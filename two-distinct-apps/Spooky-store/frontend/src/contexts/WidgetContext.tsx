"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import {
  DashboardLayout,
  WidgetInstance,
  CreateWidgetInstanceDto,
  UpdateWidgetInstanceDto,
  ReorderWidgetInstancesDto,
} from "@/types/dashboard-customization";
import { DashboardLayoutsApi, WidgetInstancesApi } from "@/lib/api";

// Widget configuration type (generic key-value pairs)
type WidgetConfig = Record<string, any>;

// Cache configuration
const LAYOUT_CACHE_TTL = 60 * 1000; // 1 minute
const WIDGET_REGISTRY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache entry type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Simple in-memory cache
class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

/**
 * Widget Context Type
 * Defines the shape of the widget context for dashboard customization
 */
interface WidgetContextType {
  // State
  layouts: DashboardLayout[];
  currentLayout: DashboardLayout | null;
  isLoading: boolean;
  isEditMode: boolean;
  error: string | null;

  // Layout methods
  fetchLayouts: (pageId?: string) => Promise<void>;
  updateLayout: (id: string, data: Partial<DashboardLayout>) => Promise<void>;
  setCurrentLayout: (layout: DashboardLayout | null) => void;

  // Widget instance methods
  addWidget: (
    layoutId: string,
    widgetKey: string,
    config?: WidgetConfig
  ) => Promise<void>;
  removeWidget: (layoutId: string, widgetId: string) => Promise<void>;
  updateWidget: (
    layoutId: string,
    widgetId: string,
    data: UpdateWidgetInstanceDto
  ) => Promise<void>;
  reorderWidgets: (
    layoutId: string,
    updates: ReorderWidgetInstancesDto["updates"]
  ) => Promise<void>;

  // Edit mode
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;

  // Utility methods
  refreshCurrentLayout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Widget Context
 */
const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

/**
 * Widget Provider Props
 */
interface WidgetProviderProps {
  children: ReactNode;
}

/**
 * Widget Provider Component
 * Manages widget layout state and provides methods for dashboard customization
 */
export function WidgetProvider({ children }: WidgetProviderProps) {
  // State
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayoutState] =
    useState<DashboardLayout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache instances (using refs to persist across renders)
  const layoutCache = useRef(new SimpleCache<DashboardLayout>());
  const layoutsCache = useRef(new SimpleCache<DashboardLayout[]>());

