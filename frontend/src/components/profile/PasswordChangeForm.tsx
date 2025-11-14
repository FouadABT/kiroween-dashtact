/**
 * Password Change Form Component
 * 
 * Form for changing user password with strength indicator and requirements
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordSchema, PasswordFormData, validatePasswordStrength } from '@/lib/validation/profile-schema';
import { usePasswordChange } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

export function PasswordChangeForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof validatePasswordStrength> | null>(null);

  const changePasswordMutation = usePasswordChange();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = form.watch('newPassword');
  const confirmPassword = form.watch('confirmPassword');

  // Update password strength when new password changes
  useState(() => {
    if (newPassword) {
      const strength = validatePasswordStrength(newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  });

  const onSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const isSubmitting = changePasswordMutation.isPending;

  // Password strength color and label
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500';
      case 'fair':
        return 'bg-orange-500';
      case 'good':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-blue-500';
      case 'very-strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthLabel = (strength: string) => {
    switch (strength) {
      case 'weak':
        return 'Weak';
      case 'fair':
        return 'Fair';
      case 'good':
        return 'Good';
      case 'strong':
        return 'Strong';
      case 'very-strong':
        return 'Very Strong';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Alert */}
      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          After changing your password, you will be logged out and need to log in again with your new password.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) {
                          setPasswordStrength(validatePasswordStrength(e.target.value));
                        } else {
                          setPasswordStrength(null);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />

                {/* Password Strength Indicator */}
                {passwordStrength && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={cn(
                        'font-medium',
                        passwordStrength.strength === 'weak' && 'text-red-600',
                        passwordStrength.strength === 'fair' && 'text-orange-600',
                        passwordStrength.strength === 'good' && 'text-yellow-600',
                        passwordStrength.strength === 'strong' && 'text-blue-600',
                        passwordStrength.strength === 'very-strong' && 'text-green-600'
                      )}>
                        {getStrengthLabel(passwordStrength.strength)}
                      </span>
                    </div>
                    <Progress
                      value={(passwordStrength.score / 5) * 100}
                      className={cn('h-2', getStrengthColor(passwordStrength.strength))}
                    />
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />

                {/* Password Match Indicator */}
                {confirmPassword && newPassword && (
                  <div className="flex items-center gap-2 text-sm mt-2">
                    {confirmPassword === newPassword ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* Password Requirements */}
          {passwordStrength && (
            <div className="space-y-2 p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Password Requirements:</p>
              <div className="space-y-1">
                {Object.entries(passwordStrength.requirements).map(([key, met]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {met ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={met ? 'text-green-600' : 'text-muted-foreground'}>
                      {key === 'minLength' && 'At least 8 characters'}
                      {key === 'hasUppercase' && 'Uppercase letter'}
                      {key === 'hasLowercase' && 'Lowercase letter'}
                      {key === 'hasNumber' && 'Number'}
                      {key === 'hasSpecialChar' && 'Special character (@$!%*?&)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
