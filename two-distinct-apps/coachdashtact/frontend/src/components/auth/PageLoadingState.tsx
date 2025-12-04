"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Props for the PageLoadingState component
 */
export interface PageLoadingStateProps {
  /** Optional message to display */
  message?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show skeleton content instead of spinner */
  showSkeleton?: boolean;
}

/**
 * PageLoadingState Component
 * 
 * Full-page loading state for route transitions.
 * Provides smooth loading experience during navigation between protected routes.
 * 
 * @example Basic usage
 * ```tsx
 * <PageLoadingState message="Loading dashboard..." />
 * ```
 * 
 * @example With skeleton
 * ```tsx
 * <PageLoadingState showSkeleton={true} />
 * ```
 */
export function PageLoadingState({ 
  message = "Loading...",
  className,
  showSkeleton = false
}: PageLoadingStateProps) {
  if (showSkeleton) {
    return <PageLoadingSkeleton className={className} />;
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900",
      className
    )}>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          aria-label="Loading"
          role="status"
        />
        <motion.p
          className="text-gray-600 dark:text-gray-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
}

/**
 * PageLoadingSkeleton Component
 * 
 * Skeleton loading state that mimics page structure.
 * Provides better perceived performance during route transitions.
 * 
 * @example
 * ```tsx
 * <PageLoadingSkeleton />
 * ```
 */
export function PageLoadingSkeleton({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900 p-8",
      className
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <motion.div
            className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </motion.div>
          ))}
        </div>

        {/* Table skeleton */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        >
          <div className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * InlineLoadingState Component
 * 
 * Compact loading state for inline use within components.
 * Useful for loading sections of a page without blocking the entire view.
 * 
 * @example
 * ```tsx
 * {isLoadingData ? (
 *   <InlineLoadingState message="Loading data..." />
 * ) : (
 *   <DataTable data={data} />
 * )}
 * ```
 */
export function InlineLoadingState({ 
  message = "Loading...",
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center justify-center py-12",
      className
    )}>
      <div className="text-center">
        <motion.div
          className="w-8 h-8 border-3 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full mx-auto mb-3"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          aria-label="Loading"
          role="status"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * ButtonLoadingState Component
 * 
 * Loading state specifically designed for buttons.
 * Shows spinner with optional text.
 * 
 * @example
 * ```tsx
 * <button disabled={isLoading}>
 *   {isLoading ? (
 *     <ButtonLoadingState text="Logging in..." />
 *   ) : (
 *     "Login"
 *   )}
 * </button>
 * ```
 */
export function ButtonLoadingState({ 
  text,
  className 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <motion.span
        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear"
        }}
        aria-label="Loading"
        role="status"
      />
      {text && <span>{text}</span>}
    </span>
  );
}
