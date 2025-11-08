import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default user roles
  const roles = [
    {
      name: 'ADMIN',
      description: 'Administrator with full system access',
      isActive: true,
    },
    {
      name: 'MODERATOR',
      description: 'Moderator with elevated permissions',
      isActive: true,
    },
    {
      name: 'USER',
      description: 'Standard user with basic permissions',
      isActive: true,
    },
  ];

  console.log('Creating user roles...');
  for (const role of roles) {
    const existingRole = await prisma.userRole.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      await prisma.userRole.create({
        data: role,
      });
      console.log(`✅ Created role: ${role.name}`);
    } else {
      console.log(`⏭️  Role already exists: ${role.name}`);
    }
  }

  // Create default global settings
  console.log('Creating default global settings...');
  const existingGlobalSettings = await prisma.settings.findFirst({
    where: { scope: 'global', userId: null },
  });

  if (!existingGlobalSettings) {
    await prisma.settings.create({
      data: {
        scope: 'global',
        themeMode: 'system',
        activeTheme: 'default',
        lightPalette: {
          background: 'oklch(100% 0 0)',
          foreground: 'oklch(9.84% 0.002 285.82)',
          card: 'oklch(100% 0 0)',
          cardForeground: 'oklch(9.84% 0.002 285.82)',
          popover: 'oklch(100% 0 0)',
          popoverForeground: 'oklch(9.84% 0.002 285.82)',
          primary: 'oklch(45.62% 0.217 264.05)',
          primaryForeground: 'oklch(100% 0 0)',
          secondary: 'oklch(96.15% 0.002 285.82)',
          secondaryForeground: 'oklch(9.84% 0.002 285.82)',
          muted: 'oklch(96.15% 0.002 285.82)',
          mutedForeground: 'oklch(45.62% 0.009 285.82)',
          accent: 'oklch(96.15% 0.002 285.82)',
          accentForeground: 'oklch(9.84% 0.002 285.82)',
          destructive: 'oklch(57.75% 0.226 27.33)',
          destructiveForeground: 'oklch(100% 0 0)',
          border: 'oklch(91.23% 0.004 285.82)',
          input: 'oklch(91.23% 0.004 285.82)',
          ring: 'oklch(45.62% 0.217 264.05)',
          chart1: 'oklch(63.47% 0.246 27.91)',
          chart2: 'oklch(72.69% 0.169 152.43)',
          chart3: 'oklch(66.77% 0.196 60.62)',
          chart4: 'oklch(72.01% 0.139 231.6)',
          chart5: 'oklch(64.71% 0.292 327.44)',
          sidebar: 'oklch(100% 0 0)',
          sidebarForeground: 'oklch(9.84% 0.002 285.82)',
          sidebarPrimary: 'oklch(45.62% 0.217 264.05)',
          sidebarPrimaryForeground: 'oklch(100% 0 0)',
          sidebarAccent: 'oklch(96.15% 0.002 285.82)',
          sidebarAccentForeground: 'oklch(9.84% 0.002 285.82)',
          sidebarBorder: 'oklch(91.23% 0.004 285.82)',
          sidebarRing: 'oklch(45.62% 0.217 264.05)',
          radius: '0.5rem',
        },
        darkPalette: {
          background: 'oklch(15% 0 0)',
          foreground: 'oklch(98% 0 0)',
          card: 'oklch(18% 0 0)',
          cardForeground: 'oklch(98% 0 0)',
          popover: 'oklch(18% 0 0)',
          popoverForeground: 'oklch(98% 0 0)',
          primary: 'oklch(70% 0.2 250)',
          primaryForeground: 'oklch(98% 0 0)',
          secondary: 'oklch(25% 0 0)',
          secondaryForeground: 'oklch(98% 0 0)',
          muted: 'oklch(25% 0 0)',
          mutedForeground: 'oklch(65% 0 0)',
          accent: 'oklch(22% 0 0)',
          accentForeground: 'oklch(98% 0 0)',
          destructive: 'oklch(60% 0.25 25)',
          destructiveForeground: 'oklch(98% 0 0)',
          border: 'oklch(30% 0 0)',
          input: 'oklch(30% 0 0)',
          ring: 'oklch(70% 0.2 250)',
          chart1: 'oklch(60% 0.25 250)',
          chart2: 'oklch(65% 0.2 160)',
          chart3: 'oklch(70% 0.2 70)',
          chart4: 'oklch(60% 0.25 300)',
          chart5: 'oklch(65% 0.25 20)',
          sidebar: 'oklch(12% 0 0)',
          sidebarForeground: 'oklch(95% 0 0)',
          sidebarPrimary: 'oklch(70% 0.2 250)',
          sidebarPrimaryForeground: 'oklch(98% 0 0)',
          sidebarAccent: 'oklch(22% 0 0)',
          sidebarAccentForeground: 'oklch(98% 0 0)',
          sidebarBorder: 'oklch(25% 0 0)',
          sidebarRing: 'oklch(70% 0.2 250)',
          radius: '0.5rem',
        },
        typography: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['Georgia', 'serif'],
            mono: ['Fira Code', 'monospace'],
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
          },
          fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
          },
          lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
            loose: 2,
          },
          letterSpacing: {
            tighter: '-0.05em',
            tight: '-0.025em',
            normal: '0',
            wide: '0.025em',
            wider: '0.05em',
          },
        },
      },
    });
    console.log('✅ Created default global settings');
  } else {
    console.log('⏭️  Global settings already exist');
  }

  console.log('✨ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
