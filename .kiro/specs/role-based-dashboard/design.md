# Design Document

## Overview

The Role-Based Dashboard system extends the existing widget infrastructure to provide personalized, data-driven dashboards for four user roles. The design leverages the current drag-drop widget system, adds role-specific data aggregation APIs, and implements pre-configured layouts that users can customize.

### Key Design Principles

1. **Separation of Concerns**: Data fetching (backend) is separate from presentation (frontend widgets)
2. **Role-Based Access Control**: All endpoints enforce permissions through existing guards
3. **Performance First**: Caching, aggregation, and lazy loading minimize load times
4. **Extensibility**: New widgets and metrics can be added without architectural changes
5. **Mobile-First**: Responsive design ensures usability across all devices

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
├─────────────────────────────────────────────────────────────┤
│  Dashboard Pages                                             │
│  ├─ /dashboard (Main)                                        │
│  └─ /dashboard/analytics                                     │
│                                                               │
│  Dashboard Data Context                                      │
│  ├─ Fetches data once                                        │
│  ├─ Shares with all widgets                                  │
│  └─ Handles refresh                                          │
│                                                               │
│  Widget Components (40+)                                     │
│  ├─ System Widgets (Super Admin)                            │
│  ├─ Business Widgets (Admin, Manager)                       │
│  ├─ Personal Widgets (User)                                 │
│  └─ Chart Widgets (All roles)                               │
│                                                               │
│  Existing Widget System                                      │
│  ├─ DashboardGrid (drag-drop)                               │
│  ├─ WidgetLibrary (add widgets)                             │
│  └─ Widget Registry (database)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (JWT Auth)
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS + Prisma)                 │
├─────────────────────────────────────────────────────────────┤
│  Dashboard Module                                            │
│  ├─ DashboardController (10 endpoints)                      │
│  ├─ DashboardService (data aggregation)                     │
│  └─ DTOs (type definitions)                                 │
│                                                               │
│  Guards & Permissions                                        │
│  ├─ JwtAuthGuard (authentication)                           │
│  └─ PermissionsGuard (authorization)                        │
│                                                               │
│  Data Sources (Prisma)                                       │
│  ├─ Orders, Products, Inventory                             │
│  ├─ Customers, Users                                         │
│  ├─ Blog Posts, Pages                                        │
│  ├─ Cron Logs, Email Logs                                   │
│  └─ Notifications, Messages                                 │
└─────────────────────────────────────────────────────────────┘
```


### Data Flow

```
User visits /dashboard
       │
       ├─> Page component mounts
       │
       ├─> DashboardDataContext fetches data
       │   └─> API: GET /dashboard/stats
       │       └─> Backend checks role
       │           └─> Aggregates appropriate data
       │               └─> Returns JSON response
       │
       ├─> Context stores data
       │
       ├─> Widgets subscribe to context
       │   ├─> RevenueCard reads revenue data
       │   ├─> OrdersCard reads orders data
       │   └─> Charts read time-series data
       │
       └─> User clicks refresh
           └─> Context re-fetches data
               └─> Widgets auto-update
