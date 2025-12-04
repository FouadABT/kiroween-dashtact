/**
 * Page Metadata Configuration
 * 
 * Centralized configuration for all page metadata, breadcrumbs, and SEO settings.
 * This is the single source of truth for metadata across the application.
 */

import { PageMetadata } from '@/types/metadata';
import type { BrandSettings } from '@/types/branding';
import { DEFAULT_BRANDING } from '@/lib/constants/branding';

/**
 * Default metadata applied to all pages as fallback
 */
export const defaultMetadata: PageMetadata = {
  title: 'Dashboard Application',
  description: 'Professional dashboard application with comprehensive features',
  keywords: ['dashboard', 'admin', 'management', 'analytics'],
  openGraph: {
    type: 'website',
    siteName: 'Dashboard Application',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Dashboard Application - Professional dashboard with comprehensive features',
        type: 'image/svg+xml',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dashboard',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    maxImagePreview: 'large',
    maxSnippet: 160,
  },
};

/**
 * Route-specific metadata configuration
 * 
 * Key format: Route path (use :param for dynamic segments)
 * Value: PageMetadata object with route-specific settings
 */
export const metadataConfig: Record<string, PageMetadata> = {
  // Home page / Landing page
  '/': {
    title: 'Dashboard Starter Kit - Build Amazing Dashboards Faster',
    description: 'A professional dashboard starter kit with authentication, theming, permissions, and everything you need to build modern web applications.',
    keywords: ['dashboard', 'starter kit', 'nextjs', 'react', 'admin panel', 'authentication', 'permissions', 'theming'],
    breadcrumb: { label: 'Home' },
    openGraph: {
      title: 'Dashboard Starter Kit',
      description: 'Build amazing dashboards with our professional starter kit featuring authentication, theming, and comprehensive features.',
      type: 'website',
      images: [
        {
          url: '/og-landing.svg',
          width: 1200,
          height: 630,
          alt: 'Dashboard Starter Kit - Professional dashboard with comprehensive features',
          type: 'image/svg+xml',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Dashboard Starter Kit',
      description: 'Build amazing dashboards with our professional starter kit featuring authentication, theming, and comprehensive features.',
      images: ['/og-landing.svg'],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  // Authentication pages
  '/login': {
    title: 'Login',
    description: 'Sign in to your account',
    breadcrumb: { label: 'Login' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/signup': {
    title: 'Sign Up',
    description: 'Create a new account',
    breadcrumb: { label: 'Sign Up' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/forgot-password': {
    title: 'Forgot Password',
    description: 'Reset your password',
    breadcrumb: { label: 'Forgot Password' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  // Blog pages
  '/blog': {
    title: 'Blog',
    description: 'Read our latest articles and tutorials',
    keywords: ['blog', 'articles', 'tutorials', 'news', 'updates'],
    breadcrumb: { label: 'Blog' },
    openGraph: {
      title: 'Blog - Latest Articles & Tutorials',
      description: 'Explore our latest articles, tutorials, and insights',
      type: 'website',
      images: [
        {
          url: '/og-blog.svg',
          width: 1200,
          height: 630,
          alt: 'Blog - Latest Articles & Tutorials',
          type: 'image/svg+xml',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog - Latest Articles & Tutorials',
      description: 'Explore our latest articles, tutorials, and insights',
      images: ['/og-blog.svg'],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  '/blog/:slug': {
    title: '{postTitle}',
    description: '{postExcerpt}',
    keywords: ['blog', 'article', '{postTitle}'],
    breadcrumb: { label: '{postTitle}', dynamic: true },
    openGraph: {
      title: '{postTitle}',
      description: '{postExcerpt}',
      type: 'article',
      images: [
        {
          url: '{postImage}',
          width: 1200,
          height: 630,
          alt: '{postTitle}',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '{postTitle}',
      description: '{postExcerpt}',
      images: ['{postImage}'],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  // Customer Account pages (Storefront)
  '/account/login': {
    title: 'Customer Login | Storefront',
    description: 'Sign in to your customer account to view orders and manage your profile',
    breadcrumb: { label: 'Login' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/account/register': {
    title: 'Create Account | Storefront',
    description: 'Create a new customer account to track orders and save your information',
    breadcrumb: { label: 'Register' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/account': {
    title: 'My Account | Storefront',
    description: 'Manage your customer account, view orders, and update your profile',
    breadcrumb: { label: 'My Account' },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/account/orders': {
    title: 'Order History | Storefront',
    description: 'View your order history and track current orders',
    breadcrumb: { label: 'Orders' },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/account/orders/:id': {
    title: 'Order Details | Storefront',
    description: 'View detailed information about your order',
    breadcrumb: { label: 'Order Details', dynamic: true },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/account/profile': {
    title: 'Edit Profile | Storefront',
    description: 'Update your personal information and account details',
    breadcrumb: { label: 'Profile' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/account/addresses': {
    title: 'Addresses | Storefront',
    description: 'Manage your shipping and billing addresses',
    breadcrumb: { label: 'Addresses' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/account/payment-methods': {
    title: 'Payment Methods | Storefront',
    description: 'Manage your saved payment methods',
    breadcrumb: { label: 'Payment Methods' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/account/settings': {
    title: 'Account Settings | Storefront',
    description: 'Manage your account preferences and settings',
    breadcrumb: { label: 'Settings' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/account/wishlist': {
    title: 'Wishlist | Storefront',
    description: 'View and manage your wishlist items',
    breadcrumb: { label: 'Wishlist' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  // Dashboard pages
  '/dashboard': {
    title: 'Dashboard',
    description: 'Your personalized dashboard overview',
    keywords: ['dashboard', 'overview', 'analytics'],
    breadcrumb: { label: 'Dashboard' },
    openGraph: {
      title: 'Dashboard Overview',
      description: 'Access your personal dashboard with real-time analytics and insights',
      type: 'website',
    },
    twitter: {
      title: 'Dashboard Overview',
      description: 'Access your personal dashboard with real-time analytics and insights',
    },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/dashboard/analytics': {
    title: 'Analytics',
    description: 'Detailed analytics and insights',
    keywords: ['analytics', 'insights', 'metrics', 'reports'],
    breadcrumb: { label: 'Analytics' },
    openGraph: {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights for data-driven decisions',
      type: 'website',
    },
    twitter: {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights for data-driven decisions',
    },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/dashboard/data': {
    title: 'Data Management',
    description: 'Manage your data and records',
    keywords: ['data', 'management', 'records'],
    breadcrumb: { label: 'Data' },
  },

  '/dashboard/search': {
    title: 'Search Results',
    description: 'Search results across your dashboard',
    keywords: ['search', 'results', 'find', 'query'],
    breadcrumb: { label: 'Search' },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/dashboard/media': {
    title: 'Media Library',
    description: 'Manage your uploaded files and media assets',
    keywords: ['media', 'files', 'uploads', 'images', 'documents', 'assets'],
    breadcrumb: { label: 'Media Library' },
    openGraph: {
      title: 'Media Library',
      description: 'Organize and manage all your uploaded files and media assets',
      type: 'website',
    },
    twitter: {
      title: 'Media Library',
      description: 'Organize and manage all your uploaded files and media assets',
    },
  },

  '/dashboard/settings': {
    title: 'Settings',
    description: 'Configure your application settings',
    keywords: ['settings', 'configuration', 'preferences'],
    breadcrumb: { label: 'Settings' },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/dashboard/settings/theme': {
    title: 'Theme Settings',
    description: 'Customize your theme and appearance',
    keywords: ['theme', 'appearance', 'colors', 'design'],
    breadcrumb: { label: 'Theme' },
    openGraph: {
      title: 'Theme Customization',
      description: 'Customize colors, typography, and appearance settings',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Theme Customization',
      description: 'Customize colors, typography, and appearance settings',
    },
  },

  '/dashboard/settings/landing-page': {
    title: 'Landing Page Settings',
    description: 'Manage your landing page content, header, footer, and analytics',
    keywords: ['landing page', 'cms', 'content', 'header', 'footer', 'analytics'],
    breadcrumb: { label: 'Landing Page' },
    openGraph: {
      title: 'Landing Page Settings',
      description: 'Comprehensive landing page management with content editor, header/footer configuration, and analytics',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Landing Page Editor',
      description: 'Customize landing page sections, content, and global settings',
    },
  },

  '/dashboard/settings/calendar': {
    title: 'Calendar Settings',
    description: 'Configure calendar preferences, manage categories, and control permissions',
    keywords: ['calendar', 'settings', 'events', 'categories', 'permissions'],
    breadcrumb: { label: 'Calendar' },
    openGraph: {
      title: 'Calendar Settings',
      description: 'Manage calendar settings, event categories, and user permissions',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Calendar Settings',
      description: 'Manage calendar settings, event categories, and user permissions',
    },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  // User management
  '/dashboard/users': {
    title: 'User Management',
    description: 'Manage users and permissions',
    keywords: ['users', 'management', 'admin', 'permissions'],
    breadcrumb: { label: 'Users' },
    openGraph: {
      title: 'User Management',
      description: 'Manage users, roles, and permissions with comprehensive admin tools',
      type: 'website',
    },
    twitter: {
      title: 'User Management',
      description: 'Manage users, roles, and permissions with comprehensive admin tools',
    },
  },

  '/dashboard/users/:id': {
    title: 'User: {userName}',
    description: 'View and edit user details',
    keywords: ['user', 'profile', 'details'],
    breadcrumb: { label: '{userName}', dynamic: true },
    openGraph: {
      title: 'User Profile: {userName}',
      description: 'View and manage user profile for {userName}',
      type: 'profile',
    },
    twitter: {
      title: 'User Profile: {userName}',
      description: 'View and manage user profile for {userName}',
    },
  },

  '/dashboard/users/:id/edit': {
    title: 'Edit User: {userName}',
    description: 'Edit user profile and settings',
    keywords: ['edit', 'user', 'profile'],
    breadcrumb: { label: 'Edit', dynamic: false },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  // Permissions management (Role Management)
  '/dashboard/permissions': {
    title: 'Role Management',
    description: 'Manage roles, assign permissions, and control user access',
    keywords: ['rbac', 'roles', 'permissions', 'access control', 'user management'],
    breadcrumb: { label: 'Role Management' },
    openGraph: {
      title: 'Role Management',
      description: 'Comprehensive role-based access control management for administrators',
      type: 'website',
    },
    twitter: {
      title: 'Role Management',
      description: 'Comprehensive role-based access control management for administrators',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  // Role management
  '/dashboard/roles': {
    title: 'Role Management',
    description: 'Manage roles, assign permissions, and control user access',
    keywords: ['rbac', 'roles', 'permissions', 'access control', 'user management'],
    breadcrumb: { label: 'Roles' },
    openGraph: {
      title: 'Role Management',
      description: 'Comprehensive role-based access control management for administrators',
      type: 'website',
    },
    twitter: {
      title: 'Role Management',
      description: 'Comprehensive role-based access control management for administrators',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  // Widgets
  '/dashboard/widgets': {
    title: 'Widgets',
    description: 'Browse and manage dashboard widgets',
    keywords: ['widgets', 'components', 'dashboard'],
    breadcrumb: { label: 'Widgets' },
  },

  // Design system
  '/dashboard/design-system': {
    title: 'Design System',
    description: 'Explore the design system and components',
    keywords: ['design system', 'components', 'ui', 'ux'],
    breadcrumb: { label: 'Design System' },
  },

  // Profile management
  '/dashboard/profile': {
    title: 'Profile',
    description: 'Manage your personal information and settings',
    keywords: ['profile', 'account', 'personal information', 'avatar'],
    breadcrumb: { label: 'Profile' },
    openGraph: {
      title: 'User Profile',
      description: 'Manage your personal information, avatar, and account settings',
      type: 'profile',
    },
    twitter: {
      title: 'User Profile',
      description: 'Manage your personal information, avatar, and account settings',
    },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  // Settings sub-pages
  '/dashboard/settings/profile': {
    title: 'Profile Settings',
    description: 'Manage your profile information',
    keywords: ['profile', 'settings', 'account'],
    breadcrumb: { label: 'Profile' },
  },

  '/dashboard/settings/landing-page-old': {
    title: 'Landing Page Settings Old',
    description: 'Manage your landing page content, header, footer, and analytics',
    keywords: ['landing page', 'cms', 'content', 'header', 'footer', 'analytics'],
    breadcrumb: { label: 'Landing Page' },
    openGraph: {
      title: 'Landing Page Settings',
      description: 'Manage your landing page content, header, footer, and analytics',
      type: 'website',
    },
    twitter: {
      title: 'Landing Page Settings',
      description: 'Manage your landing page content, header, footer, and analytics',
    },
    robots: {
      index: false,
      follow: false,
    },
  },

  '/dashboard/settings/security': {
    title: 'Security Settings',
    description: 'Manage your password and security preferences',
    keywords: ['security', 'password', 'authentication', 'two-factor'],
    breadcrumb: { label: 'Security' },
    openGraph: {
      title: 'Security Settings',
      description: 'Manage your password, two-factor authentication, and security preferences',
      type: 'website',
    },
    twitter: {
      title: 'Security Settings',
      description: 'Manage your password, two-factor authentication, and security preferences',
    },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/dashboard/settings/notifications': {
    title: 'Notification Settings',
    description: 'Configure your notification preferences',
    keywords: ['notifications', 'alerts', 'preferences'],
    breadcrumb: { label: 'Notifications' },
  },

  '/dashboard/settings/email': {
    title: 'Email Settings',
    description: 'Configure SMTP settings and manage email system',
    keywords: ['email', 'smtp', 'configuration', 'templates', 'notifications'],
    breadcrumb: { label: 'Email' },
    openGraph: {
      title: 'Email Settings',
      description: 'Configure SMTP settings, manage email templates, and monitor email delivery',
      type: 'website',
    },
    twitter: {
      title: 'Email Settings',
      description: 'Configure SMTP settings, manage email templates, and monitor email delivery',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/dashboard/settings/messaging': {
    title: 'Messaging Settings',
    description: 'Configure messaging system settings and preferences',
    keywords: ['messaging', 'chat', 'settings', 'configuration', 'communication'],
    breadcrumb: { label: 'Messaging' },
    openGraph: {
      title: 'Messaging Settings',
      description: 'Configure messaging system settings, retention policies, and communication preferences',
      type: 'website',
    },
    twitter: {
      title: 'Messaging Settings',
      description: 'Configure messaging system settings, retention policies, and communication preferences',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/dashboard/settings/legal': {
    title: 'Legal Pages',
    description: 'Manage Terms of Service and Privacy Policy',
    keywords: ['legal', 'terms', 'privacy', 'policy', 'compliance'],
    breadcrumb: { label: 'Legal Pages' },
    openGraph: {
      title: 'Legal Pages Management',
      description: 'Manage Terms of Service and Privacy Policy for your application',
      type: 'website',
    },
    twitter: {
      title: 'Legal Pages Management',
      description: 'Manage Terms of Service and Privacy Policy for your application',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  // Notifications page
  '/dashboard/notifications': {
    title: 'Notifications',
    description: 'View and manage all your notifications',
    keywords: ['notifications', 'alerts', 'messages', 'updates'],
    breadcrumb: { label: 'Notifications' },
    openGraph: {
      title: 'Notifications Center',
      description: 'Stay updated with all your notifications in one place',
      type: 'website',
    },
    twitter: {
      title: 'Notifications Center',
      description: 'Stay updated with all your notifications in one place',
    },
  },

  // Calendar pages
  '/dashboard/calendar': {
    title: 'Calendar',
    description: 'Manage your events, schedule, and appointments',
    keywords: ['calendar', 'events', 'schedule', 'appointments', 'planning'],
    breadcrumb: { label: 'Calendar' },
    openGraph: {
      title: 'Calendar - Event Management',
      description: 'Organize your schedule with our comprehensive calendar system',
      type: 'website',
    },
    twitter: {
      title: 'Calendar - Event Management',
      description: 'Organize your schedule with our comprehensive calendar system',
    },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/dashboard/calendar/new': {
    title: 'Create Event',
    description: 'Create a new calendar event with optional recurrence and reminders',
    keywords: ['calendar', 'create', 'event', 'new', 'schedule'],
    breadcrumb: { label: 'Create Event' },
    openGraph: {
      title: 'Create Calendar Event',
      description: 'Create a new event with recurrence patterns and reminders',
      type: 'website',
    },
    twitter: {
      title: 'Create Calendar Event',
      description: 'Create a new event with recurrence patterns and reminders',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  // Activity Log page
  '/dashboard/activity': {
    title: 'Activity Log',
    description: 'View and audit all system activities and user actions',
    keywords: ['activity', 'audit', 'log', 'history', 'tracking', 'security'],
    breadcrumb: { label: 'Activity Log' },
    openGraph: {
      title: 'Activity Log',
      description: 'Monitor and audit all system activities and user actions',
      type: 'website',
    },
    twitter: {
      title: 'Activity Log',
      description: 'Monitor and audit all system activities and user actions',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/blog': {
    title: 'Blog Management',
    description: 'Create and manage blog posts',
    keywords: ['blog', 'management', 'admin', 'posts'],
    breadcrumb: { label: 'Blog' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/blog/categories-tags': {
    title: 'Categories & Tags',
    description: 'Manage blog categories and tags',
    keywords: ['blog', 'categories', 'tags', 'management'],
    breadcrumb: { label: 'Categories & Tags' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/blog/new': {
    title: 'Create Blog Post',
    description: 'Create a new blog post',
    keywords: ['blog', 'create', 'new', 'post'],
    breadcrumb: { label: 'New Post' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/blog/:id/edit': {
    title: 'Edit: {postTitle}',
    description: 'Edit blog post',
    keywords: ['blog', 'edit', 'post'],
    breadcrumb: { label: 'Edit', dynamic: false },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  // Pages management
  '/dashboard/pages': {
    title: 'Pages Management',
    description: 'Create and manage custom pages',
    keywords: ['pages', 'management', 'cms', 'content'],
    breadcrumb: { label: 'Pages' },
    openGraph: {
      title: 'Pages Management',
      description: 'Create and manage custom pages with full CMS capabilities',
      type: 'website',
    },
    twitter: {
      title: 'Pages Management',
      description: 'Create and manage custom pages with full CMS capabilities',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/pages/new': {
    title: 'Create Page',
    description: 'Create a new custom page',
    keywords: ['page', 'create', 'new', 'cms'],
    breadcrumb: { label: 'New Page' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/pages/:id': {
    title: 'Page: {pageTitle}',
    description: 'View page details',
    keywords: ['page', 'details', 'cms'],
    breadcrumb: { label: '{pageTitle}', dynamic: true },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/pages/:id/edit': {
    title: 'Edit: {pageTitle}',
    description: 'Edit custom page',
    keywords: ['page', 'edit', 'cms'],
    breadcrumb: { label: 'Edit', dynamic: false },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  // E-Commerce pages
  '/dashboard/ecommerce': {
    title: 'E-Commerce Dashboard',
    description: 'Overview of your e-commerce performance and metrics',
    keywords: ['ecommerce', 'dashboard', 'sales', 'orders', 'revenue'],
    breadcrumb: { label: 'E-Commerce' },
    openGraph: {
      title: 'E-Commerce Dashboard',
      description: 'Monitor your e-commerce performance with real-time metrics and insights',
      type: 'website',
    },
    twitter: {
      title: 'E-Commerce Dashboard',
      description: 'Monitor your e-commerce performance with real-time metrics and insights',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/products': {
    title: 'Products',
    description: 'Manage your product catalog',
    keywords: ['products', 'catalog', 'inventory', 'ecommerce'],
    breadcrumb: { label: 'Products' },
    openGraph: {
      title: 'Product Management',
      description: 'Manage your product catalog and inventory',
      type: 'website',
    },
    twitter: {
      title: 'Product Management',
      description: 'Manage your product catalog and inventory',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/products/new': {
    title: 'Create Product',
    description: 'Add a new product to your catalog',
    keywords: ['product', 'create', 'new', 'ecommerce'],
    breadcrumb: { label: 'New Product' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/products/:id': {
    title: 'Product: {productName}',
    description: 'View product details',
    keywords: ['product', 'details', 'ecommerce'],
    breadcrumb: { label: '{productName}', dynamic: true },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/products/:id/edit': {
    title: 'Edit: {productName}',
    description: 'Edit product details',
    keywords: ['product', 'edit', 'ecommerce'],
    breadcrumb: { label: 'Edit', dynamic: false },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/orders': {
    title: 'Orders',
    description: 'Manage customer orders and fulfillment',
    keywords: ['orders', 'sales', 'fulfillment', 'ecommerce'],
    breadcrumb: { label: 'Orders' },
    openGraph: {
      title: 'Order Management',
      description: 'Process and track customer orders',
      type: 'website',
    },
    twitter: {
      title: 'Order Management',
      description: 'Process and track customer orders',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/orders/:id': {
    title: 'Order: {orderId}',
    description: 'View order details',
    keywords: ['order', 'details', 'ecommerce'],
    breadcrumb: { label: 'Order #{orderId}', dynamic: true },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/customers': {
    title: 'Customers',
    description: 'Manage customer database and relationships',
    keywords: ['customers', 'crm', 'contacts', 'ecommerce'],
    breadcrumb: { label: 'Customers' },
    openGraph: {
      title: 'Customer Management',
      description: 'Manage your customer database and relationships',
      type: 'website',
    },
    twitter: {
      title: 'Customer Management',
      description: 'Manage your customer database and relationships',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/customers/:id': {
    title: 'Customer: {customerName}',
    description: 'View customer details and order history',
    keywords: ['customer', 'details', 'orders', 'ecommerce'],
    breadcrumb: { label: '{customerName}', dynamic: true },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/inventory': {
    title: 'Inventory',
    description: 'Track and manage product inventory levels',
    keywords: ['inventory', 'stock', 'warehouse', 'ecommerce'],
    breadcrumb: { label: 'Inventory' },
    openGraph: {
      title: 'Inventory Management',
      description: 'Track stock levels and manage inventory adjustments',
      type: 'website',
    },
    twitter: {
      title: 'Inventory Management',
      description: 'Track stock levels and manage inventory adjustments',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/categories': {
    title: 'Product Categories',
    description: 'Manage your product categories and organization',
    keywords: ['categories', 'products', 'organization', 'ecommerce'],
    breadcrumb: { label: 'Categories' },
    openGraph: {
      title: 'Product Categories',
      description: 'Manage your product categories and organization',
      type: 'website',
    },
    twitter: {
      title: 'Product Categories',
      description: 'Manage your product categories and organization',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/ecommerce/shipping': {
    title: 'Shipping Methods',
    description: 'Manage shipping methods, rates, and delivery options',
    keywords: ['shipping', 'delivery', 'methods', 'rates', 'ecommerce'],
    breadcrumb: { label: 'Shipping' },
    openGraph: {
      title: 'Shipping Methods Management',
      description: 'Configure and manage shipping methods and delivery rates',
      type: 'website',
    },
    twitter: {
      title: 'Shipping Methods Management',
      description: 'Configure and manage shipping methods and delivery rates',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/settings/ecommerce': {
    title: 'E-Commerce Settings',
    description: 'Configure e-commerce store settings',
    keywords: ['ecommerce', 'settings', 'configuration', 'store'],
    breadcrumb: { label: 'E-Commerce' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/settings/menus': {
    title: 'Menu Management',
    description: 'Manage dashboard navigation menus and menu items',
    keywords: ['menus', 'navigation', 'dashboard', 'management'],
    breadcrumb: { label: 'Menus' },
    openGraph: {
      title: 'Menu Management',
      description: 'Configure and manage dashboard navigation menus',
      type: 'website',
    },
    twitter: {
      title: 'Menu Management',
      description: 'Configure and manage dashboard navigation menus',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/settings/menus/new': {
    title: 'Create Menu Item',
    description: 'Create a new menu item for dashboard navigation',
    keywords: ['menu', 'create', 'navigation', 'dashboard'],
    breadcrumb: { label: 'New Menu' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/settings/menus/:id/edit': {
    title: 'Edit Menu: {menuLabel}',
    description: 'Edit menu item configuration',
    keywords: ['menu', 'edit', 'navigation'],
    breadcrumb: { label: 'Edit', dynamic: false },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },

  '/dashboard/settings/cron-jobs': {
    title: 'Cron Jobs Management',
    description: 'Monitor and manage scheduled tasks and background jobs',
    keywords: ['cron', 'jobs', 'scheduled tasks', 'automation', 'background jobs', 'system'],
    breadcrumb: { label: 'Cron Jobs' },
    openGraph: {
      title: 'Cron Jobs Management',
      description: 'Monitor, schedule, and manage automated background tasks',
      type: 'website',
    },
    twitter: {
      title: 'Cron Jobs Management',
      description: 'Monitor, schedule, and manage automated background tasks',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  // Admin pages
  '/admin/header-footer-editor': {
    title: 'Header & Footer Editor',
    description: 'Customize your site\'s header and footer configuration',
    keywords: ['header', 'footer', 'editor', 'navigation', 'branding', 'cms'],
    breadcrumb: { label: 'Header & Footer' },
    openGraph: {
      title: 'Header & Footer Editor',
      description: 'Customize header navigation, logo, CTAs, and footer content',
      type: 'website',
    },
    twitter: {
      title: 'Header & Footer Editor',
      description: 'Customize header navigation, logo, CTAs, and footer content',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/admin/landing-editor': {
    title: 'Landing Page Editor',
    description: 'Edit landing page sections and content',
    keywords: ['landing page', 'editor', 'cms', 'sections', 'content'],
    breadcrumb: { label: 'Landing Editor' },
    openGraph: {
      title: 'Landing Page Editor',
      description: 'Customize landing page sections, content, and layout',
      type: 'website',
    },
    twitter: {
      title: 'Landing Page Editor',
      description: 'Customize landing page sections, content, and layout',
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  // Public Storefront
  '/shop': {
    title: 'Shop - Browse Our Products',
    description: 'Browse our complete catalog of products. Filter by category, price, and more to find exactly what you need.',
    keywords: ['shop', 'products', 'catalog', 'store', 'buy', 'ecommerce'],
    breadcrumb: { label: 'Shop' },
    openGraph: {
      title: 'Shop - Browse Our Products',
      description: 'Browse our complete catalog of products. Filter by category, price, and more.',
      type: 'website',
      images: [
        {
          url: '/og-shop.svg',
          width: 1200,
          height: 630,
          alt: 'Shop - Browse our product catalog',
          type: 'image/svg+xml',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Shop - Browse Our Products',
      description: 'Browse our complete catalog of products. Filter by category, price, and more.',
      images: ['/og-shop.svg'],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  '/shop/search': {
    title: 'Search Results for "{searchQuery}"',
    description: 'Search results for "{searchQuery}" - Find products in our catalog',
    keywords: ['search', '{searchQuery}', 'products', 'shop', 'find', 'ecommerce'],
    breadcrumb: { label: 'Search' },
    openGraph: {
      title: 'Search Results for "{searchQuery}"',
      description: 'Search results for "{searchQuery}" - Find products in our catalog',
      type: 'website',
      images: [
        {
          url: '/og-shop.svg',
          width: 1200,
          height: 630,
          alt: 'Search results for {searchQuery}',
          type: 'image/svg+xml',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Search Results for "{searchQuery}"',
      description: 'Search results for "{searchQuery}" - Find products in our catalog',
      images: ['/og-shop.svg'],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  '/shop/products/:slug': {
    title: '{productName}',
    description: '{productDescription}',
    keywords: ['product', 'shop', 'buy', 'ecommerce'],
    breadcrumb: { label: '{productName}', dynamic: true },
    openGraph: {
      title: '{productName}',
      description: '{productDescription}',
      type: 'website',
      images: [
        {
          url: '{productImage}',
          width: 1200,
          height: 630,
          alt: '{productName}',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '{productName}',
      description: '{productDescription}',
      images: ['{productImage}'],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  '/cart': {
    title: 'Shopping Cart',
    description: 'Review your cart and proceed to checkout',
    keywords: ['cart', 'shopping cart', 'checkout', 'ecommerce'],
    breadcrumb: { label: 'Cart' },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  '/checkout': {
    title: 'Checkout',
    description: 'Complete your purchase securely',
    keywords: ['checkout', 'payment', 'order', 'purchase', 'ecommerce'],
    breadcrumb: { label: 'Checkout' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/checkout/success': {
    title: 'Order Confirmed - Thank You!',
    description: 'Your order has been placed successfully',
    keywords: ['order', 'confirmation', 'success', 'thank you'],
    breadcrumb: { label: 'Order Confirmed' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/shop/category/:category': {
    title: '{categoryName} - Shop by Category',
    description: 'Browse our {categoryName} collection. Find the best products in {categoryName}.',
    keywords: ['{categoryName}', 'shop', 'products', 'category'],
    breadcrumb: { label: '{categoryName}', dynamic: true },
    openGraph: {
      title: '{categoryName} - Shop by Category',
      description: 'Browse our {categoryName} collection. Find the best products in {categoryName}.',
      type: 'website',
      images: [
        {
          url: '{categoryImage}',
          width: 1200,
          height: 630,
          alt: '{categoryName}',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '{categoryName} - Shop by Category',
      description: 'Browse our {categoryName} collection. Find the best products in {categoryName}.',
      images: ['{categoryImage}'],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  '/shop/:slug': {
    title: '{productName} - Product Details',
    description: '{productDescription}',
    keywords: ['{productName}', 'product', 'shop', 'buy'],
    breadcrumb: { label: '{productName}', dynamic: true },
    openGraph: {
      title: '{productName}',
      description: '{productDescription}',
      type: 'website',
      images: [
        {
          url: '{productImage}',
          width: 1200,
          height: 630,
          alt: '{productName}',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: '{productName}',
      description: '{productDescription}',
      images: ['{productImage}'],
    },
    robots: {
      index: true,
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  // Search page
  '/search': {
    title: 'Search Results',
    description: 'Search across all content including users, products, orders, pages, and blog posts',
    keywords: ['search', 'find', 'results', 'query'],
    breadcrumb: { label: 'Search' },
    openGraph: {
      title: 'Search Results',
      description: 'Search across all content including users, products, orders, pages, and blog posts',
      type: 'website',
    },
    twitter: {
      title: 'Search Results',
      description: 'Search across all content including users, products, orders, pages, and blog posts',
    },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  // Error pages
  '/403': {
    title: 'Access Denied',
    description: 'You do not have permission to access this page',
    breadcrumb: { label: 'Access Denied' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/404': {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist',
    breadcrumb: { label: 'Not Found' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  '/500': {
    title: 'Server Error',
    description: 'An unexpected error occurred',
    breadcrumb: { label: 'Error' },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },

  // Admin section
  '/admin': {
    title: 'Admin',
    description: 'Admin section',
    breadcrumb: { label: 'Admin' },
    robots: {
      index: false,
      follow: false,
    },
  },

  // Custom Pages (dynamic routes - top-level)
  '/:slug': {
    title: '{pageTitle}',
    description: '{pageDescription}',
    keywords: ['{pageKeywords}'],
    breadcrumb: { label: '{pageTitle}', dynamic: true },
    openGraph: {
      title: '{pageMetaTitle}',
      description: '{pageMetaDescription}',
      images: [
        {
          url: '{pageImage}',
          width: 1200,
          height: 630,
          alt: '{pageTitle}',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '{pageMetaTitle}',
      description: '{pageMetaDescription}',
      images: ['{pageImage}'],
    },
    robots: {
      index: true, // Will be overridden based on page status/visibility
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },

  // Support & Documentation page
  '/dashboard/support': {
    title: 'Support & Documentation',
    description: 'Complete overview of your dashboard application including features, architecture, and business logic',
    keywords: ['support', 'documentation', 'help', 'guide', 'features', 'architecture'],
    breadcrumb: { label: 'Support' },
    openGraph: {
      title: 'Support & Documentation',
      description: 'Comprehensive documentation and support resources for your dashboard application',
      type: 'website',
    },
    twitter: {
      title: 'Support & Documentation',
      description: 'Comprehensive documentation and support resources for your dashboard application',
    },
    robots: {
      index: false,
      follow: true,
      noarchive: true,
    },
  },

  // Nested Custom Pages (dynamic routes - parent/child)
  '/:parentSlug/:slug': {
    title: '{pageTitle}',
    description: '{pageDescription}',
    keywords: ['{pageKeywords}'],
    breadcrumb: { label: '{pageTitle}', dynamic: true },
    openGraph: {
      title: '{pageMetaTitle}',
      description: '{pageMetaDescription}',
      images: [
        {
          url: '{pageImage}',
          width: 1200,
          height: 630,
          alt: '{pageTitle}',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '{pageMetaTitle}',
      description: '{pageMetaDescription}',
      images: ['{pageImage}'],
    },
    robots: {
      index: true, // Will be overridden based on page status/visibility
      follow: true,
      maxImagePreview: 'large',
      maxSnippet: 160,
    },
  },
};

/**
 * Get metadata configuration for a specific path
 * 
 * @param pathname - The route pathname
 * @returns Merged metadata (default + route-specific)
 */
export function getMetadataForPath(pathname: string): PageMetadata {
  // Exact match
  if (metadataConfig[pathname]) {
    return { ...defaultMetadata, ...metadataConfig[pathname] };
  }

  // Pattern match for dynamic routes (e.g., /dashboard/users/:id)
  const pattern = Object.keys(metadataConfig).find((key) => {
    const regex = new RegExp('^' + key.replace(/:\w+/g, '[^/]+') + '$');
    return regex.test(pathname);
  });

  if (pattern) {
    return { ...defaultMetadata, ...metadataConfig[pattern] };
  }

  // Return default metadata if no match found
  return defaultMetadata;
}

/**
 * Resolve template strings in metadata with dynamic values
 * 
 * @param metadata - Metadata object with potential template strings
 * @param values - Dynamic values to replace in templates
 * @returns Resolved metadata with replaced values
 */
export function resolveMetadataTemplate(
  metadata: PageMetadata,
  values?: Record<string, string>
): PageMetadata {
  if (!values) return metadata;

  const resolved = { ...metadata };

  // Resolve title
  if (resolved.title) {
    resolved.title = resolveTemplate(resolved.title, values);
  }

  // Resolve description
  if (resolved.description) {
    resolved.description = resolveTemplate(resolved.description, values);
  }

  // Resolve breadcrumb label
  if (resolved.breadcrumb?.label) {
    resolved.breadcrumb = {
      ...resolved.breadcrumb,
      label: resolveTemplate(resolved.breadcrumb.label, values),
    };
  }

  // Resolve Open Graph metadata
  if (resolved.openGraph?.title) {
    resolved.openGraph = {
      ...resolved.openGraph,
      title: resolveTemplate(resolved.openGraph.title, values),
    };
  }

  if (resolved.openGraph?.description) {
    resolved.openGraph = {
      ...resolved.openGraph,
      description: resolveTemplate(resolved.openGraph.description, values),
    };
  }

  return resolved;
}

/**
 * Replace template placeholders with actual values
 * 
 * @param template - String with {placeholder} syntax
 * @param values - Object with placeholder values
 * @returns Resolved string
 */
function resolveTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] || match;
  });
}

/**
 * Apply branding to metadata
 * 
 * Replaces default brand name with custom brand name in titles and descriptions
 * 
 * @param metadata - Metadata object to apply branding to
 * @param brandSettings - Brand settings from context
 * @returns Metadata with branding applied
 */
export function applyBrandingToMetadata(
  metadata: PageMetadata,
  brandSettings: BrandSettings | null
): PageMetadata {
  if (!brandSettings) return metadata;

  const brandName = brandSettings.brandName || DEFAULT_BRANDING.brandName;
  const description = brandSettings.description || defaultMetadata.description;
  const siteName = brandName;

  const branded = { ...metadata };

  // Replace brand name in title (always a string in PageMetadata)
  if (branded.title && typeof branded.title === 'string') {
    branded.title = branded.title.replace(/Dashboard Application/g, brandName);
    branded.title = branded.title.replace(/Dashboard/g, brandName);
  }

  // Replace brand name in description
  if (branded.description) {
    branded.description = branded.description.replace(/Dashboard Application/g, brandName);
    if (brandSettings.description) {
      branded.description = brandSettings.description;
    }
  }

  // Update Open Graph metadata
  if (branded.openGraph) {
    branded.openGraph = {
      ...branded.openGraph,
      siteName,
      title: branded.openGraph.title?.replace(/Dashboard Application/g, brandName),
      description: branded.openGraph.description?.replace(/Dashboard Application/g, brandName) || description,
    };
  }

  // Update Twitter metadata
  if (branded.twitter) {
    branded.twitter = {
      ...branded.twitter,
      title: branded.twitter.title?.replace(/Dashboard Application/g, brandName),
      description: branded.twitter.description?.replace(/Dashboard Application/g, brandName) || description,
    };
  }

  return branded;
}

/**
 * Get favicon links for metadata
 * 
 * @param brandSettings - Brand settings from context
 * @returns Array of favicon link objects
 */
export function getFaviconLinks(brandSettings: BrandSettings | null) {
  const faviconUrl = brandSettings?.faviconUrl || DEFAULT_BRANDING.faviconUrl;

  return [
    {
      rel: 'icon',
      url: faviconUrl,
    },
    {
      rel: 'apple-touch-icon',
      url: faviconUrl,
    },
  ];
}
