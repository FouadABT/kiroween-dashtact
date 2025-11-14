'use client';

import { InventoryAdjustment } from '@/types/ecommerce';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

interface AdjustmentHistoryProps {
  adjustments: InventoryAdjustment[];
}

export function AdjustmentHistory({ adjustments }: AdjustmentHistoryProps) {
  if (adjustments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No adjustment history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjustment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {adjustments.map((adjustment) => {
            const isIncrease = adjustment.quantityChange > 0;
            const Icon = isIncrease ? TrendingUp : TrendingDown;
            const colorClass = isIncrease ? 'text-green-500' : 'text-red-500';

            return (
              <div key={adjustment.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className={`p-2 rounded-lg ${isIncrease ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <Icon className={`h-5 w-5 ${colorClass}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${colorClass}`}>
                      {isIncrease ? '+' : ''}{adjustment.quantityChange}
                    </span>
                    <Badge variant="secondary">{adjustment.reason}</Badge>
                  </div>
                  {adjustment.notes && (
                    <p className="text-sm text-muted-foreground">{adjustment.notes}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(adjustment.createdAt), 'PPp')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
