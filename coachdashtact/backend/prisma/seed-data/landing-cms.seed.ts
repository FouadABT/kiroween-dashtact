import { PrismaClient } from '@prisma/client';

export async function seedLandingCMS(prisma: PrismaClient) {
  console.log('🎨 Seeding Landing CMS enhancements...');

  // Seed professional header configuration
  const headerConfig = await prisma.headerConfig.upsert({
    where: { id: 'default-header' },
    update: {},
    create: {
      id: 'default-header',
      logoLight: null,
      logoDark: null,
      logoSize: 'md',
      logoLink: '/',
      navigation: [
        {
          label: 'Features',
          link: '#features',
          type: 'internal',
        },
        {
          label: 'Technology',
          link: '#technology',
          type: 'internal',
        },
        {
          label: 'Use Cases',
          link: '#use-cases',
          type: 'internal',
        },
        {
          label: 'Pricing',
          link: '/pricing',
          type: 'internal',
        },
        {
          label: 'Documentation',
          link: '/docs',
          type: 'internal',
        },
        {
          label: 'Blog',
          link: '/blog',
          type: 'internal',
        },
      ],
      ctas: [
        {
          text: 'Sign In',
          link: '/login',
          style: 'secondary',
        },
        {
          text: 'Start Free Trial',
          link: '/signup',
          style: 'primary',
        },
      ],
      style: {
        background: '#ffffff',
        sticky: true,
        stickyBehavior: 'always',
        transparent: false,
        shadow: true,
      },
      mobileMenu: {
        enabled: true,
        iconStyle: 'hamburger',
        animation: 'slide',
      },
    },
  });

  console.log('✅ Header configuration seeded');

  // Seed professional footer configuration
  const footerConfig = await prisma.footerConfig.upsert({
    where: { id: 'default-footer' },
    update: {},
    create: {
      id: 'default-footer',
      layout: 'multi-column',
      columns: [
        {
          heading: 'Product',
          type: 'links',
          links: [
            { label: 'Features', link: '/#features' },
            { label: 'Technology Stack', link: '/#technology' },
            { label: 'Use Cases', link: '/#use-cases' },
            { label: 'Pricing', link: '/pricing' },
            { label: 'Changelog', link: '/changelog' },
            { label: 'Roadmap', link: '/roadmap' },
          ],
        },
        {
          heading: 'Resources',
          type: 'links',
          links: [
            { label: 'Documentation', link: '/docs' },
            { label: 'API Reference', link: '/docs/api' },
            { label: 'Guides & Tutorials', link: '/docs/guides' },
            { label: 'Component Library', link: '/docs/components' },
            { label: 'Code Examples', link: '/docs/examples' },
            { label: 'Video Tutorials', link: '/docs/videos' },
          ],
        },
        {
          heading: 'Company',
          type: 'links',
          links: [
            { label: 'About Us', link: '/about' },
            { label: 'Blog', link: '/blog' },
            { label: 'Careers', link: '/careers' },
            { label: 'Press Kit', link: '/press' },
            { label: 'Partners', link: '/partners' },
            { label: 'Contact', link: '/contact' },
          ],
        },
        {
          heading: 'Support',
          type: 'links',
          links: [
            { label: 'Help Center', link: '/help' },
            { label: 'Community Forum', link: '/community' },
            { label: 'System Status', link: '/status' },
            { label: 'Report a Bug', link: '/report-bug' },
            { label: 'Feature Requests', link: '/feature-requests' },
            { label: 'Contact Support', link: '/support' },
          ],
        },
        {
          heading: 'Legal',
          type: 'links',
          links: [
            { label: 'Privacy Policy', link: '/privacy' },
            { label: 'Terms of Service', link: '/terms' },
            { label: 'Cookie Policy', link: '/cookies' },
            { label: 'GDPR Compliance', link: '/gdpr' },
            { label: 'Security', link: '/security' },
            { label: 'Licenses', link: '/licenses' },
          ],
        },
      ],
      social: [
        {
          platform: 'twitter',
          url: 'https://twitter.com/dashboardkit',
          icon: 'twitter',
        },
        {
          platform: 'github',
          url: 'https://github.com/dashboardkit',
          icon: 'github',
        },
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/company/dashboardkit',
          icon: 'linkedin',
        },
        {
          platform: 'youtube',
          url: 'https://youtube.com/@dashboardkit',
          icon: 'youtube',
        },
        {
          platform: 'discord',
          url: 'https://discord.gg/dashboardkit',
          icon: 'discord',
        },
      ],
      newsletter: {
        enabled: true,
        title: 'Stay Updated',
        description:
          'Get the latest updates, tutorials, and announcements delivered to your inbox.',
        placeholder: 'Enter your email address',
        buttonText: 'Subscribe',
      },
      copyright: `© ${new Date().getFullYear()} Dashboard Starter Kit. All rights reserved.`,
      legalLinks: [
        { label: 'Privacy Policy', link: '/privacy' },
        { label: 'Terms of Service', link: '/terms' },
        { label: 'Cookie Policy', link: '/cookies' },
        { label: 'Security', link: '/security' },
      ],
      style: {
        background: '#f9fafb',
        textColor: '#374151',
        borderTop: true,
      },
    },
  });

  console.log('✅ Footer configuration seeded');

  // Seed section templates
  const templates = [
    // Hero Templates
    {
      name: 'Hero - Centered',
      description: 'Centered hero section with headline and CTAs',
      category: 'Hero',
      thumbnail: null,
      section: {
        type: 'hero',
        data: {
          headline: 'Welcome to Our Platform',
          subheadline: 'Build amazing things with our powerful tools',
          primaryCta: {
            text: 'Get Started',
            link: '/signup',
            linkType: 'url',
          },
          secondaryCta: {
            text: 'Learn More',
            link: '/about',
            linkType: 'url',
          },
          backgroundType: 'gradient',
          backgroundColor: 'oklch(0.5 0.2 250)',
          textAlignment: 'center',
          height: 'large',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'Hero - Left Aligned',
      description: 'Left-aligned hero with image on right',
      category: 'Hero',
      thumbnail: null,
      section: {
        type: 'hero',
        data: {
          headline: 'Transform Your Business',
          subheadline: 'Powerful solutions for modern teams',
          primaryCta: {
            text: 'Start Free Trial',
            link: '/signup',
            linkType: 'url',
          },
          backgroundType: 'color',
          backgroundColor: '#ffffff',
          textAlignment: 'left',
          height: 'medium',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Features Templates
    {
      name: 'Features - 3 Column Grid',
      description: 'Three-column feature grid with icons',
      category: 'Features',
      thumbnail: null,
      section: {
        type: 'features',
        data: {
          title: 'Our Features',
          subtitle: 'Everything you need to succeed',
          layout: 'grid',
          columns: 3,
          features: [
            {
              id: 'feature-1',
              icon: 'zap',
              title: 'Fast Performance',
              description: 'Lightning-fast load times',
              order: 1,
            },
            {
              id: 'feature-2',
              icon: 'shield',
              title: 'Secure',
              description: 'Enterprise-grade security',
              order: 2,
            },
            {
              id: 'feature-3',
              icon: 'users',
              title: 'Collaborative',
              description: 'Work together seamlessly',
              order: 3,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'Features - List Layout',
      description: 'Vertical list of features',
      category: 'Features',
      thumbnail: null,
      section: {
        type: 'features',
        data: {
          title: 'Why Choose Us',
          subtitle: 'Built for modern teams',
          layout: 'list',
          columns: 1,
          features: [
            {
              id: 'feature-1',
              icon: 'check',
              title: 'Easy to Use',
              description: 'Intuitive interface that anyone can master',
              order: 1,
            },
            {
              id: 'feature-2',
              icon: 'check',
              title: 'Powerful Features',
              description: 'Everything you need in one place',
              order: 2,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // CTA Templates
    {
      name: 'CTA - Centered',
      description: 'Centered call-to-action section',
      category: 'CTA',
      thumbnail: null,
      section: {
        type: 'cta',
        data: {
          title: 'Ready to Get Started?',
          description: 'Join thousands of users already using our platform',
          primaryCta: {
            text: 'Sign Up Now',
            link: '/signup',
            linkType: 'url',
          },
          backgroundColor: 'oklch(0.5 0.2 250)',
          textColor: 'oklch(1 0 0)',
          alignment: 'center',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'CTA - With Secondary Button',
      description: 'CTA with primary and secondary actions',
      category: 'CTA',
      thumbnail: null,
      section: {
        type: 'cta',
        data: {
          title: 'Start Your Free Trial',
          description: 'No credit card required. Cancel anytime.',
          primaryCta: {
            text: 'Get Started',
            link: '/signup',
            linkType: 'url',
          },
          secondaryCta: {
            text: 'View Demo',
            link: '/demo',
            linkType: 'url',
          },
          backgroundColor: '#f9fafb',
          textColor: '#111827',
          alignment: 'center',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Testimonials Templates
    {
      name: 'Testimonials - Grid',
      description: 'Grid layout for customer testimonials',
      category: 'Testimonials',
      thumbnail: null,
      section: {
        type: 'testimonials',
        data: {
          title: 'What Our Customers Say',
          subtitle: 'Trusted by thousands of users worldwide',
          layout: 'grid',
          testimonials: [
            {
              id: 'testimonial-1',
              quote: 'This product has transformed our workflow!',
              author: 'John Doe',
              role: 'CEO, Company Inc',
              avatar: null,
              rating: 5,
              order: 1,
            },
            {
              id: 'testimonial-2',
              quote: 'Best investment we made this year.',
              author: 'Jane Smith',
              role: 'CTO, Tech Corp',
              avatar: null,
              rating: 5,
              order: 2,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Stats Templates
    {
      name: 'Stats - 4 Column',
      description: 'Four-column statistics display',
      category: 'Stats',
      thumbnail: null,
      section: {
        type: 'stats',
        data: {
          title: 'Our Impact',
          subtitle: 'Numbers that matter',
          layout: 'grid',
          stats: [
            {
              id: 'stat-1',
              value: '10,000+',
              label: 'Active Users',
              order: 1,
            },
            {
              id: 'stat-2',
              value: '99.9%',
              label: 'Uptime',
              order: 2,
            },
            {
              id: 'stat-3',
              value: '50+',
              label: 'Countries',
              order: 3,
            },
            {
              id: 'stat-4',
              value: '24/7',
              label: 'Support',
              order: 4,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Content Templates
    {
      name: 'Content - Image Left',
      description: 'Content section with image on left',
      category: 'Content',
      thumbnail: null,
      section: {
        type: 'content',
        data: {
          title: 'About Our Platform',
          content:
            '<p>We provide powerful tools to help you build amazing products.</p>',
          imageUrl: null,
          imagePosition: 'left',
          backgroundColor: '#ffffff',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'Content - Image Right',
      description: 'Content section with image on right',
      category: 'Content',
      thumbnail: null,
      section: {
        type: 'content',
        data: {
          title: 'Our Mission',
          content:
            '<p>Empowering teams to achieve more through innovative solutions.</p>',
          imageUrl: null,
          imagePosition: 'right',
          backgroundColor: '#f9fafb',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Additional Hero Templates
    {
      name: 'Hero - Split Screen',
      description: 'Split screen hero with content and image',
      category: 'Hero',
      thumbnail: null,
      section: {
        type: 'hero',
        data: {
          headline: 'Build Better Products',
          subheadline: 'The all-in-one platform for modern teams',
          primaryCta: {
            text: 'Get Started Free',
            link: '/signup',
            linkType: 'url',
          },
          backgroundType: 'color',
          backgroundColor: '#ffffff',
          textAlignment: 'left',
          height: 'large',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'Hero - Video Background',
      description: 'Hero section with video background',
      category: 'Hero',
      thumbnail: null,
      section: {
        type: 'hero',
        data: {
          headline: 'Experience the Future',
          subheadline: 'Innovation meets simplicity',
          primaryCta: {
            text: 'Watch Demo',
            link: '/demo',
            linkType: 'url',
          },
          backgroundType: 'video',
          backgroundColor: '#000000',
          textAlignment: 'center',
          height: 'large',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Additional Features Templates
    {
      name: 'Features - 4 Column Grid',
      description: 'Four-column feature grid',
      category: 'Features',
      thumbnail: null,
      section: {
        type: 'features',
        data: {
          title: 'Complete Feature Set',
          subtitle: 'Everything you need in one place',
          layout: 'grid',
          columns: 4,
          features: [
            {
              id: 'feature-1',
              icon: 'zap',
              title: 'Fast',
              description: 'Lightning speed',
              order: 1,
            },
            {
              id: 'feature-2',
              icon: 'shield',
              title: 'Secure',
              description: 'Bank-level security',
              order: 2,
            },
            {
              id: 'feature-3',
              icon: 'users',
              title: 'Collaborative',
              description: 'Team-friendly',
              order: 3,
            },
            {
              id: 'feature-4',
              icon: 'globe',
              title: 'Global',
              description: 'Worldwide access',
              order: 4,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'Features - Carousel',
      description: 'Carousel layout for features',
      category: 'Features',
      thumbnail: null,
      section: {
        type: 'features',
        data: {
          title: 'Powerful Features',
          subtitle: 'Swipe to explore',
          layout: 'carousel',
          columns: 1,
          features: [
            {
              id: 'feature-1',
              icon: 'star',
              title: 'Premium Quality',
              description: 'Top-tier performance',
              order: 1,
            },
            {
              id: 'feature-2',
              icon: 'heart',
              title: 'User Friendly',
              description: 'Intuitive design',
              order: 2,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Additional Testimonials Templates
    {
      name: 'Testimonials - Carousel',
      description: 'Carousel layout for testimonials',
      category: 'Testimonials',
      thumbnail: null,
      section: {
        type: 'testimonials',
        data: {
          title: 'Customer Stories',
          subtitle: 'See what our users are saying',
          layout: 'carousel',
          testimonials: [
            {
              id: 'testimonial-1',
              quote: 'Game-changing platform!',
              author: 'Sarah Johnson',
              role: 'Product Manager',
              avatar: null,
              rating: 5,
              order: 1,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'Testimonials - Masonry',
      description: 'Masonry layout for testimonials',
      category: 'Testimonials',
      thumbnail: null,
      section: {
        type: 'testimonials',
        data: {
          title: 'Wall of Love',
          subtitle: 'Real feedback from real users',
          layout: 'masonry',
          testimonials: [
            {
              id: 'testimonial-1',
              quote: 'Absolutely love this product!',
              author: 'Mike Chen',
              role: 'Developer',
              avatar: null,
              rating: 5,
              order: 1,
            },
            {
              id: 'testimonial-2',
              quote: 'Best tool for our team.',
              author: 'Emily Davis',
              role: 'Designer',
              avatar: null,
              rating: 5,
              order: 2,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Additional CTA Templates
    {
      name: 'CTA - Split Layout',
      description: 'Split layout CTA with image',
      category: 'CTA',
      thumbnail: null,
      section: {
        type: 'cta',
        data: {
          title: 'Join Our Community',
          description: 'Connect with thousands of users',
          primaryCta: {
            text: 'Join Now',
            link: '/signup',
            linkType: 'url',
          },
          backgroundColor: '#ffffff',
          textColor: '#111827',
          alignment: 'left',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'CTA - Minimal',
      description: 'Minimal CTA design',
      category: 'CTA',
      thumbnail: null,
      section: {
        type: 'cta',
        data: {
          title: 'Get Started Today',
          description: 'No setup required',
          primaryCta: {
            text: 'Start Free',
            link: '/signup',
            linkType: 'url',
          },
          backgroundColor: '#f9fafb',
          textColor: '#111827',
          alignment: 'center',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Additional Stats Templates
    {
      name: 'Stats - 3 Column',
      description: 'Three-column statistics',
      category: 'Stats',
      thumbnail: null,
      section: {
        type: 'stats',
        data: {
          title: 'By the Numbers',
          subtitle: 'Our achievements',
          layout: 'grid',
          stats: [
            {
              id: 'stat-5',
              value: '1M+',
              label: 'Downloads',
              order: 1,
            },
            {
              id: 'stat-6',
              value: '150+',
              label: 'Countries',
              order: 2,
            },
            {
              id: 'stat-7',
              value: '4.9/5',
              label: 'Rating',
              order: 3,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'Stats - Horizontal',
      description: 'Horizontal stats layout',
      category: 'Stats',
      thumbnail: null,
      section: {
        type: 'stats',
        data: {
          title: 'Trusted Worldwide',
          subtitle: '',
          layout: 'horizontal',
          stats: [
            {
              id: 'stat-8',
              value: '500K+',
              label: 'Users',
              order: 1,
            },
            {
              id: 'stat-9',
              value: '100+',
              label: 'Integrations',
              order: 2,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Additional Content Templates
    {
      name: 'Content - Centered',
      description: 'Centered content section',
      category: 'Content',
      thumbnail: null,
      section: {
        type: 'content',
        data: {
          title: 'Our Story',
          content: '<p>Founded with a mission to make technology accessible to everyone.</p>',
          imageUrl: null,
          imagePosition: 'center',
          backgroundColor: '#ffffff',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    {
      name: 'Content - Full Width',
      description: 'Full-width content section',
      category: 'Content',
      thumbnail: null,
      section: {
        type: 'content',
        data: {
          title: 'What We Do',
          content: '<p>We build tools that help teams collaborate and succeed.</p>',
          imageUrl: null,
          imagePosition: 'full',
          backgroundColor: '#f9fafb',
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Pricing Templates
    {
      name: 'Pricing - 3 Tiers',
      description: 'Three-tier pricing table',
      category: 'Pricing',
      thumbnail: null,
      section: {
        type: 'pricing',
        data: {
          title: 'Simple Pricing',
          subtitle: 'Choose the plan that fits your needs',
          plans: [
            {
              id: 'plan-1',
              name: 'Starter',
              price: '$9',
              period: 'month',
              features: ['Feature 1', 'Feature 2', 'Feature 3'],
              cta: { text: 'Get Started', link: '/signup', linkType: 'url' },
              order: 1,
            },
            {
              id: 'plan-2',
              name: 'Pro',
              price: '$29',
              period: 'month',
              features: ['All Starter features', 'Feature 4', 'Feature 5'],
              cta: { text: 'Get Started', link: '/signup', linkType: 'url' },
              highlighted: true,
              order: 2,
            },
            {
              id: 'plan-3',
              name: 'Enterprise',
              price: 'Custom',
              period: '',
              features: ['All Pro features', 'Feature 6', 'Feature 7'],
              cta: { text: 'Contact Sales', link: '/contact', linkType: 'url' },
              order: 3,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // FAQ Templates
    {
      name: 'FAQ - Accordion',
      description: 'FAQ section with accordion',
      category: 'FAQ',
      thumbnail: null,
      section: {
        type: 'faq',
        data: {
          title: 'Frequently Asked Questions',
          subtitle: 'Everything you need to know',
          faqs: [
            {
              id: 'faq-1',
              question: 'How does it work?',
              answer: 'Our platform is designed to be simple and intuitive.',
              order: 1,
            },
            {
              id: 'faq-2',
              question: 'What are the pricing options?',
              answer: 'We offer flexible pricing plans for teams of all sizes.',
              order: 2,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Team Templates
    {
      name: 'Team - Grid',
      description: 'Team members in grid layout',
      category: 'Team',
      thumbnail: null,
      section: {
        type: 'team',
        data: {
          title: 'Meet Our Team',
          subtitle: 'The people behind the product',
          layout: 'grid',
          members: [
            {
              id: 'member-1',
              name: 'John Doe',
              role: 'CEO & Founder',
              avatar: null,
              bio: 'Passionate about building great products',
              social: [],
              order: 1,
            },
            {
              id: 'member-2',
              name: 'Jane Smith',
              role: 'CTO',
              avatar: null,
              bio: 'Tech enthusiast and problem solver',
              social: [],
              order: 2,
            },
          ],
        },
      },
      isCustom: false,
      isPublic: true,
    },
    // Gallery Templates
    {
      name: 'Gallery - Grid',
      description: 'Image gallery in grid layout',
      category: 'Gallery',
      thumbnail: null,
      section: {
        type: 'gallery',
        data: {
          title: 'Our Work',
          subtitle: 'See what we have created',
          layout: 'grid',
          columns: 3,
          images: [],
        },
      },
      isCustom: false,
      isPublic: true,
    },
  ];

  for (const template of templates) {
    await prisma.sectionTemplate.upsert({
      where: { id: `template-${template.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `template-${template.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...template,
      },
    });
  }

  console.log(`✅ ${templates.length} section templates seeded`);

  // Seed professional landing page content for Dashboard Starter Kit
  const landingContent = await prisma.landingPageContent.upsert({
    where: { id: 'default-landing' },
    update: {},
    create: {
      id: 'default-landing',
      sections: [
        {
          id: 'hero-1',
          type: 'hero',
          enabled: true,
          order: 1,
          data: {
            headline: 'Enterprise Dashboard Starter Kit',
            subheadline:
              'Production-ready admin dashboard with advanced features, role-based access, and comprehensive management tools. Built with Next.js 14, NestJS, and PostgreSQL.',
            primaryCta: {
              text: 'Start Free Trial',
              link: '/signup',
              linkType: 'url',
            },
            secondaryCta: {
              text: 'View Demo',
              link: '/login',
              linkType: 'url',
            },
            backgroundType: 'gradient',
            textAlignment: 'center',
            height: 'large',
          },
        },
        {
          id: 'stats-1',
          type: 'stats',
          enabled: true,
          order: 2,
          data: {
            stats: [
              {
                value: '50+',
                label: 'Pre-built Components',
                description: 'Ready-to-use dashboard widgets',
              },
              {
                value: '99.9%',
                label: 'Uptime SLA',
                description: 'Enterprise-grade reliability',
              },
              {
                value: '10x',
                label: 'Faster Development',
                description: 'Ship products in days, not months',
              },
              {
                value: '24/7',
                label: 'Support Available',
                description: 'Expert help when you need it',
              },
            ],
            layout: 'horizontal',
            backgroundType: 'solid',
          },
        },
        {
          id: 'features-1',
          type: 'features',
          enabled: true,
          order: 3,
          data: {
            heading: 'Everything You Need to Build Modern Dashboards',
            subheading:
              'Comprehensive features for user management, analytics, e-commerce, and more',
            features: [
              {
                icon: 'Shield',
                title: 'Advanced Security',
                description:
                  'Two-factor authentication, role-based access control, JWT tokens, and comprehensive audit logging',
              },
              {
                icon: 'Users',
                title: 'User Management',
                description:
                  'Complete user lifecycle management with roles, permissions, profiles, and activity tracking',
              },
              {
                icon: 'BarChart3',
                title: 'Analytics & Reporting',
                description:
                  'Real-time dashboards, customizable widgets, data visualization, and export capabilities',
              },
              {
                icon: 'ShoppingCart',
                title: 'E-Commerce Ready',
                description:
                  'Full-featured store with products, inventory, orders, customers, and payment processing',
              },
              {
                icon: 'Layout',
                title: 'Customizable Layouts',
                description:
                  'Drag-and-drop dashboard builder, widget library, and personalized user experiences',
              },
              {
                icon: 'Mail',
                title: 'Email System',
                description:
                  'Template management, SMTP configuration, delivery tracking, and automated notifications',
              },
              {
                icon: 'MessageSquare',
                title: 'Messaging Platform',
                description:
                  'Real-time messaging, notifications, in-app alerts, and communication tools',
              },
              {
                icon: 'Clock',
                title: 'Cron Job Management',
                description:
                  'Schedule tasks, monitor execution, view logs, and automate workflows',
              },
              {
                icon: 'FileText',
                title: 'Content Management',
                description:
                  'Blog system, custom pages, landing page builder, and SEO optimization',
              },
              {
                icon: 'Palette',
                title: 'Branding & Themes',
                description:
                  'White-label ready with custom branding, dark mode, and theme customization',
              },
              {
                icon: 'Search',
                title: 'Global Search',
                description:
                  'Powerful search across all entities with filters, sorting, and quick navigation',
              },
              {
                icon: 'Zap',
                title: 'Performance Optimized',
                description:
                  'Built for speed with caching, lazy loading, and optimized database queries',
              },
            ],
            layout: 'grid',
            columns: 3,
          },
        },
        {
          id: 'features-2',
          type: 'features',
          enabled: true,
          order: 4,
          data: {
            heading: 'Built with Modern Technology Stack',
            subheading:
              'Industry-leading frameworks and tools for scalability and maintainability',
            features: [
              {
                icon: 'Code',
                title: 'Next.js 14 & React',
                description:
                  'Latest App Router, Server Components, and streaming for optimal performance',
              },
              {
                icon: 'Server',
                title: 'NestJS Backend',
                description:
                  'Scalable Node.js framework with TypeScript, dependency injection, and modular architecture',
              },
              {
                icon: 'Database',
                title: 'PostgreSQL & Prisma',
                description:
                  'Type-safe database access, migrations, and powerful query capabilities',
              },
              {
                icon: 'Paintbrush',
                title: 'Tailwind CSS & shadcn/ui',
                description:
                  'Beautiful, accessible components with dark mode and responsive design',
              },
              {
                icon: 'Lock',
                title: 'JWT & OAuth',
                description:
                  'Secure authentication with refresh tokens, session management, and social login',
              },
              {
                icon: 'TestTube',
                title: 'Testing Suite',
                description:
                  'Unit tests, integration tests, E2E tests with Jest and Vitest',
              },
            ],
            layout: 'grid',
            columns: 3,
          },
        },
        {
          id: 'testimonials-1',
          type: 'testimonials',
          enabled: true,
          order: 5,
          data: {
            heading: 'Trusted by Development Teams Worldwide',
            subheading: 'See what developers are saying about our starter kit',
            testimonials: [
              {
                quote:
                  'This dashboard starter kit saved us months of development time. The code quality is exceptional and the architecture is solid.',
                author: 'Sarah Chen',
                role: 'CTO, TechStart Inc',
                avatar: null,
              },
              {
                quote:
                  'The best admin dashboard template I\'ve used. Everything just works out of the box, and customization is straightforward.',
                author: 'Michael Rodriguez',
                role: 'Lead Developer, Digital Solutions',
                avatar: null,
              },
              {
                quote:
                  'Incredible attention to detail. The security features, testing coverage, and documentation are top-notch.',
                author: 'Emily Watson',
                role: 'Senior Engineer, CloudScale',
                avatar: null,
              },
            ],
            layout: 'grid',
            columns: 3,
          },
        },
        {
          id: 'content-1',
          type: 'content',
          enabled: true,
          order: 6,
          data: {
            heading: 'Why Choose Our Dashboard Starter Kit?',
            content:
              '<p>Building a production-ready admin dashboard from scratch takes months of development time. Our starter kit provides everything you need to launch faster:</p><ul><li><strong>Save Development Time:</strong> Pre-built components, authentication, and common features mean you can focus on your unique business logic</li><li><strong>Enterprise-Grade Security:</strong> Built-in security best practices, OWASP compliance, and regular security updates</li><li><strong>Scalable Architecture:</strong> Modular design that grows with your application from MVP to enterprise scale</li><li><strong>Comprehensive Documentation:</strong> Detailed guides, API documentation, and code examples for every feature</li><li><strong>Active Maintenance:</strong> Regular updates, bug fixes, and new features added continuously</li><li><strong>Developer Experience:</strong> TypeScript throughout, excellent IDE support, and helpful error messages</li></ul>',
            image: null,
            imagePosition: 'right',
            backgroundType: 'solid',
          },
        },
        {
          id: 'features-3',
          type: 'features',
          enabled: true,
          order: 7,
          data: {
            heading: 'Key Features for Every Use Case',
            subheading: 'Flexible and extensible for any type of application',
            features: [
              {
                icon: 'Building',
                title: 'SaaS Applications',
                description:
                  'Multi-tenancy support, subscription management, usage tracking, and billing integration',
              },
              {
                icon: 'Store',
                title: 'E-Commerce Platforms',
                description:
                  'Complete store management, inventory tracking, order processing, and customer portal',
              },
              {
                icon: 'GraduationCap',
                title: 'Educational Platforms',
                description:
                  'Course management, student tracking, content delivery, and progress monitoring',
              },
              {
                icon: 'Briefcase',
                title: 'Business Tools',
                description:
                  'CRM, project management, team collaboration, and workflow automation',
              },
              {
                icon: 'Heart',
                title: 'Healthcare Systems',
                description:
                  'Patient management, appointment scheduling, HIPAA compliance, and secure messaging',
              },
              {
                icon: 'TrendingUp',
                title: 'Analytics Platforms',
                description:
                  'Data visualization, custom reports, real-time metrics, and export capabilities',
              },
            ],
            layout: 'grid',
            columns: 3,
          },
        },
        {
          id: 'cta-1',
          type: 'cta',
          enabled: true,
          order: 8,
          data: {
            heading: 'Ready to Build Your Next Project?',
            subheading:
              'Start with our production-ready dashboard and ship faster. No credit card required.',
            primaryCta: {
              text: 'Start Free Trial',
              link: '/signup',
              linkType: 'url',
            },
            secondaryCta: {
              text: 'View Documentation',
              link: '/docs',
              linkType: 'url',
            },
            backgroundType: 'gradient',
            alignment: 'center',
          },
        },
      ],
      settings: {
        theme: {
          primaryColor: 'oklch(0.5 0.2 250)',
        },
        layout: {
          maxWidth: 'container',
          spacing: 'normal',
        },
        seo: {
          title:
            'Enterprise Dashboard Starter Kit - Next.js, NestJS, PostgreSQL',
          description:
            'Production-ready admin dashboard with advanced features, role-based access, e-commerce, analytics, and comprehensive management tools. Built with Next.js 14, NestJS, and PostgreSQL.',
          keywords: [
            'dashboard',
            'admin panel',
            'starter kit',
            'nextjs',
            'nestjs',
            'postgresql',
            'typescript',
            'react',
            'tailwind',
            'saas',
            'enterprise',
          ],
        },
      },
      isActive: true,
    },
  });

  console.log('✅ Landing page content seeded');
}