```

## Components and Interfaces

### Backend Components

#### 1. Dashboard Module

**File**: `backend/src/dashboard/dashboard.module.ts`

```typescript
@Module({
  imports: [
    PrismaModule,        // Database access
    PermissionsModule,   // Permission guards
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
```

**Purpose**: Encapsulates all dashboard-related functionality

**Dependencies**:
- PrismaModule: Database queries
- PermissionsModule: Authorization

#### 2. Dashboard Controller

**File**: `backend/src/dashboard/dashboard.controller.ts`

**Endpoints**:

| Method | Path | Guard | Permission | Description |
|--------|------|-------|------------|-------------|
| GET | `/dashboard/stats` | JWT | Role-based | Get dashboard statistics |
| GET | `/dashboard/recent-activity` | JWT | Role-based | Get recent activity feed |
| GET | `/dashboard/alerts` | JWT | Role-based | Get role-specific alerts |
| GET | `/dashboard/system-health` | JWT | `system:*` | Get system health (Super Admin) |
| GET | `/dashboard/revenue` | JWT | Admin+ | Get revenue analytics |
| GET | `/dashboard/sales` | JWT | Admin+ | Get sales analytics |
| GET | `/dashboard/inventory` | JWT | Admin+ | Get inventory metrics |
| GET | `/dashboard/content` | JWT | Admin+ | Get content metrics |
| GET | `/dashboard/users` | JWT | Admin+ | Get user metrics |

**Design Pattern**: RESTful API with role-based filtering


#### 3. Dashboard Service

**File**: `backend/src/dashboard/dashboard.service.ts`

**Key Methods**:

```typescript
class DashboardService {
  // Core statistics by role
  async getStatsForRole(userId: string, role: string): Promise<DashboardStats>
  
  // Recent activity feed
  async getRecentActivity(userId: string, role: string, limit: number): Promise<Activity[]>
  
  // Role-specific alerts
  async getAlerts(userId: string, role: string): Promise<Alert[]>
  
  // System health (Super Admin only)
  async getSystemHealth(): Promise<SystemHealth>
  
  // Business metrics
  async getBusinessMetrics(role: string): Promise<BusinessMetrics>
  async getRevenueData(startDate: Date, endDate: Date, role: string): Promise<RevenueData>
  async getSalesData(startDate: Date, endDate: Date, role: string): Promise<SalesData>
  async getInventoryData(role: string): Promise<InventoryData>
  async getContentMetrics(role: string): Promise<ContentMetrics>
  async getUserMetrics(role: string): Promise<UserMetrics>
}
```

**Data Aggregation Strategy**:

1. **Super Admin Stats**:
   - Cron job success rate: `COUNT(success) / COUNT(*) FROM cron_logs WHERE created_at > NOW() - INTERVAL '24 hours'`
   - Email delivery rate: `COUNT(status='delivered') / COUNT(*) FROM email_logs WHERE created_at > NOW() - INTERVAL '24 hours'`
   - Active users: `COUNT(DISTINCT user_id) FROM users WHERE last_login > NOW() - INTERVAL '30 days'`
   - All business metrics (below)

2. **Admin Stats**:
   - Revenue today: `SUM(total) FROM orders WHERE status='completed' AND DATE(created_at) = CURRENT_DATE`
   - Revenue this month: `SUM(total) FROM orders WHERE status='completed' AND MONTH(created_at) = MONTH(CURRENT_DATE)`
   - Orders by status: `COUNT(*) FROM orders GROUP BY status`
   - Low stock count: `COUNT(*) FROM inventory WHERE quantity <= reorder_threshold`
   - New customers today: `COUNT(*) FROM customers WHERE DATE(created_at) = CURRENT_DATE`
   - Blog posts by status: `COUNT(*) FROM blog_posts GROUP BY status`

3. **Manager Stats**:
   - Same as Admin but excludes blog and user metrics

4. **User Stats**:
   - Unread notifications: `COUNT(*) FROM notifications WHERE user_id = ? AND read = false`
   - Unread messages: `COUNT(*) FROM messages WHERE recipient_id = ? AND read = false`
   - File uploads: `COUNT(*) FROM uploads WHERE user_id = ?`

**Caching Strategy**:
- Use in-memory cache with 5-minute TTL
- Cache key: `dashboard:stats:${userId}:${role}`
- Invalidate on relevant data changes (optional)


### Frontend Components

#### 1. Dashboard Pages

**Main Dashboard**: `frontend/src/app/dashboard/page.tsx`

```typescript
export default function DashboardPage() {
  return (
    <DashboardDataProvider>
      <PageHeader
        title="Dashboard"
        description="Your personalized overview"
        actions={<DashboardRefreshButton />}
      />
      <DashboardGrid />
      <WidgetLibrary />
    </DashboardDataProvider>
  );
}
```

**Analytics Dashboard**: `frontend/src/app/dashboard/analytics/page.tsx`

```typescript
export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState({ start: last30Days, end: today });
  
  return (
    <DashboardDataProvider dateRange={dateRange}>
      <PageHeader
        title="Analytics"
        description="Detailed insights and trends"
        actions={
          <>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <DashboardRefreshButton />
          </>
        }
      />
      <DashboardGrid page="analytics-dashboard" />
    </DashboardDataProvider>
  );
}
```

#### 2. Dashboard Data Context

**File**: `frontend/src/contexts/DashboardDataContext.tsx`

```typescript
interface DashboardDataContextValue {
  stats: DashboardStats | null;
  recentActivity: Activity[];
  alerts: Alert[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function DashboardDataProvider({ children, dateRange }) {
  const [data, setData] = useState<DashboardDataContextValue>({
    stats: null,
    recentActivity: [],
    alerts: [],
    loading: true,
    error: null,
    refresh: async () => {},
  });
  
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);
  
  const fetchDashboardData = async () => {
    try {
      const [stats, activity, alerts] = await Promise.all([
        DashboardApi.getStats(),
        DashboardApi.getRecentActivity(10),
        DashboardApi.getAlerts(),
      ]);
      setData({ stats, recentActivity: activity, alerts, loading: false, error: null });
    } catch (error) {
      setData(prev => ({ ...prev, loading: false, error }));
    }
  };
  
  return (
    <DashboardDataContext.Provider value={{ ...data, refresh: fetchDashboardData }}>
      {children}
    </DashboardDataContext.Provider>
  );
}
```

**Design Rationale**:
- Single fetch reduces API calls
- Shared context prevents prop drilling
- Refresh function allows manual updates
- Loading/error states handled centrally


#### 3. Widget Components

**Widget Component Pattern**:

```typescript
interface WidgetProps {
  data?: any;
  config?: WidgetConfig;
  onConfigChange?: (config: WidgetConfig) => void;
}

export function MyWidget({ data, config }: WidgetProps) {
  const { stats, loading, error } = useDashboardData();
  
  // Loading state
  if (loading) {
    return <WidgetSkeleton />;
  }
  
  // Error state
  if (error) {
    return <WidgetError error={error} onRetry={refresh} />;
  }
  
  // Empty state
  if (!data || data.length === 0) {
    return <WidgetEmpty message="No data available" />;
  }
  
  // Render widget
  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>{config?.title || 'Widget Title'}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Widget content */}
      </CardContent>
    </Card>
  );
}
```

**Widget Categories**:

1. **System Widgets** (Super Admin):
   - `SystemHealthCard`: Cron success rate, email delivery, uptime
   - `CronJobsStatus`: Recent cron executions table
   - `EmailDeliveryStats`: Email metrics with charts
   - `SecurityAlerts`: Failed logins, suspicious activity

2. **Business Widgets** (Admin, Manager):
   - `RevenueCard`: Revenue today with trend
   - `OrdersCard`: Orders by status with badges
   - `CustomersCard`: New customers with trend
   - `InventoryAlertsCard`: Low stock count with alert

3. **Chart Widgets**:
   - `RevenueChart`: Line chart (recharts)
   - `SalesByCategoryChart`: Pie chart
   - `OrderStatusChart`: Bar chart
   - `TopProductsChart`: Horizontal bar chart

4. **Table Widgets**:
   - `RecentOrdersTable`: Last 10 orders
   - `LowStockTable`: Products below threshold
   - `RecentCustomersTable`: New customers
   - `RecentPostsTable`: Recent blog posts

5. **Personal Widgets** (User):
   - `PersonalStatsCard`: Notifications, messages, files
   - `NotificationsFeed`: Recent notifications
   - `MessagesFeed`: Recent messages
   - `ProfileSummaryCard`: Profile info

6. **Action Widgets**:
   - `QuickActionsGrid`: Role-specific buttons
   - `AlertsPanel`: Dismissible alerts

**Widget Styling Guidelines**:
- Use theme variables: `bg-card`, `text-card-foreground`, `border-border`
- Consistent padding: `p-4` or `p-6`
- Rounded corners: `rounded-lg`
- Shadow: `shadow-sm`
- Hover effects: `hover:shadow-md transition-shadow`


#### 4. API Client

**File**: `frontend/src/lib/api.ts`

```typescript
export class DashboardApi {
  static async getStats(): Promise<DashboardStats> {
    return ApiClient.get('/dashboard/stats');
  }
  
  static async getRecentActivity(limit = 10): Promise<Activity[]> {
    return ApiClient.get(`/dashboard/recent-activity?limit=${limit}`);
  }
  
  static async getAlerts(): Promise<Alert[]> {
    return ApiClient.get('/dashboard/alerts');
  }
  
  static async getSystemHealth(): Promise<SystemHealth> {
    return ApiClient.get('/dashboard/system-health');
  }
  
  static async getRevenue(startDate: string, endDate: string): Promise<RevenueData> {
    return ApiClient.get(`/dashboard/revenue?startDate=${startDate}&endDate=${endDate}`);
  }
  
  static async getSales(startDate: string, endDate: string): Promise<SalesData> {
    return ApiClient.get(`/dashboard/sales?startDate=${startDate}&endDate=${endDate}`);
  }
  
  static async getInventory(): Promise<InventoryData> {
    return ApiClient.get('/dashboard/inventory');
  }
  
  static async getContent(): Promise<ContentMetrics> {
    return ApiClient.get('/dashboard/content');
  }
  
  static async getUsers(): Promise<UserMetrics> {
    return ApiClient.get('/dashboard/users');
  }
}
```

**Error Handling**:
- 401: Redirect to login
- 403: Show "Access Denied" message
- 404: Show "Endpoint not found" (shouldn't happen)
- 500: Show "Server error, please try again"
- Network error: Show "Connection failed"

## Data Models

### Backend DTOs

**DashboardStats DTO**:

```typescript
export class DashboardStatsDto {
  // Revenue
  revenueToday: number;
  revenueThisMonth: number;
  revenueYesterday: number;
  revenueChange: number; // Percentage
  
  // Orders
  ordersTotal: number;
  ordersPending: number;
  ordersProcessing: number;
  ordersCompleted: number;
  ordersCancelled: number;
  
  // Customers
  customersTotal: number;
  customersToday: number;
  customersThisMonth: number;
  
  // Inventory
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
  
  // Content (Admin only)
  blogPostsDraft?: number;
  blogPostsPublished?: number;
  customPagesCount?: number;
  
  // System (Super Admin only)
  cronJobSuccessRate?: number;
  emailDeliveryRate?: number;
  activeUsersCount?: number;
  systemUptime?: number;
}
```

**Activity DTO**:

```typescript
export class ActivityDto {
  id: string;
  type: 'order' | 'customer' | 'product' | 'blog' | 'cron' | 'email' | 'user';
  description: string;
  timestamp: Date;
  entityId: string;
  entityType: string;
  metadata?: Record<string, any>;
}
```

**Alert DTO**:

```typescript
export class AlertDto {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  dismissible: boolean;
}
```


### Frontend Types

**File**: `frontend/src/types/dashboard.ts`

```typescript
export interface DashboardStats {
  revenueToday: number;
  revenueThisMonth: number;
  revenueYesterday: number;
  revenueChange: number;
  ordersTotal: number;
  ordersPending: number;
  ordersProcessing: number;
  ordersCompleted: number;
  ordersCancelled: number;
  customersTotal: number;
  customersToday: number;
  customersThisMonth: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
  blogPostsDraft?: number;
  blogPostsPublished?: number;
  customPagesCount?: number;
  cronJobSuccessRate?: number;
  emailDeliveryRate?: number;
  activeUsersCount?: number;
  systemUptime?: number;
}

export interface Activity {
  id: string;
  type: 'order' | 'customer' | 'product' | 'blog' | 'cron' | 'email' | 'user';
  description: string;
  timestamp: string;
  entityId: string;
  entityType: string;
  metadata?: Record<string, any>;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  dismissible: boolean;
}

export interface RevenueData {
  daily: Array<{ date: string; revenue: number; orders: number }>;
  averageOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
  byCategory: Array<{ category: string; revenue: number }>;
}

export interface SalesData {
  topProducts: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    quantitySold: number;
    revenue: number;
  }>;
  byCategory: Array<{ category: string; quantity: number; revenue: number }>;
}

