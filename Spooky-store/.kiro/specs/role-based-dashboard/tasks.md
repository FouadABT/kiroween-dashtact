# Implementation Plan

- [x] 1. Backend Dashboard Module Setup





  - Create dashboard module structure with controller, service, and DTOs
  - Import PrismaModule and PermissionsModule for database access and authorization
  - Register DashboardModule in app.module.ts to enable routing

  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 1.1 Create Dashboard Module and Controller

  - Create `backend/src/dashboard/dashboard.module.ts` with PrismaModule and PermissionsModule imports
  - Create `backend/src/dashboard/dashboard.controller.ts` with JwtAuthGuard applied to all endpoints
  - Create `backend/src/dashboard/dashboard.service.ts` with PrismaService injection
  - Register DashboardModule in `backend/src/app.module.ts` imports array
  - _Requirements: 18.1, 18.2, 18.3, 18.4_


- [x] 1.2 Create Dashboard DTOs

  - Create `backend/src/dashboard/dto/dashboard-stats.dto.ts` with all statistics fields
  - Create `backend/src/dashboard/dto/activity.dto.ts` for activity feed items
  - Create `backend/src/dashboard/dto/alert.dto.ts` for alert notifications
  - Create `backend/src/dashboard/dto/revenue-data.dto.ts` for revenue analytics
  - Create `backend/src/dashboard/dto/sales-data.dto.ts` for sales analytics
  - Create `backend/src/dashboard/dto/inventory-data.dto.ts` for inventory metrics
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 2. Dashboard Statistics API Implementation





  - Implement getStatsForRole service method with role-based data aggregation
  - Create GET /dashboard/stats endpoint with JWT authentication
  - Add caching with 5-minute TTL for dashboard statistics
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 2.1 Implement Super Admin Statistics


  - Calculate cron job success rate from cron_logs table for last 24 hours
  - Calculate email delivery rate from email_logs table for last 24 hours
  - Count active users who logged in within last 30 days
  - Include all business metrics (revenue, orders, customers, inventory)
  - _Requirements: 1.1, 2.8, 5.3, 5.4, 5.5_

- [x] 2.2 Implement Admin Statistics

  - Calculate revenue today and this month from completed orders
  - Count orders grouped by status (pending, processing, completed, cancelled)
  - Count low stock products where quantity <= reorder threshold
  - Count new customers registered today
  - Count blog posts grouped by status (draft, published, archived)
  - _Requirements: 1.2, 2.4, 2.5, 2.6_


- [x] 2.3 Implement Manager Statistics

  - Calculate revenue today and this month from completed orders
  - Count orders grouped by status
  - Count low stock products where quantity <= reorder threshold
  - Count new customers registered today
  - Exclude blog and user management metrics
  - _Requirements: 1.3, 2.4, 2.5, 2.6_

- [x] 2.4 Implement User Statistics

  - Count unread notifications for the authenticated user
  - Count unread messages for the authenticated user
  - Count file uploads by the authenticated user
  - Return only personal metrics, no business data
  - _Requirements: 1.4_

- [x] 3. Recent Activity Feed Implementation





  - Implement getRecentActivity service method with role-based filtering
  - Create GET /dashboard/recent-activity endpoint with limit parameter
  - Order activity items by timestamp descending
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_


- [x] 3.1 Implement Super Admin Activity Feed

  - Fetch recent cron job executions from cron_logs
  - Fetch recent email sends from email_logs
  - Fetch recent user actions (logins, registrations)
  - Fetch recent system events
  - Combine and sort by timestamp, limit to requested count
  - _Requirements: 3.3_

- [x] 3.2 Implement Admin Activity Feed

  - Fetch recent orders with customer and status
  - Fetch recent blog post publications
  - Fetch recent customer registrations
  - Fetch recent product updates
  - Combine and sort by timestamp, limit to requested count
  - _Requirements: 3.4_

- [x] 3.3 Implement Manager Activity Feed

  - Fetch recent orders with customer and status
  - Fetch recent inventory adjustments
  - Fetch recent customer activity
  - Combine and sort by timestamp, limit to requested count
  - _Requirements: 3.5_

- [x] 3.4 Implement User Activity Feed

  - Fetch user's own notifications
  - Fetch user's own messages
  - Fetch user's own file uploads
  - Combine and sort by timestamp, limit to requested count
  - _Requirements: 3.6_


