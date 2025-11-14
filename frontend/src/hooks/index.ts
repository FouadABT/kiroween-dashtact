/**
 * Hooks Index
 * 
 * Central export point for all custom React hooks.
 * Import hooks from this file for cleaner imports.
 * 
 * @example
 * ```tsx
 * import { useAuth, usePermission, useRequireAuth } from '@/hooks';
 * ```
 */

// Authentication hooks
export { useAuth } from '@/contexts/AuthContext';
export { usePermission } from './usePermission';
export { useRequireAuth } from './useRequireAuth';
export { useRequirePermission } from './useRequirePermission';
export { useRole } from './useRole';

// Theme hooks
export { useTheme } from './useTheme';
export { useTypography } from './useTypography';

// Metadata hooks
export { useMetadata } from './useMetadata';

// Utility hooks
export { useDebounceValue, useDebounceCallback } from './useDebounce';
export { useScreenReaderAnnouncement } from './useScreenReaderAnnouncement';
export { toast } from './use-toast';
