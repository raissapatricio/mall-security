require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { globalLimiter } = require('./middlewares/rateLimiter');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const marketRoutes = require('./routes/market.routes');

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// 1. Defesa de Infraestrutura: Helmet para Injeção de Headers de Segurança HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", CLIENT_ORIGIN]
    }
  },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' }, // Proteção contra Clickjacking
  hsts: { maxAge: 31536000, includeSubDomains: true } // Força HTTPS
}));

// 2. CORS Estrito: Permitindo exclusivamente a origem do workspace web com cookies
app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas locais do Vite ou requisições sem origin (ex: mobile/testes de API do mesmo host)
    if (!origin || origin === CLIENT_ORIGIN) {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado por política CORS: Origem não permitida.'));
  },
  credentials: true, // Essencial para envio e recebimento de cookies HttpOnly
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Prevenção de DoS via Payload: Limite estrito de tamanho no body parser
app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: false, limit: '15kb' }));

// 4. Parser de Cookies
app.use(cookieParser());

// 5. Rate Limiting Global
app.use('/api', globalLimiter);

// 6. Rotas da Aplicação
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/market', marketRoutes);

// Health check para monitoramento
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    defenseActive: true
  });
});

// Tratamento de Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado.',
    code: 'ROUTE_NOT_FOUND'
  });
});

// Middleware Global de Tratamento de Erros (Sem vazamento de stacktrace)
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: err.message,
      code: 'CORS_FORBIDDEN'
    });
  }

  console.error('[SERVER_UNCAUGHT_ERROR]', err);
  res.status(500).json({
    error: 'Ocorreu um erro interno no servidor de segurança.',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`🛡️ NexusPay API Defensiva rodando na porta ${PORT}`);
  console.log(`🔒 Origem autorizada no CORS: ${CLIENT_ORIGIN}`);
});
