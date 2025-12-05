/**
 * Debounce Utility
 * Delays function execution until after a specified wait time has elapsed
 * since the last time it was invoked
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay (default: 300ms)
 * @returns A debounced version of the function with cancel and flush methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
      lastArgs = null;
    }, wait);
  };

  // Cancel pending invocation
  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  // Immediately invoke pending function
  debounced.flush = () => {
    if (timeoutId !== null && lastArgs !== null) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}

/**
 * Creates a debounced function using useCallback pattern for React components
 * This is a helper that can be used with React hooks
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): DebouncedFunction<T> {
  // This is a simple wrapper - actual React hook implementation
  // should be done in a custom hook file
  return debounce(func, wait);
}
