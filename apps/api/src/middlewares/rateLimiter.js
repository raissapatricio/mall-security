const rateLimit = require('express-rate-limit');

// Rate limiter global para proteção contra DDoS e abuso
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Máximo 300 requisições por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições originadas deste IP. Limite de tráfego temporariamente atingido.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limiter rigoroso para autenticação e rotas críticas (prevenção de Brute-Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Limite de 20 tentativas para cadastro/login/recuperação
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de autenticação para este IP. Tente novamente após 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

// Rate limiter para transações de compra e depósitos (evita spam e race condition attempts)
const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 transações por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Operações financeiras muito frequentes. Aguarde um instante.',
    code: 'TRANSACTION_RATE_LIMIT'
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  transactionLimiter
};
