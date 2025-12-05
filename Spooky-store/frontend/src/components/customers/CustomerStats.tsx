'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerStatsProps {
  stats: {
    totalOrders: number;
    lifetimeValue: string;
    averageOrderValue: string;
    lastOrderDate?: string;
  };
}

export function CustomerStats({ stats }: CustomerStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lifetime Value</p>
              <p className="text-2xl font-bold">
                ${(parseFloat(stats.lifetimeValue) || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold">
                ${(parseFloat(stats.averageOrderValue) || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.lastOrderDate && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Order</p>
                <p className="text-lg font-bold">
                  {format(new Date(stats.lastOrderDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
