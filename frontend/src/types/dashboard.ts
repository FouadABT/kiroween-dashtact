import { LucideIcon } from "lucide-react";

/**
 * Navigation item interface for sidebar navigation
 */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

/**
 * Breadcrumb item interface for header navigation
 */
export interface BreadcrumbItem {
  title: string;
  href?: string;
}

/**
 * User interface for authentication and profile data
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

/**
 * Dashboard statistics interface for overview cards
 */
export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
}

/**
 * Form state interface for handling form validation and loading states
 */
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  success?: string;
}

/**
 * Data table row interface for demo data
 */
export interface TableRow {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Chart data interface for analytics pages
 */
export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number | boolean | null | undefined;
}