export interface InventoryData {
  lowStock: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    reorderThreshold: number;
    price: number;
  }>;
  outOfStock: Array<{
    id: string;
    name: string;
    sku: string;
  }>;
  totalValue: number;
}
```

## Error Handling

### Backend Error Handling

**Strategy**: Use NestJS exception filters

```typescript
@Controller('dashboard')
export class DashboardController {
  @Get('stats')
  async getStats(@Request() req) {
    try {
      return await this.dashboardService.getStatsForRole(req.user.id, req.user.role);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (error instanceof ForbiddenException) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
```

**Error Types**:
- `UnauthorizedException`: Invalid or missing JWT token
- `ForbiddenException`: Insufficient permissions
- `NotFoundException`: Resource not found
- `InternalServerErrorException`: Database or server error


### Frontend Error Handling

**Strategy**: Graceful degradation with user feedback

```typescript
export function DashboardPage() {
  const { stats, loading, error, refresh } = useDashboardData();
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={refresh}>Try Again</Button>
      </div>
    );
  }
  
  return <DashboardGrid />;
}
```

**Widget-Level Error Handling**:

```typescript
export function RevenueCard() {
  const { stats, error } = useDashboardData();
  
  if (error) {
    return (
      <Card className="bg-card">
        <CardContent className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Unable to load revenue data</p>
        </CardContent>
      </Card>
    );
  }
  
  return <Card>{/* Normal content */}</Card>;
}
```

## Testing Strategy

### Backend Testing

**Unit Tests**: Test service methods in isolation

```typescript
describe('DashboardService', () => {
  describe('getStatsForRole', () => {
    it('should return Super Admin stats with system metrics', async () => {
      const stats = await service.getStatsForRole('user-id', 'SUPER_ADMIN');
      expect(stats.cronJobSuccessRate).toBeDefined();
      expect(stats.emailDeliveryRate).toBeDefined();
    });
    
    it('should return Admin stats without system metrics', async () => {
      const stats = await service.getStatsForRole('user-id', 'ADMIN');
      expect(stats.cronJobSuccessRate).toBeUndefined();
      expect(stats.revenueToday).toBeDefined();
    });
    
    it('should return User stats with only personal metrics', async () => {
      const stats = await service.getStatsForRole('user-id', 'USER');
      expect(stats.revenueToday).toBeUndefined();
      expect(stats.notificationsUnread).toBeDefined();
    });
  });
});
```

**Integration Tests**: Test controller endpoints

```typescript
describe('DashboardController (e2e)', () => {
  it('/dashboard/stats (GET) should return 401 without auth', () => {
    return request(app.getHttpServer())
      .get('/dashboard/stats')
      .expect(401);
  });
  
  it('/dashboard/stats (GET) should return stats for authenticated user', () => {
    return request(app.getHttpServer())
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('revenueToday');
      });
  });
  
