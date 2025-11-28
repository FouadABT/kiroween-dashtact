"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/contexts/NavigationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useBranding } from "@/hooks/useBranding";
import { Skeleton } from "@/components/ui/skeleton";
import { getDefaultLogoUrl } from "@/lib/constants/branding";
import { NavItem } from "@/types/navigation";

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  /** Optional custom navigation items to override defaults */
  navigationItems?: Array<{
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
  /** Optional callback when sidebar state changes */
  onStateChange?: (collapsed: boolean) => void;
}

/**
 * Individual navigation menu item component
 * Extracted to fix React hooks order issue
 */
function NavMenuItem({ 
  item, 
  isActive, 
  sidebarCollapsed, 
  isRouteActive,
  onMobileClick 
}: { 
  item: NavItem; 
  isActive: boolean; 
  sidebarCollapsed: boolean; 
  isRouteActive: (href: string) => boolean;
  onMobileClick?: () => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(isActive);
  
  // If item has children, render as collapsible group
  if (item.children && item.children.length > 0) {
    return (
      <li key={item.title}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "group flex w-full gap-x-2 sm:gap-x-3 rounded-md p-1.5 sm:p-2 text-xs sm:text-sm leading-5 sm:leading-6 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2",
            isActive
              ? "bg-sidebar-accent/50 text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
          )}
          aria-label={sidebarCollapsed ? item.title : undefined}
          title={sidebarCollapsed ? item.title : undefined}
          aria-expanded={isExpanded}
        >
          <item.icon
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-colors",
              isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
            )}
            aria-hidden="true"
          />
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="truncate flex-1 text-left"
              >
                {item.title}
              </motion.span>
            )}
          </AnimatePresence>
          {!sidebarCollapsed && (
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
              aria-hidden="true"
            />
          )}
        </button>
        
        {/* Nested items */}
        <AnimatePresence>
          {isExpanded && !sidebarCollapsed && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 space-y-1 pl-9"
            >
              {item.children.map((child: NavItem) => {
                const isChildActive = isRouteActive(child.href);
                return (
                  <li key={child.title}>
                    <Link
                      href={child.href}
                      onClick={onMobileClick}
                      className={cn(
                        "group flex gap-x-2 rounded-md p-1.5 text-xs leading-5 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2",
                        isChildActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                      )}
                      aria-current={isChildActive ? "page" : undefined}
                    >
                      <child.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isChildActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{child.title}</span>
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  }
  
  // Regular item without children
  return (
    <li key={item.title}>
      <Link
        href={item.href}
        onClick={onMobileClick}
        className={cn(
          "group flex gap-x-2 sm:gap-x-3 rounded-md p-1.5 sm:p-2 text-xs sm:text-sm leading-5 sm:leading-6 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
        )}
        aria-current={isActive ? "page" : undefined}
        aria-label={sidebarCollapsed ? item.title : undefined}
        title={sidebarCollapsed ? item.title : undefined}
      >
        <item.icon
          className={cn(
            "h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-colors",
            isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
          )}
          aria-hidden="true"
        />
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              {item.title}
            </motion.span>
          )}
        </AnimatePresence>
        {item.badge && !sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="ml-auto rounded-full bg-sidebar-primary/20 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs text-sidebar-primary-foreground flex-shrink-0"
            aria-label={`${item.badge} notifications`}
          >
            {item.badge}
          </motion.span>
        )}
      </Link>
    </li>
  );
}

