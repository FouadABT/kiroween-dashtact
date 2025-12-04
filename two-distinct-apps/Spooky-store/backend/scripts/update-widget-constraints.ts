import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateWidgetConstraints() {
  console.log('Updating widget grid span constraints...\n');

  // Update stats-card to allow full width
  const statsCard = await prisma.widgetDefinition.update({
    where: { key: 'stats-card' },
    data: {
      maxGridSpan: 12,
    },
  });
  console.log(`✓ Updated ${statsCard.name}: maxGridSpan ${statsCard.maxGridSpan}`);

  // Update other widgets to allow full width
  const widgets = await prisma.widgetDefinition.updateMany({
    where: {
      key: {
        in: ['revenue-stats', 'order-status-chart', 'quick-stats'],
      },
    },
    data: {
      maxGridSpan: 12,
    },
  });
  console.log(`✓ Updated ${widgets.count} additional widgets to maxGridSpan 12`);

  console.log('\n✅ All widget constraints updated successfully!');
  console.log('Widgets can now be resized up to 12 columns (full width).');

  await prisma.$disconnect();
}

updateWidgetConstraints().catch((error) => {
  console.error('Error updating widget constraints:', error);
  process.exit(1);
});
