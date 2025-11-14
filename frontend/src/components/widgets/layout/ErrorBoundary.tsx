import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
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
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component catches React errors in the widget tree and displays a fallback UI.
 * Logs errors to console and provides a retry button to reset the error state.
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
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          className={cn(
            'flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-8 text-center',
            this.props.className
          )}
          role="alert"
        >
          <div className="mb-4 rounded-full bg-destructive/20 p-3">
            <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>
          
          <h3 className="mb-2 text-lg font-semibold text-destructive">
            Something went wrong
          </h3>
          
          <p className="mb-4 max-w-md text-sm text-muted-foreground">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          
          <Button
            onClick={this.handleReset}
            variant="outline"
            size="sm"
          >
            Try again
          </Button>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 max-w-2xl text-left">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Error details (development only)
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