  /**
   * Get user-friendly error message
   */
  const getUserFriendlyError = (err: unknown, defaultMessage: string): string => {
    if (err instanceof Error) {
      const message = err.message.toLowerCase();
      
      // Network errors
      if (message.includes('network') || message.includes('fetch failed')) {
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      // Permission errors
      if (message.includes('permission') || message.includes('unauthorized') || message.includes('403')) {
        return 'You don\'t have permission to perform this action.';
      }
      
      // Not found errors
      if (message.includes('not found') || message.includes('404')) {
        return 'The requested content could not be found.';
      }
      
      // Timeout errors
      if (message.includes('timeout')) {
        return 'The request took too long. Please try again.';
      }
      
      // Validation errors
      if (message.includes('validation') || message.includes('invalid')) {
        return err.message; // Show validation message as-is
      }
      
      // Return original message if it's user-friendly
      if (err.message.length < 100) {
        return err.message;
      }
    }
    
    return defaultMessage;
  };

  /**
   * Fetch layouts with optional filtering by pageId
   */
  const fetchLayouts = useCallback(async (pageId?: string) => {
    setError(null);

    try {
      if (pageId) {
        // Check cache first
        const cacheKey = `layout-${pageId}`;
        const cachedLayout = layoutCache.current.get(cacheKey);
        
        if (cachedLayout) {
          setLayouts([cachedLayout]);
          setCurrentLayoutState(cachedLayout);
          return;
        }

        setIsLoading(true);

        // Fetch layout for specific page
        const layout = await DashboardLayoutsApi.getForPage(pageId);
        
        // Cache the result
        layoutCache.current.set(cacheKey, layout, LAYOUT_CACHE_TTL);
        
        setLayouts([layout]);
        setCurrentLayoutState(layout);
      } else {
        // Check cache first
        const cacheKey = 'layouts-all';
        const cachedLayouts = layoutsCache.current.get(cacheKey);
        
        if (cachedLayouts) {
          setLayouts(cachedLayouts);
          
          // Set first layout as current if none selected
          if (cachedLayouts.length > 0 && !currentLayout) {
            setCurrentLayoutState(cachedLayouts[0]);
          }
          return;
        }

        setIsLoading(true);

        // Fetch all layouts for current user
        const response = await DashboardLayoutsApi.getAll();
        
        // Cache the result
        layoutsCache.current.set(cacheKey, response.data, LAYOUT_CACHE_TTL);
        
        setLayouts(response.data);

        // Set first layout as current if none selected
        if (response.data.length > 0 && !currentLayout) {
          setCurrentLayoutState(response.data[0]);
        }
      }
    } catch (err) {
      const errorMessage = getUserFriendlyError(err, "Failed to load dashboard layouts");
      setError(errorMessage);
      console.error("Failed to fetch layouts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLayout]);

  /**
   * Update layout with optimistic updates
   */
  const updateLayout = useCallback(
    async (id: string, data: Partial<DashboardLayout>) => {
      setError(null);

      // Optimistic update
      const previousLayouts = [...layouts];
      const previousCurrentLayout = currentLayout;

      const updatedLayouts = layouts.map((layout) =>
        layout.id === id ? { ...layout, ...data } : layout
      );
      setLayouts(updatedLayouts);

      if (currentLayout?.id === id) {
        setCurrentLayoutState({ ...currentLayout, ...data });
      }

      try {
        // Make API call
        const updatedLayout = await DashboardLayoutsApi.update(id, data);

        // Invalidate cache
        layoutCache.current.invalidate(`layout-${updatedLayout.pageId}`);
        layoutsCache.current.invalidateAll();

        // Update with server response
        setLayouts((prev) =>
          prev.map((layout) =>
            layout.id === id ? updatedLayout : layout
          )
        );

        if (currentLayout?.id === id) {
          setCurrentLayoutState(updatedLayout);
        }
      } catch (err) {
        // Revert optimistic update on error
        setLayouts(previousLayouts);
        setCurrentLayoutState(previousCurrentLayout);

        const errorMessage =
          err instanceof Error ? err.message : "Failed to update layout";
        setError(errorMessage);
        console.error("Failed to update layout:", err);
        throw err;
      }
    },
    [layouts, currentLayout]
  );

  /**
   * Set current layout
   */
  const setCurrentLayout = useCallback((layout: DashboardLayout | null) => {
    setCurrentLayoutState(layout);
  }, []);

  /**
   * Add widget to layout with optimistic updates
   */
  const addWidget = useCallback(
    async (
      layoutId: string,
      widgetKey: string,
      config: WidgetConfig = {}
    ) => {
      setError(null);

      // Calculate next position
      const layout = layouts.find((l) => l.id === layoutId);
      const nextPosition = layout?.widgetInstances
        ? Math.max(...layout.widgetInstances.map((w) => w.position), -1) + 1
        : 0;

      // Create optimistic widget instance
      const optimisticWidget: WidgetInstance = {
        id: `temp-${Date.now()}`,
        layoutId,
        widgetKey,
        position: nextPosition,
        gridSpan: 6, // Default span
        gridRow: null,
        config,
        isVisible: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      const previousLayouts = [...layouts];
      const previousCurrentLayout = currentLayout;

      const updatedLayouts = layouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              widgetInstances: [
                ...(l.widgetInstances || []),
                optimisticWidget,
              ],
            }
          : l
      );
      setLayouts(updatedLayouts);

      if (currentLayout?.id === layoutId) {
        setCurrentLayoutState({
          ...currentLayout,
          widgetInstances: [
            ...(currentLayout.widgetInstances || []),
            optimisticWidget,
          ],
        });
      }

      try {
        // Make API call
        const newWidget = await WidgetInstancesApi.add(layoutId, {
          widgetKey,
          position: nextPosition,
          config,
        });

        // Invalidate cache
        const layout = layouts.find((l) => l.id === layoutId);
        if (layout) {
          layoutCache.current.invalidate(`layout-${layout.pageId}`);
        }
        layoutsCache.current.invalidateAll();

        // Update with server response
        setLayouts((prev) =>
          prev.map((l) =>
            l.id === layoutId
              ? {
                  ...l,
                  widgetInstances: [
                    ...(l.widgetInstances || []).filter(
                      (w) => w.id !== optimisticWidget.id
                    ),
                    newWidget,
                  ],
                }
              : l
          )
        );

        if (currentLayout?.id === layoutId) {
          setCurrentLayoutState((prev) =>
            prev
              ? {
                  ...prev,
                  widgetInstances: [
                    ...(prev.widgetInstances || []).filter(
                      (w) => w.id !== optimisticWidget.id
                    ),
                    newWidget,
                  ],
                }
              : null
          );
        }
      } catch (err) {
        // Revert optimistic update on error
        setLayouts(previousLayouts);
        setCurrentLayoutState(previousCurrentLayout);

        const errorMessage =
          err instanceof Error ? err.message : "Failed to add widget";
        setError(errorMessage);
        console.error("Failed to add widget:", err);
        throw err;
      }
    },
    [layouts, currentLayout]
  );

  /**
   * Remove widget from layout with optimistic updates
   */
  const removeWidget = useCallback(
    async (layoutId: string, widgetId: string) => {
      setError(null);

      // Optimistic update
      const previousLayouts = [...layouts];
      const previousCurrentLayout = currentLayout;

      const updatedLayouts = layouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              widgetInstances: (l.widgetInstances || []).filter(
                (w) => w.id !== widgetId
              ),
            }
          : l
      );
      setLayouts(updatedLayouts);

      if (currentLayout?.id === layoutId) {
        setCurrentLayoutState({
          ...currentLayout,
          widgetInstances: (currentLayout.widgetInstances || []).filter(
            (w) => w.id !== widgetId
          ),
        });
      }

      try {
        // Make API call
        await WidgetInstancesApi.remove(layoutId, widgetId);

        // Invalidate cache
        const layout = layouts.find((l) => l.id === layoutId);
        if (layout) {
          layoutCache.current.invalidate(`layout-${layout.pageId}`);
        }
        layoutsCache.current.invalidateAll();
      } catch (err) {
        // Revert optimistic update on error
        setLayouts(previousLayouts);
        setCurrentLayoutState(previousCurrentLayout);

        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove widget";
        setError(errorMessage);
        console.error("Failed to remove widget:", err);
        throw err;
      }
    },
    [layouts, currentLayout]
  );

  /**
   * Update widget instance with optimistic updates
   */
  const updateWidget = useCallback(
    async (
      layoutId: string,
      widgetId: string,
      data: UpdateWidgetInstanceDto
    ) => {
      setError(null);

      // Optimistic update
      const previousLayouts = [...layouts];
      const previousCurrentLayout = currentLayout;

      const updatedLayouts = layouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              widgetInstances: (l.widgetInstances || []).map((w) =>
                w.id === widgetId ? { ...w, ...data } : w
              ),
            }
          : l
      );
      setLayouts(updatedLayouts);

      if (currentLayout?.id === layoutId) {
        setCurrentLayoutState({
          ...currentLayout,
          widgetInstances: (currentLayout.widgetInstances || []).map((w) =>
            w.id === widgetId ? { ...w, ...data } : w
          ),
        });
      }

      try {
        // Make API call
        const updatedWidget = await WidgetInstancesApi.update(
          layoutId,
          widgetId,
          data
        );

        // Invalidate cache
        const layout = layouts.find((l) => l.id === layoutId);
        if (layout) {
          layoutCache.current.invalidate(`layout-${layout.pageId}`);
        }
        layoutsCache.current.invalidateAll();

        // Update with server response
        setLayouts((prev) =>
          prev.map((l) =>
            l.id === layoutId
              ? {
                  ...l,
                  widgetInstances: (l.widgetInstances || []).map((w) =>
                    w.id === widgetId ? updatedWidget : w
                  ),
                }
              : l
          )
        );

        if (currentLayout?.id === layoutId) {
          setCurrentLayoutState((prev) =>
            prev
              ? {
                  ...prev,
                  widgetInstances: (prev.widgetInstances || []).map((w) =>
                    w.id === widgetId ? updatedWidget : w
                  ),
                }
              : null
          );
        }
      } catch (err) {
        // Revert optimistic update on error
        setLayouts(previousLayouts);
        setCurrentLayoutState(previousCurrentLayout);

        const errorMessage =
          err instanceof Error ? err.message : "Failed to update widget";
        setError(errorMessage);
        console.error("Failed to update widget:", err);
        throw err;
      }
    },
    [layouts, currentLayout]
  );

