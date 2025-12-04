# Landing Page Customization Guide

## Overview

This guide provides step-by-step instructions and practical examples for customizing the landing page to match your brand and requirements. Whether you want to change colors, add sections, or completely redesign the layout, this guide has you covered.

## Table of Contents

1. [Hero Section Customization](#hero-section-customization)
2. [Features Section Customization](#features-section-customization)
3. [CTA Button Customization](#cta-button-customization)
4. [Footer Customization](#footer-customization)
5. [Landing Page Variations](#landing-page-variations)
6. [Quick Customization Checklist](#quick-customization-checklist)

---

## Hero Section Customization

### Location
`frontend/src/components/landing/Hero.tsx`

### Basic Text Changes

**Change the headline:**
```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
  Your Custom Headline{' '}
  <span className="text-primary">Goes Here</span>
</h1>
```

**Change the description:**
```tsx
<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
  Your custom description that explains what your application does
  and why users should choose your product.
</p>
```

**Change the badge text:**
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
  <Sparkles className="w-4 h-4" />
  <span className="text-sm font-medium">Your Custom Badge Text</span>
</div>
```

### Hero Variations


#### Variation 1: Hero with Background Image

```tsx
export function Hero() {
  return (
    <section 
      className="relative py-20 lg:py-32 overflow-hidden"
      style={{
        backgroundImage: 'url(/hero-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-background/90 -z-10" />
      
      <div className="container mx-auto px-4">
        {/* Your content here */}
      </div>
    </section>
  );
}
```

#### Variation 2: Hero with Side-by-Side Layout

```tsx
export function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Build Amazing Dashboards{' '}
              <span className="text-primary">Faster</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your description here
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
          
          {/* Right: Hero Image */}
          <div className="relative">
            <Image
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```


#### Variation 3: Hero with Video Background

```tsx
export function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 -z-10" />
      
      <div className="container mx-auto px-4">
        {/* Your content here */}
      </div>
    </section>
  );
}
```

#### Variation 4: Centered Hero with Stats

```tsx
export function Hero() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline and description */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Your Headline
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your description
          </p>
          
          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Customizing Hero Animations

**Change animation timing:**
```tsx
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: 0.8,  // Slower animation
    delay: 0.2,     // Longer delay
    ease: "easeOut" // Different easing
  }}
>
  Your Headline
</motion.h1>
```


**Remove animations:**
```tsx
// Simply remove the motion wrapper
<h1 className="text-4xl lg:text-6xl font-bold mb-6">
  Your Headline
</h1>
```

**Add scroll-triggered animations:**
```tsx
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  Your Headline
</motion.h1>
```

---

## Features Section Customization

### Location
`frontend/src/components/landing/Features.tsx`

### Adding/Removing Features

**Add a new feature:**
```tsx
const features = [
  // ... existing features
  {
    icon: YourIcon,  // Import from lucide-react
    title: 'Your Feature Title',
    description: 'Detailed description of your feature and its benefits.',
  },
];
```

**Remove a feature:**
Simply delete the feature object from the array.

### Available Icons

Import any icon from `lucide-react`:
```tsx
import {
  Shield, Zap, Palette, Users, Lock, Smartphone,
  BarChart3, Settings, Bell, FileText, Globe,
  Code, Database, Cloud, Rocket, Star, Heart,
  CheckCircle, Award, TrendingUp, Package,
  // ... hundreds more available
} from 'lucide-react';
```

Browse all icons: https://lucide.dev/icons/

### Features Section Variations

#### Variation 1: Two-Column Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
  {features.map((feature, index) => (
    <FeatureCard key={feature.title} {...feature} index={index} />
  ))}
</div>
```


#### Variation 2: Four-Column Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {features.map((feature, index) => (
    <FeatureCard key={feature.title} {...feature} index={index} />
  ))}
</div>
```

#### Variation 3: List Layout (Horizontal Cards)

```tsx
<div className="max-w-4xl mx-auto space-y-6">
  {features.map((feature, index) => (
    <div key={feature.title} className="flex gap-6 p-6 rounded-lg border bg-card">
      <div className="flex-shrink-0">
        <div className="p-3 rounded-lg bg-primary/10">
          <feature.icon className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
        <p className="text-muted-foreground">{feature.description}</p>
      </div>
    </div>
  ))}
</div>
```

#### Variation 4: Tabbed Features

```tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Features() {
  const featureCategories = {
    security: [
      { icon: Shield, title: 'Authentication', description: '...' },
      { icon: Lock, title: 'Permissions', description: '...' },
    ],
    design: [
      { icon: Palette, title: 'Theming', description: '...' },
      { icon: Smartphone, title: 'Responsive', description: '...' },
    ],
    performance: [
      { icon: Zap, title: 'Fast', description: '...' },
      { icon: BarChart3, title: 'Analytics', description: '...' },
    ],
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="security">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="security">
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {featureCategories.security.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </TabsContent>
          
          {/* Repeat for other tabs */}
        </Tabs>
      </div>
    </section>
  );
}
```


### Customizing Feature Cards

**Location:** `frontend/src/components/landing/FeatureCard.tsx`

**Change card styling:**
```tsx
function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-xl transition-all duration-300">
      {/* Icon with different background */}
      <div className="mb-4 p-4 rounded-full bg-gradient-to-br from-primary to-secondary w-fit">
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
```

**Add "Learn More" link:**
```tsx
function FeatureCard({ icon: Icon, title, description, link }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      
      {/* Learn More Link */}
      {link && (
        <Link 
          href={link}
          className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
        >
          Learn more
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
```

---

## CTA Button Customization

### Location
`frontend/src/components/landing/Hero.tsx`

### Button Text Changes

**Change button labels:**
```tsx
<div className="flex gap-4 justify-center">
  <Button size="lg" asChild>
    <Link href="/signup">
      Start Free Trial  {/* Changed from "Get Started" */}
    </Link>
  </Button>
  <Button size="lg" variant="outline" asChild>
    <Link href="/login">
      Log In  {/* Changed from "Sign In" */}
    </Link>
  </Button>
</div>
```


### Button Style Variations

#### Variation 1: Different Button Variants

```tsx
<div className="flex gap-4 justify-center">
  {/* Primary button */}
  <Button size="lg" asChild>
    <Link href="/signup">Get Started</Link>
  </Button>
  
  {/* Secondary button */}
  <Button size="lg" variant="secondary" asChild>
    <Link href="/demo">Watch Demo</Link>
  </Button>
  
  {/* Ghost button */}
  <Button size="lg" variant="ghost" asChild>
    <Link href="/login">Sign In</Link>
  </Button>
</div>
```

#### Variation 2: Single Large CTA

```tsx
<div className="flex justify-center">
  <Button size="lg" className="text-lg px-8 py-6" asChild>
    <Link href="/signup">
      Get Started Free - No Credit Card Required
    </Link>
  </Button>
</div>
```

#### Variation 3: CTA with Icons

```tsx
<div className="flex gap-4 justify-center">
  <Button size="lg" asChild className="group">
    <Link href="/signup">
      <Rocket className="mr-2 w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
      Get Started
      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Link>
  </Button>
  
  <Button size="lg" variant="outline" asChild>
    <Link href="/demo">
      <Play className="mr-2 w-5 h-5" />
      Watch Demo
    </Link>
  </Button>
</div>
```

#### Variation 4: Stacked Buttons (Mobile-First)

```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
  <Button size="lg" className="w-full sm:w-auto" asChild>
    <Link href="/signup">Get Started</Link>
  </Button>
  <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
    <Link href="/login">Sign In</Link>
  </Button>
</div>
```

### Adding More CTA Buttons

```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
  {/* Primary CTA */}
  <Button size="lg" asChild>
    <Link href="/signup">Get Started Free</Link>
  </Button>
  
  {/* Secondary CTA */}
  <Button size="lg" variant="outline" asChild>
    <Link href="/demo">Schedule Demo</Link>
  </Button>
  
  {/* Tertiary CTA */}
  <Button size="lg" variant="ghost" asChild>
    <Link href="/pricing">View Pricing</Link>
  </Button>
</div>
```


### Changing Button Destinations

**Link to external URL:**
```tsx
<Button size="lg" asChild>
  <a href="https://yourdomain.com/signup" target="_blank" rel="noopener noreferrer">
    Get Started
  </a>
</Button>
```

**Link to documentation:**
```tsx
<Button size="lg" variant="outline" asChild>
  <Link href="/docs">Read Documentation</Link>
</Button>
```

**Link to contact form:**
```tsx
<Button size="lg" variant="outline" asChild>
  <Link href="/contact">Contact Sales</Link>
</Button>
```

---

## Footer Customization

### Location
`frontend/src/components/landing/Footer.tsx`

### Basic Footer Changes

**Change company name and description:**
```tsx
<div className="space-y-4">
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
      <span className="text-primary-foreground font-bold text-lg">Y</span>
    </div>
    <span className="font-bold text-xl text-foreground">Your Company</span>
  </div>
  <p className="text-sm text-muted-foreground">
    Your company description or tagline goes here.
  </p>
</div>
```

**Add/modify footer links:**
```tsx
{/* Product Links */}
<div>
  <h3 className="font-semibold text-foreground mb-4">Product</h3>
  <ul className="space-y-2">
    <li>
      <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Features
      </Link>
    </li>
    <li>
      <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Pricing
      </Link>
    </li>
    <li>
      <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Documentation
      </Link>
    </li>
    <li>
      <Link href="/changelog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Changelog
      </Link>
    </li>
  </ul>
</div>
```


**Update social media links:**
```tsx
<div>
  <h3 className="font-semibold text-foreground mb-4">Connect</h3>
  <div className="flex space-x-4">
    <a
      href="https://github.com/yourcompany"
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label="GitHub"
    >
      <Github className="w-5 h-5" />
    </a>
    <a
      href="https://twitter.com/yourcompany"
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Twitter"
    >
      <Twitter className="w-5 h-5" />
    </a>
    <a
      href="https://linkedin.com/company/yourcompany"
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label="LinkedIn"
    >
      <Linkedin className="w-5 h-5" />
    </a>
  </div>
</div>
```

### Footer Variations

#### Variation 1: Minimal Footer

```tsx
export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl text-foreground">Dashboard</span>
          </div>
          
          {/* Links */}
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Dashboard
          </p>
        </div>
      </div>
    </footer>
  );
}
```


#### Variation 2: Footer with Newsletter Signup

```tsx
export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto text-center mb-12 pb-12 border-b border-border">
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-6">
            Get the latest updates and news delivered to your inbox.
          </p>
          <form className="flex gap-2 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
        
        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ... your footer columns ... */}
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

#### Variation 3: Footer with Logo and Tagline

```tsx
export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Column (Wider) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Logo" width={40} height={40} />
              <span className="font-bold text-2xl text-foreground">Your Brand</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Building the future of dashboard applications with modern 
              technology and exceptional user experience.
            </p>
            <div className="flex space-x-4">
              {/* Social icons */}
            </div>
          </div>
          
          {/* Other columns */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            {/* Links */}
          </div>
          {/* ... more columns ... */}
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Your Brand. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
```


### Adding More Social Icons

```tsx
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Instagram, 
  Youtube,
  Slack,
  Discord
} from 'lucide-react';

<div className="flex space-x-4">
  <a href="https://github.com/yourcompany" aria-label="GitHub">
    <Github className="w-5 h-5" />
  </a>
  <a href="https://twitter.com/yourcompany" aria-label="Twitter">
    <Twitter className="w-5 h-5" />
  </a>
  <a href="https://linkedin.com/company/yourcompany" aria-label="LinkedIn">
    <Linkedin className="w-5 h-5" />
  </a>
  <a href="https://facebook.com/yourcompany" aria-label="Facebook">
    <Facebook className="w-5 h-5" />
  </a>
  <a href="https://instagram.com/yourcompany" aria-label="Instagram">
    <Instagram className="w-5 h-5" />
  </a>
  <a href="https://youtube.com/@yourcompany" aria-label="YouTube">
    <Youtube className="w-5 h-5" />
  </a>
</div>
```

---

## Landing Page Variations

### Complete Example 1: SaaS Product Landing Page

**File:** `frontend/src/app/page.tsx`

```tsx
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
```

**Create Testimonials Component:**

**File:** `frontend/src/components/landing/Testimonials.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    quote: "This dashboard has transformed how we manage our business. The interface is intuitive and powerful.",
    author: "Sarah Johnson",
    role: "CEO, TechCorp",
    avatar: "/avatars/sarah.jpg",
    rating: 5,
  },
  {
    quote: "Best dashboard solution we've used. The customization options are endless and the support is excellent.",
    author: "Michael Chen",
    role: "CTO, StartupXYZ",
    avatar: "/avatars/michael.jpg",
    rating: 5,
  },
  {
    quote: "Incredible value for money. We were able to launch our product 3x faster using this starter kit.",
    author: "Emily Rodriguez",
    role: "Product Manager, InnovateCo",
    avatar: "/avatars/emily.jpg",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            Loved by Teams Worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            See what our customers have to say about their experience
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-lg border bg-card"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                  <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```


**Create CTA Section:**

**File:** `frontend/src/components/landing/CTA.tsx`

```tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of teams already building amazing products with our dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="group">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
```

### Complete Example 2: Portfolio/Agency Landing Page

```tsx
import { Hero } from '@/components/landing/Hero';
import { Services } from '@/components/landing/Services';
import { Portfolio } from '@/components/landing/Portfolio';
import { Team } from '@/components/landing/Team';
import { Contact } from '@/components/landing/Contact';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Portfolio />
      <Team />
      <Contact />
      <Footer />
    </>
  );
}
```

### Complete Example 3: Minimal Landing Page

```tsx
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}
```


---

## Quick Customization Checklist

Use this checklist to quickly customize your landing page:

### Essential Changes

- [ ] **Hero Headline** - Update in `Hero.tsx`
- [ ] **Hero Description** - Update in `Hero.tsx`
- [ ] **CTA Button Text** - Update in `Hero.tsx`
- [ ] **Company Name** - Update in `Footer.tsx` and `PublicNavigation.tsx`
- [ ] **Company Logo** - Replace logo files in `/public`
- [ ] **Social Media Links** - Update in `Footer.tsx`

### Content Changes

- [ ] **Features List** - Add/remove/edit in `Features.tsx`
- [ ] **Feature Icons** - Change icons in `Features.tsx`
- [ ] **Footer Links** - Update in `Footer.tsx`
- [ ] **Navigation Links** - Update in `PublicNavigation.tsx`

### Styling Changes

- [ ] **Color Scheme** - Use theme customization in settings
- [ ] **Typography** - Use theme customization in settings
- [ ] **Background Images** - Add to `/public` and reference in components
- [ ] **Animations** - Adjust Framer Motion settings

### SEO Changes

- [ ] **Page Title** - Update in `metadata-config.ts`
- [ ] **Meta Description** - Update in `metadata-config.ts`
- [ ] **Keywords** - Update in `metadata-config.ts`
- [ ] **OG Image** - Create and add to `/public`

### Advanced Changes

- [ ] **Add New Sections** - Create new components
- [ ] **Change Layout** - Modify component order in `page.tsx`
- [ ] **Add Testimonials** - Create `Testimonials.tsx`
- [ ] **Add Pricing** - Create `Pricing.tsx`
- [ ] **Add FAQ** - Create `FAQ.tsx`

---

## File Reference

Quick reference for all landing page files:

```
Landing Page Files:
├── frontend/src/app/page.tsx                    # Main landing page
├── frontend/src/components/landing/
│   ├── Hero.tsx                                 # Hero section
│   ├── Features.tsx                             # Features grid
│   ├── FeatureCard.tsx                          # Individual feature card
│   ├── Footer.tsx                               # Footer
│   ├── PublicNavigation.tsx                     # Navigation bar
│   └── LandingLayout.tsx                        # Layout wrapper
├── frontend/src/lib/metadata-config.ts          # SEO metadata
└── frontend/public/                             # Static assets (images, logos)
```

---

## Tips and Best Practices

### Content Tips

1. **Keep headlines short and impactful** - Aim for 5-10 words
2. **Focus on benefits, not features** - Tell users what they'll gain
3. **Use action-oriented CTA text** - "Start Free Trial" vs "Submit"
4. **Add social proof** - Testimonials, logos, stats
5. **Make it scannable** - Use bullet points and short paragraphs

### Design Tips

1. **Maintain visual hierarchy** - Larger text for important content
2. **Use consistent spacing** - Follow Tailwind spacing scale
3. **Limit color palette** - Use theme colors for consistency
4. **Optimize images** - Compress and use appropriate formats
5. **Test responsiveness** - Check on mobile, tablet, desktop

### Performance Tips

1. **Lazy load images** - Use Next.js Image component
2. **Minimize animations** - Only animate what's necessary
3. **Optimize fonts** - Use next/font for automatic optimization
4. **Reduce bundle size** - Import only needed icons
5. **Enable caching** - Configure proper cache headers

### Accessibility Tips

1. **Use semantic HTML** - Proper heading hierarchy
2. **Add alt text** - Describe all images
3. **Ensure color contrast** - WCAG AA minimum (4.5:1)
4. **Keyboard navigation** - Test with Tab key
5. **Screen reader friendly** - Use ARIA labels where needed

---

## Additional Resources

- **Component Library**: [shadcn/ui Documentation](https://ui.shadcn.com)
- **Icons**: [Lucide Icons](https://lucide.dev)
- **Animations**: [Framer Motion Docs](https://www.framer.com/motion/)
- **Tailwind CSS**: [Tailwind Documentation](https://tailwindcss.com/docs)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)

## Need Help?

- Check the main [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md) for more details
- Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) for installation help
- See [CONFIGURATION_GUIDE.md](./CONFIGURATION_GUIDE.md) for feature flags
- Ask Kiro for specific customization assistance

