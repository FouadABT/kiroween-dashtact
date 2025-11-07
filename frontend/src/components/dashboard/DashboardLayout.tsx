"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavigationProvider, useNavigation } from "@/contexts/NavigationContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

/**
 * Props for the DashboardLayout component
 */
export interface DashboardLayoutProps {
  /** Content to be rendered in the main dashboard area */
  children: React.ReactNode;
  /** Optional custom navigation items */
  navigationItems?: Array<{
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
  /** Optional callback when layout state changes */
  onLayoutChange?: (sidebarCollapsed: boolean) => void;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useNavigation();
  const mainContentRef = useRef<HTMLElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close sidebar on Escape key
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  // Focus management for sidebar
  useEffect(() => {
    if (sidebarOpen) {
      // Focus trap for mobile sidebar
      const sidebar = document.querySelector('[role="dialog"]') as HTMLElement;
      if (sidebar) {
        const focusableElements = sidebar.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement?.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement?.focus();
              }
            }
          }
        };

        sidebar.addEventListener('keydown', handleTabKey);
        firstElement?.focus();

        return () => {
          sidebar.removeEventListener('keydown', handleTabKey);
        };
      }
    }
  }, [sidebarOpen]);

  const handleSkipToMain = () => {
    mainContentRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Skip to main content link */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          handleSkipToMain();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        {/* Header */}
        <Header />

        {/* Page content with animations */}
        <main 
          id="main-content"
          ref={mainContentRef}
          className="p-3 sm:p-4 lg:p-6 xl:p-8 focus:outline-none"
          tabIndex={-1}
          role="main"
          aria-label="Main content"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <RouteGuard requireAuth={true}>
      <NavigationProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </NavigationProvider>
    </RouteGuard>
  );
}