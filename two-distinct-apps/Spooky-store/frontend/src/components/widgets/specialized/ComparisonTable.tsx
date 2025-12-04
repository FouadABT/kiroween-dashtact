/**
 * ComparisonTable Component
 * 
 * Displays a feature comparison grid across multiple options/plans.
 * Supports highlighting specific columns and responsive horizontal scrolling.
 * 
 * @example
 * ```tsx
 * <ComparisonTable
 *   columns={[
 *     { id: 'basic', label: 'Basic', highlighted: false },
 *     { id: 'pro', label: 'Professional', highlighted: true },
 *     { id: 'enterprise', label: 'Enterprise', highlighted: false }
 *   ]}
 *   features={[
 *     {
 *       category: 'Core Features',
 *       items: [
 *         { label: 'Users', values: { basic: '5', pro: '25', enterprise: 'Unlimited' } },
 *         { label: 'Storage', values: { basic: '10GB', pro: '100GB', enterprise: '1TB' } }
 *       ]
 *     }
 *   ]}
 * />
 * ```
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Check, X, Minus } from 'lucide-react';
import { BaseWidgetProps } from '../types/widget.types';

export interface ComparisonColumn {
  id: string;
  label: string;
  highlighted?: boolean;
  badge?: string;
}

export interface ComparisonFeatureItem {
  label: string;
  values: Record<string, string | boolean | number>;
  tooltip?: string;
}

export interface ComparisonFeatureCategory {
  category: string;
  items: ComparisonFeatureItem[];
}

export interface ComparisonTableProps extends BaseWidgetProps {
  /** Column definitions */
  columns: ComparisonColumn[];
  /** Feature categories and items */
  features: ComparisonFeatureCategory[];
  /** Show category headers */
  showCategories?: boolean;
}

/**
 * Render cell value based on type
 */
function renderCellValue(value: string | boolean | number): React.ReactNode {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-green-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground mx-auto" />
    );
  }

  if (value === '-' || value === 'N/A') {
    return <Minus className="h-5 w-5 text-muted-foreground mx-auto" />;
  }

  return <span className="text-sm text-foreground">{value}</span>;
}

export function ComparisonTable({
  columns,
  features,
  showCategories = true,
  className = '',
}: ComparisonTableProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Horizontal scroll container for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Header */}
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left bg-muted/50">
                <span className="text-sm font-semibold text-muted-foreground">
                  Features
                </span>
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`p-4 text-center ${
                    column.highlighted
                      ? 'bg-primary/10 border-x-2 border-primary'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {column.badge && (
                      <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-0.5 rounded">
                        {column.badge}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-foreground">
                      {column.label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {features.map((category, categoryIndex) => (
              <React.Fragment key={categoryIndex}>
                {/* Category Header */}
                {showCategories && (
                  <tr className="border-b border-border bg-muted/30">
                    <td
                      colSpan={columns.length + 1}
                      className="p-3 text-sm font-semibold text-foreground"
                    >
                      {category.category}
                    </td>
                  </tr>
                )}

                {/* Feature Rows */}
                {category.items.map((item, itemIndex) => (
                  <tr
                    key={itemIndex}
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                    title={item.tooltip}
                  >
                    <td className="p-4 text-left">
                      <span className="text-sm text-foreground">
                        {item.label}
                      </span>
                    </td>
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`p-4 text-center ${
                          column.highlighted
                            ? 'bg-primary/5 border-x-2 border-primary'
                            : ''
                        }`}
                      >
                        {renderCellValue(item.values[column.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile scroll hint */}
      <div className="md:hidden p-2 text-center text-xs text-muted-foreground border-t border-border">
        Scroll horizontally to see all columns
      </div>
    </Card>
  );
}
