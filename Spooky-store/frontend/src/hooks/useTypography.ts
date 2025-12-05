/**
 * useTypography Hook
 * Provides access to typography configuration and update methods
 */

import { useTheme } from '@/contexts/ThemeContext';
import { TypographyConfig } from '@/types/settings';

/**
 * Typography hook return type
 */
export interface UseTypographyReturn {
  /** Current typography configuration */
  typography: TypographyConfig | null;
  
  /** Update typography configuration */
  updateTypography: (typography: Partial<TypographyConfig>) => Promise<void>;
  
  /** Loading state */
  isLoading: boolean;
}

/**
 * useTypography hook
 * Access typography values and update function from theme context
 * 
 * @throws Error if used outside ThemeProvider
 * @returns Typography configuration and update method
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { typography, updateTypography, isLoading } = useTypography();
 *   
 *   const handleFontChange = async () => {
 *     await updateTypography({
 *       fontFamily: {
 *         sans: ['Inter', 'system-ui', 'sans-serif']
 *       }
 *     });
 *   };
 *   
 *   return (
 *     <div style={{ fontFamily: typography?.fontFamily.sans.join(', ') }}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useTypography(): UseTypographyReturn {
  const { settings, updateTypography, isLoading } = useTheme();
  
  return {
    typography: settings?.typography ?? null,
    updateTypography,
    isLoading,
  };
}
