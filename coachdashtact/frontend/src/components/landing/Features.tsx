/**
 * Features Section Component
 * 
 * Displays a grid of feature cards highlighting key application capabilities.
 * Responsive design with animations.
 */

'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Palette, 
  Zap, 
  Users, 
  Lock, 
  Smartphone,
  BarChart3,
  Settings,
  Bell,
  FileText
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'JWT-based authentication with refresh tokens, password hashing, and secure session management.',
  },
  {
    icon: Lock,
    title: 'Role-Based Permissions',
    description: 'Flexible permission system with role-based access control for fine-grained authorization.',
  },
  {
    icon: Palette,
    title: 'Customizable Theming',
    description: 'Dark mode support with customizable color palettes and typography using OKLCH color space.',
  },
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Built with Next.js 14 App Router and React Server Components for optimal performance.',
  },
  {
    icon: Users,
    title: 'User Management',
    description: 'Complete user management system with CRUD operations, role assignment, and profile editing.',
  },
  {
    icon: Smartphone,
    title: 'Fully Responsive',
    description: 'Mobile-first design that works seamlessly across all devices and screen sizes.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Ready',
    description: 'Built-in analytics components and data visualization with charts and metrics.',
  },
  {
    icon: Settings,
    title: 'Configurable',
    description: 'Feature flags and environment-based configuration for flexible deployment options.',
  },
  {
    icon: Bell,
    title: 'Real-Time Notifications',
    description: 'WebSocket-based notification system with user preferences and delivery tracking.',
  },
  {
    icon: FileText,
    title: 'SEO Optimized',
    description: 'Comprehensive metadata system with Open Graph tags, structured data, and sitemap generation.',
  },
];

export function Features() {
  return (
    <section className="py-20 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
          >
            Everything You Need
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            A comprehensive dashboard starter kit with all the features you need 
            to build modern web applications.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
