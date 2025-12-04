import { Metadata } from 'next';
import { AccountLayout } from '@/components/customer-account/AccountLayout';
import { PaymentMethodsPageClient } from './PaymentMethodsPageClient';

export const metadata: Metadata = {
  title: 'Payment Methods | Account',
  description: 'Manage your saved payment methods',
};

export default function PaymentMethodsPage() {
  return (
    <AccountLayout>
      <PaymentMethodsPageClient />
    </AccountLayout>
  );
}