- [x] 4. Alert System Implementation




  - Implement getAlerts service method with role-based alert generation
  - Create GET /dashboard/alerts endpoint
  - Include alert severity, title, message, and action URL
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_


- [x] 4.1 Implement Super Admin Alerts

  - Check for failed cron jobs in last 24 hours
  - Check for email delivery failures in last 24 hours
  - Check for system errors in logs
  - Generate security alerts for failed login attempts
  - _Requirements: 4.2, 4.6_

- [x] 4.2 Implement Admin Alerts

  - Check for products with quantity <= reorder threshold
  - Check for pending orders older than 24 hours
  - Check for failed payment transactions
  - _Requirements: 4.3, 4.7_

- [x] 4.3 Implement Manager Alerts

  - Check for products with quantity <= reorder threshold
  - Check for orders requiring fulfillment (status = processing)
  - _Requirements: 4.4, 4.7_


- [x] 4.4 Implement User Alerts

  - Count unread notifications
  - Count unread messages
  - Return as info-level alerts
  - _Requirements: 4.5_



- [x] 5. System Health Monitoring Implementation



  - Implement getSystemHealth service method for Super Admin only
  - Create GET /dashboard/system-health endpoint with system:* permission guard
  - Calculate cron job success rate, email delivery rate, active users count
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 6. Revenue Analytics Implementation





  - Implement getRevenueData service method with date range filtering
  - Create GET /dashboard/revenue endpoint with startDate and endDate query parameters
  - Default to last 30 days if no date range provided
  - Calculate daily revenue, average order value, and revenue by category
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 7. Sales Analytics Implementation





  - Implement getSalesData service method with date range filtering
  - Create GET /dashboard/sales endpoint with startDate and endDate query parameters
  - Return top 10 selling products ranked by quantity sold
  - Aggregate sales by product category
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 8. Inventory Monitoring Implementation





  - Implement getInventoryData service method
  - Create GET /dashboard/inventory endpoint
  - Return products where quantity <= reorder threshold
  - Return products where quantity = 0 as out of stock
  - Calculate total inventory value
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_



- [x] 9. Content Management Metrics Implementation






  - Implement getContentMetrics service method for Admin role
  - Create GET /dashboard/content endpoint
  - Return blog post counts grouped by status
  - Return 5 most recently published blog posts
  - Return custom pages count and landing pages count
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 10. User Management Metrics Implementation





  - Implement getUserMetrics service method for Super Admin and Admin roles
  - Create GET /dashboard/users endpoint
  - Return total users count, active users count, new registrations today
  - Return user counts grouped by role
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

-

- [x] 11. Frontend Dashboard Data Context




  - Create DashboardDataContext for sharing dashboard data across widgets
  - Implement data fetching on mount with loading and error states
  - Provide refresh function for manual data updates
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

- [x] 11.1 Create Dashboard Data Context


  - Create `frontend/src/contexts/DashboardDataContext.tsx` with context and provider
  - Define DashboardDataContextValue interface with stats, activity, alerts, loading, error, refresh
  - Implement useEffect to fetch data on mount
  - Implement refresh function that re-fetches all dashboard data
  - _Requirements: 20.1, 20.2, 20.3, 20.4_


- [x] 11.2 Create useDashboardData Hook
  - Create `frontend/src/hooks/useDashboardData.ts` hook to consume context
  - Return stats, recentActivity, alerts, loading, error, and refresh function
  - Throw error if used outside DashboardDataProvider
  - _Requirements: 20.1, 20.2_

- [x] 12. Frontend API Client Methods




  - Add DashboardApi class to frontend/src/lib/api.ts
  - Implement all dashboard API methods with proper error handling
  - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_

- [x] 12.1 Implement Dashboard API Methods

  - Add getStats() method for GET /dashboard/stats
  - Add getRecentActivity(limit) method for GET /dashboard/recent-activity
  - Add getAlerts() method for GET /dashboard/alerts
  - Add getSystemHealth() method for GET /dashboard/system-health
  - Add getRevenue(startDate, endDate) method for GET /dashboard/revenue
  - Add getSales(startDate, endDate) method for GET /dashboard/sales
  - Add getInventory() method for GET /dashboard/inventory
  - Add getContent() method for GET /dashboard/content
  - Add getUsers() method for GET /dashboard/users
  - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_

