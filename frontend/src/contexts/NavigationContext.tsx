"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NavItem, BreadcrumbItem } from "@/types/dashboard";
import { 
  Home, 
  BarChart3, 
  Table, 
  Settings,
  Users
} from "lucide-react";

interface NavigationContextType {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Navigation items
  navigationItems: NavItem[];
  
  // Active route detection
  activeRoute: string;
  isRouteActive: (href: string) => boolean;
  
  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Navigation items configuration
const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Data",
    href: "/dashboard/data",
    icon: Table,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Dashboard
  breadcrumbs.push({
    title: "Dashboard",
    href: "/dashboard"
  });

  // Add additional segments
  if (segments.length > 1) {
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const href = '/' + segments.slice(0, i + 1).join('/');
      
      // Capitalize and format segment names
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        title,
        href: i === segments.length - 1 ? undefined : href // Last item has no href
      });
    }
  }

  return breadcrumbs;
}

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Generate breadcrumbs based on current pathname
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Active route detection
  const isRouteActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const value: NavigationContextType = {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    navigationItems,
    activeRoute: pathname,
    isRouteActive,
    breadcrumbs,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}