import { PrismaClient } from '@prisma/client';

export async function seedBranding(prisma: PrismaClient) {
  console.log('Seeding branding data...');

  // Check if branding settings already exist
  const existing = await prisma.brandSettings.findFirst();

  if (!existing) {
    await prisma.brandSettings.create({
      data: {
        brandName: 'Dashboard',
        tagline: 'Your powerful admin dashboard',
        description:
          'A modern, customizable dashboard for managing your application',
        logoUrl: null,
        logoDarkUrl: null,
        faviconUrl: null,
        websiteUrl: null,
        supportEmail: null,
        socialLinks: {
          twitter: '',
          linkedin: '',
          facebook: '',
          instagram: '',
        },
      },
    });

    console.log('✓ Default branding settings created');
  } else {
    console.log('✓ Branding settings already exist');
  }
}