  it('/dashboard/system-health (GET) should return 403 for non-admin', () => {
    return request(app.getHttpServer())
      .get('/dashboard/system-health')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

### Frontend Testing

**Component Tests**: Test widget rendering

```typescript
describe('RevenueCard', () => {
  it('should render loading state', () => {
    render(
      <DashboardDataContext.Provider value={{ loading: true }}>
        <RevenueCard />
      </DashboardDataContext.Provider>
    );
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
  
  it('should render revenue data', () => {
    const mockData = { revenueToday: 5000, revenueChange: 12.5 };
    render(
      <DashboardDataContext.Provider value={{ stats: mockData, loading: false }}>
        <RevenueCard />
      </DashboardDataContext.Provider>
    );
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });
  
  it('should render error state', () => {
    render(
      <DashboardDataContext.Provider value={{ error: new Error('Failed'), loading: false }}>
        <RevenueCard />
      </DashboardDataContext.Provider>
    );
    expect(screen.getByText(/unable to load/i)).toBeInTheDocument();
  });
});
```


## Performance Optimizations

### Backend Optimizations

**1. Database Query Optimization**

```typescript
// ❌ Bad: Multiple queries
const revenueToday = await prisma.order.aggregate({
  where: { status: 'completed', createdAt: { gte: startOfDay } },
  _sum: { total: true },
});
const ordersToday = await prisma.order.count({
  where: { createdAt: { gte: startOfDay } },
});

// ✅ Good: Single query with aggregation
const stats = await prisma.order.groupBy({
  by: ['status'],
  where: { createdAt: { gte: startOfDay } },
  _sum: { total: true },
  _count: true,
});
```

**2. Caching Strategy**

```typescript
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  
  async getStatsForRole(userId: string, role: string): Promise<DashboardStats> {
    const cacheKey = `dashboard:stats:${userId}:${role}`;
    
    // Check cache
    const cached = await this.cacheManager.get<DashboardStats>(cacheKey);
    if (cached) return cached;
    
    // Fetch data
    const stats = await this.calculateStats(userId, role);
    
    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, stats, 300);
    
    return stats;
  }
}
```

**3. Database Indexes**

```prisma
model Order {
  id        String   @id @default(uuid())
  status    String
  total     Decimal
  createdAt DateTime @default(now())
  
  @@index([status, createdAt]) // Composite index for dashboard queries
  @@index([createdAt])          // Index for date filtering
}

model Inventory {
  id               String @id @default(uuid())
  quantity         Int
  reorderThreshold Int
  
  @@index([quantity, reorderThreshold]) // Index for low stock queries
}
```

**4. Batch Queries**

```typescript
async getBusinessMetrics(role: string): Promise<BusinessMetrics> {
  // Execute all queries in parallel
  const [revenue, orders, customers, inventory, blog] = await Promise.all([
    this.getRevenueMetrics(),
    this.getOrderMetrics(),
    this.getCustomerMetrics(),
    this.getInventoryMetrics(),
    role === 'ADMIN' ? this.getBlogMetrics() : null,
  ]);
  
  return { revenue, orders, customers, inventory, blog };
}
```

### Frontend Optimizations

**1. Code Splitting**

```typescript
// Lazy load chart library
const RevenueChart = lazy(() => import('@/components/widgets/dashboard/RevenueChart'));

export function DashboardPage() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <RevenueChart />
    </Suspense>
  );
}
```

**2. Memoization**

```typescript
export const RevenueCard = React.memo(function RevenueCard({ data }: Props) {
  const formattedRevenue = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(data.revenueToday);
  }, [data.revenueToday]);
  
  return <Card>{formattedRevenue}</Card>;
});
```

**3. React Query Caching**

```typescript
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => DashboardApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
```

**4. Virtual Scrolling for Tables**

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function RecentOrdersTable({ orders }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      {virtualizer.getVirtualItems().map((virtualRow) => (
        <OrderRow key={virtualRow.key} order={orders[virtualRow.index]} />
      ))}
    </div>
  );
}
```


## Mobile Responsive Design

### Breakpoint Strategy

```typescript
// Tailwind breakpoints
const breakpoints = {
  mobile: '< 768px',   // 1 column
  tablet: '768-1023px', // 2 columns
  desktop: '>= 1024px', // 4 columns
};
```

### Grid Layout

```typescript
export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget) => (
        <div
          key={widget.id}
          className={cn(
            'col-span-1',
            widget.span === 6 && 'md:col-span-2',
            widget.span === 12 && 'md:col-span-2 lg:col-span-4',
          )}
        >
          <WidgetRenderer widget={widget} />
        </div>
      ))}
    </div>
  );
}
```

### Widget Adaptations

**Cards**: Stack content vertically on mobile

```typescript
export function RevenueCard() {
  return (
    <Card>
      <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6">
        <div>
          <p className="text-sm text-muted-foreground">Revenue Today</p>
          <p className="text-2xl md:text-3xl font-bold">$5,000</p>
        </div>
        <Badge className="self-start md:self-auto">+12.5%</Badge>
      </CardContent>
    </Card>
  );
}
```

**Tables**: Horizontal scroll on mobile

```typescript
export function RecentOrdersTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            {/* Table content */}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Charts**: Reduce height on mobile

