"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WidgetDefinitionsApi } from "@/lib/api";
import { WidgetDefinition } from "@/types/dashboard-customization";
import { useAuth } from "@/contexts/AuthContext";
import { useWidgets } from "@/contexts/WidgetContext";
import { showSuccessToast, showErrorToast } from "@/lib/toast-helpers";
import { Search, Plus, Loader2, Package } from "lucide-react";
import * as LucideIcons from "lucide-react";

/**
 * Widget Library Modal Props
 */
export interface WidgetLibraryProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Layout ID to add widgets to */
  layoutId: string;
  /** Optional page identifier to filter available widgets */
  pageIdentifier?: string;
}

/**
 * Widget Library Modal Component
 * 
 * Displays available widgets organized by category with search functionality.
 * Filters widgets by user permissions automatically.
 * Allows users to add widgets to their dashboard layout.
 */
export function WidgetLibrary({ open, onClose, layoutId, pageIdentifier }: WidgetLibraryProps) {
  const [widgets, setWidgets] = useState<WidgetDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addingWidgetKey, setAddingWidgetKey] = useState<string | null>(null);
  
  const { getPermissions } = useAuth();
  const { addWidget } = useWidgets();

  // Fetch widgets on mount
  useEffect(() => {
    if (open) {
      fetchWidgets();
    }
  }, [open, pageIdentifier]); // Re-fetch when pageIdentifier changes

  /**
   * Fetch widgets from API
   */
  const fetchWidgets = async () => {
    setIsLoading(true);
    try {
      // Use page-specific endpoint if pageIdentifier is provided
      const response = pageIdentifier
        ? await WidgetDefinitionsApi.getByPageIdentifier(pageIdentifier, { isActive: true })
        : await WidgetDefinitionsApi.getAll({ isActive: true });
      
      // Extract widgets array from response
      let widgetsData: WidgetDefinition[] = [];
      
      if (Array.isArray(response)) {
        // Direct array response
        widgetsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // Standard API response with data property
        widgetsData = response.data;
      } else {
        console.warn("Unexpected API response format:", response);
        widgetsData = [];
      }
      
      // Ensure each widget has required properties with defaults
      const normalizedWidgets = widgetsData.map(widget => ({
        ...widget,
        tags: widget.tags || [],
        useCases: widget.useCases || [],
        dataRequirements: widget.dataRequirements || { permissions: [], endpoints: [], dependencies: [] }
      }));
      
      // Filter by user permissions (backend already filters, but double-check)
      const userPermissions = getPermissions();
      const filteredWidgets = filterWidgetsByPermissions(normalizedWidgets, userPermissions);
      
      setWidgets(filteredWidgets);
    } catch (error) {
      console.error("Failed to fetch widgets:", error);
      showErrorToast("Failed to load widgets", "Please try again later");
      setWidgets([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filter widgets by user permissions
   */
  const filterWidgetsByPermissions = (
    widgets: WidgetDefinition[],
    userPermissions: string[]
  ): WidgetDefinition[] => {
    const permissionsSet = new Set(userPermissions);

    // Super admin sees all
    if (permissionsSet.has("*:*")) {
      return widgets;
    }

    return widgets.filter((widget) => {
      const requirements = widget.dataRequirements;

      // No permission requirements - visible to all
      if (!requirements?.permissions || requirements.permissions.length === 0) {
        return true;
      }

      // Check if user has all required permissions
      return requirements.permissions.every((permission: string) =>
        permissionsSet.has(permission)
      );
    });
  };

  /**
   * Get unique categories from widgets
   */
  const categories = useMemo(() => {
    const categorySet = new Set(widgets.map((w) => w.category));
    return Array.from(categorySet).sort();
  }, [widgets]);

  /**
   * Filter widgets by search query and category
   * (Page-specific filtering is already done by the backend)
   */
  const filteredWidgets = useMemo(() => {
    let filtered = widgets;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((w) => w.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.description.toLowerCase().includes(query) ||
          (w.tags && w.tags.some((tag) => tag.toLowerCase().includes(query))) ||
          (w.useCases && w.useCases.some((useCase) => useCase.toLowerCase().includes(query)))
      );
    }

    return filtered;
  }, [widgets, searchQuery, selectedCategory]);

  /**
   * Group widgets by category
   */
  const widgetsByCategory = useMemo(() => {
    const grouped: Record<string, WidgetDefinition[]> = {};
    
    filteredWidgets.forEach((widget) => {
      if (!grouped[widget.category]) {
        grouped[widget.category] = [];
      }
      grouped[widget.category].push(widget);
    });

    return grouped;
  }, [filteredWidgets]);

  /**
   * Handle adding a widget to the layout
   */
  const handleAddWidget = async (widget: WidgetDefinition) => {
    console.log('➕ Adding widget:', {
      widgetKey: widget.key,
      widgetName: widget.name,
      layoutId,
      hasLayoutId: !!layoutId,
    });

    // Validate layoutId
    if (!layoutId) {
      console.error('❌ No layoutId provided to WidgetLibrary!');
      showErrorToast(
        "No layout selected",
        "Please ensure you're in edit mode and a layout is loaded"
      );
      return;
    }

    setAddingWidgetKey(widget.key);
    
    try {
      // Add widget with default configuration
      await addWidget(layoutId, widget.key, {});
      
      showSuccessToast(
        "Widget added",
        `${widget.name} has been added to your dashboard`
      );
      
      // Close modal after successful add
      onClose();
    } catch (error) {
      console.error("Failed to add widget:", error);
      showErrorToast(
        "Failed to add widget",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setAddingWidgetKey(null);
    }
  };

  /**
   * Get Lucide icon component by name
   */
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Package;
  };

  /**
   * Format category name for display
   */
  const formatCategoryName = (category: string): string => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Debug logging
  useEffect(() => {
    if (open) {
      console.log('📚 Widget Library opened:', {
        layoutId,
        hasLayoutId: !!layoutId,
        widgetsCount: widgets.length,
        isLoading,
      });
    }
  }, [open, layoutId, widgets.length, isLoading]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="!max-w-7xl !h-[85vh] flex flex-col p-0 w-[95vw] overflow-hidden" 
        aria-describedby="widget-library-description"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle id="widget-library-title" className="text-2xl font-bold">
            Widget Library
          </DialogTitle>
          <DialogDescription id="widget-library-description" className="text-base">
            Browse and add widgets to customize your dashboard. Use the search box to find specific widgets, or filter by category.
          </DialogDescription>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="px-6 py-4 space-y-4 bg-muted/30 shrink-0 border-b" role="search" aria-label="Widget search and filters">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search widgets by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 text-base"
              aria-label="Search widgets"
              type="search"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Category filters">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="default"
              onClick={() => setSelectedCategory(null)}
              aria-pressed={selectedCategory === null}
              aria-label="Show all categories"
              className="h-10"
            >
              All Categories
              {selectedCategory === null && (
                <Badge variant="secondary" className="ml-2">
                  {filteredWidgets.length}
                </Badge>
              )}
            </Button>
            {categories.map((category) => {
              const count = widgets.filter(w => w.category === category).length;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="default"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  aria-label={`Filter by ${formatCategoryName(category)}`}
                  className="h-10"
                >
                  {formatCategoryName(category)}
                  <Badge variant="secondary" className="ml-2">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Widget List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-6" aria-label="Available widgets">
            {isLoading ? (
              <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading widgets...</span>
              </div>
            ) : filteredWidgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center" role="status">
                <Package className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No widgets found
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedCategory
                    ? "Try adjusting your search or filters"
                    : "No widgets are available"}
                </p>
              </div>
            ) : (
              <div className="space-y-8 py-6 pb-8" role="list" aria-label="Widget categories">
              {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => (
                <div key={category} role="listitem">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-bold text-foreground" id={`category-${category}`}>
                      {formatCategoryName(category)}
                    </h3>
                    <Badge variant="outline" className="text-sm">
                      {categoryWidgets.length} {categoryWidgets.length === 1 ? 'widget' : 'widgets'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" role="list" aria-labelledby={`category-${category}`}>
                    {categoryWidgets.map((widget) => {
                      const Icon = getIcon(widget.icon);
                      const isAdding = addingWidgetKey === widget.key;

                      return (
                        <div
                          key={widget.key}
                          className="group border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-card"
                          role="listitem"
                        >
                          <div className="flex flex-col h-full">
                            {/* Header with Icon and Add Button */}
                            <div className="flex items-start gap-4 mb-3">
                              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors" aria-hidden="true">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-foreground mb-1 line-clamp-1" id={`widget-${widget.key}`}>
                                  {widget.name}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {formatCategoryName(widget.category)}
                                </Badge>
                              </div>
                              <Button
                                size="default"
                                onClick={() => handleAddWidget(widget)}
                                disabled={isAdding}
                                className="flex-shrink-0 h-10"
                                aria-label={`Add ${widget.name} widget to dashboard`}
                                aria-describedby={`widget-${widget.key}`}
                              >
                                {isAdding ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                                    Adding...
                                    <span className="sr-only">Adding widget...</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                                    Add
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                              {widget.description}
                            </p>
                            
                            {/* Tags */}
                            {widget.tags && widget.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {widget.tags.slice(0, 4).map((tag, idx) => (
                                  <Badge
                                    key={`${widget.key}-tag-${idx}`}
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {widget.tags.length > 4 && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    +{widget.tags.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Use Cases */}
                            {widget.useCases && widget.useCases.length > 0 && (
                              <div className="pt-3 border-t border-border">
                                <p className="text-xs font-semibold text-foreground mb-1.5">Common Use Cases:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {widget.useCases.slice(0, 2).map((useCase, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <span className="text-primary mt-0.5">•</span>
                                      <span className="line-clamp-1">{useCase}</span>
                                    </li>
                                  ))}
                                  {widget.useCases.length > 2 && (
                                    <li className="text-xs text-muted-foreground/70 italic">
                                      +{widget.useCases.length - 2} more use cases
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
