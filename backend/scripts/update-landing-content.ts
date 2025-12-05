import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLandingContent() {
  console.log('🔄 Updating landing page content...\n');

  // Find existing landing page
  const existingLandingPage = await prisma.landingPageContent.findFirst({
    where: { isActive: true },
  });

  if (!existingLandingPage) {
    console.log('❌ No existing landing page found');
    return;
  }

  // Update with new structure
  await prisma.landingPageContent.update({
    where: { id: existingLandingPage.id },
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
            copyright: '© 2025 Dashboard Application. All rights reserved.',
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
      publishedAt: new Date(),
    },
  });

  console.log('✅ Landing page content updated successfully!');
  await prisma.$disconnect();
}

updateLandingContent().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
