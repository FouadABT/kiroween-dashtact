import { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RouteGuard } from '@/components/auth/RouteGuard';

export const metadata: Metadata = {
  title: 'Sign In | Dashboard Kit',
  description: 'Sign in to your dashboard account',
};

export default function LoginPage() {
  return (
    <RouteGuard requireAuth={false}>
      <AuthLayout
        title="Welcome back"
        description="Sign in to your account to continue"
        linkText="Don't have an account?"
        linkHref="/signup"
        linkLabel="Sign up"
      >
        <LoginForm />
      </AuthLayout>
    </RouteGuard>
  );
}