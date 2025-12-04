import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAllRoles() {
  console.log('🔍 Verifying Landing Page CMS permissions for all roles...\n');

  const roles = ['Super Admin', 'Admin', 'Manager', 'User'];

  for (const roleName of roles) {
    const role = await prisma.userRole.findUnique({
      where: { name: roleName },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
          where: {
            permission: {
              OR: [
                { resource: 'landing' },
                { resource: 'pages' },
              ],
            },
          },
        },
      },
    });

    console.log(`✅ ${roleName}:`);
    if (role && role.rolePermissions.length > 0) {
      role.rolePermissions.forEach((rp) => {
        console.log(`   - ${rp.permission.name}`);
      });
    } else {
      console.log('   - No landing/pages permissions');
    }
    console.log('');
  }

  await prisma.$disconnect();
}

verifyAllRoles().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
