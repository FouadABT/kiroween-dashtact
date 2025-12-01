/**
 * Landing CMS Types
 * 
 * Type definitions for Landing Page CMS enhancements
 */

// Navigation Item
export interface NavigationItem {
  label: string;
  link?: string;
  icon?: string;
  type: 'internal' | 'external' | 'dropdown' | 'mega-menu';
  children?: NavigationItem[];
}

// CTA Button
export interface CTAButton {
  text: string;
  link: string;
  style: 'primary' | 'secondary' | 'outline';
  icon?: string;
}

// Header Style
export interface HeaderStyle {
  background?: string;
  sticky: boolean;
  stickyBehavior: 'always' | 'hide-on-scroll' | 'show-on-scroll-up';
  transparent: boolean;
  shadow: boolean;
}

// Mobile Menu Config
export interface MobileMenuConfig {
  enabled: boolean;
  iconStyle: 'hamburger' | 'dots' | 'menu';
  animation: 'slide' | 'fade' | 'scale';
}

// Header Configuration
export interface HeaderConfig {
  id: string;
  logoLight?: string;
  logoDark?: string;
  logoSize: 'sm' | 'md' | 'lg';
  logoLink: string;
  navigation: NavigationItem[];
  ctas: CTAButton[];
  style: HeaderStyle;
  mobileMenu: MobileMenuConfig;
  createdAt: string;
  updatedAt: string;
}

// Footer Link
export interface FooterLink {
  label: string;
  link: string;
}

// Footer Column
export interface FooterColumn {
  heading: string;
  type: 'links' | 'text' | 'social' | 'newsletter' | 'contact';
  links?: FooterLink[];
  text?: string;
}

// Social Link
export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// Newsletter Config
export interface NewsletterConfig {
  enabled: boolean;
  title: string;
  description?: string;
  placeholder: string;
  buttonText: string;
}

// Legal Link
export interface LegalLink {
  label: string;
  link: string;
}

// Footer Style
export interface FooterStyle {
  background: string;
  textColor: string;
  borderTop?: boolean;
}

// Footer Configuration
export interface FooterConfig {
  id: string;
  layout: 'single' | 'multi-column' | 'centered' | 'split';
  columns: FooterColumn[];
  social: SocialLink[];
  newsletter: NewsletterConfig;
  copyright: string;
  legalLinks: LegalLink[];
  style: FooterStyle;
  createdAt: string;
  updatedAt: string;
}

// Section Template
export interface SectionTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  thumbnail?: string;
  section: any; // LandingPageSection
  isCustom: boolean;
  isPublic: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// Landing Analytics Event
export interface LandingAnalyticsEvent {
  id: string;
  pageId: string;
  eventType: 'view' | 'cta_click' | 'section_view' | 'form_submit' | 'scroll';
  eventData: any;
  sessionId: string;
  userId?: string;
  deviceType: string;
  browser: string;
  referrer?: string;
  timestamp: string;
}

// Landing Page Content (updated)
export interface LandingPageContent {
  id: string;
  sections: any[]; // Array of section objects
  settings: any; // Global settings
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  headerConfigId?: string;
  footerConfigId?: string;
  themeMode: 'light' | 'dark' | 'auto' | 'toggle';
  headerConfig?: HeaderConfig;
  footerConfig?: FooterConfig;
}

// DTOs for API calls
export interface CreateHeaderConfigDto {
  logoLight?: string;
  logoDark?: string;
  logoSize: 'sm' | 'md' | 'lg';
  logoLink: string;
  navigation: NavigationItem[];
  ctas: CTAButton[];
  style: HeaderStyle;
  mobileMenu: MobileMenuConfig;
}

export interface UpdateHeaderConfigDto {
  logoLight?: string;
  logoDark?: string;
  logoSize?: 'sm' | 'md' | 'lg';
  logoLink?: string;
  navigation?: NavigationItem[];
  ctas?: CTAButton[];
  style?: HeaderStyle;
  mobileMenu?: MobileMenuConfig;
}

export interface CreateFooterConfigDto {
  layout: 'single' | 'multi-column' | 'centered' | 'split';
  columns: FooterColumn[];
  social: SocialLink[];
  newsletter: NewsletterConfig;
  copyright: string;
  legalLinks: LegalLink[];
  style: FooterStyle;
}

export interface UpdateFooterConfigDto {
  layout?: 'single' | 'multi-column' | 'centered' | 'split';
  columns?: FooterColumn[];
  social?: SocialLink[];
  newsletter?: NewsletterConfig;
  copyright?: string;
  legalLinks?: LegalLink[];
  style?: FooterStyle;
}

export interface CreateSectionTemplateDto {
  name: string;
  description?: string;
  category: string;
  thumbnail?: string;
  section: any;
  isCustom?: boolean;
  isPublic?: boolean;
}

