import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPaymentMethods() {
  console.log('💳 Seeding payment methods...');

  const methods = [
    {
      name: 'Credit Card',
      type: 'CARD',
      description: 'Visa, Mastercard, American Express',
      isActive: true,
    },
    {
      name: 'PayPal',
      type: 'PAYPAL',
      description: 'Pay securely with your PayPal account',
      isActive: true,
    },
    {
      name: 'Bank Transfer',
      type: 'BANK_TRANSFER',
      description: 'Direct bank transfer',
      isActive: true,
    },
    {
      name: 'Apple Pay',
      type: 'APPLE_PAY',
      description: 'Fast and secure payment with Apple Pay',
      isActive: true,
    },
    {
      name: 'Google Pay',
      type: 'GOOGLE_PAY',
      description: 'Fast and secure payment with Google Pay',
      isActive: true,
    },
  ];

  for (const method of methods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { name: method.name },
    });

    if (!existing) {
      await prisma.paymentMethod.create({
        data: method,
      });
      console.log(`✅ Created payment method: ${method.name}`);
    } else {
      console.log(`⏭️  Payment method already exists: ${method.name}`);
    }
  }

  console.log('✅ Payment methods seeded successfully!');
}
