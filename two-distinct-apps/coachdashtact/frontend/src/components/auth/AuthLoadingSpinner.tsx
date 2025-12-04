"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Props for the AuthLoadingSpinner component
 */
export interface AuthLoadingSpinnerProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Optional message to display below spinner */
  message?: string;
  /** Whether to show in fullscreen mode */
  fullscreen?: boolean;
}

/**
 * AuthLoadingSpinner Component
 * 
 * Specialized loading spinner for authentication operations.
 * Provides visual feedback during login, registration, logout, and token refresh.
 * 
 * @example Basic usage
 * ```tsx
 * <AuthLoadingSpinner message="Logging in..." />
 * ```
 * 
 * @example Fullscreen mode
 * ```tsx
 * <AuthLoadingSpinner 
 *   message="Authenticating..." 
 *   fullscreen={true}
 * />
 * ```
 */
export function AuthLoadingSpinner({ 
  size = "md", 
  className,
  message,
  fullscreen = false
}: AuthLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  const spinner = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4",
      fullscreen ? "min-h-screen" : "py-8",
      className
    )}>
      <motion.div
        className={cn(
          "border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full",
          sizeClasses[size]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        aria-label="Loading"
        role="status"
      />
      {message && (
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * AuthLoadingDots Component
 * 
 * Compact loading indicator using animated dots.
 * Useful for inline loading states in buttons or small spaces.
 * 
 * @example
 * ```tsx
 * <button disabled>
 *   <AuthLoadingDots /> Processing...
 * </button>
 * ```
 */
export function AuthLoadingDots({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <div className={cn("inline-flex space-x-1", className)} role="status" aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.15
          }}
        />
      ))}
    </div>
  );
}

/**
 * AuthLoadingOverlay Component
 * 
 * Semi-transparent overlay with loading spinner.
 * Used to block interaction during auth operations.
 * 
 * @example
 * ```tsx
 * {isLoading && (
 *   <AuthLoadingOverlay message="Verifying credentials..." />
 * )}
 * ```
 */
export function AuthLoadingOverlay({ 
  message 
}: { 
  message?: string 
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <AuthLoadingSpinner size="lg" message={message} />
      </motion.div>
    </motion.div>
  );
}