export function Sidebar() {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    navigationItems,
    isLoadingMenus,
    menusError,
    isRouteActive
  } = useNavigation();
  const { resolvedTheme } = useTheme();
  const { getLogoUrl, getBrandName } = useBranding();

  // Get logo based on theme
  const isDark = resolvedTheme === 'dark';
  const logoUrl = getLogoUrl(isDark) || getDefaultLogoUrl(isDark);
  const brandName = getBrandName();
  const brandInitial = brandName.charAt(0).toUpperCase();

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const contentVariants = {
    expanded: {
      width: "16rem",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    collapsed: {
      width: "4rem",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        variants={contentVariants}
        animate={sidebarCollapsed ? "collapsed" : "expanded"}
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col"
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-sidebar-border bg-sidebar px-6 pb-4">
          {/* Logo and collapse button */}
          <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between px-1">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 min-w-0"
                >
                  {logoUrl.endsWith('.svg') || logoUrl.endsWith('.png') || logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg') || logoUrl.endsWith('.webp') ? (
                    <div className="relative h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl}
                        alt={`${brandName} logo`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sidebar-primary-foreground font-bold text-xs sm:text-sm">{brandInitial}</span>
                    </div>
                  )}
                  <span className="text-lg sm:text-xl font-semibold text-sidebar-foreground truncate">{brandName}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-md p-1 sm:p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!sidebarCollapsed}
              type="button"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col" aria-label="Main navigation">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {/* Loading state */}
                  {isLoadingMenus && (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <li key={i} className="px-2">
                          <div className="flex items-center gap-x-3 p-2">
                            <Skeleton className="h-6 w-6 rounded" />
                            {!sidebarCollapsed && <Skeleton className="h-4 flex-1" />}
                          </div>
                        </li>
                      ))}
                    </>
                  )}

                  {/* Error state */}
                  {menusError && !isLoadingMenus && (
                    <li className="px-2">
                      <div className="flex items-center gap-x-3 p-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        {!sidebarCollapsed && (
                          <span className="text-sm">{menusError}</span>
                        )}
                      </div>
                    </li>
                  )}

                  {/* Empty state */}
                  {!isLoadingMenus && !menusError && navigationItems.length === 0 && (
                    <li className="px-2">
                      <div className="flex items-center gap-x-3 p-2 text-muted-foreground">
                        <AlertCircle className="h-5 w-5" />
                        {!sidebarCollapsed && (
                          <span className="text-sm">No menu items available</span>
                        )}
                      </div>
                    </li>
                  )}

                  {/* Menu items */}
                  {!isLoadingMenus && !menusError && navigationItems.map((item) => (
                    <NavMenuItem
                      key={item.title}
                      item={item}
                      isActive={isRouteActive(item.href)}
                      sidebarCollapsed={sidebarCollapsed}
                      isRouteActive={isRouteActive}
                    />
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={sidebarOpen ? "open" : "closed"}
        className="fixed inset-y-0 z-50 flex w-64 flex-col lg:hidden"
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4 border-r border-sidebar-border">
          {/* Mobile header with close button */}
          <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {logoUrl.endsWith('.svg') || logoUrl.endsWith('.png') || logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg') || logoUrl.endsWith('.webp') ? (
                <div className="relative h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt={`${brandName} logo`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-sidebar-primary-foreground font-bold text-xs sm:text-sm">{brandInitial}</span>
                </div>
              )}
              <span className="text-lg sm:text-xl font-semibold text-sidebar-foreground truncate">{brandName}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 sm:p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2"
              aria-label="Close sidebar"
              type="button"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex flex-1 flex-col" aria-label="Main navigation">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {/* Loading state */}
                  {isLoadingMenus && (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <li key={i} className="px-2">
                          <div className="flex items-center gap-x-3 p-2">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-4 flex-1" />
                          </div>
                        </li>
                      ))}
                    </>
                  )}

                  {/* Error state */}
                  {menusError && !isLoadingMenus && (
                    <li className="px-2">
                      <div className="flex items-center gap-x-3 p-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm">{menusError}</span>
                      </div>
                    </li>
                  )}

                  {/* Empty state */}
                  {!isLoadingMenus && !menusError && navigationItems.length === 0 && (
                    <li className="px-2">
                      <div className="flex items-center gap-x-3 p-2 text-muted-foreground">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm">No menu items available</span>
                      </div>
                    </li>
                  )}

                  {/* Menu items */}
                  {!isLoadingMenus && !menusError && navigationItems.map((item) => (
                    <NavMenuItem
                      key={item.title}
                      item={item}
                      isActive={isRouteActive(item.href)}
                      sidebarCollapsed={false}
                      isRouteActive={isRouteActive}
                      onMobileClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </motion.div>
    </>
  );
}