- [x] 13. Frontend TypeScript Types




  - Create comprehensive TypeScript interfaces for all dashboard data structures
  - Ensure type safety across frontend components
  - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_

- [x] 13.1 Create Dashboard Types


  - Create `frontend/src/types/dashboard.ts` with all interfaces
  - Define DashboardStats interface matching backend DTO
  - Define Activity interface matching backend DTO
  - Define Alert interface matching backend DTO
  - Define RevenueData, SalesData, InventoryData, ContentMetrics, UserMetrics interfaces
  - Define SystemHealth interface for Super Admin metrics

  - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_

- [x] 14. System Widgets for Super Admin




  - Create widget components for system monitoring and health
  - Display cron job status, email delivery, and security alerts
  - _Requirements: 11.1, 11.2, 11.10, 11.11, 11.12_


- [x] 14.1 Create SystemHealthCard Widget

  - Create `frontend/src/components/widgets/dashboard/SystemHealthCard.tsx`
  - Display cron job success rate with percentage and trend
  - Display email delivery rate with percentage and trend
  - Display system uptime with duration
  - Use Card component with theme colors
  - Show loading skeleton while fetching data
  - Show error message if data fetch fails
  - _Requirements: 11.1, 11.10, 11.11_


- [x] 14.2 Create CronJobsStatus Widget

  - Create `frontend/src/components/widgets/dashboard/CronJobsStatus.tsx`
  - Display table of recent cron job executions
  - Show job name, status (success/failure), execution time, duration
  - Use color-coded badges for status (green for success, red for failure)
  - Limit to last 10 executions
  - _Requirements: 11.1, 11.10, 11.11_


- [x] 14.3 Create EmailDeliveryStats Widget

  - Create `frontend/src/components/widgets/dashboard/EmailDeliveryStats.tsx`
  - Display email sent count, delivered count, failed count
  - Show delivery rate percentage with trend
  - Use mini bar chart for visual representation
  - _Requirements: 11.1, 11.10, 11.11_


- [x] 14.4 Create SecurityAlerts Widget

  - Create `frontend/src/components/widgets/dashboard/SecurityAlerts.tsx`
  - Display list of security alerts (failed logins, suspicious activity)
  - Show alert severity with color-coded icons
  - Include timestamp and description
  - Provide action button to view details
  - _Requirements: 11.1, 11.10, 11.11_

- [x] 15. Business Widgets for Admin and Manager







  - Create widget components for business metrics
  - Display revenue, orders, customers, and inventory data
  - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.10, 11.11, 11.12_


- [x] 15.1 Create RevenueCard Widget





  - Create `frontend/src/components/widgets/dashboard/RevenueCard.tsx`
  - Display revenue today with formatted currency
  - Show percentage change from yesterday with trend arrow
  - Use green for positive change, red for negative
  - Display revenue this month as secondary metric
  - _Requirements: 11.2, 11.10, 11.11_


- [x] 15.2 Create OrdersCard Widget

  - Create `frontend/src/components/widgets/dashboard/OrdersCard.tsx`
  - Display total orders count
  - Show orders by status with color-coded badges (pending: yellow, processing: blue, completed: green, cancelled: red)
  - Use grid layout for status breakdown
  - _Requirements: 11.3, 11.10, 11.11_


- [x] 15.3 Create CustomersCard Widget

  - Create `frontend/src/components/widgets/dashboard/CustomersCard.tsx`
  - Display new customers today with count
  - Show trend compared to yesterday
  - Display total customers as secondary metric
  - Use user icon and theme colors
  - _Requirements: 11.4, 11.10, 11.11_


- [x] 15.4 Create InventoryAlertsCard Widget

  - Create `frontend/src/components/widgets/dashboard/InventoryAlertsCard.tsx`
  - Display low stock products count with alert badge
  - Show out of stock products count
  - Use warning colors (yellow/orange) for low stock
  - Provide link to inventory management page
  - _Requirements: 11.5, 11.10, 11.11_


- [x] 16. Chart Widgets for Analytics





  - Create chart widgets using recharts library
  - Display revenue trends, sales distribution, and product performance
  - _Requirements: 11.6, 11.7, 11.10, 11.11, 11.12_


