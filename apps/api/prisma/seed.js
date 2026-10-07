const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados SQLite...');

  // Limpa registros anteriores para estado limpo
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('123456', salt);

  // Usuário Vendedor Oficial (CPF matematicamente válido: 111.444.777-35)
  const officialSeller = await prisma.user.create({
    data: {
      name: 'Nexus Tech Store Oficial',
      cpf: '11144477735',
      phone: '(11) 98765-4321',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      cardLast4: '8888',
      passwordHash,
      balance: 15400.00
    }
  });

  // Produtos iniciais disponíveis no mercado com imagens web de alta definição
  await prisma.product.createMany({
    data: [
      {
        title: 'MacBook Air M2 16GB 512GB Space Gray',
        category: 'Eletrônicos',
        description: 'Impecável, sem marcas de uso, na caixa com nota fiscal e garantia AppleCare ativa.',
        price: 7490.00,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        sellerId: officialSeller.id
      },
      {
        title: 'Monitor Studio Display 27" 5K Retina',
        category: 'Periféricos',
        description: 'Vidro padrão, suporte com inclinação ajustável, câmera de 12MP Ultra-Wide com Palco Central.',
        price: 9890.00,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
        sellerId: officialSeller.id
      },
      {
        title: 'Magic Keyboard com Touch ID e Magic Trackpad',
        category: 'Periféricos',
        description: 'Combo Apple na cor preta, conexão USB-C e cabo Lightning trançado incluso.',
        price: 1350.00,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        sellerId: officialSeller.id
      },
      {
        title: 'Cadeira Ergonômica Herman Miller Aeron (Grafite)',
        category: 'Móveis',
        description: 'Tamanho B, suporte postural PostureFit SL e rodízios para piso vinílico/madeira.',
        price: 5200.00,
        imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=800&q=80',
        sellerId: officialSeller.id
      }
    ]
  });

  console.log('✅ Seed finalizado com sucesso! Usuário de demonstração e produtos cadastrados.');
  console.log('👤 Usuário Demo: CPF: 111.444.777-35 | Senha: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
