'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface TrackingInfoProps {
  trackingNumber: string;
  status: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

export function TrackingInfo({
  trackingNumber,
  status,
  shippedAt,
  deliveredAt,
}: TrackingInfoProps) {
  // This is a placeholder - in production, you'd integrate with actual shipping carriers
  const getTrackingUrl = (trackingNumber: string) => {
    // Example: USPS tracking URL
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Tracking Number</p>
          <p className="font-mono font-semibold">{trackingNumber}</p>
        </div>

        {shippedAt && (
          <div>
            <p className="text-sm text-muted-foreground">Shipped Date</p>
            <p className="font-medium">{format(new Date(shippedAt), 'PPP')}</p>
          </div>
        )}

        {deliveredAt && (
          <div>
            <p className="text-sm text-muted-foreground">Delivered Date</p>
            <p className="font-medium">{format(new Date(deliveredAt), 'PPP')}</p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(getTrackingUrl(trackingNumber), '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Track Package
        </Button>

        <p className="text-xs text-muted-foreground">
          Click the button above to track your package with the shipping carrier.
        </p>
      </CardContent>
    </Card>
  );
}
