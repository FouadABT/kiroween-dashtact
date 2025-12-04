import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedShippingMethods() {
  console.log('🚚 Seeding shipping methods...');

  const methods = [
    {
      name: 'Standard Shipping',
      description: 'Delivery in 5-7 business days',
      price: 5.99,
      isActive: true,
    },
    {
      name: 'Express Shipping',
      description: 'Delivery in 2-3 business days',
      price: 12.99,
      isActive: true,
    },
    {
      name: 'Overnight Shipping',
      description: 'Next business day delivery',
      price: 24.99,
      isActive: true,
    },
    {
      name: 'Local Pickup',
      description: 'Pick up at our store',
      price: 0,
      isActive: true,
    },
  ];

  for (const method of methods) {
    const existing = await prisma.shippingMethod.findFirst({
      where: { name: method.name },
    });

    if (!existing) {
      await prisma.shippingMethod.create({
        data: method,
      });
      console.log(`✅ Created shipping method: ${method.name}`);
    } else {
      console.log(`⏭️  Shipping method already exists: ${method.name}`);
    }
  }

  console.log('✅ Shipping methods seeded successfully!');
}
