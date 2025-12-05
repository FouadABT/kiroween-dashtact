import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { AccountLayout } from '@/components/customer-account/AccountLayout';
import { ProfilePageClient } from './ProfilePageClient';
import { isFeatureEnabled } from '@/config/features.config';

export const metadata: Metadata = {
  title: 'Edit Profile | Storefront',
  description: 'Update your personal information and account details',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  // Check if customer account feature is enabled
  if (!isFeatureEnabled('customerAccount')) {
    notFound();
  }
  const breadcrumbs = [
    { label: 'Account', href: '/account' },
    { label: 'Profile', href: '/account/profile' },
  ];

  return (
    <AccountLayout>
      <PageHeader
        title="Edit Profile"
        description="Update your personal information and account details"
        breadcrumbProps={{
          customItems: breadcrumbs,
        }}
      />
      <ProfilePageClient />
    </AccountLayout>
  );
}
