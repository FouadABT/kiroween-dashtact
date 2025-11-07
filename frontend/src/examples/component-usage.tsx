/**
 * Component Usage Examples
 * 
 * This file demonstrates how to use the exported components
 * and TypeScript interfaces from the dashboard starter kit.
 */

import React, { useState } from 'react';

// Import components from the main index and specific paths
import {
  // Authentication components
  AuthLayout,
  LoginForm,
  RouteGuard,
  
  // Dashboard components
  DashboardLayout,
  DataTable,
} from '@/components';

// Import UI components from specific paths
import {
  AnimatedButton,
  LoadingSpinner,
  PageTransition,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';

// Import development components
import { AccessibilityTester } from '@/components/dev';

// Import types
import type {
  AnimatedButtonProps,
  AccessibilityTestResult,
} from '@/types';

// ============================================================================
// Authentication Examples
// ============================================================================

/**
 * Example: Custom Login Page
 */
export function ExampleLoginPage() {
  const handleLoginSuccess = () => {
    console.log('Login successful!');
  };

  const handleLoginError = (error: string) => {
    console.error('Login failed:', error);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to access your dashboard"
      linkText="Don't have an account?"
      linkHref="/signup"
      linkLabel="Create one here"
    >
      <LoginForm
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
        redirectTo="/dashboard"
      />
    </AuthLayout>
  );
}

/**
 * Example: Protected Dashboard Page
 */
export function ExampleDashboardPage() {
  return (
    <RouteGuard requireAuth={true}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <ExampleActionButton />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ExampleStatCard title="Total Users" value="1,234" />
            <ExampleStatCard title="Revenue" value="$12,345" />
            <ExampleStatCard title="Orders" value="567" />
            <ExampleStatCard title="Growth" value="+12%" />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}

// ============================================================================
// UI Component Examples
// ============================================================================

/**
 * Example: Animated Button with Loading State
 */
export function ExampleActionButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <AnimatedButton
      loading={loading}
      loadingText="Processing..."
      animationType="scale"
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {loading ? 'Processing...' : 'Take Action'}
    </AnimatedButton>
  );
}

/**
 * Example: Stat Card Component
 */
interface StatCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function ExampleStatCard({ title, value, trend = 'neutral' }: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`text-sm font-medium ${trendColors[trend]}`}>
            {trend === 'up' && '↗'}
            {trend === 'down' && '↘'}
            {trend === 'neutral' && '→'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example: Loading States
 */
export function ExampleLoadingStates() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Loading States</h3>
      
      <div className="flex items-center space-x-4">
        <LoadingSpinner size="sm" color="primary" />
        <span className="text-sm">Small spinner</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <LoadingSpinner size="md" color="primary" />
        <span className="text-sm">Medium spinner</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <LoadingSpinner size="lg" color="primary" />
        <span className="text-sm">Large spinner</span>
      </div>
    </div>
  );
}

// ============================================================================
// TypeScript Usage Examples
// ============================================================================

/**
 * Example: Using TypeScript interfaces for props
 */
interface CustomComponentProps extends AnimatedButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function ExampleCustomButton({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: CustomComponentProps) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <AnimatedButton
      {...props}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${props.className || ''}`}
    >
      {children}
    </AnimatedButton>
  );
}

/**
 * Example: Form with TypeScript validation
 */
interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ExampleTypedForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          <AnimatedButton
            type="submit"
            loading={loading}
            loadingText="Sending..."
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send Message
          </AnimatedButton>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Development Tools Example
// ============================================================================

/**
 * Example: Accessibility Testing Integration
 */
export function ExampleAccessibilityTesting() {
  const handleTestComplete = (results: AccessibilityTestResult[]) => {
    console.log('Accessibility test results:', results);
    
    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.warn(`${failedTests.length} accessibility issues found`);
    } else {
      console.log('All accessibility tests passed!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Development Tools</h2>
      
      <AccessibilityTester
        onTestComplete={handleTestComplete}
        testConfig={{
          includeRecommendations: true,
          autoRun: false
        }}
      />
    </div>
  );
}

// ============================================================================
// Page Transition Example
// ============================================================================

/**
 * Example: Page with transitions
 */
export function ExamplePageWithTransitions({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </PageTransition>
  );
}