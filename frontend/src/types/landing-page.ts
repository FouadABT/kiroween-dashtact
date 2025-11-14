/**
 * Landing Page CMS Types
 * 
 * TypeScript interfaces for Landing Page CMS models
 * Synced with backend/prisma/schema.prisma
 */

// Enums
export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PageVisibility = 'PUBLIC' | 'PRIVATE';

// Section Types for Landing Page
export type SectionType = 'hero' | 'features' | 'footer' | 'cta' | 'testimonials' | 'stats' | 'content';

export interface LandingPageSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  data: HeroSectionData | FeaturesSectionData | FooterSectionData | CtaSectionData | TestimonialsSectionData | StatsSectionData | ContentSectionData;
}

// CTA Button
export interface CtaButton {
  text: string;
  link: string;
  linkType: 'url' | 'page';
}

// Hero Section Data
export interface HeroSectionData {
  headline: string;
  subheadline: string;
  primaryCta: CtaButton;
  secondaryCta?: CtaButton;
  backgroundImage?: string;
  backgroundType: 'image' | 'gradient' | 'solid';
  backgroundColor?: string;
  textAlignment: 'left' | 'center' | 'right';
  height: 'small' | 'medium' | 'large' | 'full';
}

// Feature Card
export interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

// Features Section Data
export interface FeaturesSectionData {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'list' | 'carousel';
  columns: 2 | 3 | 4;
  features: FeatureCard[];
}

// Nav Link
export interface NavLink {
  label: string;
  url: string;
  linkType: 'url' | 'page';
  order: number;
}

// Social Link
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// Footer Section Data
export interface FooterSectionData {
  companyName: string;
  description: string;
  navLinks: NavLink[];
  socialLinks: SocialLink[];
  copyright: string;
  showNewsletter: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
}

// CTA Section Data
export interface CtaSectionData {
  title: string;
  description: string;
  primaryCta: CtaButton;
  secondaryCta?: CtaButton;
  backgroundColor: string;
  textColor: string;
  alignment: 'left' | 'center' | 'right';
}

// Testimonial
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  order: number;
}

// Testimonials Section Data
export interface TestimonialsSectionData {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'carousel';
  testimonials: Testimonial[];
}

// Stat
export interface Stat {
  id: string;
  value: string;
  label: string;
  icon?: string;
  order: number;
}

// Stats Section Data
export interface StatsSectionData {
  title?: string;
  layout: 'horizontal' | 'grid';
  stats: Stat[];
}

// Content Section Data
export interface ContentSectionData {
  title?: string;
  content: string;
  layout: 'single' | 'two-column';
  image?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
}

// Landing Page Settings
export interface LandingPageSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  layout?: {
    maxWidth?: 'full' | 'container' | 'narrow';
    spacing?: 'compact' | 'normal' | 'relaxed';
  };
  seo?: {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
  };
}

// Landing Page Content Model
export interface LandingPageContent {
  id: string;
  sections: LandingPageSection[];
  settings: LandingPageSettings;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Custom Page Model
export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: PageStatus;
  visibility: PageVisibility;
  parentPageId?: string;
  showInNavigation: boolean;
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  customCssClass?: string;
  templateKey?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  parentPage?: CustomPage;
  childPages?: CustomPage[];
}

// Page Redirect Model
export interface PageRedirect {
  id: string;
  fromSlug: string;
  toPageId: string;
  redirectType: number; // 301 or 302
  createdAt: string;
  toPage?: CustomPage;
}

// API Request/Response Types

export interface CreateLandingPageContentDto {
  sections: LandingPageSection[];
  settings: LandingPageSettings;
  version?: number;
  isActive?: boolean;
}

export interface UpdateLandingPageContentDto {
  sections?: LandingPageSection[];
  settings?: LandingPageSettings;
  version?: number;
  isActive?: boolean;
}

export interface CreateCustomPageDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: PageStatus;
  visibility?: PageVisibility;
  parentPageId?: string;
  showInNavigation?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  customCssClass?: string;
  templateKey?: string;
}

export interface UpdateCustomPageDto {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: PageStatus;
  visibility?: PageVisibility;
  parentPageId?: string;
  showInNavigation?: boolean;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  customCssClass?: string;
  templateKey?: string;
}

export interface CreatePageRedirectDto {
  fromSlug: string;
  toPageId: string;
  redirectType?: number;
}

export interface UpdatePageRedirectDto {
  fromSlug?: string;
  toPageId?: string;
  redirectType?: number;
}

// Query/Filter Types

export interface CustomPageQueryDto {
  status?: PageStatus;
  visibility?: PageVisibility;
  parentPageId?: string;
  showInNavigation?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'displayOrder' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface LandingPageQueryDto {
  isActive?: boolean;
  version?: number;
}

// API Response Types

export interface LandingPageContentResponse {
  data: LandingPageContent;
  message?: string;
}

export interface LandingPageContentListResponse {
  data: LandingPageContent[];
  total: number;
  page: number;
  limit: number;
}

export interface CustomPageResponse {
  data: CustomPage;
  message?: string;
}

export interface CustomPageListResponse {
  data: CustomPage[];
  total: number;
  page: number;
  limit: number;
}

export interface PageRedirectResponse {
  data: PageRedirect;
  message?: string;
}

export interface PageRedirectListResponse {
  data: PageRedirect[];
  total: number;
}
