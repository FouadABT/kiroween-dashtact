'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Loader2, Search, Package, TrendingUp } from 'lucide-react';

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  isActive: boolean;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
}

export default function ShippingPageClient() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    isActive: true,
  });

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/shipping-methods');
      if (!response.ok) throw new Error('Failed to fetch shipping methods');
      const data = await response.json();
      setMethods(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load shipping methods');
      console.error(error);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        description: method.description || '',
        price: typeof method.price === 'number' ? method.price.toString() : method.price.toString(),
        isActive: method.isActive,
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMethod(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingMethod
        ? `http://localhost:3001/shipping-methods/${editingMethod.id}`
        : 'http://localhost:3001/shipping-methods';
      
      const method = editingMethod ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          price: Number(formData.price),
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) throw new Error('Failed to save shipping method');

      toast.success(editingMethod ? 'Shipping method updated' : 'Shipping method created');
      handleCloseDialog();
      fetchShippingMethods();
    } catch (error) {
      toast.error('Failed to save shipping method');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await fetch(`http://localhost:3001/shipping-methods/${deletingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete shipping method');

      toast.success('Shipping method deleted');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchShippingMethods();
    } catch (error) {
      toast.error('Failed to delete shipping method');
      console.error(error);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const filteredMethods = methods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = methods.filter(m => m.isActive).length;
  const totalRevenue = methods.reduce((sum, m) => sum + Number(m.price), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Methods</h1>
          <p className="text-muted-foreground mt-1">Manage shipping methods, rates, and delivery options</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Shipping Method
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Methods</p>
              <p className="text-2xl font-bold">{methods.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Methods</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. Price</p>
              <p className="text-2xl font-bold">
                ${methods.length > 0 ? (totalRevenue / methods.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shipping methods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
                <th className="text-left py-3 px-4 font-semibold">Price</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-right py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMethods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No shipping methods found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog()}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Method
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredMethods.map((method) => (
                  <tr key={method.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 font-medium">{method.name}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground max-w-xs truncate">
                      {method.description || '-'}
                    </td>
                    <td className="py-4 px-4 font-semibold text-primary">
                      ${typeof method.price === 'number' ? method.price.toFixed(2) : Number(method.price).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={method.isActive ? 'default' : 'secondary'}>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(method)}
                          className="gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(method.id)}
                          className="gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
            </DialogTitle>
            <DialogDescription>
              {editingMethod
                ? 'Update the shipping method details below.'
                : 'Create a new shipping method for your store.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Standard Shipping"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Delivery within 5-7 business days"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Make this method available to customers
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingMethod ? 'Update' : 'Create'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipping Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shipping method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
