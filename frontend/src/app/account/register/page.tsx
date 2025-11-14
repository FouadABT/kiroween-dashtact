import { Metadata } from 'next';
import { RegisterPageClient } from './RegisterPageClient';

export const metadata: Metadata = {
  title: 'Create Account | Storefront',
  description: 'Create a new customer account to track orders and save your information',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return <RegisterPageClient />;
}
