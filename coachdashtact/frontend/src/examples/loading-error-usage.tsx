/**
 * Loading and Error Components Usage Examples
 * 
 * This file demonstrates how to use the authentication loading and error components
 * in various scenarios throughout your application.
 */

import { useState, useEffect } from 'react';
import {
  // Loading components
  AuthLoadingSpinner,
  AuthLoadingDots,
  AuthLoadingOverlay,
  PageLoadingState,
  InlineLoadingState,
  ButtonLoadingState,
  // Error components
  AuthErrorMessage,
  AuthErrorBanner,
  PermissionDeniedMessage,
  FormErrorMessage,
  ErrorList,
  AccessDeniedMessage,
  InlineAccessDenied,
  FeatureLockedMessage,
} from '@/components/auth';

/**
 * Example 1: Login Form with Loading and Error States
 */
export function LoginFormExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise((resolve, reject) => 
        setTimeout(() => reject(new Error('Invalid credentials')), 2000)
      );
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      
      {/* Show error banner if there's an error */}
      {error && (
        <AuthErrorBanner
          message={error}
          severity="error"
          dismissible={true}
          onDismiss={() => setError(null)}
        />
      )}
      
      <form className="space-y-4 mt-4">
        <input 
          type="email" 
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input 
          type="password" 
          placeholder="Password"
          className="w-full p-2 border rounded"
        />
        
        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {isLoading ? (
            <ButtonLoadingState text="Logging in..." />
          ) : (
            'Login'
          )}
        </button>
      </form>
      
      {/* Show loading overlay during authentication */}
      {isLoading && (
        <AuthLoadingOverlay message="Verifying credentials..." />
      )}
    </div>
  );
}

/**
 * Example 2: Page with Loading State
 */
