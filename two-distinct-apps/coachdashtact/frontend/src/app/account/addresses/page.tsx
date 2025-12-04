import { Metadata } from 'next';
import { AccountLayout } from '@/components/customer-account/AccountLayout';
import { AddressesPageClient } from './AddressesPageClient';

export const metadata: Metadata = {
  title: 'Manage Addresses | Account',
  description: 'Manage your shipping and billing addresses',
};

export default function AddressesPage() {
  return (
    <AccountLayout>
      <AddressesPageClient />
    </AccountLayout>
  );
}
