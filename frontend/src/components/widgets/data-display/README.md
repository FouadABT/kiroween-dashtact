# Data Display Widgets

A collection of components for displaying data in various formats.

## Components

### MetricCard

Displays a large metric value with optional comparison data and formatting.

**Features:**
- Number, currency, and percentage formatting
- Comparison with previous period
- Trend indicators (up/down)
- Icon support
- Theme-aware colors

**Usage:**
```tsx
import { MetricCard } from '@/components/widgets/data-display';

<MetricCard
  label="Total Revenue"
  value={45678}
  format="currency"
  currency="USD"
  comparison={{
    previousValue: 40000,
    percentageChange: 14.2,
    period: "vs last month"
  }}
  icon={DollarSign}
  color="success"
/>
```

### ProgressWidget

Displays progress towards a goal with bar or circle variants.

**Features:**
- Bar and circle variants
- Automatic percentage calculation
- Value display (current/max)
- Theme-aware colors
- Responsive sizing

**Usage:**
```tsx
import { ProgressWidget } from '@/components/widgets/data-display';

// Bar variant
<ProgressWidget
  title="Storage Used"
  current={75}
  max={100}
  variant="bar"
  label="GB"
  showPercentage
  showValue
/>

// Circle variant
<ProgressWidget
  title="Project Completion"
  current={45}
  max={100}
  variant="circle"
  color="primary"
/>
```

### ListWidget

Displays a scrollable list of items with icons and optional click handlers.

**Features:**
- Scrollable with custom max height
- Icon support for each item
- Click handlers
- Empty state
- Chevron indicators
- Metadata badges

**Usage:**
```tsx
import { ListWidget } from '@/components/widgets/data-display';

<ListWidget
  title="Recent Activities"
  items={[
    {
      id: '1',
      title: 'User logged in',
      description: '2 minutes ago',
      icon: LogIn,
      metadata: { badge: 'New' }
    },
    {
      id: '2',
      title: 'File uploaded',
      description: '5 minutes ago',
      icon: Upload
    }
  ]}
  onItemClick={(item) => console.log(item)}
  showChevron
  maxHeight="400px"
/>
```

### CardGrid

Displays items in a responsive grid layout with custom card rendering.

**Features:**
- Responsive columns (1-4)
- Custom render function
- Loading skeleton cards
- Empty state
- Configurable gap sizes
- Generic type support

**Usage:**
```tsx
import { CardGrid } from '@/components/widgets/data-display';
import { Card, CardContent } from '@/components/ui/card';

<CardGrid
  title="Products"
  items={products}
  columns={3}
  gap="md"
  renderCard={(product) => (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <p className="text-lg font-bold mt-2">${product.price}</p>
      </CardContent>
    </Card>
  )}
  loading={isLoading}
  loadingCount={6}
/>
```

## Common Props

All data display widgets support these common props from `BaseWidgetProps`:

- `loading?: boolean` - Show loading state
- `error?: string` - Show error state
- `permission?: string` - Require permission to view
- `className?: string` - Additional CSS classes

## Theme Integration

All components use theme-aware colors and automatically adapt to light/dark mode:

- Background colors: `bg-card`, `bg-muted`
- Text colors: `text-foreground`, `text-muted-foreground`
- Border colors: `border-border`
- Semantic colors: `text-primary`, `text-success`, `text-destructive`, etc.

## Accessibility

All components include:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Semantic HTML structure

## Examples

See the widget gallery at `/dashboard/widgets` for live examples of all components.