```typescript
export function RevenueChart() {
  return (
    <Card>
      <CardContent>
        <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
          <LineChart data={data}>
            {/* Chart content */}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

**Quick Actions**: 2 columns on mobile

```typescript
export function QuickActionsGrid({ actions }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          className="h-auto flex-col gap-2 p-4"
          onClick={() => router.push(action.url)}
        >
          <action.icon className="h-5 w-5" />
          <span className="text-xs md:text-sm">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
```

## Security Considerations

### Authentication & Authorization

**1. JWT Token Validation**

```typescript
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  // All endpoints require valid JWT token
}
```

**2. Role-Based Access Control**

```typescript
@Get('system-health')
@Permissions('system:*')
async getSystemHealth() {
  // Only Super Admin can access
}
```

**3. Data Filtering by Role**

```typescript
async getStatsForRole(userId: string, role: string): Promise<DashboardStats> {
  switch (role) {
    case 'SUPER_ADMIN':
      return this.getSuperAdminStats(userId);
    case 'ADMIN':
      return this.getAdminStats(userId);
    case 'MANAGER':
      return this.getManagerStats(userId);
    case 'USER':
      return this.getUserStats(userId);
    default:
      throw new ForbiddenException('Invalid role');
  }
}
```

### Data Privacy

**1. User Data Isolation**

```typescript
// Users only see their own data
async getUserStats(userId: string): Promise<DashboardStats> {
  const notifications = await this.prisma.notification.count({
    where: { userId, read: false },
  });
  // Never include other users' data
}
```

**2. Sensitive Data Exclusion**

```typescript
// Don't expose sensitive fields
async getRecentActivity(userId: string, role: string): Promise<Activity[]> {
  const activities = await this.prisma.activity.findMany({
    select: {
      id: true,
      type: true,
      description: true,
      timestamp: true,
      // Exclude: password, tokens, API keys
    },
  });
}
```


## Widget Registry Integration

### Database Schema

The existing widget registry schema supports the dashboard system:

```prisma
model Widget {
  id          String   @id @default(uuid())
  key         String   @unique
  name        String
  description String?
  component   String
  category    String
  permissions String[]
  defaultSpan Int      @default(6)
  configSchema Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  instances WidgetInstance[]
}

