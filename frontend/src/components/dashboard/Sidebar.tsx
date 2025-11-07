"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/contexts/NavigationContext";

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

export function Sidebar(_props?: SidebarProps) {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    navigationItems,
    isRouteActive
  } = useNavigation();

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
      {/* Desktop Sidebar */}
      <motion.div
        variants={contentVariants}
        animate={sidebarCollapsed ? "collapsed" : "expanded"}
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col"
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
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
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs sm:text-sm">D</span>
                  </div>
                  <span className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Dashboard</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-md p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
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
                  {navigationItems.map((item) => {
                    const isActive = isRouteActive(item.href);
                    
                    return (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex gap-x-2 sm:gap-x-3 rounded-md p-1.5 sm:p-2 text-xs sm:text-sm leading-5 sm:leading-6 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                          )}
                          aria-current={isActive ? "page" : undefined}
                          aria-label={sidebarCollapsed ? item.title : undefined}
                          title={sidebarCollapsed ? item.title : undefined}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-colors",
                              isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-700"
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
                              className="ml-auto rounded-full bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs text-blue-700 flex-shrink-0"
                              aria-label={`${item.badge} notifications`}
                            >
                              {item.badge}
                            </motion.span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
          {/* Mobile header with close button */}
          <div className="flex h-14 sm:h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">D</span>
              </div>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Dashboard</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 sm:p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                  {navigationItems.map((item) => {
                    const isActive = isRouteActive(item.href);
                    
                    return (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "group flex gap-x-2 sm:gap-x-3 rounded-md p-1.5 sm:p-2 text-xs sm:text-sm leading-5 sm:leading-6 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 sm:h-6 sm:w-6 shrink-0 transition-colors",
                              isActive ? "text-blue-700" : "text-gray-400 group-hover:text-blue-700"
                            )}
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.title}</span>
                          {item.badge && (
                            <span 
                              className="ml-auto rounded-full bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs text-blue-700 flex-shrink-0"
                              aria-label={`${item.badge} notifications`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </motion.div>
    </>
  );
}