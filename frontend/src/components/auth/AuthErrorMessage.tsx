"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { XCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";

/**
 * Error severity levels
 */
export type ErrorSeverity = "error" | "warning" | "info";

/**
 * Props for the AuthErrorMessage component
 */
export interface AuthErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Additional CSS classes */
  className?: string;
  /** Whether the error can be dismissed */
  dismissible?: boolean;
  /** Callback when error is dismissed */
  onDismiss?: () => void;
  /** Optional error code for debugging */
  errorCode?: string;
  /** Whether to show the error inline or as a banner */
  variant?: "inline" | "banner";
}

/**
 * AuthErrorMessage Component
 * 
 * Displays authentication-related error messages with appropriate styling and icons.
 * Supports different severity levels and dismissible errors.
 * 
 * @example Basic usage
 * ```tsx
 * <AuthErrorMessage 
 *   message="Invalid email or password" 
 *   severity="error"
 * />
 * ```
 * 
 * @example Dismissible error
 * ```tsx
 * <AuthErrorMessage 
 *   message="Session expired. Please log in again."
 *   severity="warning"
 *   dismissible={true}
 *   onDismiss={() => setError(null)}
 * />
 * ```
 */
export function AuthErrorMessage({
  message,
  severity = "error",
  className,
  dismissible = false,
  onDismiss,
  errorCode,
  variant = "inline"
}: AuthErrorMessageProps) {
  const severityConfig = {
    error: {
      icon: XCircle,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-800 dark:text-red-200",
      iconColor: "text-red-500 dark:text-red-400"
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-800 dark:text-yellow-200",
      iconColor: "text-yellow-500 dark:text-yellow-400"
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-800 dark:text-blue-200",
      iconColor: "text-blue-500 dark:text-blue-400"
    }
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  const content = (
    <motion.div
      className={cn(
        "rounded-lg border p-4",
        config.bgColor,
        config.borderColor,
        variant === "banner" && "w-full",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium", config.textColor)}>
            {message}
          </p>
          {errorCode && (
            <p className={cn("text-xs mt-1 opacity-75", config.textColor)}>
              Error code: {errorCode}
            </p>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              "flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
              config.textColor
            )}
            aria-label="Dismiss error"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {message && content}
    </AnimatePresence>
  );
}

/**
 * AuthErrorBanner Component
 * 
 * Full-width error banner for critical authentication errors.
 * Typically used at the top of pages or forms.
 * 
 * @example
 * ```tsx
 * <AuthErrorBanner 
 *   message="Your session has expired. Please log in again."
 *   onDismiss={() => router.push('/login')}
 * />
 * ```
 */
export function AuthErrorBanner({
  message,
  severity = "error",
  dismissible = true,
  onDismiss,
  errorCode
}: Omit<AuthErrorMessageProps, "variant">) {
  return (
    <AuthErrorMessage
      message={message}
      severity={severity}
      dismissible={dismissible}
      onDismiss={onDismiss}
      errorCode={errorCode}
      variant="banner"
    />
  );
}

/**
 * PermissionDeniedMessage Component
 * 
 * Specialized error message for permission-related errors.
 * Shows when user lacks required permissions.
 * 
 * @example
 * ```tsx
 * <PermissionDeniedMessage 
 *   permission="users:write"
 *   resource="user management"
 * />
 * ```
 */
export function PermissionDeniedMessage({
  permission,
  resource,
  className
}: {
  permission?: string;
  resource?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-4",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
            Permission Denied
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            You don&apos;t have permission to access {resource || "this resource"}.
          </p>
          {permission && (
            <div className="mt-2 bg-orange-100 dark:bg-orange-900/40 rounded px-2 py-1 inline-block">
              <p className="text-xs text-orange-800 dark:text-orange-200 font-mono">
                Required: {permission}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * FormErrorMessage Component
 * 
 * Compact error message for form fields.
 * Used to display validation or submission errors.
 * 
 * @example
 * ```tsx
 * <FormErrorMessage message="Email is required" />
 * ```
 */
export function FormErrorMessage({
  message,
  className
}: {
  message: string;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          className={cn(
            "text-sm text-red-600 dark:text-red-400 mt-1",
            className
          )}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/**
 * ErrorList Component
 * 
 * Displays multiple errors in a list format.
 * Useful for showing validation errors or multiple issues.
 * 
 * @example
 * ```tsx
 * <ErrorList 
 *   errors={[
 *     "Password must be at least 8 characters",
 *     "Password must contain an uppercase letter",
 *     "Password must contain a number"
 *   ]}
 * />
 * ```
 */
export function ErrorList({
  errors,
  className
}: {
  errors: string[];
  className?: string;
}) {
  if (!errors || errors.length === 0) return null;

  return (
    <motion.div
      className={cn(
        "rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
            {errors.length === 1 ? "Error" : `${errors.length} Errors`}
          </h3>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <motion.li
                key={index}
                className="text-sm text-red-700 dark:text-red-300"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                • {error}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
