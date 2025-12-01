import { PrismaClient, Prisma } from '@prisma/client';

export async function seedBranding(prisma: PrismaClient) {
  console.log('Seeding branding data...');

  // Read branding data from environment variables (set by setup CLI)
  const brandName = process.env.BRAND_NAME || 'Dashboard';
  const tagline = process.env.BRAND_TAGLINE || 'Your powerful admin dashboard';
  const description = process.env.BRAND_DESCRIPTION || 'A modern, customizable dashboard for managing your application';
  const websiteUrl = process.env.BRAND_WEBSITE_URL || null;
  const supportEmail = process.env.BRAND_SUPPORT_EMAIL || null;

  // Check if branding settings already exist
  const existing = await prisma.brandSettings.findFirst();

  if (!existing) {
    // Create new branding settings
    await prisma.brandSettings.create({
      data: {
        brandName,
        tagline: tagline || null,
        description: description || null,
        logoUrl: null,
        logoDarkUrl: null,
        faviconUrl: null,
        websiteUrl: websiteUrl || null,
        supportEmail: supportEmail || null,
        socialLinks: {
          twitter: '',
          linkedin: '',
          facebook: '',
          instagram: '',
        },
      },
    });

    console.log(`✅ Branding settings created: ${brandName}`);
  } else {
    // Update existing branding if CLI provided values (not defaults)
    const hasCliValues = process.env.BRAND_NAME && process.env.BRAND_NAME !== '';
    
    if (hasCliValues) {
      await prisma.brandSettings.update({
        where: { id: existing.id },
        data: {
          brandName,
          tagline: tagline || existing.tagline,
          description: description || existing.description,
          websiteUrl: websiteUrl || existing.websiteUrl,
          supportEmail: supportEmail || existing.supportEmail,
          // Preserve existing logo URLs
          logoUrl: existing.logoUrl,
          logoDarkUrl: existing.logoDarkUrl,
          faviconUrl: existing.faviconUrl,
          socialLinks: existing.socialLinks ?? Prisma.JsonNull,
        },
      });
      console.log(`✅ Branding settings updated: ${brandName}`);
    } else {
      console.log('⏭️  Branding settings already exist (no CLI values to update)');
    }
  }

  // Log the final values
  if (tagline && tagline !== 'Your powerful admin dashboard') {
    console.log(`   Tagline: ${tagline}`);
  }
  if (description && description !== 'A modern, customizable dashboard for managing your application') {
    console.log(`   Description: ${description.substring(0, 50)}...`);
  }
  if (websiteUrl) console.log(`   Website: ${websiteUrl}`);
  if (supportEmail) console.log(`   Support Email: ${supportEmail}`);
}