  /**
   * Reorder widgets in layout with optimistic updates
   */
  const reorderWidgets = useCallback(
    async (
      layoutId: string,
      updates: ReorderWidgetInstancesDto["updates"]
    ) => {
      setError(null);

      // Optimistic update
      const previousLayouts = [...layouts];
      const previousCurrentLayout = currentLayout;

      const updatedLayouts = layouts.map((l) => {
        if (l.id !== layoutId) return l;

        const widgetMap = new Map(
          (l.widgetInstances || []).map((w) => [w.id, w])
        );

        updates.forEach((update) => {
          const widget = widgetMap.get(update.id);
          if (widget) {
            widgetMap.set(update.id, {
              ...widget,
              position: update.position,
              gridRow: update.gridRow ?? widget.gridRow,
            });
          }
        });

        return {
          ...l,
          widgetInstances: Array.from(widgetMap.values()).sort(
            (a, b) => a.position - b.position
          ),
        };
      });

      setLayouts(updatedLayouts);

      if (currentLayout?.id === layoutId) {
        const layout = updatedLayouts.find((l) => l.id === layoutId);
        if (layout) {
          setCurrentLayoutState(layout);
        }
      }

      try {
        // Make API call
        await WidgetInstancesApi.reorder(layoutId, { updates });

        // Invalidate cache
        const layout = layouts.find((l) => l.id === layoutId);
        if (layout) {
          layoutCache.current.invalidate(`layout-${layout.pageId}`);
        }
        layoutsCache.current.invalidateAll();
      } catch (err) {
        // Revert optimistic update on error
        setLayouts(previousLayouts);
        setCurrentLayoutState(previousCurrentLayout);

        const errorMessage =
          err instanceof Error ? err.message : "Failed to reorder widgets";
        setError(errorMessage);
        console.error("Failed to reorder widgets:", err);
        throw err;
      }
    },
    [layouts, currentLayout]
  );

