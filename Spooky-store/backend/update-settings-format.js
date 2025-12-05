const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSettings() {
  console.log('🔄 Updating settings format from OKLCH to HSL...');

  const lightPalette = {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    cardForeground: '240 10% 3.9%',
    popover: '0 0% 100%',
    popoverForeground: '240 10% 3.9%',
    primary: '240 5.9% 10%',
    primaryForeground: '0 0% 98%',
    secondary: '240 4.8% 95.9%',
    secondaryForeground: '240 5.9% 10%',
    muted: '240 4.8% 95.9%',
    mutedForeground: '240 3.8% 46.1%',
    accent: '240 4.8% 95.9%',
    accentForeground: '240 5.9% 10%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '0 0% 98%',
    border: '240 5.9% 90%',
    input: '240 5.9% 90%',
    ring: '240 5.9% 10%',
    chart1: '220 70% 50%',
    chart2: '160 60% 45%',
    chart3: '30 80% 55%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
    sidebar: '0 0% 98%',
    sidebarForeground: '240 5.3% 26.1%',
    sidebarPrimary: '240 5.9% 10%',
    sidebarPrimaryForeground: '0 0% 98%',
    sidebarAccent: '240 4.8% 95.9%',
    sidebarAccentForeground: '240 5.9% 10%',
    sidebarBorder: '220 13% 91%',
    sidebarRing: '240 5.9% 10%',
    radius: '0.625rem',
  };

  const darkPalette = {
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222.2 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222.2 84% 4.9%',
    popoverForeground: '210 40% 98%',
    primary: '210 40% 98%',
    primaryForeground: '222.2 47.4% 11.2%',
    secondary: '217.2 32.6% 17.5%',
    secondaryForeground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    mutedForeground: '215 20.2% 65.1%',
    accent: '217.2 32.6% 17.5%',
    accentForeground: '210 40% 98%',
    destructive: '0 62.8% 30.6%',
    destructiveForeground: '210 40% 98%',
    border: '217.2 32.6% 17.5%',
    input: '217.2 32.6% 17.5%',
    ring: '212.7 26.8% 83.9%',
    chart1: '220 70% 50%',
    chart2: '160 60% 45%',
    chart3: '30 80% 55%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
    sidebar: '222.2 84% 4.9%',
    sidebarForeground: '210 40% 98%',
    sidebarPrimary: '217.2 91.2% 59.8%',
    sidebarPrimaryForeground: '222.2 47.4% 11.2%',
    sidebarAccent: '217.2 32.6% 17.5%',
    sidebarAccentForeground: '210 40% 98%',
    sidebarBorder: '217.2 32.6% 17.5%',
    sidebarRing: '217.2 91.2% 59.8%',
    radius: '0.625rem',
  };

  // Update all settings
  const allSettings = await prisma.settings.findMany();
  
  for (const setting of allSettings) {
    await prisma.settings.update({
      where: { id: setting.id },
      data: {
        lightPalette,
        darkPalette,
      },
    });
    console.log(`✅ Updated settings: ${setting.id} (scope: ${setting.scope})`);
  }

  console.log('✨ Settings format updated successfully!');
  console.log('🔄 Please refresh your browser to see the changes');
}

updateSettings()
  .catch((e) => {
    console.error('❌ Error updating settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
