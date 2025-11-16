'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  AlertCircle, 
  Info,
  X,
} from 'lucide-react';
import { MenuFormData, PageType, MenuItem } from '@/types/menu';
import { UserRole } from '@/types/user';
import { Permission } from '@/types/permission';
import { cn } from '@/lib/utils';

/**
 * Icon Picker Component
 * Reusable icon picker for menu items
 */
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  ShoppingBag,
  FileText,
  Settings,
  Newspaper,
  Home,
  Star,
  Zap,
  Shield,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  Target,
  Rocket,
  Sparkles,
  Menu,
  Layers,
  Grid,
  List,
} from 'lucide-react';

const MENU_ICONS = [
  { value: 'layout-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'bar-chart-3', label: 'Analytics', icon: BarChart3 },
  { value: 'shopping-cart', label: 'Shopping Cart', icon: ShoppingCart },
  { value: 'package', label: 'Package', icon: Package },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'shopping-bag', label: 'Shopping Bag', icon: ShoppingBag },
  { value: 'file-text', label: 'File Text', icon: FileText },
  { value: 'settings', label: 'Settings', icon: Settings },
  { value: 'newspaper', label: 'Newspaper', icon: Newspaper },
  { value: 'home', label: 'Home', icon: Home },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'zap', label: 'Zap', icon: Zap },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'trending-up', label: 'Trending Up', icon: TrendingUp },
  { value: 'clock', label: 'Clock', icon: Clock },
  { value: 'check-circle', label: 'Check Circle', icon: CheckCircle },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'rocket', label: 'Rocket', icon: Rocket },
  { value: 'sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'menu', label: 'Menu', icon: Menu },
  { value: 'layers', label: 'Layers', icon: Layers },
  { value: 'grid', label: 'Grid', icon: Grid },
  { value: 'list', label: 'List', icon: List },
];

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

