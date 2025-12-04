'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { authConfig } from '@/config/auth.config';
import { CoachesApi } from '@/lib/api/coaching';
import { CoachProfile } from '@/types/coaching';
import { toast } from '@/hooks/use-toast';
import { Users, Star, CheckCircle2, XCircle } from 'lucide-react';

interface MemberSignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  coachId: string;
  goals: string;
  acceptTerms: boolean;
}

interface MemberSignupFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  coachId?: string;
  goals?: string;
  acceptTerms?: string;
  general?: string;
}

/**
 * Member Signup Form Component
 * 
 * Provides member registration with coach selection and capacity checks.
 * 
 * Requirements: 6.1-6.7
 */
export function MemberSignupForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<MemberSignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    coachId: '',
    goals: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<MemberSignupFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);

  // Fetch available coaches on mount
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoadingCoaches(true);
        const availableCoaches = await CoachesApi.getAvailable();
        console.log('[MemberSignupForm] Fetched coaches:', availableCoaches);
        setCoaches(availableCoaches);
      } catch (error) {
        console.error('[MemberSignupForm] Failed to fetch coaches:', error);
        toast.error('Failed to load available coaches. Please try again.');
      } finally {
        setLoadingCoaches(false);
      }
    };

    fetchCoaches();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: MemberSignupFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Coach selection validation (optional)
    // No error if not selected - will be assigned by admin later

    // Terms acceptance validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Register member with profile creation in one step
      const memberRegistrationData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        coachId: formData.coachId || undefined,
        goals: formData.goals || undefined,
      };

      console.log('[MemberSignupForm] Registering member with profile...');
      
      // Call the special member registration endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/register-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(memberRegistrationData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const authResponse = await response.json();
      
      // Store tokens and update auth context manually
      if (authResponse.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', authResponse.accessToken);
          if (authResponse.refreshToken) {
            localStorage.setItem('refreshToken', authResponse.refreshToken);
          }
        }
      }

      console.log('[MemberSignupForm] Member registration successful');

      // Show success message
      if (formData.coachId) {
        toast.success('Account created and coach assigned successfully!');
      } else {
        toast.success('Account created successfully! An admin will assign you a coach.');
      }

      // Redirect to member dashboard
      console.log('[MemberSignupForm] Redirecting to member dashboard...');
      router.push('/member');
      
      // Trigger a page reload to update auth context
      setTimeout(() => {
        window.location.href = '/member';
      }, 100);
      
    } catch (error) {
      console.error('[MemberSignupForm] Signup error:', error);
      
      // Extract error message
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error cases
        if (errorMessage.includes('capacity') || errorMessage.includes('full')) {
          errorMessage = 'The selected coach has reached maximum capacity. Please choose another coach or proceed without selection.';
        } else if (errorMessage.includes('email')) {
          errorMessage = 'This email is already registered. Please use a different email or sign in.';
        }
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof MemberSignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof MemberSignupFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Get selected coach details
  const selectedCoach = coaches.find(c => c.userId === formData.coachId);

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        {errors.general && (
          <motion.div 
            className="p-4 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-start gap-3"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="polite"
          >
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Registration Failed</p>
              <p className="mt-1 text-sm opacity-90">{errors.general}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal Information */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={errors.name ? 'border-destructive' : ''}
          disabled={isLoading}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
          autoComplete="name"
          required
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={errors.email ? 'border-destructive' : ''}
          disabled={isLoading}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          autoComplete="email"
          required
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={errors.password ? 'border-destructive' : ''}
          disabled={isLoading}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby="password-requirements password-error"
          autoComplete="new-password"
          required
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password}
          </p>
        )}
        {authConfig.ui.showPasswordStrength && formData.password && (
          <PasswordStrengthIndicator 
            password={formData.password}
            showRequirements={true}
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={errors.confirmPassword ? 'border-destructive' : ''}
          disabled={isLoading}
          aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          autoComplete="new-password"
          required
        />
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Coach Selection */}
      <div className="space-y-2">
        <Label htmlFor="coachId">Select Your Coach (Optional)</Label>
        <Select
          value={formData.coachId}
          onValueChange={(value) => handleInputChange('coachId', value)}
          disabled={isLoading || loadingCoaches}
        >
          <SelectTrigger id="coachId" className={errors.coachId ? 'border-destructive' : ''}>
            <SelectValue placeholder={loadingCoaches ? "Loading coaches..." : "Choose a coach or skip for now"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No coach selected (Admin will assign)</SelectItem>
            {coaches.map((coach) => {
              const isAtCapacity = coach.currentMemberCount && coach.currentMemberCount >= coach.maxMembers;
              return (
                <SelectItem 
                  key={coach.userId} 
                  value={coach.userId}
                  disabled={isAtCapacity || !coach.isAcceptingMembers}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{coach.user?.name || 'Unknown Coach'}</span>
                    {isAtCapacity && (
                      <Badge variant="destructive" className="ml-2">Full</Badge>
                    )}
                    {!coach.isAcceptingMembers && !isAtCapacity && (
                      <Badge variant="secondary" className="ml-2">Not Accepting</Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.coachId && (
          <p className="text-sm text-destructive" role="alert">
            {errors.coachId}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          You can select a coach now or have one assigned by an administrator later.
        </p>
      </div>

      {/* Selected Coach Details */}
      {selectedCoach && (
        <Card className="p-4 bg-muted/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{selectedCoach.user?.name}</h4>
              {selectedCoach.averageRating && selectedCoach.totalRatings && selectedCoach.totalRatings > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{selectedCoach.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({selectedCoach.totalRatings})</span>
                </div>
              )}
            </div>
            {selectedCoach.specialization && (
              <p className="text-sm text-muted-foreground">
                <strong>Specialization:</strong> {selectedCoach.specialization}
              </p>
            )}
            {selectedCoach.bio && (
              <p className="text-sm text-muted-foreground">{selectedCoach.bio}</p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>
                {selectedCoach.currentMemberCount || 0} / {selectedCoach.maxMembers} members
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Goals */}
      <div className="space-y-2">
        <Label htmlFor="goals">Your Goals (Optional)</Label>
        <Textarea
          id="goals"
          placeholder="What would you like to achieve through coaching?"
          value={formData.goals}
          onChange={(e) => handleInputChange('goals', e.target.value)}
          className={errors.goals ? 'border-destructive' : ''}
          disabled={isLoading}
          rows={3}
        />
        {errors.goals && (
          <p className="text-sm text-destructive" role="alert">
            {errors.goals}
          </p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => 
              handleInputChange('acceptTerms', checked as boolean)
            }
            disabled={isLoading}
            className="mt-1"
          />
          <Label 
            htmlFor="acceptTerms" 
            className="text-sm font-normal cursor-pointer leading-5"
          >
            I agree to the{' '}
            <a 
              href="/terms" 
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="/privacy" 
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive" role="alert">
            {errors.acceptTerms}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || loadingCoaches}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Creating account...</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Member Account</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.form>
  );
}
