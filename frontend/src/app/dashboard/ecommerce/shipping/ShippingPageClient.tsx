'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export default function ShippingPageClient() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/shipping-methods');
      if (!response.ok) throw new Error('Failed to fetch shipping methods');
      const data = await response.json();
      setMethods(data);
    } catch (error) {
      toast.error('Failed to load shipping methods');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMethods = methods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Methods</h1>
          <p className="text-muted-foreground mt-1">Manage shipping methods and rates</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Shipping Method
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <Input
            placeholder="Search shipping methods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Description</th>
                <th className="text-left py-3 px-4 font-semibold">Price</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMethods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No shipping methods found
                  </td>
                </tr>
              ) : (
                filteredMethods.map((method) => (
                  <tr key={method.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{method.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{method.description || '-'}</td>
                    <td className="py-3 px-4 font-medium">${method.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm ${method.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
