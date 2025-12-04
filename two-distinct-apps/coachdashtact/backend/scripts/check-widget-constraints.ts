import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWidgetConstraints() {
  const widgets = await prisma.widgetDefinition.findMany({
    where: {
      OR: [
        { maxGridSpan: { lt: 12 } },
      ],
    },
    select: {
      key: true,
      name: true,
      minGridSpan: true,
      maxGridSpan: true,
      defaultGridSpan: true,
    },
  });

  console.log('Widgets with maxGridSpan < 12:');
  console.log(JSON.stringify(widgets, null, 2));

  await prisma.$disconnect();
}

checkWidgetConstraints().catch(console.error);
