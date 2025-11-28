import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFeatureFlags() {
  console.log('Seeding feature flags...');

  const features = [
    {
      key: 'landing',
      name: 'Landing Page',
      description: 'Public landing page and marketing site',
      category: 'content',
      relatedTables: ['landing_page_contents', 'section_templates'],
    },
    {
      key: 'blog',
      name: 'Blog System',
      description: 'Blog posts, categories, and tags',
      category: 'content',
      relatedTables: ['blog_posts', 'blog_categories', 'blog_tags'],
    },
    {
      key: 'ecommerce',
      name: 'E-Commerce',
      description: 'Shop, products, cart, checkout, and orders',
      category: 'ecommerce',
      relatedTables: [
        'products',
        'product_categories',
        'carts',
        'cart_items',
        'orders',
        'order_items',
        'shipping_methods',
        'payment_methods',
      ],
    },
    {
      key: 'calendar',
      name: 'Calendar & Events',
      description: 'Calendar system with events and scheduling',
      category: 'communication',
      relatedTables: [
        'calendar_events',
        'event_attendees',
        'event_reminders',
        'event_categories',
        'recurrence_rules',
      ],
    },
    {
      key: 'crm',
      name: 'CRM System',
      description: 'Customer relationship management (future)',
      category: 'general',
      relatedTables: [],
    },
    {
      key: 'notifications',
      name: 'Notifications',
      description: 'Notification system and delivery',
      category: 'communication',
      relatedTables: ['notifications', 'notification_templates', 'notification_preferences'],
    },
    {
      key: 'customerAccount',
      name: 'Customer Account',
      description: 'Customer profiles, addresses, and account settings',
      category: 'ecommerce',
      relatedTables: ['customers', 'addresses', 'customer_payment_methods', 'account_settings'],
    },
  ];

  for (const feature of features) {
    const isEnabled = process.env[`ENABLE_${feature.key.toUpperCase()}`] === 'true';

    try {
      await prisma.featureFlag.upsert({
        where: { key: feature.key },
        update: {
          isEnabled,
        },
        create: {
          key: feature.key,
          name: feature.name,
          description: feature.description,
          category: feature.category,
          isEnabled,
          isSystem: true,
          relatedTables: feature.relatedTables,
        },
      });

      const status = isEnabled ? '✅' : '⏭️';
      console.log(`${status} Feature flag: ${feature.name} (${isEnabled ? 'enabled' : 'disabled'})`);
    } catch (error) {
      console.error(`❌ Failed to seed feature flag ${feature.key}:`, error);
    }
  }

  console.log('✅ Feature flags seeded successfully');
}
