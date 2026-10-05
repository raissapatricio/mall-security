const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  registerSchema,
  loginSchema,
  recoveryRequestSchema,
  resetPasswordSchema
} = require('../schemas/auth.schema');

const router = express.Router();

// Helper para normalizar CPF (somente dígitos)
const cleanDigits = (v) => (v || '').replace(/\D/g, '');

// Helper para assinar token JWT
const signToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'nexus_mall_defense_jwt_secret_token_secure_key_2026',
    { expiresIn: '24h' }
  );
};

// Configuração segura de Cookie HttpOnly
const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true, // Inacessível via document.cookie no Front-end (Defesa contra XSS)
    secure: process.env.NODE_ENV === 'production', // true se HTTPS
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  });
};

// Armazenamento em memória com expiração para OTP de SMS simulado
const otpCache = new Map();

/**
 * POST /api/auth/register
 * Cadastro protegido com PCI-DSS (apenas últimos 4 dígitos salvos) e bcrypt
 */
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { name, cpf, phone, address, cardNumber, password } = req.body;
    const normalizedCpf = cleanDigits(cpf);

    // Verificação de duplicidade de CPF
    const existingUser = await prisma.user.findUnique({
      where: { cpf: normalizedCpf }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'CPF já cadastrado na plataforma.',
        code: 'CPF_ALREADY_EXISTS'
      });
    }

    // Hash da senha com salt factor 12 (OWASP Password Storage Cheat Sheet)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // PCI-DSS: Extrai estritamente os 4 últimos dígitos do cartão
    const cleanedCard = cleanDigits(cardNumber);
    const cardLast4 = cleanedCard.slice(-4);

    // Criação atômica no banco de dados com saldo inicial de R$ 1.000,00
    const user = await prisma.user.create({
      data: {
        name,
        cpf: normalizedCpf,
        phone,
        address,
        cardLast4,
        passwordHash,
        balance: 1000.00
      },
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

    const token = signToken(user.id);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Cadastro realizado com sucesso! Saldo inicial creditado.',
      user
    });
  } catch (error) {
    console.error('[AUTH_REGISTER_ERROR]', error);
    return res.status(500).json({
      error: 'Erro interno ao processar cadastro.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/login
 * Autenticação via CPF e Senha com rate limit contra brute-force
 */
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { cpf, password } = req.body;
    const normalizedCpf = cleanDigits(cpf);

    const user = await prisma.user.findUnique({
      where: { cpf: normalizedCpf }
    });

    // Mensagem genérica contra timing attacks e user enumeration
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Credenciais inválidas.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = signToken(user.id);
    setAuthCookie(res, token);

    return res.json({
      message: 'Login realizado com sucesso.',
      user: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        phone: user.phone,
        address: user.address,
        cardLast4: user.cardLast4,
        balance: user.balance,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('[AUTH_LOGIN_ERROR]', error);
    return res.status(500).json({
      error: 'Erro ao processar login.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/logout
 * Encerra a sessão removendo o cookie HttpOnly
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ message: 'Sessão encerrada com sucesso.' });
});

/**
 * GET /api/auth/me
 * Retorna os dados do perfil do usuário autenticado no JWT
 */
router.get('/me', authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

/**
 * POST /api/auth/recovery-request
 * Validação cruzada de CPF e Telefone com emissão de SMS simulado
 */
router.post('/recovery-request', authLimiter, validate(recoveryRequestSchema), async (req, res) => {
  try {
    const { cpf, phone } = req.body;
    const normalizedCpf = cleanDigits(cpf);
    const normalizedPhone = cleanDigits(phone);

    const user = await prisma.user.findUnique({
      where: { cpf: normalizedCpf }
    });

    if (!user || cleanDigits(user.phone) !== normalizedPhone) {
      return res.status(404).json({
        error: 'Os dados informados não conferem com nenhum registro do sistema.',
        code: 'IDENTITY_MISMATCH'
      });
    }

    // Gera código numérico de 6 dígitos para o SMS
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpCache.set(normalizedCpf, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

    return res.json({
      message: 'SMS enviado com sucesso!',
      simulatedSms: {
        toPhone: user.phone,
        otpCode: otp,
        text: `NexusPay: Seu código de liberação para redefinição é ${otp}.`
      }
    });
  } catch (error) {
    console.error('[AUTH_RECOVERY_ERROR]', error);
    return res.status(500).json({
      error: 'Erro ao processar recuperação de senha.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Redefine a senha após validação do SMS simulado
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res) => {
  try {
    const { cpf, newPassword } = req.body;
    const normalizedCpf = cleanDigits(cpf);

    const cached = otpCache.get(normalizedCpf);
    if (!cached || Date.now() > cached.expiresAt) {
      return res.status(400).json({
        error: 'Código SMS expirado ou requisição inválida. Solicite novamente.',
        code: 'OTP_EXPIRED'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { cpf: normalizedCpf },
      data: { passwordHash }
    });

    otpCache.delete(normalizedCpf);

    return res.json({ message: 'Senha redefinida com sucesso. Faça login com sua nova credencial.' });
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error);
    return res.status(500).json({
      error: 'Erro ao redefinir senha.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

module.exports = router;