export function DashboardPageExample() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ users: number; revenue: number } | null>(null);

  // Simulate data loading
  useEffect(() => {
    setTimeout(() => {
      setData({ users: 100, revenue: 50000 });
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    // Option 1: Show spinner
    return <PageLoadingState message="Loading dashboard..." />;
    
    // Option 2: Show skeleton
    // return <PageLoadingState showSkeleton={true} />;
  }

  return (
    <div className="p-6">
      <h1>Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Total Users</p>
          <p className="text-2xl font-bold">{data?.users}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Revenue</p>
          <p className="text-2xl font-bold">${data?.revenue}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Form with Field Validation Errors
 */
export function SignupFormExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const pwdErrors: string[] = [];

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      if (password.length < 8) {
        pwdErrors.push('Password must be at least 8 characters');
      }
      if (!/[A-Z]/.test(password)) {
        pwdErrors.push('Password must contain an uppercase letter');
      }
      if (!/[0-9]/.test(password)) {
        pwdErrors.push('Password must contain a number');
      }
    }

    setErrors(newErrors);
    setPasswordErrors(pwdErrors);
    return Object.keys(newErrors).length === 0 && pwdErrors.length === 0;
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
      
      {/* Show multiple password errors */}
      {passwordErrors.length > 0 && (
        <ErrorList errors={passwordErrors} className="mb-4" />
      )}
      
      <form className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          {/* Show field-specific error */}
          {errors.email && <FormErrorMessage message={errors.email} />}
        </div>
        
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          {errors.password && <FormErrorMessage message={errors.password} />}
        </div>
        
        <button
          type="button"
          onClick={validateForm}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

/**
 * Example 4: Data Table with Inline Loading
 */
export function DataTableExample() {
  const [isLoading] = useState(true);
  const [data] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      
      {isLoading ? (
        <InlineLoadingState message="Loading users..." />
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/**
 * Example 5: Permission Denied Scenarios
 */
export function PermissionDeniedExample() {
  return (
    <div className="space-y-8 p-6">
      {/* Scenario 1: Full access denied message */}
      <div>
        <h3 className="text-lg font-bold mb-4">Full Access Denied</h3>
        <AccessDeniedMessage
          permission="users:write"
          resource="user management"
          showBackButton={true}
          backUrl="/dashboard"
        />
      </div>
      
      {/* Scenario 2: Inline permission denied */}
      <div>
        <h3 className="text-lg font-bold mb-4">Inline Permission Denied</h3>
        <InlineAccessDenied message="You need admin privileges to perform this action" />
      </div>
      
      {/* Scenario 3: Permission denied in error message format */}
      <div>
        <h3 className="text-lg font-bold mb-4">Permission Error Message</h3>
        <PermissionDeniedMessage
          permission="users:delete"
          resource="user accounts"
        />
      </div>
      
      {/* Scenario 4: Feature locked (premium feature) */}
      <div>
        <h3 className="text-lg font-bold mb-4">Feature Locked</h3>
        <FeatureLockedMessage
          feature="Advanced Analytics"
          requiredRole="Premium"
          upgradeUrl="/upgrade"
          contactUrl="/contact"
        />
      </div>
    </div>
  );
}

/**
 * Example 6: Different Error Severities
 */
export function ErrorSeveritiesExample() {
  return (
    <div className="space-y-4 p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Error Message Severities</h2>
      
      {/* Error severity */}
      <AuthErrorMessage
        message="Invalid email or password. Please try again."
        severity="error"
        errorCode="AUTH_001"
      />
      
      {/* Warning severity */}
      <AuthErrorMessage
        message="Your session will expire in 5 minutes. Please save your work."
        severity="warning"
        dismissible={true}
        onDismiss={() => console.log('Warning dismissed')}
      />
      
      {/* Info severity */}
      <AuthErrorMessage
        message="You are currently logged in as a guest user."
        severity="info"
      />
    </div>
  );
}

/**
 * Example 7: Button with Loading State
 */
export function ButtonLoadingExample() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="space-x-4 p-6">
      <button
        onClick={() => setIsSaving(true)}
        disabled={isSaving}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isSaving ? (
          <ButtonLoadingState text="Saving..." />
        ) : (
          'Save Changes'
        )}
      </button>
      
      <button
        onClick={() => setIsDeleting(true)}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
      >
        {isDeleting ? (
          <ButtonLoadingState text="Deleting..." />
        ) : (
          'Delete'
        )}
      </button>
      
      {/* Inline dots for compact buttons */}
      <button
        disabled
        className="px-4 py-2 bg-gray-600 text-white rounded"
      >
        <AuthLoadingDots className="mr-2" /> Processing
      </button>
    </div>
  );
}

/**
 * Example 8: Fullscreen Loading
 */
export function FullscreenLoadingExample() {
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <div className="p-6">
      <button
        onClick={() => setShowFullscreen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Show Fullscreen Loading
      </button>
      
      {showFullscreen && (
        <AuthLoadingSpinner
          message="Processing your request..."
          fullscreen={true}
        />
      )}
    </div>
  );
}

/**
 * Example 9: Route Transition Loading
 */
export function RouteTransitionExample() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (isTransitioning) {
    return <PageLoadingState message="Loading page..." />;
  }

  return (
    <div className="p-6">
      <h1>Current Page</h1>
      <button
        onClick={() => setIsTransitioning(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Navigate to Next Page
      </button>
    </div>
  );
}

/**
 * Example 10: Combining Loading and Error States
 */
export function CombinedStatesExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ message: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setData({ message: 'Data loaded successfully' });
    } catch {
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Data Fetching Example</h2>
      
      {error && (
        <AuthErrorMessage
          message={error}
          severity="error"
          dismissible={true}
          onDismiss={() => setError(null)}
        />
      )}
      
      {isLoading ? (
        <InlineLoadingState message="Fetching data..." />
      ) : data ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">{data.message}</p>
        </div>
      ) : (
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Load Data
        </button>
      )}
    </div>
  );
}
