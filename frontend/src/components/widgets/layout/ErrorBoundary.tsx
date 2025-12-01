'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;
  
  /**
   * Custom fallback UI to display on error
   */
  fallback?: ReactNode;
  
  /**
   * Callback function called when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Additional CSS classes for the error container
   */
  className?: string;
  
  /**
   * Maximum number of retry attempts before showing permanent error
   */
  maxRetries?: number;
  
  /**
   * Custom error message to display
   */
  errorMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * ErrorBoundary component catches React errors in the widget tree and displays a fallback UI.
 * Logs errors to console and provides a retry button to reset the error state.
 * Supports retry limits and user-friendly error messages.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyWidget />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyWidget />
 * </ErrorBoundary>
 * 
 * // With retry limit
 * <ErrorBoundary maxRetries={3}>
 *   <MyWidget />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console with component stack
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;
    
    // Check if max retries exceeded
    if (retryCount >= maxRetries) {
      console.warn('Max retry attempts exceeded');
      return;
    }
    
    // Set retrying state
    this.setState({ isRetrying: true });
    
    // Reset error state after a brief delay (allows UI to show loading state)
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1,
        isRetrying: false,
      });
    }, 300);
  };
  
  /**
   * Get user-friendly error message based on error type
   */
  getUserFriendlyMessage(error?: Error): string {
    if (!error) return 'An unexpected error occurred';
    
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'You don\'t have permission to access this content.';
    }
    
    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return 'The requested content could not be found.';
    }
    
    // Timeout errors
    if (message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.';
    }
    
    // Default to original message if it's user-friendly
    if (error.message.length < 100 && !error.message.includes('undefined')) {
      return error.message;
    }
    
    return 'Something went wrong while loading this content.';
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { maxRetries = 3, errorMessage } = this.props;
      const { retryCount, isRetrying, error } = this.state;
      const canRetry = retryCount < maxRetries;
      const userMessage = errorMessage || this.getUserFriendlyMessage(error);

      // Default error UI
      return (
        <div
          className={cn(
            'flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-8 text-center',
            this.props.className
          )}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="mb-4 rounded-full bg-destructive/20 p-3">
            <AlertCircle 
              className="h-8 w-8 text-destructive" 
              aria-hidden="true" 
            />
          </div>
          
          <h3 
            className="mb-2 text-lg font-semibold text-destructive"
            id="error-title"
          >
            Something went wrong
          </h3>
          
          <p 
            className="mb-4 max-w-md text-sm text-muted-foreground"
            id="error-message"
          >
            {userMessage}
          </p>
          
          {canRetry ? (
            <Button
              onClick={this.handleReset}
              variant="outline"
              size="sm"
              disabled={isRetrying}
              aria-label="Retry loading content"
              aria-describedby="error-message"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Try again
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Maximum retry attempts reached. Please refresh the page or contact support.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                aria-label="Refresh page"
              >
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Refresh Page
              </Button>
            </div>
          )}
          
          {retryCount > 0 && canRetry && (
            <p className="mt-2 text-xs text-muted-foreground">
              Retry attempt {retryCount} of {maxRetries}
            </p>
          )}
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 max-w-2xl text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Error details (development only)
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                <strong>Error:</strong> {error.message}
                {'\n\n'}
                <strong>Stack:</strong>
                {'\n'}
                {error.stack}
                {this.state.errorInfo && (
                  <>
                    {'\n\n'}
                    <strong>Component Stack:</strong>
                    {'\n'}
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

