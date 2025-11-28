import { Metadata } from 'next';
import { AccountLayout } from '@/components/customer-account/AccountLayout';
import { SettingsPageClient } from './SettingsPageClient';

export const metadata: Metadata = {
  title: 'Account Settings | Account',
  description: 'Manage your account settings and preferences',
};

export default function SettingsPage() {
  return (
    <AccountLayout>
      <SettingsPageClient />
    </AccountLayout>
  );
}
