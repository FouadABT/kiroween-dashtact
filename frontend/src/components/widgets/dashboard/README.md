# Dashboard Widgets

System monitoring and health widgets for the role-based dashboard system.

## System Widgets (Super Admin Only)

### SystemHealthCard
Displays system health metrics including:
- Cron job success rate with percentage and trend
- Email delivery rate with percentage and trend  
- System uptime with duration
- Color-coded status indicators (green/yellow/red)

**Usage:**
```tsx
import { SystemHealthCard } from '@/components/widgets/dashboard';

<SystemHealthCard />
```

### CronJobsStatus
Displays a table of recent cron job executions:
- Job name
- Status (success/failure/running) with color-coded badges
- Execution time (relative)
- Duration
- Limited to last 10 executions

**Usage:**
```tsx
import { CronJobsStatus } from '@/components/widgets/dashboard';

<CronJobsStatus />
```

### EmailDeliveryStats
Displays email delivery statistics:
- Email sent count
- Delivered count
- Failed count
- Delivery rate percentage with trend
- Mini bar chart visualization
- Progress bar

**Usage:**
```tsx
import { EmailDeliveryStats } from '@/components/widgets/dashboard';

<EmailDeliveryStats />
```

### SecurityAlerts
Displays security-related alerts:
- Failed logins
- Suspicious activity
- Alert severity with color-coded icons (critical/error/warning/info)
- Timestamp and description
- Action button to view details
- Limited to 5 most recent alerts

**Usage:**
```tsx
import { SecurityAlerts } from '@/components/widgets/dashboard';

<SecurityAlerts />
```

## Business Widgets (Admin & Manager)

### RevenueCard
Displays revenue metrics:
- Revenue today with formatted currency
- Percentage change from yesterday with trend arrow (green for positive, red for negative)
- Revenue this month as secondary metric
- Color-coded badges (Up/Down/Stable)

**Usage:**
```tsx
import { RevenueCard } from '@/components/widgets/dashboard';

<RevenueCard />
```

### OrdersCard
Displays order statistics:
- Total orders count
- Orders by status with color-coded badges:
  - Pending (yellow)
  - Processing (blue)
  - Completed (green)
  - Cancelled (red)
- Grid layout for status breakdown (2x2)

**Usage:**
```tsx
import { OrdersCard } from '@/components/widgets/dashboard';

<OrdersCard />
```

### CustomersCard
Displays customer metrics:
- New customers today with count
- Trend compared to yesterday with arrow indicator
- Total customers as secondary metric
- User icon and theme colors

**Usage:**
```tsx
import { CustomersCard } from '@/components/widgets/dashboard';

<CustomersCard />
```

### InventoryAlertsCard
Displays inventory alerts:
- Low stock products count with alert badge (yellow/orange)
- Out of stock products count with alert badge (red)
- Visual indicators with icons (AlertTriangle, XCircle)
- Link button to inventory management page
- Shows "healthy" state when no alerts

**Usage:**
```tsx
import { InventoryAlertsCard } from '@/components/widgets/dashboard';

<InventoryAlertsCard />
```

## Data Source

All widgets consume data from the `DashboardDataContext`:
- `stats` - Dashboard statistics including system metrics
- `recentActivity` - Recent activity feed (used for cron jobs and email stats)
- `alerts` - Role-specific alerts (used for security alerts)

## States

All widgets handle three states:
1. **Loading** - Shows skeleton loaders
2. **Error** - Shows error message with retry option
3. **Empty** - Shows appropriate empty state message

## Theme Support

All widgets use theme variables for colors:
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-muted` / `text-muted-foreground` - Muted elements
- `border-border` - Borders
- Status colors: green (success), yellow (warning), red (error)

## Table Widgets (Admin & Manager)

### RecentOrdersTable
Displays the last 10 orders with detailed information:
- Order ID (truncated to 8 characters)
- Customer name
- Status with color-coded badges (pending/processing/completed/cancelled)
- Total amount (formatted currency)
- Order date (formatted)
- Horizontal scroll on mobile
- Sorted by date descending

**Usage:**
```tsx
import { RecentOrdersTable } from '@/components/widgets/dashboard';

<RecentOrdersTable />
```

**Data Source:** Uses `recentActivity` from DashboardDataContext, filters for 'order' type activities.

### LowStockTable
Displays products with low inventory levels:
- Product name with stock status badge
- SKU (monospace font)
- Current stock (highlighted in red if 0)
- Reorder threshold
- Price (formatted currency)
- Link button to product edit page
- Highlights out of stock products with red background
- Sorted by quantity ascending

**Usage:**
```tsx
import { LowStockTable } from '@/components/widgets/dashboard';

<LowStockTable />
```

**Data Source:** Fetches inventory data independently via `DashboardApi.getInventory()`.

### RecentCustomersTable
Displays the last 10 customers registered:
- Customer name
- Email address
- Phone number (formatted)
- Registration date (formatted)
- Link button to customer profile
- Sorted by registration date descending

**Usage:**
```tsx
import { RecentCustomersTable } from '@/components/widgets/dashboard';

<RecentCustomersTable />
```

**Data Source:** Uses `recentActivity` from DashboardDataContext, filters for 'customer' type activities.

### RecentPostsTable
Displays recent blog posts:
- Post title (truncated if too long)
- Author name
- Status badge (published: green, draft: gray, archived: orange)
- Published date (formatted)
- Link button to post edit page
- Shows only published posts from recent activity

**Usage:**
```tsx
import { RecentPostsTable } from '@/components/widgets/dashboard';

