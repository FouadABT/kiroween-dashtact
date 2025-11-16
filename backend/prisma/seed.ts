import { PrismaClient } from '@prisma/client';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from './seed-data/auth.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Permissions
  console.log('Creating permissions...');
  for (const permission of DEFAULT_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { name: permission.name },
    });

    if (!existing) {
      await prisma.permission.create({
        data: permission,
      });
      console.log(`✅ Created permission: ${permission.name}`);
    } else {
      console.log(`⏭️  Permission already exists: ${permission.name}`);
    }
  }

  // Seed Roles
  console.log('Creating user roles...');
  for (const [key, roleData] of Object.entries(DEFAULT_ROLES)) {
    const existingRole = await prisma.userRole.findUnique({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      const role = await prisma.userRole.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          isActive: true,
          isSystemRole: roleData.isSystemRole,
        },
      });
      console.log(`✅ Created role: ${roleData.name}`);

      // Assign permissions to role
      for (const permissionName of roleData.permissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName },
        });

        if (permission) {
          const existingAssignment = await prisma.rolePermission.findUnique({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
          });

          if (!existingAssignment) {
            await prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: permission.id,
              },
            });
            console.log(`  ✅ Assigned permission: ${permissionName}`);
          }
        }
      }
    } else {
      console.log(`⏭️  Role already exists: ${roleData.name}`);
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
        },
        darkPalette: {
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

  // Create default landing page content
  console.log('Creating default landing page content...');
  const existingLandingPage = await prisma.landingPageContent.findFirst({
    where: { isActive: true },
  });

  if (!existingLandingPage) {
    await prisma.landingPageContent.create({
      data: {
        sections: [
          // Hero Section
          {
            id: 'hero-1',
            type: 'hero',
            enabled: true,
            order: 1,
            data: {
              headline: 'Welcome to Your Dashboard',
              subheadline: 'Professional dashboard application with powerful features and modern design',
              primaryCta: {
                text: 'Get Started',
                link: '/signup',
                linkType: 'url',
              },
              secondaryCta: {
                text: 'Learn More',
                link: '#features',
                linkType: 'url',
              },
              backgroundType: 'gradient',
              backgroundColor: 'oklch(0.95 0.02 250)',
              textAlignment: 'center',
              height: 'large',
            },
          },
          // Features Section
          {
            id: 'features-1',
            type: 'features',
            enabled: true,
            order: 2,
            data: {
              title: 'Powerful Features',
              subtitle: 'Everything you need to build and manage your application',
              layout: 'grid',
              columns: 3,
              features: [
                {
                  id: 'feature-1',
                  icon: 'shield',
                  title: 'Secure Authentication',
                  description: 'JWT-based authentication with role-based access control and permission management',
                  order: 1,
                },
                {
                  id: 'feature-2',
                  icon: 'palette',
                  title: 'Customizable Themes',
                  description: 'Light and dark modes with full color palette customization using OKLCH color space',
                  order: 2,
                },
                {
                  id: 'feature-3',
                  icon: 'bell',
                  title: 'Real-time Notifications',
                  description: 'WebSocket-powered instant notifications with user preferences and DND mode',
                  order: 3,
                },
                {
                  id: 'feature-4',
                  icon: 'layout',
                  title: 'Modern UI Components',
                  description: 'Built with shadcn/ui and Tailwind CSS for a beautiful, responsive interface',
                  order: 4,
                },
              ],
            },
          },
          // CTA Section
          {
            id: 'cta-1',
            type: 'cta',
            enabled: true,
            order: 3,
            data: {
              title: 'Ready to Get Started?',
              description: 'Join thousands of users already using our platform to build amazing applications',
              primaryCta: {
                text: 'Sign Up Now',
                link: '/signup',
                linkType: 'url',
              },
              secondaryCta: {
                text: 'View Documentation',
                link: '/docs',
                linkType: 'url',
              },
              backgroundColor: 'oklch(0.5 0.2 250)',
              textColor: 'oklch(1 0 0)',
              alignment: 'center',
            },
          },
          // Footer Section
          {
            id: 'footer-1',
            type: 'footer',
            enabled: true,
            order: 99,
            data: {
              companyName: 'Dashboard Application',
              description: 'A professional dashboard starter kit with authentication, theming, and real-time features',
              navLinks: [
                {
                  label: 'Features',
                  url: '#features',
                  linkType: 'url',
                  order: 1,
                },
                {
                  label: 'About',
                  url: '/about',
                  linkType: 'url',
                  order: 2,
                },
                {
                  label: 'Contact',
                  url: '/contact',
                  linkType: 'url',
                  order: 3,
                },
                {
                  label: 'Privacy',
                  url: '/privacy',
                  linkType: 'url',
                  order: 4,
                },
              ],
              socialLinks: [
                {
                  platform: 'github',
                  url: 'https://github.com',
                  icon: 'github',
                },
                {
                  platform: 'twitter',
                  url: 'https://twitter.com',
                  icon: 'twitter',
                },
              ],
              copyright: '© 2024 Dashboard Application. All rights reserved.',
              showNewsletter: false,
            },
          },
        ],
        settings: {
          theme: {
            primaryColor: 'oklch(0.5 0.2 250)',
            secondaryColor: 'oklch(0.6 0.15 280)',
          },
          layout: {
            maxWidth: 'container',
            spacing: 'normal',
          },
          seo: {
            title: 'Dashboard Application - Professional Management Platform',
            description: 'A comprehensive dashboard application with authentication, theming, notifications, and real-time features',
            keywords: 'dashboard, admin, management, saas, authentication, notifications',
            ogImage: '/og-image.svg',
          },
        },
        version: 1,
        isActive: true,
        publishedAt: new Date(),
      },
    });
    console.log('✅ Created default landing page content');
  } else {
    console.log('⏭️  Landing page content already exists');
  }

  // Create default e-commerce settings
  console.log('Creating default e-commerce settings...');
  const existingEcommerceSettings = await prisma.ecommerceSettings.findFirst({
    where: { scope: 'global' },
  });

  if (!existingEcommerceSettings) {
    await prisma.ecommerceSettings.create({
      data: {
        scope: 'global',
        storeName: 'My Store',
        storeDescription: null,
        currency: 'USD',
        currencySymbol: '$',
        taxRate: 0,
        taxLabel: 'Tax',
        shippingEnabled: true,
        portalEnabled: true,
        allowGuestCheckout: false,
        trackInventory: true,
        lowStockThreshold: 10,
        autoGenerateOrderNumbers: true,
        orderNumberPrefix: 'ORD',
        codEnabled: true,
        codFee: 0,
        codMinOrderAmount: 0,
        codMaxOrderAmount: null,
        codAvailableCountries: [],
      },
    });
    console.log('✅ Created default e-commerce settings');
  } else {
    console.log('⏭️  E-commerce settings already exist');
  }

  // Create payment methods
  console.log('Creating payment methods...');
  
  const paymentMethods = [
    {
      name: 'Cash on Delivery',
      type: 'COD',
      description: 'Pay with cash when your order is delivered',
      isActive: true,
      displayOrder: 1,
      configuration: {
        fee: 0,
        minOrderAmount: 0,
        maxOrderAmount: null,
        availableCountries: [],
      },
    },
    {
      name: 'Credit Card',
      type: 'CARD',
      description: 'Pay securely with your credit or debit card',
      isActive: false,
      displayOrder: 2,
      configuration: {
        supportedCards: ['visa', 'mastercard', 'amex'],
        requireCvv: true,
      },
    },
    {
      name: 'PayPal',
      type: 'PAYPAL',
      description: 'Pay with your PayPal account',
      isActive: false,
      displayOrder: 3,
      configuration: {
        environment: 'sandbox',
      },
    },
  ];

  for (const method of paymentMethods) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { type: method.type },
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

  // Seed Dashboard Customization System
  console.log('Creating widget definitions...');
  
  // Import auto-discovered widget definitions
  const { widgetDefinitions: discoveredWidgets } = require('./seed-data/widgets.seed');
  
  // Transform discovered widgets to match database schema
  const widgetDefinitions = discoveredWidgets.map((widget: any) => ({
    key: widget.key,
    name: widget.name,
    description: widget.description,
    component: widget.component,
    category: widget.category,
    icon: widget.icon,
    defaultGridSpan: widget.defaultGridSpan,
    minGridSpan: widget.minGridSpan,
    maxGridSpan: widget.maxGridSpan,
    configSchema: widget.configSchema,
    dataRequirements: widget.dataRequirements,
    useCases: widget.useCases,
    examples: widget.examples,
    tags: widget.tags,
    isActive: true,
    isSystemWidget: widget.isSystemWidget,
  }));

  for (const widget of widgetDefinitions) {
    const existing = await prisma.widgetDefinition.findUnique({
      where: { key: widget.key },
    });

    if (!existing) {
      await prisma.widgetDefinition.create({
        data: widget,
      });
      console.log(`✅ Created widget definition: ${widget.name}`);
    } else {
      console.log(`⏭️  Widget definition already exists: ${widget.name}`);
    }
  }

  // Seed default dashboard layouts using templates
  const { seedDashboardLayouts, seedDemoLayouts } = require('./seed-data/dashboard-layouts.seed');
  await seedDashboardLayouts();
  
  // Seed demo layouts for showcasing different use cases
  await seedDemoLayouts();

  // Seed dashboard menus
  const { seedDashboardMenus } = require('./seed-data/dashboard-menus.seed');
  await seedDashboardMenus(prisma);

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
