'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { passwordRequirements } from '@/config/auth.config';

/**
 * Props for PasswordStrengthIndicator component
 */
export interface PasswordStrengthIndicatorProps {
  /** Password to evaluate */
  password: string;
  /** Show detailed requirements checklist */
  showRequirements?: boolean;
}

/**
 * Password Strength Indicator Component
 * 
 * Displays a visual indicator of password strength with:
 * - Strength bar with color coding
 * - Strength label (Very Weak to Very Strong)
 * - Optional requirements checklist
 * 
 * Requirements: 1.2, 8.1
 */
export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  // Calculate password strength
  const strength = useMemo(() => {
    if (!password) return 0;
    return passwordRequirements.calculateStrength(password);
  }, [password]);

  // Get strength label and color
  const strengthLabel = passwordRequirements.getStrengthLabel(strength);
  const strengthColor = passwordRequirements.getStrengthColor(strength);

  // Calculate bar width percentage
  const barWidth = (strength / 4) * 100;

  // Get bar color class
  const getBarColorClass = (score: number): string => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-emerald-500',
    ];
    return colors[score] || 'bg-red-500';
  };

  // Check individual requirements
  const requirements = useMemo(() => {
    if (!password) {
      return {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      };
    }

    return {
      length: password.length >= passwordRequirements.minLength,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength:</span>
          <span className={`font-medium ${strengthColor}`}>
            {strengthLabel}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getBarColorClass(strength)} transition-colors duration-300`}
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1 text-xs">
          <RequirementItem
            met={requirements.length}
            label={`At least ${passwordRequirements.minLength} characters`}
          />
          {passwordRequirements.requireUppercase && (
            <RequirementItem
              met={requirements.uppercase}
              label="One uppercase letter"
            />
          )}
          {passwordRequirements.requireLowercase && (
            <RequirementItem
              met={requirements.lowercase}
              label="One lowercase letter"
            />
          )}
          {passwordRequirements.requireNumbers && (
            <RequirementItem
              met={requirements.number}
              label="One number"
            />
          )}
          {passwordRequirements.requireSpecialChars && (
            <RequirementItem
              met={requirements.special}
              label="One special character (@$!%*?&)"
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Individual requirement item component
 */
interface RequirementItemProps {
  met: boolean;
  label: string;
}

function RequirementItem({ met, label }: RequirementItemProps) {
  return (
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
          met
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
        }`}
      >
        {met && (
          <svg
            className="w-3 h-3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span
        className={`transition-colors duration-200 ${
          met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}