function IconPicker({ value, onChange, error }: IconPickerProps) {
  const selectedIcon = MENU_ICONS.find((icon) => icon.value === value);
  const IconComponent = selectedIcon?.icon || LayoutDashboard;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          'p-2 border rounded-lg bg-card',
          error && 'border-destructive'
        )}>
          <IconComponent className="h-5 w-5" />
        </div>
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={cn('flex-1', error && 'border-destructive')}>
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {MENU_ICONS.map((icon) => {
              const Icon = icon.icon;
              return (
                <SelectItem key={icon.value} value={icon.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {icon.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

/**
 * Multi-Select Component
 * For selecting multiple permissions or roles
 */
interface MultiSelectProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

function MultiSelect({ label, options, selected, onChange, placeholder }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeOption = (value: string) => {
    onChange(selected.filter(v => v !== value));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {/* Selected items */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map(value => {
              const option = options.find(o => o.value === value);
              return (
                <Badge key={value} variant="secondary" className="gap-1">
                  {option?.label || value}
                  <button
                    type="button"
                    onClick={() => removeOption(value)}
                    className="ml-1 hover:bg-accent rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
        
        {/* Dropdown */}
        <Select
          value=""
          onValueChange={(value) => {
            if (value && !selected.includes(value)) {
              onChange([...selected, value]);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options
              .filter(option => !selected.includes(option.value))
              .map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            {options.filter(option => !selected.includes(option.value)).length === 0 && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                All options selected
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * MenuItemForm Props
 */
interface MenuItemFormProps {
  initialData?: MenuItem;
  availableMenus?: MenuItem[];
  availableRoles?: UserRole[];
  availablePermissions?: Permission[];
  onSubmit: (data: MenuFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Validation errors type
 */
interface ValidationErrors {
  key?: string;
  label?: string;
  icon?: string;
  route?: string;
  order?: string;
  pageType?: string;
  pageIdentifier?: string;
  componentPath?: string;
}

/**
 * MenuItemForm Component
 * Form for creating and editing menu items
 */
export function MenuItemForm({
  initialData,
  availableMenus = [],
  availableRoles = [],
  availablePermissions = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: MenuItemFormProps) {
  // Form state
  const [formData, setFormData] = useState<MenuFormData>({
    key: initialData?.key || '',
    label: initialData?.label || '',
    icon: initialData?.icon || '',
    route: initialData?.route || '',
    order: initialData?.order || 0,
    parentId: initialData?.parentId,
    pageType: initialData?.pageType || PageType.HARDCODED,
    pageIdentifier: initialData?.pageIdentifier,
    componentPath: initialData?.componentPath,
    isActive: initialData?.isActive ?? true,
    requiredPermissions: initialData?.requiredPermissions || [],
    requiredRoles: initialData?.requiredRoles || [],
    featureFlag: initialData?.featureFlag,
    description: initialData?.description,
    badge: initialData?.badge,
    availableWidgets: initialData?.availableWidgets || [],
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState<Array<{ key: string; name: string }>>([]);

  // Fetch available widgets on mount
  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const { WidgetDefinitionsApi } = await import('@/lib/api');
        const response = await WidgetDefinitionsApi.getAll({ isActive: true });
        
        let widgetsData: any[] = [];
        if (Array.isArray(response)) {
          widgetsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          widgetsData = response.data;
        }
        
        const widgetOptions = widgetsData.map(w => ({
          key: w.key,
          name: w.name,
        }));
        
        setAvailableWidgets(widgetOptions);
      } catch (error) {
        console.error('Failed to fetch widgets:', error);
      }
    };
    
    fetchWidgets();
  }, []);

  // Validate form
  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Required fields
    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.key)) {
      newErrors.key = 'Key must contain only lowercase letters, numbers, and hyphens';
    }

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (!formData.icon) {
      newErrors.icon = 'Icon is required';
    }

    if (!formData.route.trim()) {
      newErrors.route = 'Route is required';
    } else if (!formData.route.startsWith('/')) {
      newErrors.route = 'Route must start with /';
    }

    if (formData.order < 0) {
      newErrors.order = 'Order must be a positive number';
    }

    // Page type specific validation
    if (formData.pageType === PageType.WIDGET_BASED && !formData.pageIdentifier?.trim()) {
      newErrors.pageIdentifier = 'Page identifier is required for widget-based pages';
    }

    if (formData.pageType === PageType.HARDCODED && !formData.componentPath?.trim()) {
      newErrors.componentPath = 'Component path is required for hardcoded pages';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by parent component
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update form field
  const updateField = <K extends keyof MenuFormData>(
    field: K,
    value: MenuFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Feature flag options
  const featureFlagOptions = [
    { value: 'shippingEnabled', label: 'Shipping Enabled' },
    { value: 'portalEnabled', label: 'Portal Enabled' },
    { value: 'trackInventory', label: 'Track Inventory' },
    { value: 'codEnabled', label: 'COD Enabled' },
  ];

  // Role options
  const roleOptions = availableRoles.map(role => ({
    value: role.name,
    label: role.name,
  }));

  // Permission options
  const permissionOptions = availablePermissions.map(perm => ({
    value: perm.name,
    label: perm.name,
  }));

  // Parent menu options (exclude self and children)
  const parentMenuOptions = availableMenus
    .filter(menu => menu.id !== initialData?.id)
    .map(menu => ({
      value: menu.id,
      label: menu.label,
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Core menu item details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key */}
          <div className="space-y-2">
            <Label htmlFor="key">
              Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => updateField('key', e.target.value)}
              placeholder="e.g., main-dashboard, ecommerce-orders"
              className={cn(errors.key && 'border-destructive')}
              disabled={isSubmitting || isLoading}
            />
            {errors.key && (
              <p className="text-sm text-destructive">{errors.key}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Unique identifier (lowercase, hyphens only)
            </p>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="e.g., Dashboard, Orders"
              className={cn(errors.label && 'border-destructive')}
              disabled={isSubmitting || isLoading}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Display name shown in the sidebar
            </p>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>
              Icon <span className="text-destructive">*</span>
            </Label>
            <IconPicker
              value={formData.icon}
              onChange={(value) => updateField('icon', value)}
              error={errors.icon}
            />
            <p className="text-sm text-muted-foreground">
              Icon displayed next to the menu label
            </p>
          </div>

          {/* Route */}
          <div className="space-y-2">
            <Label htmlFor="route">
              Route <span className="text-destructive">*</span>
            </Label>
            <Input
              id="route"
              value={formData.route}
              onChange={(e) => updateField('route', e.target.value)}
              placeholder="/dashboard/example"
              className={cn(errors.route && 'border-destructive')}
              disabled={isSubmitting || isLoading}
            />
            {errors.route && (
              <p className="text-sm text-destructive">{errors.route}</p>
            )}
            <p className="text-sm text-muted-foreground">
              URL path for this menu item
            </p>
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="order">
              Order <span className="text-destructive">*</span>
            </Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => updateField('order', parseInt(e.target.value) || 0)}
              min="0"
              className={cn(errors.order && 'border-destructive')}
              disabled={isSubmitting || isLoading}
            />
            {errors.order && (
              <p className="text-sm text-destructive">{errors.order}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Display order (lower numbers appear first)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Optional description shown as tooltip"
              rows={2}
              disabled={isSubmitting || isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Optional tooltip text
            </p>
          </div>

          {/* Badge */}
          <div className="space-y-2">
            <Label htmlFor="badge">Badge</Label>
            <Input
              id="badge"
              value={formData.badge || ''}
              onChange={(e) => updateField('badge', e.target.value)}
              placeholder="e.g., New, Beta, 5"
              disabled={isSubmitting || isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Optional badge text or count
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-muted-foreground">
                Show this menu item to users
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
              disabled={isSubmitting || isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Page Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Page Configuration</CardTitle>
          <CardDescription>
            How this menu item renders its page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Page Type */}
          <div className="space-y-2">
            <Label htmlFor="pageType">
              Page Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.pageType}
              onValueChange={(value) => updateField('pageType', value as PageType)}
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger id="pageType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PageType.WIDGET_BASED}>
                  Widget Based - Customizable dashboard
                </SelectItem>
                <SelectItem value={PageType.HARDCODED}>
                  Hardcoded - Traditional component
                </SelectItem>
                <SelectItem value={PageType.CUSTOM}>
                  Custom - Hybrid approach
                </SelectItem>
                <SelectItem value={PageType.EXTERNAL}>
                  External - External link
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Determines how the page is rendered
            </p>
          </div>

          {/* Page Identifier (for WIDGET_BASED) */}
          {formData.pageType === PageType.WIDGET_BASED && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pageIdentifier">
                  Page Identifier <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pageIdentifier"
                  value={formData.pageIdentifier || ''}
                  onChange={(e) => updateField('pageIdentifier', e.target.value)}
                  placeholder="e.g., main-dashboard, analytics-dashboard"
                  className={cn(errors.pageIdentifier && 'border-destructive')}
                  disabled={isSubmitting || isLoading}
                />
                {errors.pageIdentifier && (
                  <p className="text-sm text-destructive">{errors.pageIdentifier}</p>
                )}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Links to a DashboardLayout for widget-based customization
                  </AlertDescription>
                </Alert>
              </div>

              {/* Available Widgets Selector */}
              <div className="space-y-2">
                <Label>Available Widgets</Label>
                <MultiSelect
                  label=""
                  options={availableWidgets.map(w => ({ value: w.key, label: w.name }))}
                  selected={formData.availableWidgets || []}
                  onChange={(selected) => updateField('availableWidgets', selected)}
                  placeholder="Select widgets (empty = all widgets available)"
                />
                <p className="text-sm text-muted-foreground">
                  Restrict which widgets can be added to this page. Leave empty to allow all widgets.
                </p>
              </div>
            </>
          )}

          {/* Component Path (for HARDCODED) */}
          {formData.pageType === PageType.HARDCODED && (
            <div className="space-y-2">
              <Label htmlFor="componentPath">
                Component Path <span className="text-destructive">*</span>
              </Label>
              <Input
                id="componentPath"
                value={formData.componentPath || ''}
                onChange={(e) => updateField('componentPath', e.target.value)}
                placeholder="e.g., /dashboard/ecommerce/orders"
                className={cn(errors.componentPath && 'border-destructive')}
                disabled={isSubmitting || isLoading}
              />
              {errors.componentPath && (
                <p className="text-sm text-destructive">{errors.componentPath}</p>
              )}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Path to the React component file
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>Hierarchy</CardTitle>
          <CardDescription>
            Parent-child menu relationships
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parent Menu */}
          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Menu</Label>
            <Select
              value={formData.parentId || 'none'}
              onValueChange={(value) => 
                updateField('parentId', value === 'none' ? undefined : value)
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger id="parentId">
                <SelectValue placeholder="No parent (top-level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (top-level)</SelectItem>
                {parentMenuOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Optional parent menu for nested items
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>
            Role and permission requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Required Roles */}
          <MultiSelect
            label="Required Roles"
            options={roleOptions}
            selected={formData.requiredRoles || []}
            onChange={(selected) => updateField('requiredRoles', selected)}
            placeholder="Select roles"
          />
          <p className="text-sm text-muted-foreground">
            Users must have at least one of these roles
          </p>

          <Separator />

          {/* Required Permissions */}
          <MultiSelect
            label="Required Permissions"
            options={permissionOptions}
            selected={formData.requiredPermissions || []}
            onChange={(selected) => updateField('requiredPermissions', selected)}
            placeholder="Select permissions"
          />
          <p className="text-sm text-muted-foreground">
            Users must have all of these permissions
          </p>

          <Separator />

          {/* Feature Flag */}
          <div className="space-y-2">
            <Label htmlFor="featureFlag">Feature Flag</Label>
            <Select
              value={formData.featureFlag || 'none'}
              onValueChange={(value) => 
                updateField('featureFlag', value === 'none' ? undefined : value)
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger id="featureFlag">
                <SelectValue placeholder="No feature flag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No feature flag</SelectItem>
                {featureFlagOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Optional feature flag to control visibility
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{initialData ? 'Update Menu' : 'Create Menu'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