model WidgetInstance {
  id        String   @id @default(uuid())
  userId    String
  widgetId  String
  page      String   @default("main-dashboard")
  position  Int
  span      Int
  config    Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  widget Widget @relation(fields: [widgetId], references: [id], onDelete: Cascade)
  
  @@unique([userId, widgetId, page])
  @@index([userId, page])
}
```

### Seeding Default Widgets

**File**: `backend/prisma/seed-data/dashboard-widgets.seed.ts`

```typescript
export const dashboardWidgets = [
  // System Widgets (Super Admin)
  {
    key: 'system-health-card',
    name: 'System Health',
    description: 'Displays system health metrics',
    component: 'SystemHealthCard',
    category: 'dashboard',
    permissions: ['system:*'],
    defaultSpan: 6,
  },
  {
    key: 'cron-jobs-status',
    name: 'Cron Jobs Status',
    description: 'Recent cron job executions',
    component: 'CronJobsStatus',
    category: 'dashboard',
    permissions: ['system:*'],
    defaultSpan: 6,
  },
  
  // Business Widgets (Admin, Manager)
  {
    key: 'revenue-card',
    name: 'Revenue',
    description: 'Revenue today with trend',
    component: 'RevenueCard',
    category: 'dashboard',
    permissions: ['ecommerce:orders:read'],
    defaultSpan: 3,
  },
  {
    key: 'orders-card',
    name: 'Orders',
    description: 'Orders by status',
    component: 'OrdersCard',
    category: 'dashboard',
    permissions: ['ecommerce:orders:read'],
    defaultSpan: 3,
  },
  
  // Chart Widgets
  {
    key: 'revenue-chart',
    name: 'Revenue Chart',
    description: 'Revenue over time',
    component: 'RevenueChart',
    category: 'dashboard',
    permissions: ['ecommerce:orders:read'],
    defaultSpan: 6,
  },
  
  // Personal Widgets (User)
  {
    key: 'personal-stats-card',
    name: 'Personal Stats',
    description: 'Your notifications and messages',
    component: 'PersonalStatsCard',
    category: 'dashboard',
    permissions: [],
    defaultSpan: 12,
  },
];
```

### Default Widget Instances by Role

```typescript
export async function seedDefaultDashboardWidgets(prisma: PrismaClient) {
  // Get all users
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const widgets = getDefaultWidgetsForRole(user.role);
    
    for (const widgetConfig of widgets) {
      const widget = await prisma.widget.findUnique({
        where: { key: widgetConfig.key },
      });
      
      if (widget) {
        await prisma.widgetInstance.upsert({
          where: {
            userId_widgetId_page: {
              userId: user.id,
              widgetId: widget.id,
              page: widgetConfig.page,
            },
          },
          create: {
            userId: user.id,
            widgetId: widget.id,
            page: widgetConfig.page,
            position: widgetConfig.position,
            span: widgetConfig.span,
          },
          update: {},
        });
      }
    }
  }
}

