import { Metadata } from 'next';
import { OrderHistoryClient } from './OrderHistoryClient';

export const metadata: Metadata = {
  title: 'Order History | Storefront',
  description: 'View your order history and track deliveries',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function OrderHistoryPage() {
  return <OrderHistoryClient />;
}