- [x] 16.1 Create RevenueChart Widget

  - Create `frontend/src/components/widgets/dashboard/RevenueChart.tsx`
  - Use recharts LineChart to display revenue over time
  - Show daily revenue for last 30 days
  - Include tooltip with date and revenue amount
  - Use responsive container with height 300px on mobile, 400px on desktop
  - Apply theme colors to chart lines and axes
  - _Requirements: 11.6, 11.10, 11.11, 14.5_


- [x] 16.2 Create SalesByCategoryChart Widget

  - Create `frontend/src/components/widgets/dashboard/SalesByCategoryChart.tsx`
  - Use recharts PieChart to display sales distribution by category
  - Show category name and percentage in legend
  - Use distinct colors for each category
  - Include tooltip with category name and revenue
  - _Requirements: 11.7, 11.10, 11.11, 14.5_


- [x] 16.3 Create OrderStatusChart Widget

  - Create `frontend/src/components/widgets/dashboard/OrderStatusChart.tsx`
  - Use recharts BarChart to display orders by status
  - Show status on x-axis, count on y-axis
  - Use color-coded bars matching status badges
  - Include tooltip with status and count
  - _Requirements: 11.10, 11.11, 14.5_



- [x] 16.4 Create TopProductsChart Widget

  - Create `frontend/src/components/widgets/dashboard/TopProductsChart.tsx`
  - Use recharts BarChart (horizontal) to display top 10 products
  - Show product name on y-axis, quantity sold on x-axis
  - Include tooltip with product name, quantity, and revenue
  - Truncate long product names with ellipsis
  - _Requirements: 11.10, 11.11, 14.5_

- [x] 17. Table Widgets for Data Display





  - Create table widgets for displaying recent records
  - Show orders, low stock products, customers, and blog posts
  - _Requirements: 11.8, 11.10, 11.11, 11.12_


- [x] 17.1 Create RecentOrdersTable Widget

  - Create `frontend/src/components/widgets/dashboard/RecentOrdersTable.tsx`
  - Display table with columns: Order ID, Customer, Status, Total, Date
  - Show last 10 orders sorted by date descending
  - Use color-coded status badges
  - Format currency and dates properly
  - Enable horizontal scroll on mobile
  - _Requirements: 11.8, 11.10, 11.11, 14.2_


- [x] 17.2 Create LowStockTable Widget

  - Create `frontend/src/components/widgets/dashboard/LowStockTable.tsx`
  - Display table with columns: Product, SKU, Current Stock, Reorder Threshold, Price
  - Show products where quantity <= reorder threshold
  - Highlight products with quantity = 0 in red
  - Sort by quantity ascending
  - Provide link to product edit page
  - _Requirements: 11.10, 11.11, 14.2_


- [x] 17.3 Create RecentCustomersTable Widget

  - Create `frontend/src/components/widgets/dashboard/RecentCustomersTable.tsx`
  - Display table with columns: Name, Email, Phone, Registration Date
  - Show last 10 customers sorted by registration date descending
  - Format dates properly
  - Provide link to customer profile
  - _Requirements: 11.10, 11.11, 14.2_


- [x] 17.4 Create RecentPostsTable Widget

  - Create `frontend/src/components/widgets/dashboard/RecentPostsTable.tsx`
  - Display table with columns: Title, Author, Status, Published Date
  - Show last 10 blog posts sorted by date descending
  - Use color-coded status badges (draft: gray, published: green)
  - Provide link to post edit page
  - _Requirements: 11.10, 11.11, 14.2_

- [x] 18. Personal Widgets for User Role








  - Create widget components for personal user data
  - Display notifications, messages, and profile information

  - _Requirements: 11.10, 11.11, 11.12_

- [x] 18.1 Create PersonalStatsCard Widget

  - Create `frontend/src/components/widgets/dashboard/PersonalStatsCard.tsx`
  - Display unread notifications count with icon
  - Display unread messages count with icon
  - Display file uploads count with icon
  - Use grid layout with 3 columns
  - Apply theme colors and hover effects
  - _Requirements: 11.10, 11.11_


