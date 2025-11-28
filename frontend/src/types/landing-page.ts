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
export type SectionType = 'hero' | 'features' | 'footer' | 'cta' | 'testimonials' | 'stats' | 'content' | 'blog-posts' | 'pages' | 'products';

export interface LandingPageSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  data: HeroSectionData | FeaturesSectionData | FooterSectionData | CtaSectionData | TestimonialsSectionData | StatsSectionData | ContentSectionData | BlogPostsSectionData | PagesSectionData | ProductsSectionData;
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
  backgroundVideo?: string;
  backgroundType: 'image' | 'gradient' | 'solid' | 'video';
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: string;
  textAlignment: 'left' | 'center' | 'right';
  height: 'small' | 'medium' | 'large' | 'extra-large' | 'full';
  // Optional extended fields for enhanced hero sections
  features?: string[];
  trustBadges?: string[];
  showTrustBadges?: boolean;
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
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'list' | 'carousel';
  columns?: 2 | 3 | 4;
  features?: FeatureCard[];
  heading?: string;
  subheading?: string;
  backgroundType?: string;
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
  rating?: number; // 1-5 stars
  order: number;
}

// Testimonials Section Data
export interface TestimonialsSectionData {
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel' | 'masonry';
  showRatings?: boolean;
  testimonials?: Testimonial[];
  heading?: string;
  subheading?: string;
  columns?: number;
}

// Stat
export interface Stat {
  id: string;
  value: string;
  label: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
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
  contentWidth?: 'full' | 'wide' | 'standard' | 'narrow';
  customCSS?: string; // Custom CSS scoped to this section
  htmlMode?: boolean; // Whether user is editing in HTML mode
}

// Blog Posts Section Data
export interface BlogPostsSectionData {
  title?: string;
  subtitle?: string;
  layout: 'grid' | 'list' | 'carousel';
  columns: 2 | 3 | 4;
  postCount: 3 | 6 | 9 | 12;
  filterByCategory?: string;
  filterByTag?: string;
  showAuthor: boolean;
  showDate: boolean;
  showCategories: boolean;
  showExcerpt: boolean;
  ctaText: string;
  ctaLink: string;
}

// Custom Pages Section Data
export interface PagesSectionData {
  title?: string;
  subtitle?: string;
  layout: 'grid' | 'cards' | 'list';
  columns: 2 | 3 | 4;
  pageCount: 3 | 6 | 9 | 12;
  filterByParent?: string;
  showExcerpt: boolean;
  showImage: boolean;
  ctaText: string;
}

// Products Section Data
export interface ProductsSectionData {
  title?: string;
  subtitle?: string;
  layout?: 'grid' | 'carousel' | 'featured';
  columns?: 2 | 3 | 4;
  productCount?: 3 | 6 | 9 | 12;
  filterByCategory?: string;
  filterByTag?: string;
  showPrice?: boolean;
  showRating?: boolean;
  showStock?: boolean;
  ctaText?: string;
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
    keywords?: string[];
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
