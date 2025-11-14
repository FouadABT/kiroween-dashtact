import { Metadata } from 'next';
import { OrderDetailsClient } from './OrderDetailsClient';

export const metadata: Metadata = {
  title: 'Order Details | Storefront',
  description: 'View your order details and tracking information',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return <OrderDetailsClient orderId={params.id} />;
}
