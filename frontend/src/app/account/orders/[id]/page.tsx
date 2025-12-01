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

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailsClient orderId={id} />;
}
