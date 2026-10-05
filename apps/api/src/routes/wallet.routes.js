const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { transactionLimiter } = require('../middlewares/rateLimiter');
const { depositSchema } = require('../schemas/market.schema');

const router = express.Router();

/**
 * POST /api/wallet/deposit
 * Depósito com transação ACID garantindo consistência no saldo
 */
router.post('/deposit', authMiddleware, transactionLimiter, validate(depositSchema), async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    // Transação ACID no Prisma
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: amount
          }
        },
        select: {
          id: true,
          name: true,
          balance: true
        }
      });

      return updated;
    });

    return res.json({
      message: `Depósito de R$ ${amount.toFixed(2)} processado com sucesso.`,
      newBalance: updatedUser.balance
    });
  } catch (error) {
    console.error('[WALLET_DEPOSIT_ERROR]', error);
    return res.status(500).json({
      error: 'Erro ao processar depósito de saldo.',
      code: 'DEPOSIT_FAILED'
    });
  }
});

/**
 * GET /api/wallet/history
 * Histórico de transações de compra e venda do usuário
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [purchases, sales] = await Promise.all([
      prisma.transaction.findMany({
        where: { buyerId: userId },
        include: {
          product: { select: { title: true, category: true } },
          seller: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.transaction.findMany({
        where: { sellerId: userId },
        include: {
          product: { select: { title: true, category: true } },
          buyer: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    return res.json({
      purchases,
      sales
    });
  } catch (error) {
    console.error('[WALLET_HISTORY_ERROR]', error);
    return res.status(500).json({
      error: 'Erro ao obter histórico financeiro.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;