- [x] 18.2 Create NotificationsFeed Widget

  - Create `frontend/src/components/widgets/dashboard/NotificationsFeed.tsx`
  - Display list of recent notifications (last 10)
  - Show notification title, message, and timestamp
  - Use relative time format (e.g., "2 hours ago")
  - Highlight unread notifications with bold text
  - Provide link to full notifications page
  - _Requirements: 11.10, 11.11_


- [x] 18.3 Create MessagesFeed Widget

  - Create `frontend/src/components/widgets/dashboard/MessagesFeed.tsx`
  - Display list of recent messages (last 10)
  - Show sender name, message preview, and timestamp
  - Use relative time format
  - Highlight unread messages with bold text
  - Provide link to full messages page
  - _Requirements: 11.10, 11.11_

- [x] 18.4 Create ProfileSummaryCard Widget


  - Create `frontend/src/components/widgets/dashboard/ProfileSummaryCard.tsx`
  - Display user avatar, name, and email
  - Show profile completion percentage with progress bar
  - Display user role badge
  - Provide link to profile edit page
  - _Requirements: 11.10, 11.11_

- [x] 19. Action Widgets




  - Create widgets for quick actions and alerts
  - Display role-specific action buttons and dismissible alerts
  - _Requirements: 11.10, 11.11, 11.12, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

- [x] 19.1 Create QuickActionsGrid Widget


  - Create `frontend/src/components/widgets/dashboard/QuickActionsGrid.tsx`
  - Display grid of action buttons based on user role
  - Super Admin: Manage Cron Jobs, View Email Logs, System Settings, Manage Users
  - Admin: Create Product, New Blog Post, Manage Orders, Upload Media
  - Manager: Fulfill Orders, Adjust Inventory, Add Product, Manage Customers
  - User: Edit Profile, View Messages, Upload Files, View Notifications
  - Use responsive grid (2 columns mobile, 3 tablet, 4 desktop)
  - Include icon and label for each action
  - Navigate to corresponding page on click
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_


- [x] 19.2 Create AlertsPanel Widget

  - Create `frontend/src/components/widgets/dashboard/AlertsPanel.tsx`
  - Display list of alerts from dashboard context
  - Show alert severity with color-coded icons (info: blue, warning: yellow, error: red, critical: red)
  - Include alert title, message, and timestamp
  - Provide action button if actionUrl is present
  - Allow dismissing alerts if dismissible is true
  - _Requirements: 11.10, 11.11_



- [x] 20. Update Dashboard Pages



  - Integrate dashboard data context and widgets into existing dashboard pages
  - Add refresh functionality and date range picker
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 20.1 Update Main Dashboard Page


  - Update `frontend/src/app/dashboard/page.tsx` to wrap content in DashboardDataProvider
  - Add DashboardRefreshButton to PageHeader actions
  - Keep existing DashboardGrid and WidgetLibrary components
  - Ensure widgets receive data from context
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_


- [x] 20.2 Create Dashboard Refresh Button

  - Create `frontend/src/components/dashboard/DashboardRefreshButton.tsx`
  - Display refresh icon button in PageHeader
  - Call refresh function from dashboard context on click
  - Show loading spinner while refreshing
  - Disable button during refresh to prevent duplicate requests
  - Show success toast on successful refresh
  - Show error toast on failed refresh
  - _Requirements: 13.2, 13.3, 13.4, 13.5_


- [x] 20.3 Update Analytics Dashboard Page

  - Update `frontend/src/app/dashboard/analytics/page.tsx` to wrap content in DashboardDataProvider
  - Add DateRangePicker component to PageHeader actions
  - Pass dateRange prop to DashboardDataProvider
  - Add DashboardRefreshButton to PageHeader actions
  - Display analytics-specific widgets (charts and graphs)
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_


- [x] 20.4 Create Date Range Picker Component

  - Create `frontend/src/components/dashboard/DateRangePicker.tsx`
  - Use shadcn/ui Calendar component for date selection
  - Default to last 30 days
  - Provide preset options (Last 7 days, Last 30 days, Last 90 days, This month, Last month)
  - Call onChange callback when date range changes
  - Display selected range in button label
  - _Requirements: 17.2, 17.3_

