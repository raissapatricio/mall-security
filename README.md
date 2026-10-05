# 🛡️ NexusPay & Mall — Monorepo Defensivo Full-Stack (AppSec)

Aplicação Web Full-Stack em arquitetura de **Monorepo** com **npm workspaces**, desenvolvida para ambiente de testes defensivos contra ataques web coordenados (OWASP Top 10, Race Conditions, IDOR, DDoS/Brute-Force e SQL Injection).

---

## 🎨 Tema Visual
- **Design Minimalista Apple com tons pastel**: Interface limpa, translucidez com efeito *frosted glass* (`backdrop-filter: blur`), curvas de raio contínuo Apple, paleta pastel suave (*mint*, *lavender*, *peach*, *sky blue*) e micro-interações táteis refinadas.

---

## 🏗️ Estrutura do Monorepo

```
mall_security/
├── package.json                   # Workspaces raiz (apps/api e apps/web) com concurrently
├── apps/
│   ├── api/                       # [Back-end] Node.js com Express & Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Modelos User, Product e Transaction (SQLite)
│   │   │   ├── dev.db             # Banco SQLite local relacional
│   │   │   └── seed.js            # Seed inicial com usuário e produtos demo
│   │   ├── src/
│   │   │   ├── lib/prisma.js      # Instância do Prisma Client com query logging
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.js        # Validação JWT em cookies httpOnly
│   │   │   │   ├── rateLimiter.js # express-rate-limit contra Brute Force e DDoS
│   │   │   │   └── validate.js    # Validação Zero-Trust Zod e sanitização XSS
│   │   │   ├── schemas/           # Schemas Zod com validação matemática de CPF
│   │   │   ├── routes/            # Rotas de Auth, Wallet e Mercado ACID
│   │   │   └── index.js           # Servidor Express com Helmet e CORS estrito
│   │   └── package.json
│   │
│   └── web/                       # [Front-end] React (Vite) + Zustand
│       ├── src/
│       │   ├── api/client.js      # Axios com withCredentials (httpOnly cookies)
│       │   ├── store/             # Zustand stores (useAuthStore, useMarketStore)
│       │   ├── components/        # Componentes modulares Apple Pastel
│       │   ├── utils/masks.js     # Formatadores de CPF, Telefone, Cartão e BRL
│       │   ├── index.css          # Design System Apple com tons pastel
│       │   ├── App.jsx            # Layout principal e Vitrine reativa
│       │   └── main.jsx
│       ├── vite.config.js         # Porta 5173
│       └── package.json
```

---

## 🛡️ Defesas Ativas Implementadas

1. **Autenticação & Sessão Segura (Defesa contra XSS & Session Hijacking)**:
   - Tokens **JWT** transmitidos e gravados exclusivamente em **cookies `httpOnly`** com `sameSite: 'lax'`.
   - Criptografia de senhas exclusivamente no servidor via **bcrypt** com *cost factor* 12.
2. **Infraestrutura HTTP (Defesa contra Clickjacking, Sniffing e Injeção)**:
   - **Helmet** configurado com Content Security Policy restritivo, `X-Frame-Options: DENY` e HSTS.
   - **CORS Estrito**: Permite unicamente a origem do workspace web (`http://localhost:5173`) com credenciais habilitadas.
3. **Prevenção de Ataques de Força Bruta e DoS**:
   - `express-rate-limit` diferenciado: proteção global e limitador estrito para rotas de autenticação (`/api/auth/*`).
   - Limite de tamanho de carga útil (`15kb`) no body parser contra Payload Flooding.
4. **Validação Rigorosa Zero-Trust (Zod)**:
   - Verificação estrutural e algorítmica matemática dos dígitos do CPF no servidor.
   - Sanitização de inputs contra Cross-Site Scripting (XSS).
   - Bloqueio de *Mass Assignment* (apenas propriedades autorizadas passam).
5. **Proteção Transacional ACID contra Race Conditions & IDOR**:
   - A rota de compra (`POST /api/market/buy/:id`) executa uma transação atômica no SQLite via `prisma.$transaction`.
   - Bloqueia compras simultâneas do mesmo produto (*concurrency race condition*).
   - Impede auto-compra e adulteração de preço (o valor cobrado é rigorosamente o registrado no banco, nunca o enviado pelo cliente).
   - Vinculação de anúncios diretamente ao ID decodificado do JWT do usuário autenticado (mitigando IDOR).
6. **Conformidade PCI-DSS Simulada**:
   - O número completo do cartão de crédito nunca é salvo no banco de dados; apenas os últimos 4 dígitos são armazenados (`**** **** **** 1234`).

---

## 🚀 Como Executar o Projeto

Na raiz do repositório, execute:

```bash
# Executa Back-end (porta 3001) e Front-end (porta 5173) simultaneamente:
npm run dev
```

Outros comandos úteis:
```bash
# Executar apenas o Back-end:
npm run dev:api

# Executar apenas o Front-end:
npm run dev:web

# Popular o banco SQLite com dados demo:
npm run prisma:seed
```

### 👤 Credenciais de Demonstração (Seed)
- **CPF:** `111.444.777-35` *(Válido matematicamente)*
- **Senha:** `123456`
- **Saldo Inicial:** R$ 15.400,00 (Vendedor Oficial)
- *(Novas contas criadas recebem automaticamente **R$ 1.000,00** de saldo inicial)*
