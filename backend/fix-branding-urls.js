const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBrandingUrls() {
  console.log('🔧 Fixing branding URLs...');

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  
  const settings = await prisma.brandSettings.findFirst();
  
  if (!settings) {
    console.log('No branding settings found');
    return;
  }

  const updates = {};
  
  // Fix logo URL
  if (settings.logoUrl && !settings.logoUrl.startsWith('http')) {
    updates.logoUrl = `${baseUrl}${settings.logoUrl}`;
    console.log(`Updating logoUrl: ${settings.logoUrl} -> ${updates.logoUrl}`);
  }
  
  // Fix dark logo URL
  if (settings.logoDarkUrl && !settings.logoDarkUrl.startsWith('http')) {
    updates.logoDarkUrl = `${baseUrl}${settings.logoDarkUrl}`;
    console.log(`Updating logoDarkUrl: ${settings.logoDarkUrl} -> ${updates.logoDarkUrl}`);
  }
  
  // Fix favicon URL
  if (settings.faviconUrl && !settings.faviconUrl.startsWith('http')) {
    updates.faviconUrl = `${baseUrl}${settings.faviconUrl}`;
    console.log(`Updating faviconUrl: ${settings.faviconUrl} -> ${updates.faviconUrl}`);
  }

  if (Object.keys(updates).length > 0) {
    await prisma.brandSettings.update({
      where: { id: settings.id },
      data: updates,
    });
    console.log('✅ Branding URLs updated successfully!');
  } else {
    console.log('✅ All URLs are already correct');
  }

  await prisma.$disconnect();
}

fixBrandingUrls().catch((error) => {
  console.error('❌ Error fixing branding URLs:', error);
  process.exit(1);
});
