import { Metadata } from 'next';
import { LoginPageClient } from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Sign In | Storefront',
  description: 'Sign in to your customer account to track orders and manage your profile',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginPageClient />;
}
