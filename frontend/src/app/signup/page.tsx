import { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';
import { RouteGuard } from '@/components/auth/RouteGuard';

export const metadata: Metadata = {
  title: 'Sign Up | Dashboard Kit',
  description: 'Create your dashboard account',
};

export default function SignupPage() {
  return (
    <RouteGuard requireAuth={false}>
      <AuthLayout
        title="Create an account"
        description="Get started with your new dashboard account"
        linkText="Already have an account?"
        linkHref="/login"
        linkLabel="Sign in"
      >
        <SignupForm />
      </AuthLayout>
    </RouteGuard>
  );
}