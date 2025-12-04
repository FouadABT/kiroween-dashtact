'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { BaseWidgetProps } from '../types/widget.types';

/**
 * ApiWidget - Fetches data from an API endpoint and renders it using a custom render function
 * 
 * Features:
 * - Automatic data fetching on mount
 * - Optional auto-refresh with configurable interval
 * - Loading and error state management
 * - Permission-based access control
 * - Manual refresh capability
 * 
 * @example
 * ```tsx
 * <ApiWidget
 *   title="User Stats"
 *   endpoint="/api/stats/users"
 *   refreshInterval={30000}
 *   permission="stats:read"
 *   render={(data) => (
 *     <div>
 *       <p>Total Users: {data.total}</p>
 *       <p>Active: {data.active}</p>
 *     </div>
 *   )}
 * />
 * ```
 */

export interface ApiWidgetProps<T = unknown> extends BaseWidgetProps {
  /** Widget title */
  title: string;
  /** API endpoint to fetch data from */
  endpoint: string;
  /** Auto-refresh interval in milliseconds (optional) */
  refreshInterval?: number;
  /** Custom render function that receives the fetched data */
  render: (data: T, refresh: () => void) => React.ReactNode;
  /** Optional actions to display in widget header */
  actions?: React.ReactNode;
  /** HTTP method (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Request body for POST/PUT requests */
  body?: unknown;
  /** Request headers */
  headers?: Record<string, string>;
  /** Transform response data before passing to render function */
  transform?: (data: unknown) => T;
  /** Callback when data is successfully fetched */
  onSuccess?: (data: T) => void;
  /** Callback when fetch fails */
  onError?: (error: Error) => void;
}

export function ApiWidget<T = unknown>({
  title,
  endpoint,
  refreshInterval,
  render,
  actions,
  permission,
  method = 'GET',
  body,
  headers = {},
  transform,
  onSuccess,
  onError,
  className,
}: ApiWidgetProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to store callback functions to avoid dependency issues
  const transformRef = useRef(transform);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Update refs when props change
  useEffect(() => {
    transformRef.current = transform;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [transform, onSuccess, onError]);

  // Serialize headers to avoid object reference issues
  const headersString = JSON.stringify(headers);
  const bodyString = body ? JSON.stringify(body) : null;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const parsedHeaders = JSON.parse(headersString);
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
      };

      if (bodyString && (method === 'POST' || method === 'PUT')) {
        options.body = bodyString;
      }

      const response = await fetch(endpoint, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const transformedData = transformRef.current 
        ? transformRef.current(responseData) 
        : responseData;

      setData(transformedData);
      onSuccessRef.current?.(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      onErrorRef.current?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, method, bodyString, headersString]);

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval, fetchData]);

  return (
    <WidgetContainer
      title={title}
      actions={actions}
      loading={isLoading}
      error={error || undefined}
      permission={permission}
      className={className}
    >
      {data && render(data, fetchData)}
    </WidgetContainer>
  );
}
