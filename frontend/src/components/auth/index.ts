/**
 * Authentication Components
 * 
 * Components for handling user authentication flows including
 * login, signup, route protection, loading states, and error handling.
 */

// Layout and Forms
export { AuthLayout } from './AuthLayout';
export { LoginForm } from './LoginForm';
export { SignupForm } from './SignupForm';
export { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

// Guards
export { RouteGuard } from './RouteGuard';
export { AuthGuard } from './AuthGuard';
export { PermissionGuard } from './PermissionGuard';
export { RoleGuard } from './RoleGuard';

// Access Denied
export { AccessDenied, redirectToAccessDenied } from './AccessDenied';
export { 
  AccessDeniedMessage,
  InlineAccessDenied,
  FeatureLockedMessage 
} from './AccessDeniedMessage';

// Loading States
export { 
  AuthLoadingSpinner,
  AuthLoadingDots,
  AuthLoadingOverlay 
} from './AuthLoadingSpinner';
export { 
  PageLoadingState,
  PageLoadingSkeleton,
  InlineLoadingState,
  ButtonLoadingState 
} from './PageLoadingState';

// Error Messages
export { 
  AuthErrorMessage,
  AuthErrorBanner,
  PermissionDeniedMessage,
  FormErrorMessage,
  ErrorList 
} from './AuthErrorMessage';

// Re-export types for external use
export type { AuthLayoutProps } from './AuthLayout';
export type { LoginFormProps } from './LoginForm';
export type { SignupFormProps } from './SignupForm';
export type { RouteGuardProps } from './RouteGuard';
export type { AuthGuardProps } from './AuthGuard';
export type { PermissionGuardProps } from './PermissionGuard';
export type { RoleGuardProps } from './RoleGuard';
export type { AccessDeniedProps } from './AccessDenied';
export type { AccessDeniedMessageProps } from './AccessDeniedMessage';
export type { AuthLoadingSpinnerProps } from './AuthLoadingSpinner';
export type { PageLoadingStateProps } from './PageLoadingState';
export type { AuthErrorMessageProps, ErrorSeverity } from './AuthErrorMessage';