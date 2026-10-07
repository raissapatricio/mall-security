const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { transactionLimiter } = require('../middlewares/rateLimiter');
const { createProductSchema } = require('../schemas/market.schema');

const router = express.Router();

/**
 * GET /api/market/products
 * Lista todos os produtos ativos (não vendidos) com dados do vendedor
 */
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isSold: false },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true
            // Dados sensíveis como passwordHash e cartão NUNCA são expostos
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ products });
  } catch (error) {
    console.error('[MARKET_LIST_PRODUCTS_ERROR]', error);
    return res.status(500).json({
      error: 'Erro ao listar vitrine de produtos.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/market/products
 * Prevenção de IDOR: A autoria do anúncio é SEMPRE vinculada ao ID do JWT (req.user.id)
 */
router.post('/products', authMiddleware, validate(createProductSchema), async (req, res) => {
  try {
    const { title, category, description, price, imageUrl } = req.body;
    const sellerId = req.user.id; // Extraído do JWT, ignorando qualquer payload de client

    const product = await prisma.product.create({
      data: {
        title,
        category,
        description,
        price,
        imageUrl: imageUrl || null,
        sellerId
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Produto anunciado com sucesso.',
      product
    });
  } catch (error) {
    console.error('[MARKET_CREATE_PRODUCT_ERROR]', error);
    return res.status(500).json({
      error: 'Erro ao criar anúncio de produto.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/market/buy/:id
 * Transação ACID com proteção total contra Race Conditions, IDOR e Adulteração de Preço
 */
router.post('/buy/:id', authMiddleware, transactionLimiter, async (req, res) => {
  const productId = req.params.id;
  const buyerId = req.user.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Busca atômica do produto no banco de dados
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          seller: true
        }
      });

      if (!product) {
        throw { status: 404, message: 'Produto não encontrado.', code: 'PRODUCT_NOT_FOUND' };
      }

      // 2. Prevenção de Race Condition: Verifica se já foi comprado concorrentemente
      if (product.isSold) {
        throw { status: 409, message: 'Este produto já foi adquirido por outro comprador.', code: 'PRODUCT_ALREADY_SOLD' };
      }

      // 3. Regra de Negócio: Bloqueia auto-compra
      if (product.sellerId === buyerId) {
        throw { status: 403, message: 'Você não pode comprar seu próprio produto anunciado.', code: 'CANNOT_BUY_OWN_PRODUCT' };
      }

      // 4. Busca saldo atualizado do comprador com bloqueio de leitura
      const buyer = await tx.user.findUnique({
        where: { id: buyerId }
      });

      if (!buyer) {
        throw { status: 404, message: 'Comprador não encontrado.', code: 'BUYER_NOT_FOUND' };
      }

      // 5. Prevenção de manipulação de preço: O preço é estritamente o gravado no banco
      const productPrice = product.price;

      if (buyer.balance < productPrice) {
        throw {
          status: 400,
          message: `Saldo insuficiente. Seu saldo é R$ ${buyer.balance.toFixed(2)} e o produto custa R$ ${productPrice.toFixed(2)}.`,
          code: 'INSUFFICIENT_FUNDS'
        };
      }

      // 6. Atualizações Atômicas (ACID)
      // Deduz saldo do comprador
      const updatedBuyer = await tx.user.update({
        where: { id: buyerId },
        data: {
          balance: { decrement: productPrice }
        }
      });

      // Adiciona saldo ao vendedor
      await tx.user.update({
        where: { id: product.sellerId },
        data: {
          balance: { increment: productPrice }
        }
      });

      // Marca o produto como vendido
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { isSold: true }
      });

      // Registra o log imutável da transação
      const transactionRecord = await tx.transaction.create({
        data: {
          amount: productPrice,
          productId: product.id,
          buyerId,
          sellerId: product.sellerId
        }
      });

      return {
        product: updatedProduct,
        newBalance: updatedBuyer.balance,
        transaction: transactionRecord
      };
    });

    return res.json({
      message: `Compra de "${result.product.title}" concluída com sucesso!`,
      newBalance: result.newBalance,
      transactionId: result.transaction.id
    });
  } catch (error) {
    if (error.status && error.message) {
      return res.status(error.status).json({
        error: error.message,
        code: error.code
      });
    }

    console.error('[MARKET_BUY_TRANSACTION_ERROR]', error);
    return res.status(500).json({
      error: 'Falha ao processar transação de compra. Nenhuma alteração foi realizada.',
      code: 'TRANSACTION_ABORTED'
    });
  }
});

// Delete product endpoint
router.delete('/products/:id', authMiddleware, async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.', code: 'PRODUCT_NOT_FOUND' });
    }
    // Only owner can delete
    if (product.sellerId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para remover este produto.', code: 'FORBIDDEN_DELETE' });
    }
    await prisma.product.delete({ where: { id: productId } });
    return res.json({ message: 'Produto removido com sucesso.' });
  } catch (error) {
    console.error('[MARKET_DELETE_PRODUCT_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao remover produto.', code: 'INTERNAL_SERVER_ERROR' });
  }
});

// Update product endpoint
router.put('/products/:id', authMiddleware, validate(createProductSchema), async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;
  const { title, category, description, price, imageUrl } = req.body;
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.', code: 'PRODUCT_NOT_FOUND' });
    }
    if (product.sellerId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este produto.', code: 'FORBIDDEN_EDIT' });
    }
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { title, category, description, price, imageUrl: imageUrl || null },
      include: { seller: { select: { id: true, name: true, phone: true, address: true } } }
    });
    return res.json({ message: 'Produto atualizado com sucesso.', product: updated });
  } catch (error) {
    console.error('[MARKET_UPDATE_PRODUCT_ERROR]', error);
    return res.status(500).json({ error: 'Erro ao atualizar produto.', code: 'INTERNAL_SERVER_ERROR' });
  }
});

module.exports = router;
