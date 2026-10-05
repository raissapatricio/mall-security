const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // Prioridade para httpOnly cookie (proteção contra XSS)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Acesso não autorizado. Sessão ausente ou expirada.',
        code: 'UNAUTHORIZED'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nexus_mall_defense_jwt_secret_token_secure_key_2026');

    // Validação no banco para prevenir spoofing e contas revogadas
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        cpf: true,
        phone: true,
        address: true,
        cardLast4: true,
        balance: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado ou credenciais revogadas.',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Sua sessão expirou. Por favor, autentique-se novamente.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      error: 'Token de autenticação inválido.',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = authMiddleware;
