'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useEcommerceSettings } from '@/contexts/EcommerceSettingsContext';
import { featuresConfig } from '@/config/features.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EcommerceSettingsPage() {
  const router = useRouter();
  // toast is imported directly
  const { settings, isLoading, error, updateSettings } = useEcommerceSettings();
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    currency: '',
    currencySymbol: '',
    taxRate: 0,
    taxLabel: '',
    shippingEnabled: true,
    portalEnabled: true,
    allowGuestCheckout: false,
    trackInventory: true,
    lowStockThreshold: 10,
    autoGenerateOrderNumbers: true,
    orderNumberPrefix: '',
  });

  // Redirect if e-commerce is not enabled
  useEffect(() => {
    if (!featuresConfig.ecommerce.enabled) {
      router.push('/dashboard/settings');
    }
  }, [router]);

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName,
        storeDescription: settings.storeDescription || '',
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        taxRate: settings.taxRate,
        taxLabel: settings.taxLabel,
        shippingEnabled: settings.shippingEnabled,
        portalEnabled: settings.portalEnabled,
        allowGuestCheckout: settings.allowGuestCheckout,
        trackInventory: settings.trackInventory,
        lowStockThreshold: settings.lowStockThreshold,
        autoGenerateOrderNumbers: settings.autoGenerateOrderNumbers,
        orderNumberPrefix: settings.orderNumberPrefix,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings) return;

    try {
      setIsSaving(true);
      await updateSettings(settings.id, {
        ...formData,
        storeDescription: formData.storeDescription || null,
      });

      toast.success('E-commerce settings have been updated successfully.');
    } catch (err) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!featuresConfig.ecommerce.enabled) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="E-Commerce Settings"
          description="Configure your e-commerce store settings"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <PermissionGuard permission="settings:write">
      <div className="space-y-6">
        <PageHeader
          title="E-Commerce Settings"
          description="Configure your e-commerce store settings"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Information */}
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  placeholder="My Store"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={formData.storeDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, storeDescription: e.target.value })
                  }
                  placeholder="A brief description of your store"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Currency & Tax */}
          <Card>
            <CardHeader>
              <CardTitle>Currency & Tax</CardTitle>
              <CardDescription>
                Configure currency and tax settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    placeholder="USD"
                    maxLength={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground">ISO 4217 code</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={(e) =>
                      setFormData({ ...formData, currencySymbol: e.target.value })
                    }
                    placeholder="$"
                    maxLength={5}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRate: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxLabel">Tax Label</Label>
                  <Input
                    id="taxLabel"
                    value={formData.taxLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, taxLabel: e.target.value })
                    }
                    placeholder="Tax"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Portal */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Portal</CardTitle>
              <CardDescription>
                Configure customer-facing features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="portalEnabled">Enable Customer Portal</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to view orders via secure link
                  </p>
                </div>
                <Switch
                  id="portalEnabled"
                  checked={formData.portalEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, portalEnabled: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowGuestCheckout">Allow Guest Checkout</Label>
                  <p className="text-sm text-muted-foreground">
                    Let customers checkout without creating an account
                  </p>
                </div>
                <Switch
                  id="allowGuestCheckout"
                  checked={formData.allowGuestCheckout}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allowGuestCheckout: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="shippingEnabled">Enable Shipping</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable shipping options for orders
                  </p>
                </div>
                <Switch
                  id="shippingEnabled"
                  checked={formData.shippingEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, shippingEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Configure inventory tracking settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trackInventory">Track Inventory</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable inventory tracking for products
                  </p>
                </div>
                <Switch
                  id="trackInventory"
                  checked={formData.trackInventory}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, trackInventory: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: parseInt(e.target.value),
                    })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Alert when inventory falls below this number
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Configure order management settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoGenerateOrderNumbers">
                    Auto-Generate Order Numbers
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate sequential order numbers
                  </p>
                </div>
                <Switch
                  id="autoGenerateOrderNumbers"
                  checked={formData.autoGenerateOrderNumbers}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, autoGenerateOrderNumbers: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="orderNumberPrefix">Order Number Prefix</Label>
                <Input
                  id="orderNumberPrefix"
                  value={formData.orderNumberPrefix}
                  onChange={(e) =>
                    setFormData({ ...formData, orderNumberPrefix: e.target.value })
                  }
                  placeholder="ORD"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Prefix for auto-generated order numbers (e.g., ORD-001)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/settings')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </PermissionGuard>
  );
}
