'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements = useMemo((): PasswordRequirement[] => {
    return [
      {
        label: 'At least 8 characters',
        met: password.length >= 8,
      },
      {
        label: 'Contains uppercase letter',
        met: /[A-Z]/.test(password),
      },
      {
        label: 'Contains lowercase letter',
        met: /[a-z]/.test(password),
      },
      {
        label: 'Contains number',
        met: /[0-9]/.test(password),
      },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { label: 'Weak', color: 'bg-destructive', width: '0%' };
    if (metCount === 1) return { label: 'Weak', color: 'bg-destructive', width: '25%' };
    if (metCount === 2) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
    if (metCount === 3) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  }, [requirements]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={`font-medium ${
          strength.label === 'Weak' ? 'text-destructive' :
          strength.label === 'Fair' ? 'text-orange-500' :
          strength.label === 'Good' ? 'text-yellow-500' :
          'text-green-500'
        }`}>
          {strength.label}
        </span>
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300`}
          style={{ width: strength.width }}
        />
      </div>

      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 text-sm ${
              req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
            }`}
          >
            {req.met ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
