/**
 * Cleanup Widgets Script
 * 
 * This script removes all widgets from the database except the 2 demo widgets.
 * Run this after updating the widgets.seed.ts file.
 * 
 * Usage:
 *   npm run cleanup:widgets
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting widget cleanup...\n');

  // Get all widgets
  const allWidgets = await prisma.widgetDefinition.findMany({
    select: { key: true, name: true },
  });

  console.log(`📊 Found ${allWidgets.length} widgets in database\n`);

  // Define widgets to keep
  const widgetsToKeep = ['stats-card', 'activity-feed'];

  // Find widgets to delete
  const widgetsToDelete = allWidgets.filter(
    (widget) => !widgetsToKeep.includes(widget.key)
  );

  console.log(`✅ Keeping ${widgetsToKeep.length} widgets:`);
  widgetsToKeep.forEach((key) => console.log(`   - ${key}`));
  console.log();

  console.log(`🗑️  Deleting ${widgetsToDelete.length} widgets:`);
  widgetsToDelete.forEach((widget) => console.log(`   - ${widget.key} (${widget.name})`));
  console.log();

  if (widgetsToDelete.length === 0) {
    console.log('✨ No widgets to delete. Database is already clean!');
    return;
  }

  // Delete widget instances first (foreign key constraint)
  console.log('🔄 Deleting widget instances...');
  const deletedInstances = await prisma.widgetInstance.deleteMany({
    where: {
      widgetKey: {
        notIn: widgetsToKeep,
      },
    },
  });
  console.log(`   Deleted ${deletedInstances.count} widget instances\n`);

  // Delete widget definitions
  console.log('🔄 Deleting widget definitions...');
  const deletedDefinitions = await prisma.widgetDefinition.deleteMany({
    where: {
      key: {
        notIn: widgetsToKeep,
      },
    },
  });
  console.log(`   Deleted ${deletedDefinitions.count} widget definitions\n`);

  console.log('✅ Widget cleanup complete!\n');
  console.log('📝 Summary:');
  console.log(`   - Widgets kept: ${widgetsToKeep.length}`);
  console.log(`   - Widget instances deleted: ${deletedInstances.count}`);
  console.log(`   - Widget definitions deleted: ${deletedDefinitions.count}`);
  console.log();
  console.log('💡 Next steps:');
  console.log('   1. Run: npm run prisma:seed');
  console.log('   2. Restart frontend dev server');
  console.log('   3. Test dashboard at http://localhost:3000/dashboard');
}

main()
  .catch((error) => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