function getDefaultWidgetsForRole(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return [
        { key: 'system-health-card', page: 'main-dashboard', position: 0, span: 6 },
        { key: 'revenue-card', page: 'main-dashboard', position: 1, span: 3 },
        { key: 'orders-card', page: 'main-dashboard', position: 2, span: 3 },
        { key: 'cron-jobs-status', page: 'main-dashboard', position: 3, span: 6 },
        { key: 'revenue-chart', page: 'main-dashboard', position: 4, span: 6 },
      ];
    case 'ADMIN':
      return [
        { key: 'revenue-card', page: 'main-dashboard', position: 0, span: 3 },
        { key: 'orders-card', page: 'main-dashboard', position: 1, span: 3 },
        { key: 'customers-card', page: 'main-dashboard', position: 2, span: 3 },
        { key: 'inventory-alerts-card', page: 'main-dashboard', position: 3, span: 3 },
        { key: 'revenue-chart', page: 'main-dashboard', position: 4, span: 6 },
      ];
    case 'MANAGER':
      return [
        { key: 'orders-card', page: 'main-dashboard', position: 0, span: 4 },
        { key: 'inventory-alerts-card', page: 'main-dashboard', position: 1, span: 4 },
        { key: 'revenue-card', page: 'main-dashboard', position: 2, span: 4 },
      ];
    case 'USER':
      return [
        { key: 'personal-stats-card', page: 'main-dashboard', position: 0, span: 12 },
        { key: 'notifications-feed', page: 'main-dashboard', position: 1, span: 6 },
        { key: 'messages-feed', page: 'main-dashboard', position: 2, span: 6 },
      ];
    default:
      return [];
  }
}
```


## Metadata and SEO Configuration

### Metadata Config

**File**: `frontend/src/lib/metadata-config.ts`

```typescript
export const metadataConfig = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Your personalized dashboard overview',
    breadcrumb: { label: 'Dashboard' },
    robots: { index: false, follow: true },
  },
  '/dashboard/analytics': {
    title: 'Analytics',
    description: 'Detailed analytics and insights',
    breadcrumb: { label: 'Analytics', parent: '/dashboard' },
    robots: { index: false, follow: true },
  },
};
```

### Page Metadata

```typescript
// frontend/src/app/dashboard/page.tsx
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personalized dashboard overview',
  robots: {
    index: false,
    follow: true,
  },
};
```

## Implementation Phases

### Phase 1: Backend Foundation (Days 1-2)

1. Create Dashboard Module structure
2. Implement DashboardService with data aggregation methods
3. Create DTOs for all response types
4. Add DashboardController with all endpoints
5. Register module in app.module.ts
6. Add database indexes for performance

**Deliverables**:
- Working API endpoints
- Unit tests for service methods
- Integration tests for controller

### Phase 2: Widget Components (Days 3-4)

1. Create widget component files
2. Implement System Widgets (Super Admin)
3. Implement Business Widgets (Admin, Manager)
4. Implement Chart Widgets
5. Implement Table Widgets
6. Implement Personal Widgets (User)
7. Implement Action Widgets

**Deliverables**:
- 25+ widget components
- Loading, error, and empty states
- Mobile-responsive layouts
- Component tests

### Phase 3: Frontend Integration (Day 5)

1. Create DashboardDataContext
2. Update dashboard pages
3. Add DashboardApi methods
4. Create TypeScript types
5. Implement refresh functionality
6. Add date range picker for analytics

**Deliverables**:
- Working dashboard pages
- Data context with caching
- API client methods
- Type definitions

### Phase 4: Widget Registry & Seeding (Day 6)

1. Create dashboard-widgets.seed.ts
2. Define all widget definitions
3. Create default widget instances by role
4. Run seed script
5. Verify widget registry

**Deliverables**:
- Seeded widget definitions
- Default layouts for all roles
- Database populated

### Phase 5: Testing & Polish (Day 7)

1. Backend unit tests
2. Backend integration tests
3. Frontend component tests
4. End-to-end testing
5. Performance optimization
6. Mobile testing
7. Accessibility audit

**Deliverables**:
- Comprehensive test coverage
- Performance benchmarks
- Accessibility compliance
- Bug fixes

## Deployment Considerations

### Environment Variables

**Backend** (`.env`):
```env
# Caching
CACHE_TTL=300
CACHE_MAX_ITEMS=100

