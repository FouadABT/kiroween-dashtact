const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMenuIcons() {
  console.log('🔍 Checking menu icons in database...\n');
  
  const menus = await prisma.dashboardMenu.findMany({
    select: {
      label: true,
      icon: true,
      route: true,
      parentId: true,
    },
    orderBy: { order: 'asc' },
  });

  if (menus.length === 0) {
    console.log('❌ No menus found in database!');
    console.log('Run: npm run prisma:seed');
  } else {
    console.log(`Found ${menus.length} menu items:\n`);
    menus.forEach((menu) => {
      const indent = menu.parentId ? '  └─ ' : '';
      console.log(`${indent}${menu.label}`);
      console.log(`${indent}   Icon: "${menu.icon}"`);
      console.log(`${indent}   Route: ${menu.route}\n`);
    });
  }

  await prisma.$disconnect();
}

checkMenuIcons().catch(console.error);