- [x] 21. Widget Registry Seeding




  - Create seed data for dashboard widget definitions
  - Seed default widget instances for each user role
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 21.1 Create Dashboard Widgets Seed File


  - Create `backend/prisma/seed-data/dashboard-widgets.seed.ts`
  - Define widget definitions for all dashboard widgets (25+ widgets)
  - Include key, name, description, component, category, permissions, defaultSpan for each widget
  - System widgets: system-health-card, cron-jobs-status, email-delivery-stats, security-alerts
  - Business widgets: revenue-card, orders-card, customers-card, inventory-alerts-card
  - Chart widgets: revenue-chart, sales-by-category-chart, order-status-chart, top-products-chart
  - Table widgets: recent-orders-table, low-stock-table, recent-customers-table, recent-posts-table
  - Personal widgets: personal-stats-card, notifications-feed, messages-feed, profile-summary-card
  - Action widgets: quick-actions-grid, alerts-panel
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_


- [x] 21.2 Create Default Widget Instances by Role

  - Add function to seed default widget instances for each user role
  - Super Admin: SystemHealthCard, RevenueCard, OrdersCard, CustomersCard, CronJobsStatus, EmailDeliveryStats, RevenueChart, RecentOrdersTable, SecurityAlerts, QuickActionsGrid
  - Admin: RevenueCard, OrdersCard, CustomersCard, InventoryAlertsCard, RecentOrdersTable, LowStockTable, RevenueChart, SalesByCategoryChart, RecentPostsTable, QuickActionsGrid
  - Manager: OrdersCard, InventoryAlertsCard, RevenueCard, RecentOrdersTable, LowStockTable, TopProductsChart, SalesByCategoryChart, QuickActionsGrid
  - User: PersonalStatsCard, NotificationsFeed, MessagesFeed, ProfileSummaryCard, QuickActionsGrid
  - Assign position and span values for logical layout
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_


- [x] 21.3 Update Main Seed Script

  - Update `backend/prisma/seed.ts` to import and call dashboard widgets seed function
  - Ensure seed runs after users are created
  - Handle errors gracefully if widgets already exist
  - _Requirements: 12.7_

- [x] 22. Database Performance Optimization




  - Add database indexes for frequently queried fields
  - Optimize queries with Prisma aggregations
  - _Requirements: 15.7_

- [x] 22.1 Add Database Indexes


  - Create migration to add composite index on orders (status, createdAt)
  - Create index on orders (createdAt)
  - Create composite index on inventory (quantity, reorderThreshold)
  - Create index on customers (createdAt)
  - Create index on blog_posts (status, createdAt)
  - Create index on cron_logs (createdAt, status)
  - Create index on email_logs (createdAt, status)
  - Run migration: `npx prisma migrate dev --name add_dashboard_indexes`
  - _Requirements: 15.7_

- [x] 23. Metadata and SEO Configuration




  - Add metadata configuration for dashboard pages
  - Configure robots directives to prevent indexing
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [x] 23.1 Update Metadata Config

  - Update `frontend/src/lib/metadata-config.ts` to add dashboard page metadata
  - Add '/dashboard' with title "Dashboard", description "Your personalized dashboard overview", robots "noindex, follow"
  - Add '/dashboard/analytics' with title "Analytics", description "Detailed analytics and insights", robots "noindex, follow"
  - Include breadcrumb configuration for both pages
  - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [x] 24. Mobile Responsive Design





  - Ensure all widgets are mobile-responsive
  - Implement responsive grid layouts
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_


- [x] 24.1 Implement Responsive Grid Layouts

  - Update DashboardGrid to use responsive Tailwind classes
  - Mobile (< 768px): grid-cols-1, all widgets span 12
  - Tablet (768-1023px): grid-cols-2, widgets span 6 or 12
  - Desktop (>= 1024px): grid-cols-4, widgets span 3, 6, or 12
  - Test all widgets at each breakpoint
  - _Requirements: 14.1, 14.2, 14.3_


- [x] 24.2 Optimize Widgets for Mobile

  - Add horizontal scroll to tables on mobile
  - Reduce chart heights on mobile (300px vs 400px desktop)
  - Stack card content vertically on mobile
  - Use 2-column grid for quick actions on mobile
  - Adjust text sizes with responsive classes (text-sm md:text-base)
  - Adjust padding with responsive classes (p-2 md:p-4)
  - _Requirements: 14.4, 14.5, 14.6_

