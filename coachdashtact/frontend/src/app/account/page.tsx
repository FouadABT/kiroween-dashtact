import { Metadata } from 'next';
import { AccountDashboardClient } from './AccountDashboardClient';

export const metadata: Metadata = {
  title: 'My Account | Storefront',
  description: 'Manage your account, orders, and profile',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  return <AccountDashboardClient />;
}
