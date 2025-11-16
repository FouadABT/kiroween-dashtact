"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NavItem, BreadcrumbItem } from "@/types/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { useMetadata } from "@/contexts/MetadataContext";
import { generateBreadcrumbs as generateBreadcrumbsHelper } from "@/lib/breadcrumb-helpers";
import { getIconByName } from "@/lib/icon-loader";
import { MenuApi } from "@/lib/api";
import { MenuItem } from "@/types/menu";

interface NavigationContextType {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Navigation items
  navigationItems: NavItem[];
  isLoadingMenus: boolean;
  menusError: string | null;
  
  // Active route detection
  activeRoute: string;
  isRouteActive: (href: string) => boolean;
  
  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

/**
 * Convert MenuItem from API to NavItem for sidebar rendering
 */
function convertMenuItemToNavItem(menuItem: MenuItem): NavItem {
  const navItem: NavItem = {
    title: menuItem.label,
    href: menuItem.route,
    icon: getIconByName(menuItem.icon),
    badge: menuItem.badge,
  };

  // Add children if they exist
  if (menuItem.children && menuItem.children.length > 0) {
    navItem.children = menuItem.children.map(convertMenuItemToNavItem);
  }

  return navItem;
}

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { dynamicValues } = useMetadata();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [menusError, setMenusError] = useState<string | null>(null);

  // Fetch dynamic menus from API
  useEffect(() => {
    async function fetchMenus() {
      if (!isAuthenticated) {
        setMenuItems([]);
        setIsLoadingMenus(false);
        return;
      }

      try {
        setIsLoadingMenus(true);
        setMenusError(null);
        const menus = await MenuApi.getUserMenus();
        setMenuItems(menus);
      } catch (error) {
        console.error('Failed to fetch menus:', error);
        setMenusError('Failed to load navigation menus');
        setMenuItems([]);
      } finally {
        setIsLoadingMenus(false);
      }
    }

    fetchMenus();
  }, [isAuthenticated]);

  // Convert menu items to navigation items
  const navigationItems = useMemo(() => {
    return menuItems.map(convertMenuItemToNavItem);
  }, [menuItems]);

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
    navigationItems,
    isLoadingMenus,
    menusError,
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