- [x] 25. Performance Optimization Implementation





  - Implement caching on backend
  - Add lazy loading and memoization on frontend

  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [x] 25.1 Implement Backend Caching

  - Install @nestjs/cache-manager package
  - Configure CacheModule in DashboardModule with 5-minute TTL
  - Add caching to getStatsForRole method with key pattern `dashboard:stats:${userId}:${role}`
  - Add caching to getRecentActivity method
  - Add caching to getAlerts method
  - _Requirements: 15.1_



- [x] 25.2 Optimize Database Queries

  - Use Prisma aggregation functions (_sum, _count, _avg) instead of multiple queries
  - Batch related queries with Promise.all
  - Use groupBy for status-based counts
  - Limit query results to necessary fields with select

  - _Requirements: 15.2, 15.3_

- [x] 25.3 Implement Frontend Performance Optimizations

  - Lazy load chart library with React.lazy and Suspense
  - Memoize widget components with React.memo
  - Memoize expensive calculations with useMemo
  - Memoize callbacks with useCallback
  - Use React Query for API caching with 5-minute stale time
  - _Requirements: 15.4, 15.5, 15.6_

- [x] 26. Backend Testing






  - Write unit tests for dashboard service methods
  - Write integration tests for dashboard controller endpoints

  - _Requirements: All backend requirements_

- [x]* 26.1 Write Dashboard Service Unit Tests

  - Test getStatsForRole returns correct data for each role
  - Test Super Admin stats include system metrics
  - Test Admin stats exclude system metrics
  - Test Manager stats exclude blog metrics
  - Test User stats include only personal metrics
  - Test getRecentActivity filters by role correctly
  - Test getAlerts generates appropriate alerts by role
  - Test getSystemHealth requires Super Admin role
  - Test revenue, sales, inventory, content, user metrics calculations
  - _Requirements: All backend requirements_

- [x]* 26.2 Write Dashboard Controller Integration Tests

  - Test GET /dashboard/stats returns 401 without authentication
  - Test GET /dashboard/stats returns 200 with valid JWT token
  - Test GET /dashboard/stats returns role-appropriate data
  - Test GET /dashboard/system-health returns 403 for non-Super Admin
  - Test GET /dashboard/system-health returns 200 for Super Admin
  - Test all other endpoints with authentication and authorization
  - Test query parameters are handled correctly
  - Test error responses for invalid requests
  - _Requirements: All backend requirements_

- [ ]* 27. Frontend Testing
  - Write component tests for all widgets
  - Test loading, error, and empty states
  - _Requirements: All frontend requirements_

- [ ]* 27.1 Write Widget Component Tests
  - Test each widget renders loading skeleton when loading is true
  - Test each widget renders data correctly when data is provided
  - Test each widget renders error state when error is present
  - Test each widget renders empty state when data is empty
  - Test RevenueCard displays formatted currency and percentage change
  - Test OrdersCard displays status badges with correct colors
  - Test charts render with correct data
  - Test tables render rows with correct data
  - Test QuickActionsGrid displays role-appropriate actions
  - Test mobile responsive behavior
  - _Requirements: All frontend requirements_

- [ ]* 27.2 Write Dashboard Page Tests
  - Test DashboardPage wraps content in DashboardDataProvider
  - Test DashboardRefreshButton calls refresh function on click
  - Test DashboardRefreshButton shows loading spinner while refreshing
  - Test DateRangePicker updates date range on selection
  - Test AnalyticsDashboardPage passes dateRange to provider
  - Test error handling displays error message
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 17.1, 17.2, 17.3_

- [ ]* 28. End-to-End Testing
  - Test complete dashboard workflow for each role
  - Verify data flows from backend to frontend correctly
  - _Requirements: All requirements_

- [ ]* 28.1 Write E2E Tests for Dashboard
  - Test Super Admin can view system health metrics
  - Test Admin can view business metrics but not system metrics
  - Test Manager can view operational metrics
  - Test User can view only personal metrics
  - Test refresh button updates dashboard data
  - Test date range picker filters analytics data
  - Test quick actions navigate to correct pages
  - Test widgets display correct data from API
  - Test mobile responsive layout works correctly
  - _Requirements: All requirements_