# Performance
DATABASE_POOL_SIZE=20
```

**Frontend** (`.env.local`):
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Database Migrations

```bash
# Create migration for indexes
npx prisma migrate dev --name add_dashboard_indexes

# Apply migration
npx prisma migrate deploy
```

### Build Process

```bash
# Backend
cd backend
npm run build
npm run test

# Frontend
cd frontend
npm run build
npm run lint
```

## Monitoring and Maintenance

### Performance Metrics

Track these metrics:
- Dashboard page load time (target: < 2s)
- API response time (target: < 500ms)
- Widget render time (target: < 100ms)
- Cache hit rate (target: > 80%)

### Error Monitoring

Log these errors:
- API failures
- Database query errors
- Widget render errors
- Permission violations

### Maintenance Tasks

Regular tasks:
- Review and optimize slow queries
- Update cache TTL based on usage
- Add new widgets as needed
- Update default layouts based on feedback

## Future Enhancements

### Phase 2 Features

1. **Custom Dashboards**: Allow users to create multiple named dashboards
2. **Widget Sharing**: Share widget configurations between users
3. **Export Functionality**: Export dashboard data to CSV/PDF
4. **Real-time Updates**: WebSocket integration for live data
5. **Advanced Filters**: Date ranges, custom filters for all widgets
6. **Scheduled Reports**: Email dashboard snapshots on schedule
7. **Widget Marketplace**: Community-contributed widgets
8. **Dashboard Templates**: Pre-built dashboard templates by industry

### Technical Improvements

1. **GraphQL API**: Alternative to REST for flexible data fetching
2. **Server-Sent Events**: Push updates to dashboard
3. **Progressive Web App**: Offline dashboard access
4. **Advanced Caching**: Redis for distributed caching
5. **Query Optimization**: Materialized views for complex aggregations

## Conclusion

This design provides a comprehensive, scalable, and performant role-based dashboard system that:

- Leverages existing widget infrastructure
- Provides role-appropriate data access
- Optimizes for performance and mobile
- Maintains security and privacy
- Supports future extensibility

The implementation follows best practices for both NestJS backend and Next.js frontend development, ensuring maintainability and developer experience.
