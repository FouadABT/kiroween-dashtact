import { LucideIcon } from "lucide-react";

/**
 * Navigation item interface for sidebar and menu items
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