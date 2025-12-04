import { Metadata } from 'next';
import PaymentsPageClient from './PaymentsPageClient';

export const metadata: Metadata = {
  title: 'Payment Methods | Dashboard',
  description: 'Manage payment methods',
};

export default function PaymentsPage() {
  return <PaymentsPageClient />;
}
