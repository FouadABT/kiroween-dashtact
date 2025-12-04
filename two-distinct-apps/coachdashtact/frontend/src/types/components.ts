/**
 * Component Type Definitions
 * 
 * This file contains TypeScript interfaces and types for all
 * reusable components in the dashboard starter kit.
 */

import { LucideIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

// ============================================================================
// Authentication Component Types
// ============================================================================

/**
 * Props for the AuthLayout component
 */
export interface AuthLayoutProps {
  /** Content to be rendered inside the auth card */
  children: React.ReactNode;
  /** Title displayed in the auth card header */
  title: string;
  /** Description text displayed below the title */
  description: string;
  /** Text displayed before the navigation link */
  linkText: string;
  /** URL for the navigation link */
  linkHref: string;
  /** Label text for the navigation link */
  linkLabel: string;
}

/**
 * Props for the LoginForm component
 */
export interface LoginFormProps {
  /** Optional callback function called on successful login */
  onSuccess?: () => void;
  /** Optional callback function called on login error */
  onError?: (error: string) => void;
  /** Optional redirect URL after successful login */
  redirectTo?: string;
}

/**
 * Props for the SignupForm component
 */
export interface SignupFormProps {
  /** Optional callback function called on successful signup */
  onSuccess?: () => void;
  /** Optional callback function called on signup error */
  onError?: (error: string) => void;
  /** Optional redirect URL after successful signup */
  redirectTo?: string;
}

/**
 * Props for the RouteGuard component
 */
export interface RouteGuardProps {
  /** Content to be rendered if authentication check passes */
  children: React.ReactNode;
  /** Whether authentication is required to access the route */
  requireAuth?: boolean;
  /** Optional custom redirect URL */
  redirectTo?: string;
}

// ============================================================================
// Dashboard Component Types
// ============================================================================

/**
 * Navigation item interface for sidebar and navigation
 */
export interface NavigationItem {
  /** Display title of the navigation item */
  title: string;
  /** URL path for the navigation item */
  href: string;
  /** Icon component for the navigation item */
  icon: LucideIcon;
  /** Optional badge text or count */
  badge?: string;
}

/**
 * Props for the DashboardLayout component
 */
export interface DashboardLayoutProps {
  /** Content to be rendered in the main dashboard area */
  children: React.ReactNode;
  /** Optional custom navigation items */
  navigationItems?: NavigationItem[];
  /** Optional callback when layout state changes */
  onLayoutChange?: (sidebarCollapsed: boolean) => void;
}

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  /** Optional custom navigation items to override defaults */
  navigationItems?: NavigationItem[];
  /** Optional callback when sidebar state changes */
  onStateChange?: (collapsed: boolean) => void;
}

/**
 * Breadcrumb item interface for header navigation
 */
export interface BreadcrumbItem {
  /** Display title of the breadcrumb */
  title: string;
  /** Optional URL for the breadcrumb (if clickable) */
  href?: string;
}

/**
 * Props for the Header component
 */
export interface HeaderProps {
  /** Optional custom breadcrumbs to override defaults */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional callback when search is performed */
  onSearch?: (query: string) => void;
  /** Optional callback when notifications are clicked */
  onNotificationClick?: () => void;
}

/**
 * Generic data table item interface
 */
export interface DataTableItem {
  /** Unique identifier for the item */
  id: string;
  /** Additional properties can be added dynamically */
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Props for the DataTable component
 */
export interface DataTableProps<TData = DataTableItem> {
  /** Optional custom data to display in the table */
  data?: TData[];
  /** Optional custom columns configuration */
  columns?: ColumnDef<TData>[];
  /** Optional callback when row selection changes */
  onSelectionChange?: (selectedRows: TData[]) => void;
  /** Optional callback when data is filtered */
  onFilterChange?: (filteredData: TData[]) => void;
  /** Optional callback for custom actions */
  onAction?: (action: string, item: TData) => void;
}

// ============================================================================
// UI Component Types
// ============================================================================

/**
 * Props for the LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Color theme of the spinner */
  color?: "primary" | "white" | "gray";
}

/**
 * Props for the AnimatedButton component
 */
export interface AnimatedButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Text to display when loading */
  loadingText?: string;
  /** Animation type for the button */
  animationType?: "scale" | "bounce" | "pulse" | "none";
  /** Additional CSS classes */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Props for the PageTransition component
 */
export interface PageTransitionProps {
  /** Content to be animated during page transitions */
  children: React.ReactNode;
  /** Optional custom transition duration in seconds */
  duration?: number;
  /** Optional custom transition type */
  type?: "tween" | "spring";
}

// ============================================================================
// Development Component Types
// ============================================================================

/**
 * Accessibility test result interface
 */
export interface AccessibilityTestResult {
  /** Name of the component being tested */
  component: string;
  /** Whether the test passed */
  passed: boolean;
  /** List of accessibility issues found */
  issues: string[];
  /** List of recommendations for improvement */
  recommendations: string[];
}

/**
 * Props for the AccessibilityTester component
 */
export interface AccessibilityTesterProps {
  /** Optional callback when tests complete */
  onTestComplete?: (results: AccessibilityTestResult[]) => void;
  /** Optional custom test configurations */
  testConfig?: {
    includeRecommendations?: boolean;
    autoRun?: boolean;
  };
}

// ============================================================================
// Form and State Types
// ============================================================================

/**
 * Generic form state interface
 */
export interface FormState {
  /** Whether the form is currently submitting */
  isLoading: boolean;
  /** Form validation errors */
  errors: Record<string, string>;
  /** Success message */
  success?: string;
}

/**
 * Login form data interface
 */
export interface LoginFormData {
  /** User email address */
  email: string;
  /** User password */
  password: string;
  /** Whether to remember the user */
  rememberMe: boolean;
}

/**
 * Signup form data interface
 */
export interface SignupFormData {
  /** User's full name */
  name: string;
  /** User email address */
  email: string;
  /** User password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** Whether user accepts terms */
  acceptTerms: boolean;
}

// ============================================================================
// Theme and Styling Types
// ============================================================================

/**
 * Component size variants
 */
export type ComponentSize = "sm" | "md" | "lg";

/**
 * Component color variants
 */
export type ComponentColor = "primary" | "secondary" | "success" | "warning" | "error";

/**
 * Animation types for components
 */
export type AnimationType = "scale" | "bounce" | "pulse" | "slide" | "fade" | "none";

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract component props from a React component
 */
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * Common props that most components accept
 */
export interface CommonComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Test ID for testing purposes */
  testId?: string;
  /** Accessibility label */
  "aria-label"?: string;
}