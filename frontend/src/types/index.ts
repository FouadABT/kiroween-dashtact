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
export * from './auth';

// Permission types
export * from './permission';

// Settings and theming types
export * from './settings';
export * from './theme-context';

// Upload types
export * from './upload';

// Metadata types
export * from './metadata';

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
  // Authentication types
  TokenPair,
  JwtPayload,
  TokenRefreshResponse,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  EmailVerification,
  ChangePasswordData,
  AuthError,
  AuthState,
  PermissionCheckOptions,
  RoleCheckOptions,
  SessionInfo,
  TwoFactorSetup,
  TwoFactorVerification,
  OAuthProvider,
  OAuthCallback,
  AuditLogEntry,
  PasswordStrength,
  AuthContextValue,
  AuthGuardProps,
  PermissionGuardProps,
  RoleGuardProps,
  LoginFormValues,
  RegisterFormValues,
  PasswordResetRequestFormValues,
  PasswordResetConfirmFormValues,
  ChangePasswordFormValues,
} from './auth';

export type {
  // Permissions
  Permission,
  RolePermission,
  CreatePermissionData,
  UpdatePermissionData,
  RolePermissionAssignment,
  PermissionCheckResponse,
  PermissionsListResponse,
  PermissionQueryParams,
} from './permission';

export type {
  // Form states
  FormState,
} from './dashboard';

export type {
  // Settings types
  ColorPalette,
  TypographyConfig,
  ThemeMode,
  SettingsScope,
  Settings,
  CreateSettingsDto,
  UpdateSettingsDto,
} from './settings';

export type {
  // Theme context types
  ThemeContextValue,
  ThemeProviderProps,
} from './theme-context';

export type {
  // Upload types
  UploadFileData,
  UploadResponse,
  UploadConfig,
  UploadError,
  UploadProgress,
} from './upload';

export type {
  // Metadata types
  OpenGraphImage,
  OpenGraphMetadata,
  TwitterMetadata,
  RobotsMetadata,
  BreadcrumbConfig,
  PageMetadata,
  RouteMetadata,
  MetadataContextValue,
} from './metadata';

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