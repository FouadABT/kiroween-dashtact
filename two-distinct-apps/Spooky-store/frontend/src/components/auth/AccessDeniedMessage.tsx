"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShieldAlert, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Props for the AccessDeniedMessage component
 */
export interface AccessDeniedMessageProps {
  /** Permission that was required but missing */
  permission?: string;
  /** Role that was required but missing */
  role?: string;
  /** Resource that was being accessed */
  resource?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show a back button */
  showBackButton?: boolean;
  /** Custom back button URL */
  backUrl?: string;
  /** Custom back button text */
  backText?: string;
  /** Variant style */
  variant?: "default" | "compact" | "card";
}

/**
 * AccessDeniedMessage Component
 * 
 * Displays a styled access denied message when users lack required permissions or roles.
 * Can be used inline within pages or as a standalone message.
 * 
 * @example Basic usage
 * ```tsx
 * <AccessDeniedMessage 
 *   permission="users:write"
 *   resource="user management"
 * />
 * ```
 * 
 * @example With back button
 * ```tsx
 * <AccessDeniedMessage 
 *   role="Admin"
 *   resource="admin panel"
 *   showBackButton={true}
 *   backUrl="/dashboard"
 * />
 * ```
 */
export function AccessDeniedMessage({
  permission,
  role,
  resource = "this content",
  className,
  showBackButton = true,
  backUrl = "/dashboard",
  backText = "Back to Dashboard",
  variant = "default"
}: AccessDeniedMessageProps) {
  const variants = {
    default: "min-h-[400px] p-8",
    compact: "p-6",
    card: "p-8 shadow-lg"
  };

  return (
    <motion.div
      className={cn(
        "flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700",
        variants[variant],
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center max-w-md">
        {/* Icon */}
        <motion.div
          className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Access Denied
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-gray-600 dark:text-gray-400 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          You don&apos;t have permission to access {resource}.
        </motion.p>

        {/* Requirements */}
        {(permission || role) && (
          <motion.div
            className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Required Access:
                </p>
                {permission && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Permission:
                    </p>
                    <code className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded font-mono">
                      {permission}
                    </code>
                  </div>
                )}
                {role && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Role:
                    </p>
                    <code className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded font-mono">
                      {role}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        {showBackButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {backText}
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * InlineAccessDenied Component
 * 
 * Compact inline version of access denied message.
 * Useful for showing within forms or smaller sections.
 * 
 * @example
 * ```tsx
 * <InlineAccessDenied 
 *   message="You need admin privileges to perform this action"
 * />
 * ```
 */
export function InlineAccessDenied({
  message = "Access denied",
  className
}: {
  message?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg",
        className
      )}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      role="alert"
    >
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
        {message}
      </p>
    </motion.div>
  );
}

/**
 * FeatureLockedMessage Component
 * 
 * Message shown when a feature is locked behind a permission or role.
 * Includes upgrade/contact information.
 * 
 * @example
 * ```tsx
 * <FeatureLockedMessage 
 *   feature="Advanced Analytics"
 *   requiredRole="Premium"
 *   upgradeUrl="/upgrade"
 * />
 * ```
 */
export function FeatureLockedMessage({
  feature,
  requiredRole,
  upgradeUrl,
  contactUrl,
  className
}: {
  feature: string;
  requiredRole?: string;
  upgradeUrl?: string;
  contactUrl?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 text-center",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
      >
        <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      </motion.div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {feature} is Locked
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This feature requires {requiredRole || "additional permissions"} to access.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {upgradeUrl && (
          <Link
            href={upgradeUrl}
            className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors font-medium"
          >
            Upgrade Now
          </Link>
        )}
        {contactUrl && (
          <Link
            href={contactUrl}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors font-medium"
          >
            Contact Us
          </Link>
        )}
      </div>
    </motion.div>
  );
}
