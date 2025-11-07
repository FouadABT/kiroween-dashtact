/**
 * Type Definitions Index
 * 
 * Central export point for all TypeScript types and interfaces
 * used throughout the dashboard starter kit.
 */

// Dashboard and navigation types
export * from './dashboard';

// Component prop types and interfaces
export * from './components';

// User and authentication types
export * from './user';

// Re-export commonly used types for convenience
export type {
  // Navigation
  NavItem,
  BreadcrumbItem,
  
  // Dashboard
  DashboardStat,
  TableRow,
  ChartData,
} from './dashboard';

export type {
  // User and authentication
  User,
  UserRole,
  UserProfile,
  CreateUserData,
  UpdateUserData,
  LoginCredentials,
  RegisterUserData,
  AuthResponse,
  UsersListResponse,
  UserQueryParams,
} from './user';

export type {
  // Form states
  FormState,
} from './dashboard';

export type {
  // Authentication components
  AuthLayoutProps,
  LoginFormProps,
  SignupFormProps,
  RouteGuardProps,
  
  // Dashboard components
  DashboardLayoutProps,
  SidebarProps,
  HeaderProps,
  DataTableProps,
  
  // UI components
  LoadingSpinnerProps,
  AnimatedButtonProps,
  PageTransitionProps,
  
  // Development components
  AccessibilityTesterProps,
  AccessibilityTestResult,
  
  // Form data types
  LoginFormData,
  SignupFormData,
  
  // Utility types
  ComponentSize,
  ComponentColor,
  AnimationType,
  DeepPartial,
  ComponentProps,
  CommonComponentProps,
} from './components';