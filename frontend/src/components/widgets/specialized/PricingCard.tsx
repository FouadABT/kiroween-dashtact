/**
 * PricingCard Component
 * 
 * Displays pricing plan information with features list and call-to-action button.
 * Supports highlighting featured plans and customizable styling.
 * 
 * @example
 * ```tsx
 * <PricingCard
 *   plan="Professional"
 *   price={29}
 *   period="month"
 *   description="Perfect for growing teams"
 *   features={[
 *     { text: 'Unlimited projects', included: true },
 *     { text: '50GB storage', included: true },
 *     { text: 'Priority support', included: true },
 *     { text: 'Advanced analytics', included: false }
 *   ]}
 *   highlighted
 *   onSelect={() => console.log('Selected Professional plan')}
 * />
 * ```
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { BaseWidgetProps } from '../types/widget.types';

export interface PricingFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingCardProps extends BaseWidgetProps {
  /** Plan name */
  plan: string;
  /** Price amount */
  price: number | string;
  /** Billing period */
  period?: 'month' | 'year' | 'one-time' | string;
  /** Currency symbol */
  currency?: string;
  /** Plan description */
  description?: string;
  /** List of features */
  features: PricingFeature[];
  /** Highlight this plan */
  highlighted?: boolean;
  /** Badge text for highlighted plan */
  badge?: string;
  /** Button text */
  buttonText?: string;
  /** Button variant */
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Select handler */
  onSelect?: () => void;
  /** Disable selection */
  disabled?: boolean;
}

/**
 * Format price for display
 */
function formatPrice(price: number | string, currency: string): string {
  if (typeof price === 'string') {
    return price;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function PricingCard({
  plan,
  price,
  period = 'month',
  currency = 'USD',
  description,
  features,
  highlighted = false,
  badge,
  buttonText = 'Get Started',
  buttonVariant,
  onSelect,
  disabled = false,
  className = '',
}: PricingCardProps) {
  const cardClasses = `
    relative p-6 transition-all
    ${highlighted 
      ? 'border-2 border-primary shadow-lg scale-105' 
      : 'border border-border hover:shadow-md'
    }
    ${className}
  `;

  return (
    <Card className={cardClasses}>
      {/* Badge for highlighted plan */}
      {highlighted && badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            {badge}
          </Badge>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          {plan}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-foreground">
            {formatPrice(price, currency)}
          </span>
          {period && period !== 'one-time' && (
            <span className="text-muted-foreground">
              /{period}
            </span>
          )}
        </div>
      </div>

      {/* Features List */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li 
            key={index}
            className="flex items-start gap-2"
            title={feature.tooltip}
          >
            {feature.included ? (
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <span 
              className={`text-sm ${
                feature.included 
                  ? 'text-foreground' 
                  : 'text-muted-foreground line-through'
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {onSelect && (
        <Button
          variant={buttonVariant || (highlighted ? 'default' : 'outline')}
          className="w-full"
          onClick={onSelect}
          disabled={disabled}
        >
          {buttonText}
        </Button>
      )}
    </Card>
  );
}
