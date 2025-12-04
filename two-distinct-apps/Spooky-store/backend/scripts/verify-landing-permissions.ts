import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyPermissions() {
  console.log('🔍 Verifying Landing Page CMS permissions...\n');

  // Check if permissions exist
  const landingPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'landing' },
        { resource: 'pages' },
      ],
    },
    orderBy: { name: 'asc' },
  });

  console.log('✅ Landing Page CMS Permissions:');
  landingPermissions.forEach((perm) => {
    console.log(`   - ${perm.name}: ${perm.description}`);
  });

  // Check Admin role permissions
  console.log('\n✅ Admin Role Permissions:');
  const adminRole = await prisma.userRole.findUnique({
    where: { name: 'Admin' },
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

  if (adminRole) {
    adminRole.rolePermissions.forEach((rp) => {
      console.log(`   - ${rp.permission.name}`);
    });
  }

  // Check if landing page content exists
  console.log('\n✅ Landing Page Content:');
  const landingPage = await prisma.landingPageContent.findFirst({
    where: { isActive: true },
  });

  if (landingPage) {
    console.log(`   - ID: ${landingPage.id}`);
    console.log(`   - Version: ${landingPage.version}`);
    console.log(`   - Active: ${landingPage.isActive}`);
    console.log(`   - Sections: ${(landingPage.sections as any[]).length}`);
    console.log(`   - Published: ${landingPage.publishedAt ? 'Yes' : 'No'}`);
    
    // List sections
    console.log('\n   Sections:');
    (landingPage.sections as any[]).forEach((section: any) => {
      console.log(`     - ${section.type} (${section.enabled ? 'enabled' : 'disabled'})`);
    });
  } else {
    console.log('   ⚠️  No landing page content found');
  }

  console.log('\n✨ Verification complete!');
  await prisma.$disconnect();
}

verifyPermissions().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