<RecentPostsTable />
```

**Data Source:** Fetches content metrics independently via `DashboardApi.getContent()`.

## Chart Widgets

### RevenueChart
Line chart displaying revenue over time:
- Daily revenue for last 30 days
- Responsive container (300px mobile, 400px desktop)
- Tooltip with date and revenue amount
- Theme colors for chart lines and axes
- Uses recharts library

**Usage:**
```tsx
import { RevenueChart } from '@/components/widgets/dashboard';

<RevenueChart />
```

### SalesByCategoryChart
Pie chart displaying sales distribution by category:
- Category name and percentage in legend
- Distinct colors for each category
- Tooltip with category name and revenue
- Responsive sizing

**Usage:**
```tsx
import { SalesByCategoryChart } from '@/components/widgets/dashboard';

<SalesByCategoryChart />
```

### OrderStatusChart
Bar chart displaying orders by status:
- Status on x-axis, count on y-axis
- Color-coded bars matching status badges
- Tooltip with status and count
- Responsive sizing

**Usage:**
```tsx
import { OrderStatusChart } from '@/components/widgets/dashboard';

<OrderStatusChart />
```

### TopProductsChart
Horizontal bar chart displaying top 10 products:
- Product name on y-axis, quantity sold on x-axis
- Tooltip with product name, quantity, and revenue
- Truncates long product names with ellipsis
- Responsive sizing

**Usage:**
```tsx
import { TopProductsChart } from '@/components/widgets/dashboard';

<TopProductsChart />
```

## Data Source

All widgets consume data from the `DashboardDataContext` or fetch independently:
- **Context-based widgets:** RecentOrdersTable, RecentCustomersTable
  - Use `stats`, `recentActivity`, `alerts` from context
- **Independent widgets:** LowStockTable, RecentPostsTable
  - Fetch their own data via API calls
  - Show loading/error states independently

## States

All widgets handle three states:
1. **Loading** - Shows skeleton loaders
2. **Error** - Shows error message with retry option
3. **Empty** - Shows appropriate empty state message with icon

## Theme Support

All widgets use theme variables for colors:
- `bg-card` / `text-card-foreground` - Card backgrounds
- `bg-muted` / `text-muted-foreground` - Muted elements
- `border-border` - Borders
- Status colors: green (success), yellow (warning), red (error)

## Mobile Responsive

All widgets are mobile-responsive:
- Tables have horizontal scroll on mobile (`overflow-x-auto`)
- Grid layouts adapt to screen size (1 col mobile, 2 col tablet, 4 col desktop)
- Text sizes scale appropriately (`text-sm md:text-base`)
- Chart heights reduce on mobile (300px vs 400px desktop)
- Padding adjusts (`p-2 md:p-4`)

## Personal Widgets (User Role)

### PersonalStatsCard
Displays personal activity metrics for users:
- Unread notifications count with icon
- Unread messages count with icon
- File uploads count with icon
- Grid layout with 3 columns
- Clickable cards that link to respective pages
- Hover effects and transitions
- Color-coded icons (primary, blue, green)

**Usage:**
```tsx
import { PersonalStatsCard } from '@/components/widgets/dashboard';

<PersonalStatsCard />
```

**Data Source:** Uses `stats.notificationsUnread`, `stats.messagesUnread`, `stats.fileUploadsCount` from DashboardDataContext.

### NotificationsFeed
Displays recent notifications (last 10):
- Notification title and message
- Timestamp in relative format (e.g., "2 hours ago")
- Priority badge (urgent/high/normal/low) with color coding
- Unread notifications highlighted with bold text and blue background
- "New" badge for unread items
- Link to full notifications page
- Scrollable list (max height 500px)

**Usage:**
```tsx
import { NotificationsFeed } from '@/components/widgets/dashboard';

<NotificationsFeed />
```

**Data Source:** Uses `recentActivity` from DashboardDataContext, filters for 'notification' type activities.

### MessagesFeed
Displays recent messages (last 10):
- Sender avatar with initials fallback
- Sender name
- Message preview (truncated to 60 characters)
- Timestamp in relative format
- Unread messages highlighted with bold text and blue dot indicator
- Unread count badge in header
- Link to full messages page
- Scrollable list (max height 500px)

**Usage:**
```tsx
import { MessagesFeed } from '@/components/widgets/dashboard';

<MessagesFeed />
```

**Data Source:** Uses `recentActivity` from DashboardDataContext, filters for 'message' type activities.

### ProfileSummaryCard
Displays user profile summary:
- User avatar with initials fallback
- User name and email
- Role badge with color coding (Super Admin/Admin/Manager/User)
- Email verification badge
- Profile completion percentage with progress bar
- Color-coded completion status (green ≥80%, yellow ≥50%, red <50%)
- Member since date
- 2FA status badge
- Edit profile button
- Quick stats grid (2 columns)

**Usage:**
```tsx
import { ProfileSummaryCard } from '@/components/widgets/dashboard';

<ProfileSummaryCard />
```

**Data Source:** Uses `user` from AuthContext (not DashboardDataContext).

## Role-Based Access

Different roles see different widgets:
- **Super Admin:** All widgets including system health and security
- **Admin:** Business widgets, charts, and all tables
- **Manager:** Business widgets and operational tables (no blog posts)
- **User:** Personal widgets only (PersonalStatsCard, NotificationsFeed, MessagesFeed, ProfileSummaryCard)
