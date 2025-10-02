import { prisma } from './client';

async function main() {
  const userId = '00000000-0000-0000-0000-000000000001';

  console.log('Seeding base data…');

  await prisma.image.upsert({
    where: { id: '00000000-0000-0000-0000-000000000100' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000100',
      userId,
      storageKey: 'seed/example.jpg',
      url: 'https://example.com/example.jpg',
      status: 'queued',
    },
  });

  console.log('Seed done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
