import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const ecommerceProvider = await prisma.provider.upsert({
    where: { name: 'ecommerce' },
    update: {},
    create: {
      name: 'ecommerce',
      baseUrl: process.env.ECOMMERCE_PROVIDER_URL || 'http://localhost:3001',
      apiKey: process.env.ECOMMERCE_PROVIDER_API_KEY || 'ecommerce-api-key',
      isActive: true,
    },
  });

  const ticketingProvider = await prisma.provider.upsert({
    where: { name: 'ticketing' },
    update: {},
    create: {
      name: 'ticketing',
      baseUrl: process.env.TICKETING_PROVIDER_URL || 'http://localhost:3002',
      apiKey: process.env.TICKETING_PROVIDER_API_KEY || 'ticketing-api-key',
      isActive: true,
    },
  });

  const eventsProvider = await prisma.provider.upsert({
    where: { name: 'events' },
    update: {},
    create: {
      name: 'events',
      baseUrl: process.env.EVENTS_PROVIDER_URL || 'http://localhost:3003',
      apiKey: process.env.EVENTS_PROVIDER_API_KEY || 'events-api-key',
      isActive: true,
    },
  });

  console.log('Providers created:', {
    ecommerce: ecommerceProvider.id,
    ticketing: ticketingProvider.id,
    events: eventsProvider.id,
  });

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