export interface UpdateSectionTemplateDto {
  name?: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  section?: any;
  isCustom?: boolean;
  isPublic?: boolean;
}

export interface TrackAnalyticsEventDto {
  pageId: string;
  eventType: 'view' | 'cta_click' | 'section_view' | 'form_submit' | 'scroll';
  eventData: any;
  sessionId: string;
  userId?: string;
  deviceType: string;
  browser: string;
  referrer?: string;
}

export interface AnalyticsQueryDto {
  pageId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
}

// Global Settings Types
export interface ColorPair {
  light?: string;
  dark?: string;
}

export interface ThemeColors {
  primary?: ColorPair;
  secondary?: ColorPair;
  accent?: ColorPair;
}

export interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  mode?: 'light' | 'dark' | 'auto' | 'toggle';
  colors?: ThemeColors;
}

export interface LayoutSettings {
  maxWidth?: 'full' | 'container' | 'narrow';
  spacing?: 'compact' | 'normal' | 'relaxed';
  containerWidth?: 'full' | 'wide' | 'standard' | 'narrow';
  sectionSpacing?: 'compact' | 'normal' | 'relaxed';
  contentAlignment?: 'left' | 'center' | 'right';
}

export interface SeoSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: boolean;
}

export interface GeneralSettings {
  title?: string;
  description?: string;
  favicon?: string;
  language?: string;
}

export interface PerformanceSettings {
  imageOptimization?: boolean;
  lazyLoading?: boolean;
  cacheStrategy?: 'aggressive' | 'normal' | 'minimal';
}

export interface AdvancedSettings {
  customCSS?: string;
  customJS?: string;
  analyticsId?: string;
  gtmId?: string;
  thirdPartyScripts?: string[];
}

export interface GlobalSettings {
  theme?: ThemeSettings;
  layout?: LayoutSettings;
  seo?: SeoSettings;
  general?: GeneralSettings;
  performance?: PerformanceSettings;
  advanced?: AdvancedSettings;
}

export interface UpdateLandingContentDto {
  sections?: any[];
  settings?: GlobalSettings;
  headerConfigId?: string;
  footerConfigId?: string;
  themeMode?: 'light' | 'dark' | 'auto' | 'toggle';
}

// Visual Editor Types
export interface LandingPageSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'stats' | 'content' | 'footer';
  content: any;
  design?: SectionDesign;
  layout?: SectionLayout;
  animation?: SectionAnimation;
  advanced?: SectionAdvanced;
  visible: boolean;
  order: number;
}

export interface SectionDesign {
  background?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  border?: string;
  shadow?: string;
  overlay?: string;
  overlayOpacity?: number;
}

export interface SectionLayout {
  padding?: string;
  margin?: string;
  containerWidth?: 'full' | 'wide' | 'standard' | 'narrow';
  contentAlignment?: 'left' | 'center' | 'right';
}

export interface SectionAnimation {
  entrance?: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none';
  timing?: number;
  delay?: number;
}

export interface SectionAdvanced {
  customCss?: string;
  anchorId?: string;
  visibilityConditions?: any;
}

export type PreviewMode = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface EditorHistoryState {
  sections: LandingPageSection[];
  timestamp: number;
}

export interface VisualEditorState {
  sections: LandingPageSection[];
  selectedSectionId: string | null;
  previewMode: PreviewMode;
  themeMode: 'light' | 'dark';
  isSaving: boolean;
  history: EditorHistoryState[];
  historyIndex: number;
}

// Landing Settings
export interface LandingSettings {
  general: {
    title: string;
    description: string;
    favicon: string;
    language: string;
  };
  seo: {
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: 'summary' | 'summary_large_image';
    structuredData: boolean;
  };
  theme: {
    mode: 'light' | 'dark' | 'auto' | 'toggle';
    colors: {
      primary: { light: string; dark: string };
      secondary: { light: string; dark: string };
      accent: { light: string; dark: string };
    };
  };
  layout: {
    maxWidth?: 'full' | 'container' | 'narrow';
    spacing?: 'compact' | 'normal' | 'relaxed';
    // Legacy properties for backward compatibility
    containerWidth?: 'full' | 'wide' | 'standard' | 'narrow';
    sectionSpacing?: 'compact' | 'normal' | 'relaxed';
    contentAlignment?: 'left' | 'center' | 'right';
  };
  performance: {
    imageOptimization: boolean;
    lazyLoading: boolean;
    cacheStrategy: 'aggressive' | 'normal' | 'minimal';
  };
  advanced?: {
    customCSS?: string;
    customJS?: string;
    analyticsId?: string;
    gtmId?: string;
    thirdPartyScripts?: string[];
  };
}