  /**
   * Toggle edit mode
   */
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  /**
   * Set edit mode
   */
  const setEditMode = useCallback((enabled: boolean) => {
    setIsEditMode(enabled);
  }, []);

  /**
   * Refresh current layout from server
   */
  const refreshCurrentLayout = useCallback(async () => {
    if (!currentLayout) return;

    setIsLoading(true);
    setError(null);

    try {
      const layout = await DashboardLayoutsApi.getById(currentLayout.id);
      setCurrentLayoutState(layout);

      // Update in layouts array
      setLayouts((prev) =>
        prev.map((l) => (l.id === layout.id ? layout : l))
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh layout";
      setError(errorMessage);
      console.error("Failed to refresh layout:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLayout]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value: WidgetContextType = {
    layouts,
    currentLayout,
    isLoading,
    isEditMode,
    error,
    fetchLayouts,
    updateLayout,
    setCurrentLayout,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    toggleEditMode,
    setEditMode,
    refreshCurrentLayout,
    clearError,
  };

  return (
    <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>
  );
}

/**
 * useWidgets Hook
 * Custom hook to access widget context
 * 
 * @throws Error if used outside of WidgetProvider
 * @returns Widget context value
 */
export function useWidgets(): WidgetContextType {
  const context = useContext(WidgetContext);
  
  if (context === undefined) {
    throw new Error("useWidgets must be used within a WidgetProvider");
  }
  
  return context;
}
