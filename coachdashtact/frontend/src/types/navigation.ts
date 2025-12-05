import { LucideIcon } from "lucide-react";

/**
 * Navigation item interface for sidebar and menu items
 */
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  permission?: string; // Optional permission required to view this nav item
  children?: NavItem[]; // Optional nested navigation items for grouped menus
}

/**
 * Breadcrumb item interface for header navigation
 */
export interface BreadcrumbItem {
  title: string;
  href?: string;
}