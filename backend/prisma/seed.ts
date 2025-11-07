import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default user roles
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrator with full system access',
      isActive: true,
    },
    {
      name: 'MODERATOR',
      description: 'Moderator with elevated permissions',
      isActive: true,
    },
    {
      name: 'USER',
      description: 'Standard user with basic permissions',
      isActive: true,
    },
  ];

  console.log('Creating user roles...');
  for (const role of roles) {
    const existingRole = await prisma.userRole.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      await prisma.userRole.create({
        data: role,
      });
      console.log(`✅ Created role: ${role.name}`);
    } else {
      console.log(`⏭️  Role already exists: ${role.name}`);
    }
  }

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
