"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavItem, BreadcrumbItem } from "@/types/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { generateBreadcrumbs as generateBreadcrumbsHelper } from "@/lib/breadcrumb-helpers";
import { 
  Home, 
  BarChart3, 
  Table, 
  Settings,
  Users,
  Shield,
  LayoutGrid,
  Bell,
  FileText,
  FileIcon,
  FileEdit,
  ShoppingCart,
  Package,
  ShoppingBag,
  Warehouse,
  Layout
} from "lucide-react";
import { featuresConfig } from "@/config/features.config";
import { PagesApi } from "@/lib/api";
import { CustomPage } from "@/types/pages";

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

// Navigation items configuration with permission requirements
// Blog navigation is conditionally added based on feature flag
const baseNavigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    // No permission required - all authenticated users can access
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    // No permission required - all authenticated users can access
  },
  {
    title: "Data",
    href: "/dashboard/data",
    icon: Table,
    // No permission required - all authenticated users can access
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    permission: "users:read", // Requires users:read permission
  },
  {
    title: "Permissions",
    href: "/dashboard/permissions",
    icon: Shield,
    permission: "permissions:read", // Requires permissions:read permission
  },
  {
    title: "Widgets",
    href: "/dashboard/widgets",
    icon: LayoutGrid,
    permission: "widgets:admin", // Requires widgets:admin permission
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    permission: "notifications:read", // Requires notifications:read permission
  },
  {
    title: "Pages",
    href: "/dashboard/pages",
    icon: FileEdit,
    // No permission on parent - visible if user has ANY child permission
    children: [
      {
        title: "All Pages",
        href: "/dashboard/pages",
        icon: FileEdit,
        permission: "pages:read",
      },
      {
        title: "Landing Page",
        href: "/dashboard/settings/landing-page",
        icon: Layout,
        permission: "landing:read",
      },
    ],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: "settings:read", // Requires settings:read permission
  },
];

// Conditionally add blog navigation if blog feature is enabled
const blogNavigation: NavItem[] = featuresConfig.blog.enabled ? [{
  title: "Blog",
  href: "/dashboard/blog",
  icon: FileText,
  permission: "blog:read", // Requires blog:read permission
}] : [];

// Conditionally add e-commerce navigation if e-commerce feature is enabled
const ecommerceNavigation: NavItem[] = featuresConfig.ecommerce.enabled ? [
  {
    title: "E-Commerce",
    href: "/dashboard/ecommerce",
    icon: ShoppingCart,
    // No permission on parent - visible if user has ANY child permission
    children: [
      {
        title: "Overview",
        href: "/dashboard/ecommerce",
        icon: BarChart3,
        // No permission - accessible to anyone with any ecommerce permission
      },
      {
        title: "Products",
        href: "/dashboard/ecommerce/products",
        icon: Package,
        permission: "products:read",
      },
      {
        title: "Orders",
        href: "/dashboard/ecommerce/orders",
        icon: ShoppingBag,
        permission: "orders:read",
      },
      {
        title: "Customers",
        href: "/dashboard/ecommerce/customers",
        icon: Users,
        permission: "customers:read",
      },
      {
        title: "Inventory",
        href: "/dashboard/ecommerce/inventory",
        icon: Warehouse,
        permission: "inventory:read",
      },
    ],
  },
] : [];

// Combine all navigation items
const navigationItems: NavItem[] = [
  ...baseNavigationItems,
  ...blogNavigation,
  ...ecommerceNavigation,
];

// Note: generateBreadcrumbs is now imported from breadcrumb-helpers.ts
// It uses metadata-config.ts and supports dynamic values

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const { hasPermission, isAuthenticated } = useAuth();
  const { dynamicValues } = useMetadata();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);

  // Fetch custom pages with showInNavigation = true and status = PUBLISHED
  useEffect(() => {
    async function fetchNavigationPages() {
      try {
        const response = await PagesApi.getAllPublic({
          status: 'PUBLISHED' as any,
          visibility: 'PUBLIC' as any,
          showInNavigation: true,
          sortBy: 'displayOrder',
          sortOrder: 'asc',
        });
        setCustomPages(response.data);
      } catch (error) {
        console.error('Failed to fetch navigation pages:', error);
        setCustomPages([]);
      }
    }

    fetchNavigationPages();
  }, []);

  // Convert custom pages to navigation items
  const customPageNavItems = useMemo(() => {
    return customPages.map((page): NavItem => ({
      title: page.title,
      href: `/${page.slug}`,
      icon: FileIcon,
      // No permission required for public pages
    }));
  }, [customPages]);

  // Recursively filter navigation items and their children based on user permissions
  const filterNavItemsByPermission = (items: NavItem[]): NavItem[] => {
    return items
      .filter(item => {
        // If no permission required, show the item
        if (!item.permission) {
          return true;
        }
        // Check if user has the required permission
        return hasPermission(item.permission);
      })
      .map(item => {
        // If item has children, recursively filter them
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterNavItemsByPermission(item.children);
          // Only include parent if it has visible children or no children requirement
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return item;
      })
      .filter(item => {
        // Remove parent items that have children but all were filtered out
        if (item.children !== undefined) {
          return item.children.length > 0;
        }
        return true;
      });
  };

  // Filter navigation items based on user permissions
  const filteredNavigationItems = useMemo(() => {
    const baseItems = isAuthenticated
      ? filterNavItemsByPermission(navigationItems)
      : navigationItems;

    // Add custom pages to navigation
    return [...baseItems, ...customPageNavItems];
  }, [isAuthenticated, hasPermission, customPageNavItems]);

  // Generate breadcrumbs based on current pathname using metadata config and dynamic values
  const breadcrumbs = useMemo(() => {
    const generated = generateBreadcrumbsHelper(pathname, dynamicValues);
    console.log('[NavigationContext] Generated breadcrumbs:', {
      pathname,
      dynamicValues,
      breadcrumbs: generated
    });
    // Convert to BreadcrumbItem format expected by Header
    return generated.map(item => ({
      title: item.label,
      href: item.href
    }));
  }, [pathname, dynamicValues]);

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
    navigationItems: filteredNavigationItems,
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