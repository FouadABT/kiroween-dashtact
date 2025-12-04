import { PrismaClient } from '@prisma/client';
import { DEFAULT_PERMISSIONS, DEFAULT_ROLES } from './seed-data/auth.seed';
import {
  MESSAGING_PERMISSIONS,
  DEFAULT_MESSAGING_SETTINGS,
} from './seed-data/messaging.seed';
import { seedLandingCMS } from './seed-data/landing-cms.seed';
import { seedProducts } from './seed-data/products.seed';
import { seedFeatureFlags } from './seed-data/feature-flags.seed';

const prisma = new PrismaClient();

/**
 * Feature Flags Configuration
 * Read from environment variables to control which features are seeded
 */
interface FeatureFlags {
  landing: boolean;
  blog: boolean;
  ecommerce: boolean;
  calendar: boolean;
  crm: boolean;
  notifications: boolean;
  customerAccount: boolean;
}

function getFeatureFlags(): FeatureFlags {
  // Read feature flags from environment variables
  // These are passed by the CLI setup tool
  const flags = {
    landing: process.env.ENABLE_LANDING === 'true',
    blog: process.env.ENABLE_BLOG === 'true',
    ecommerce: process.env.ENABLE_ECOMMERCE === 'true',
    calendar: process.env.ENABLE_CALENDAR === 'true',
    crm: process.env.ENABLE_CRM === 'true',
    notifications: process.env.ENABLE_NOTIFICATIONS === 'true',
    customerAccount: process.env.ENABLE_CUSTOMER_ACCOUNT === 'true',
  };

  // Log the flags being used for debugging
  console.log('📋 Feature Flags (from environment):');
  console.log(`  Landing: ${flags.landing} (ENABLE_LANDING=${process.env.ENABLE_LANDING})`);
  console.log(`  Blog: ${flags.blog} (ENABLE_BLOG=${process.env.ENABLE_BLOG})`);
  console.log(`  E-commerce: ${flags.ecommerce} (ENABLE_ECOMMERCE=${process.env.ENABLE_ECOMMERCE})`);
  console.log(`  Calendar: ${flags.calendar} (ENABLE_CALENDAR=${process.env.ENABLE_CALENDAR})`);
  console.log(`  CRM: ${flags.crm} (ENABLE_CRM=${process.env.ENABLE_CRM})`);
  console.log(`  Notifications: ${flags.notifications} (ENABLE_NOTIFICATIONS=${process.env.ENABLE_NOTIFICATIONS})`);
  console.log(`  Customer Account: ${flags.customerAccount} (ENABLE_CUSTOMER_ACCOUNT=${process.env.ENABLE_CUSTOMER_ACCOUNT})`);

  return flags;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Read feature flags from environment
  const featureFlags = getFeatureFlags();

  // Seed Feature Flags Configuration
  await seedFeatureFlags();

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
    // Read theme mode from environment variable (set by setup CLI)
    const themeMode = process.env.THEME_MODE || 'system';
    
    await prisma.settings.create({
      data: {
        scope: 'global',
        themeMode,
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
    console.log(`   Theme Mode: ${themeMode}`);
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

  // Seed dashboard menus with feature flags
  const { seedDashboardMenus } = require('./seed-data/dashboard-menus.seed');
  await seedDashboardMenus(prisma, featureFlags);

  // Seed default widget instances by role (after users are created)
  console.log('Seeding default widget instances for role-based dashboards...');
  try {
    const { seedDefaultWidgetInstances } = require('./seed-data/dashboard-widgets.seed');
    await seedDefaultWidgetInstances(prisma, featureFlags);
  } catch (error) {
    console.log('⚠️  Could not seed default widget instances (users may not exist yet):', error.message);
  }

  // Seed default dashboard layouts for each role
  console.log('Seeding default dashboard layouts...');
  try {
    const { defaultLayoutsSeed } = require('./seed-data/default-layouts.seed');
    
    // Get all users grouped by role
    const users = await prisma.user.findMany({
      include: { role: true },
    });

    let createdLayoutsCount = 0;
    let createdInstancesCount = 0;
    
    for (const user of users) {
      const roleName = user.role.name;
      const userLayouts = defaultLayoutsSeed.filter(layout => layout.role === roleName);
      
      // Group by page
      const pageGroups = new Map<string, typeof userLayouts>();
      for (const layout of userLayouts) {
        if (!pageGroups.has(layout.page)) {
          pageGroups.set(layout.page, []);
        }
        pageGroups.get(layout.page)!.push(layout);
      }
      
      // Create layout and instances for each page
      for (const [page, layouts] of pageGroups) {
        // Find or create dashboard layout
        let dashboardLayout = await prisma.dashboardLayout.findUnique({
          where: {
            pageId_userId: {
              pageId: page,
              userId: user.id,
            },
          },
        });

        if (!dashboardLayout) {
          dashboardLayout = await prisma.dashboardLayout.create({
            data: {
              pageId: page,
              userId: user.id,
              scope: 'user',
              name: `${roleName} ${page} Layout`,
              description: `Default ${page} layout for ${roleName} role`,
              isActive: true,
              isDefault: true,
            },
          });
          createdLayoutsCount++;
        }

        // Create widget instances
        for (const layout of layouts) {
          // Check if instance already exists
          const existing = await prisma.widgetInstance.findFirst({
            where: {
              layoutId: dashboardLayout.id,
              widgetKey: layout.widgetKey,
            },
          });

          if (!existing) {
            await prisma.widgetInstance.create({
              data: {
                layoutId: dashboardLayout.id,
                widgetKey: layout.widgetKey,
                position: layout.position,
                gridSpan: layout.gridSpan,
                config: layout.config,
              },
            });
            createdInstancesCount++;
          }
        }
      }
    }
    
    console.log(`✅ Created ${createdLayoutsCount} dashboard layouts and ${createdInstancesCount} widget instances for ${users.length} users`);
  } catch (error) {
    console.log('⚠️  Could not seed default layouts:', error.message);
    console.error(error);
  }

  // Seed email permissions and templates
  console.log('Seeding email system...');
  const { EMAIL_PERMISSIONS, DEFAULT_EMAIL_TEMPLATES } = require('./seed-data/email.seed');
  
  // Create email permissions
  for (const permission of EMAIL_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { name: permission.name },
    });

    if (!existing) {
      await prisma.permission.create({
        data: permission,
      });
      console.log(`✅ Created email permission: ${permission.name}`);
    } else {
      console.log(`⏭️  Email permission already exists: ${permission.name}`);
    }
  }

  // Assign email permissions to Super Admin role
  const superAdminRole = await prisma.userRole.findUnique({
    where: { name: 'Super Admin' },
  });

  if (superAdminRole) {
    for (const permissionDef of EMAIL_PERMISSIONS) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionDef.name },
      });

      if (permission) {
        const existingAssignment = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: superAdminRole.id,
              permissionId: permission.id,
            },
          },
        });

        if (!existingAssignment) {
          await prisma.rolePermission.create({
            data: {
              roleId: superAdminRole.id,
              permissionId: permission.id,
            },
          });
          console.log(`  ✅ Assigned email permission to Super Admin: ${permissionDef.name}`);
        }
      }
    }
  }

  // Create default email templates
  // Get a super admin user for createdBy/updatedBy
  const superAdmin = await prisma.user.findFirst({
    where: {
      role: {
        name: 'Super Admin',
      },
    },
  });

  const systemUserId = superAdmin?.id || 'system';

  for (const template of DEFAULT_EMAIL_TEMPLATES) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { slug: template.slug },
    });

    if (!existing) {
      await prisma.emailTemplate.create({
        data: {
          ...template,
          createdBy: systemUserId,
          updatedBy: systemUserId,
        },
      });
      console.log(`✅ Created email template: ${template.name}`);
    } else {
      console.log(`⏭️  Email template already exists: ${template.name}`);
    }
  }

  // Seed messaging system
  console.log('Seeding messaging system...');
  const { MESSAGING_PERMISSIONS, DEFAULT_MESSAGING_SETTINGS } = require('./seed-data/messaging.seed');
  
  // Create messaging permissions
  for (const permission of MESSAGING_PERMISSIONS) {
    const existing = await prisma.permission.findUnique({
      where: { name: permission.name },
    });

    if (!existing) {
      await prisma.permission.create({
        data: permission,
      });
      console.log(`✅ Created messaging permission: ${permission.name}`);
    } else {
      console.log(`⏭️  Messaging permission already exists: ${permission.name}`);
    }
  }

  // Assign messaging permissions to roles
  const roles = await prisma.userRole.findMany({
    where: {
      name: {
        in: ['Super Admin', 'Admin', 'User'],
      },
    },
  });

  for (const role of roles) {
    // Super Admin gets all messaging permissions
    if (role.name === 'Super Admin') {
      for (const permissionDef of MESSAGING_PERMISSIONS) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionDef.name },
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
            console.log(`  ✅ Assigned messaging permission to ${role.name}: ${permissionDef.name}`);
          }
        }
      }
    }
    // Admin and User get messaging:access permission
    else if (role.name === 'Admin' || role.name === 'User') {
      const permission = await prisma.permission.findUnique({
        where: { name: 'messaging:access' },
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
          console.log(`  ✅ Assigned messaging:access to ${role.name}`);
        }
      }
    }
  }

  // Create default messaging settings
  console.log('Creating default messaging settings...');
  const existingMessagingSettings = await prisma.messagingSettings.findFirst();

  if (!existingMessagingSettings) {
    await prisma.messagingSettings.create({
      data: DEFAULT_MESSAGING_SETTINGS,
    });
    console.log('✅ Created default messaging settings');
  } else {
    console.log('⏭️  Messaging settings already exist');
  }

  // Seed branding
  const { seedBranding } = require('./seed-data/branding.seed');
  await seedBranding(prisma);

  // Seed cron jobs permissions
  const { seedCronJobsPermissions } = require('./seed-data/cron-jobs.seed');
  await seedCronJobsPermissions(prisma);

  // Seed legal pages
  console.log('Creating default legal pages...');
  
  const defaultLegalPages = [
    {
      pageType: 'TERMS',
      content: `# Terms of Service

Last updated: ${new Date().toLocaleDateString()}

## 1. Acceptance of Terms

By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License

Permission is granted to temporarily access the materials on this website for personal, non-commercial transitory viewing only.

## 3. Disclaimer

The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

## 4. Limitations

In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.

## 5. Revisions

We may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.

## 6. Governing Law

These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`,
    },
    {
      pageType: 'PRIVACY',
      content: `# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## 1. Information We Collect

We collect information that you provide directly to us, including when you create an account, use our services, or communicate with us.

### Personal Information
- Name and contact information
- Account credentials
- Payment information
- Usage data and preferences

## 2. How We Use Your Information

We use the information we collect to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send technical notices and support messages
- Respond to your comments and questions
- Monitor and analyze trends and usage

## 3. Information Sharing

We do not sell, trade, or rent your personal information to third parties. We may share your information with:
- Service providers who assist in our operations
- Law enforcement when required by law
- Other parties with your consent

## 4. Data Security

We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

## 5. Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Object to processing of your data
- Export your data

## 6. Cookies

We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.

## 7. Children's Privacy

Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.

## 8. Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## 9. Contact Us

If you have any questions about this Privacy Policy, please contact us.`,
    },
  ];

  for (const legalPage of defaultLegalPages) {
    const existing = await prisma.legalPage.findUnique({
      where: { pageType: legalPage.pageType as any },
    });

    if (!existing) {
      await prisma.legalPage.create({
        data: legalPage as any,
      });
      console.log(`✅ Created legal page: ${legalPage.pageType}`);
    } else {
      console.log(`⏭️  Legal page already exists: ${legalPage.pageType}`);
    }
  }

  // Seed Products (conditional on ecommerce feature)
  if (featureFlags.ecommerce) {
    console.log('🛍️  Seeding e-commerce data...');
    await seedProducts();

    // Seed Shipping Methods
    const { seedShippingMethods } = require('./seed-data/shipping-methods.seed');
    await seedShippingMethods();

    // Seed Payment Methods
    const { seedPaymentMethods } = require('./seed-data/payment-methods.seed');
    await seedPaymentMethods();
  } else {
    console.log('⏭️  E-commerce feature disabled, skipping products seed');
  }

  // Seed Landing CMS enhancements (conditional on landing feature)
  if (featureFlags.landing) {
    console.log('🎨 Seeding landing page CMS...');
    await seedLandingCMS(prisma);
  } else {
    console.log('⏭️  Landing feature disabled, skipping landing CMS seed');
  }

  // Seed Calendar System (conditional on calendar feature)
  if (featureFlags.calendar) {
    console.log('📅 Seeding calendar system...');
    const { seedCalendar } = require('./seed-data/calendar.seed');
    await seedCalendar(prisma);
  } else {
    console.log('⏭️  Calendar feature disabled, skipping calendar seed');
  }

  // Seed Coaching Platform
  console.log('🏋️ Seeding coaching platform...');
  const { seedCoachingPermissions } = require('./seed-data/coaching.seed');
  await seedCoachingPermissions();

  // Create default admin account after all seeds complete
  console.log('👤 Creating default admin account...');
  try {
    const { SetupService } = require('../src/setup/setup.service');
    const setupService = new SetupService(prisma);
    await setupService.createDefaultAdminAccount();
  } catch (error) {
    console.log('⚠️  Could not create default admin account:', error.message);
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
