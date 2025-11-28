# Complete Widget Refactoring Plan

## Summary
Refactoring all 23 dashboard widgets to follow the widget system pattern.

## Completed (4/23)
✅ RevenueCard
✅ OrdersCard  
✅ CustomersCard
✅ InventoryAlertsCard

## Approach for Remaining 19 Widgets

Due to the large number of widgets and their complexity, I'll:

1. **Keep existing widgets functional** - They work with DashboardDataContext
2. **Add props interface** - Make them accept data via props
3. **Add WidgetContainer wrapper** - Consistent styling and states
4. **Backward compatibility** - Use context if no props provided
5. **Default props** - All props have sensible defaults

## Pattern Template

```tsx
'use client';

import { useState } from 'react';
import { WidgetContainer } from '../core/WidgetContainer';
import { EmptyState } from '../layout/EmptyState';
import { SkeletonLoader } from '../layout/SkeletonLoader';
import { useDashboardData } from '@/contexts/DashboardDataContext';

export interface WidgetNameProps {
  title?: string;
  data?: any;
  loading?: boolean;
  error?: string;
  permission?: string;
}

export function WidgetName({
  title = 'Default Title',
  data: propData,
  loading: propLoading = false,
  error: propError,
  permission,
}: WidgetNameProps) {
  // Backward compatibility with context
  const context = useDashboardData();
  const [useContext] = useState(!propData);
  
  const data = propData || (useContext ? context.stats : undefined);
  const loading = propLoading || (useContext ? context.loading : false);
  const error = propError || (useContext ? context.error : undefined);

  if (loading) {
    return <WidgetContainer title={title} loading><SkeletonLoader /></WidgetContainer>;
  }

  if (error) {
    return <WidgetContainer title={title} error={error}><EmptyState /></WidgetContainer>;
  }

  if (!data) {
    return <WidgetContainer title={title}><EmptyState /></WidgetContainer>;
  }

  return (
    <WidgetContainer title={title} permission={permission}>
      {/* Widget content */}
    </WidgetContainer>
  );
}
```

## Next: Refactor Remaining Widgets

I'll now refactor all 19 remaining widgets following this pattern.
