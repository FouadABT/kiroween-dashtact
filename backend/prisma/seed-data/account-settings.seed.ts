/**
 * Account Settings Seed Data
 * 
 * Defines default account settings for customers.
 * These settings are created automatically when a customer is created.
 */

export async function seedAccountSettings(prisma: any) {
  console.log('Seeding account settings...');

  // Account settings are created on-demand when a customer is created
  // This seed file is here for reference and future bulk operations
  
  // Example: Create default settings for existing customers without settings
  const customersWithoutSettings = await prisma.customer.findMany({
    where: {
      settings: null,
    },
  });

  for (const customer of customersWithoutSettings) {
    await prisma.accountSettings.create({
      data: {
        customerId: customer.id,
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
        orderUpdates: true,
        twoFactorEnabled: false,
        privacyLevel: 'private',
      },
    });
  }

  console.log(`✓ Created account settings for ${customersWithoutSettings.length} customers`);
}
