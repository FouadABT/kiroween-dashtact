# Requirements Document

## Introduction

This specification defines a role-based dashboard system that provides personalized data visualizations, metrics, and quick actions tailored to four distinct user roles: Super Admin, Admin, Manager, and User. The system leverages an existing widget infrastructure with drag-drop capabilities and extends it with role-specific data APIs, pre-configured widget layouts, and real-time business intelligence.

## Glossary

- **Dashboard System**: The web application interface that displays widgets, metrics, and visualizations
- **Widget**: A self-contained UI component that displays specific data or functionality
- **Widget Registry**: Database storage system for widget definitions and user configurations
- **Role**: A user classification that determines permissions and dashboard content (Super Admin, Admin, Manager, User)
- **Widget Instance**: A specific placement of a widget on a user's dashboard with position and configuration
- **Dashboard Page**: A named collection of widgets (e.g., "main-dashboard", "analytics-dashboard")
- **Quick Actions**: Role-specific shortcut buttons for common tasks
- **Business Metrics**: Quantitative measurements of business performance (revenue, orders, inventory)
- **System Metrics**: Technical measurements of application health (cron jobs, email delivery, uptime)
- **Data Aggregation**: The process of combining multiple data sources into summary statistics

## Requirements

### Requirement 1: Role-Based Dashboard Data Access

**User Story:** As a user with a specific role, I want to see dashboard metrics relevant to my responsibilities, so that I can focus on information pertinent to my job function.

#### Acceptance Criteria

1. WHEN a Super Admin views the dashboard, THE Dashboard System SHALL display system health metrics, cron job statistics, email delivery rates, and all business metrics
2. WHEN an Admin views the dashboard, THE Dashboard System SHALL display business metrics including revenue, orders, inventory levels, customer counts, and blog statistics
3. WHEN a Manager views the dashboard, THE Dashboard System SHALL display operational metrics including orders, inventory, sales data, and customer activity
4. WHEN a User views the dashboard, THE Dashboard System SHALL display personal metrics including notification counts, message counts, file uploads, and profile information
5. WHERE a user lacks permissions for specific metrics, THE Dashboard System SHALL exclude those metrics from the response

### Requirement 2: Dashboard Statistics API

**User Story:** As a dashboard page, I want to fetch aggregated statistics through a REST API, so that I can display current data to the user.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/stats` that returns role-appropriate statistics
2. WHEN the stats endpoint receives a request, THE Dashboard System SHALL authenticate the user using JWT tokens
3. WHEN calculating statistics, THE Dashboard System SHALL aggregate data from orders, products, inventory, customers, blog posts, cron logs, and email logs tables
4. THE Dashboard System SHALL return revenue totals for today and the current month
5. THE Dashboard System SHALL return order counts grouped by status (pending, processing, completed, cancelled)
6. WHERE inventory quantity falls below the reorder threshold, THE Dashboard System SHALL include the product in low stock counts
7. THE Dashboard System SHALL return customer registration counts for today
8. WHERE the user role is Super Admin, THE Dashboard System SHALL include cron job success rates calculated from cron_logs
9. WHERE the user role is Super Admin, THE Dashboard System SHALL include email delivery rates calculated from email_logs

### Requirement 3: Recent Activity Feed

**User Story:** As a user, I want to see recent activity relevant to my role, so that I can stay informed about important events.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/recent-activity` that returns role-filtered activity
2. THE Dashboard System SHALL accept a query parameter `limit` with a default value of 10 and maximum value of 50
3. WHEN a Super Admin requests activity, THE Dashboard System SHALL return system events, cron executions, email sends, and user actions
4. WHEN an Admin requests activity, THE Dashboard System SHALL return orders, blog posts, customer registrations, and product updates
5. WHEN a Manager requests activity, THE Dashboard System SHALL return orders, inventory adjustments, and customer activity
6. WHEN a User requests activity, THE Dashboard System SHALL return only their own notifications, messages, and file uploads
7. THE Dashboard System SHALL order activity items by timestamp in descending order
8. THE Dashboard System SHALL include the activity type, description, timestamp, and related entity identifier in each activity item

### Requirement 4: Alert System

**User Story:** As a user, I want to receive alerts about issues requiring my attention, so that I can respond to problems promptly.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/alerts` that returns role-specific alerts
2. WHEN a Super Admin requests alerts, THE Dashboard System SHALL return failed cron jobs, email failures, system errors, and security alerts
3. WHEN an Admin requests alerts, THE Dashboard System SHALL return low inventory warnings, pending orders, and failed payments
4. WHEN a Manager requests alerts, THE Dashboard System SHALL return low inventory warnings and orders requiring fulfillment
5. WHEN a User requests alerts, THE Dashboard System SHALL return unread notification counts and unread message counts
6. WHERE a cron job has failed in the last 24 hours, THE Dashboard System SHALL include it in Super Admin alerts
7. WHERE inventory quantity is below the reorder threshold, THE Dashboard System SHALL include the product in inventory alerts
8. THE Dashboard System SHALL include alert severity (info, warning, error, critical) in each alert item

### Requirement 5: System Health Monitoring

**User Story:** As a Super Admin, I want to monitor system health metrics, so that I can ensure the application is functioning correctly.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/system-health` restricted to Super Admin role
2. THE Dashboard System SHALL enforce the `system:*` permission for the system health endpoint
3. THE Dashboard System SHALL calculate cron job success rate as successful executions divided by total executions in the last 24 hours
4. THE Dashboard System SHALL calculate email delivery rate as delivered emails divided by total email attempts in the last 24 hours
5. THE Dashboard System SHALL return the count of active users who logged in within the last 30 days
6. THE Dashboard System SHALL return database connection status
7. WHERE a user without Super Admin role attempts to access system health, THE Dashboard System SHALL return a 403 Forbidden response

### Requirement 6: Revenue Analytics

**User Story:** As an Admin or Manager, I want to view revenue trends over time, so that I can analyze business performance.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/revenue` that returns revenue data
2. THE Dashboard System SHALL accept query parameters `startDate` and `endDate` in ISO 8601 format
3. WHERE no date range is provided, THE Dashboard System SHALL default to the last 30 days
4. THE Dashboard System SHALL aggregate daily revenue from completed orders within the date range
5. THE Dashboard System SHALL calculate average order value as total revenue divided by order count
6. THE Dashboard System SHALL group revenue by product category
7. THE Dashboard System SHALL return order count trends alongside revenue data
8. WHERE the user role is User, THE Dashboard System SHALL return a 403 Forbidden response

### Requirement 7: Sales Analytics

**User Story:** As an Admin or Manager, I want to analyze sales data by product and category, so that I can identify top performers.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/sales` that returns sales analytics
2. THE Dashboard System SHALL accept query parameters `startDate` and `endDate` in ISO 8601 format
3. THE Dashboard System SHALL return the top 10 selling products ranked by quantity sold
4. THE Dashboard System SHALL aggregate sales by product category
5. THE Dashboard System SHALL calculate product performance metrics including total quantity sold and total revenue
6. THE Dashboard System SHALL include product name, SKU, category, quantity sold, and revenue for each top product
7. WHERE the user role is User, THE Dashboard System SHALL return a 403 Forbidden response

### Requirement 8: Inventory Monitoring

**User Story:** As an Admin or Manager, I want to monitor inventory levels, so that I can prevent stockouts and manage reordering.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/inventory` that returns inventory metrics
2. THE Dashboard System SHALL return products where quantity is less than or equal to the reorder threshold
3. THE Dashboard System SHALL return products where quantity equals zero as out of stock items
4. THE Dashboard System SHALL calculate total inventory value as sum of (quantity × price) for all products
5. THE Dashboard System SHALL include product name, SKU, current quantity, reorder threshold, and price for each low stock item
6. THE Dashboard System SHALL order low stock items by quantity in ascending order
7. WHERE the user role is User, THE Dashboard System SHALL return a 403 Forbidden response

### Requirement 9: Content Management Metrics

**User Story:** As an Admin, I want to view content metrics for blog posts and pages, so that I can track content production.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/content` that returns content metrics
2. THE Dashboard System SHALL return blog post counts grouped by status (draft, published, archived)
3. THE Dashboard System SHALL return the 5 most recently published blog posts with title, author, and publish date
4. THE Dashboard System SHALL return the total count of custom pages
5. THE Dashboard System SHALL return the count of active landing pages
6. WHERE the user role is Manager or User, THE Dashboard System SHALL return a 403 Forbidden response

### Requirement 10: User Management Metrics

**User Story:** As a Super Admin or Admin, I want to view user metrics, so that I can monitor user growth and engagement.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a GET endpoint at `/dashboard/users` that returns user metrics
2. THE Dashboard System SHALL return the total count of registered users
3. THE Dashboard System SHALL return the count of active users who logged in within the last 30 days
4. THE Dashboard System SHALL return the count of new user registrations today
5. THE Dashboard System SHALL return user counts grouped by role (Super Admin, Admin, Manager, User)
6. WHERE the user role is Manager or User, THE Dashboard System SHALL return a 403 Forbidden response

### Requirement 11: Dashboard Widget Components

**User Story:** As a dashboard page, I want to render pre-built widget components, so that I can display data in a consistent and visually appealing manner.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a SystemHealthCard widget component that displays cron job success rate, email delivery rate, and uptime
2. THE Dashboard System SHALL provide a RevenueCard widget component that displays revenue today with percentage change from yesterday
3. THE Dashboard System SHALL provide a OrdersCard widget component that displays order counts by status with color-coded badges
4. THE Dashboard System SHALL provide a CustomersCard widget component that displays new customer count with trend indicator
5. THE Dashboard System SHALL provide a InventoryAlertsCard widget component that displays low stock product count with alert badge
6. THE Dashboard System SHALL provide a RevenueChart widget component that renders a line chart of revenue over time using recharts library
7. THE Dashboard System SHALL provide a SalesByCategoryChart widget component that renders a pie chart of sales distribution
8. THE Dashboard System SHALL provide a RecentOrdersTable widget component that displays the last 10 orders with status, customer, and total
9. THE Dashboard System SHALL provide a LowStockTable widget component that displays products below threshold with stock levels
10. WHEN a widget receives no data, THE Dashboard System SHALL display an empty state message
11. WHEN a widget is loading data, THE Dashboard System SHALL display a skeleton loading state
12. WHEN a widget encounters an error, THE Dashboard System SHALL display an error message with retry option

### Requirement 12: Default Widget Layouts

**User Story:** As a new user, I want to see a pre-configured dashboard layout appropriate for my role, so that I can immediately access relevant information without manual setup.

#### Acceptance Criteria

1. WHEN a Super Admin first accesses the dashboard, THE Dashboard System SHALL create default widget instances including SystemHealthCard, RevenueCard, OrdersCard, CustomersCard, CronJobsStatus, EmailDeliveryStats, RevenueChart, RecentOrdersTable, SecurityAlerts, and QuickActionsGrid
2. WHEN an Admin first accesses the dashboard, THE Dashboard System SHALL create default widget instances including RevenueCard, OrdersCard, CustomersCard, InventoryAlertsCard, RecentOrdersTable, LowStockTable, RevenueChart, SalesByCategoryChart, RecentPostsTable, and QuickActionsGrid
3. WHEN a Manager first accesses the dashboard, THE Dashboard System SHALL create default widget instances including OrdersCard, InventoryAlertsCard, RevenueCard, RecentOrdersTable, LowStockTable, TopProductsChart, SalesByCategoryChart, and QuickActionsGrid
4. WHEN a User first accesses the dashboard, THE Dashboard System SHALL create default widget instances including PersonalStatsCard, NotificationsFeed, MessagesFeed, ProfileSummaryCard, and QuickActionsGrid
5. THE Dashboard System SHALL assign position values to default widgets to create a logical layout
6. THE Dashboard System SHALL assign grid span values to default widgets (3, 6, or 12 columns)
7. THE Dashboard System SHALL store default widget instances in the Widget Registry database

### Requirement 13: Dashboard Data Refresh

**User Story:** As a user, I want to manually refresh dashboard data, so that I can see the most current information.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a refresh button in the dashboard page header
2. WHEN the refresh button is clicked, THE Dashboard System SHALL re-fetch all dashboard statistics from the API
3. WHILE refreshing, THE Dashboard System SHALL display a loading spinner on the refresh button
4. WHEN the refresh completes successfully, THE Dashboard System SHALL update all widget data
5. WHEN the refresh fails, THE Dashboard System SHALL display an error toast notification
6. THE Dashboard System SHALL disable the refresh button during the refresh operation to prevent duplicate requests

### Requirement 14: Mobile Responsive Dashboard

**User Story:** As a mobile user, I want to view the dashboard on my phone, so that I can access information on the go.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768 pixels, THE Dashboard System SHALL display widgets in a single column layout
2. WHEN the viewport width is between 768 and 1023 pixels, THE Dashboard System SHALL display widgets in a two-column layout
3. WHEN the viewport width is 1024 pixels or greater, THE Dashboard System SHALL display widgets in a four-column layout
4. WHEN displaying tables on mobile, THE Dashboard System SHALL enable horizontal scrolling
5. WHEN displaying charts on mobile, THE Dashboard System SHALL reduce chart height to fit smaller screens
6. THE Dashboard System SHALL use responsive text sizes that scale appropriately for each breakpoint

### Requirement 15: Dashboard Performance Optimization

**User Story:** As a user, I want the dashboard to load quickly, so that I can access information without delay.

#### Acceptance Criteria

1. THE Dashboard System SHALL cache dashboard statistics on the backend with a 5-minute time-to-live
2. THE Dashboard System SHALL use Prisma aggregation functions for calculating counts and sums
3. THE Dashboard System SHALL batch related database queries to minimize round trips
4. THE Dashboard System SHALL lazy load chart libraries only when chart widgets are rendered
5. THE Dashboard System SHALL memoize widget components to prevent unnecessary re-renders
6. THE Dashboard System SHALL use React Query for frontend caching with a 5-minute stale time
7. WHERE database indexes do not exist on frequently queried fields, THE Dashboard System SHALL create indexes on created_at, updated_at, status, and user_id columns

### Requirement 16: Quick Actions by Role

**User Story:** As a user, I want quick access to common actions for my role, so that I can perform tasks efficiently.

#### Acceptance Criteria

1. WHEN a Super Admin views quick actions, THE Dashboard System SHALL display buttons for Manage Cron Jobs, View Email Logs, System Settings, and Manage Users
2. WHEN an Admin views quick actions, THE Dashboard System SHALL display buttons for Create Product, New Blog Post, Manage Orders, and Upload Media
3. WHEN a Manager views quick actions, THE Dashboard System SHALL display buttons for Fulfill Orders, Adjust Inventory, Add Product, and Manage Customers
4. WHEN a User views quick actions, THE Dashboard System SHALL display buttons for Edit Profile, View Messages, Upload Files, and View Notifications
5. WHEN a quick action button is clicked, THE Dashboard System SHALL navigate to the corresponding page
6. THE Dashboard System SHALL display quick action buttons in a responsive grid layout

### Requirement 17: Analytics Dashboard Page

**User Story:** As an Admin or Manager, I want to view detailed analytics with charts and graphs, so that I can perform in-depth analysis.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide an analytics dashboard page at `/dashboard/analytics`
2. THE Dashboard System SHALL display a date range picker with a default range of the last 30 days
3. WHEN the date range changes, THE Dashboard System SHALL re-fetch analytics data for the new range
4. THE Dashboard System SHALL display RevenueChart, SalesByCategoryChart, OrderStatusChart, and TopProductsChart widgets for Admin and Manager roles
5. WHERE the user role is Super Admin, THE Dashboard System SHALL additionally display CronJobsStatus, EmailDeliveryStats, UserMetricsChart, and ContentMetricsChart widgets
6. WHERE the user role is User, THE Dashboard System SHALL display PersonalActivityChart, FileUsageChart, and NotificationHistoryChart widgets
7. THE Dashboard System SHALL provide an export button for downloading analytics data (future feature placeholder)

### Requirement 18: Dashboard Module Integration

**User Story:** As the application, I want the dashboard module to integrate with existing modules, so that dashboard routes are accessible.

#### Acceptance Criteria

1. THE Dashboard System SHALL create a DashboardModule in the backend at `backend/src/dashboard/dashboard.module.ts`
2. THE Dashboard System SHALL import PrismaModule in DashboardModule to enable database access
3. THE Dashboard System SHALL import PermissionsModule in DashboardModule to enable permission guards
4. THE Dashboard System SHALL register DashboardModule in the application root module at `backend/src/app.module.ts`
5. WHERE DashboardModule is not imported in the root module, THE Dashboard System SHALL return 404 Not Found for all dashboard endpoints

### Requirement 19: Dashboard Metadata and SEO

**User Story:** As a search engine, I want appropriate metadata for dashboard pages, so that I can properly index or exclude them.

#### Acceptance Criteria

1. THE Dashboard System SHALL configure metadata for `/dashboard` with title "Dashboard", description "Your personalized dashboard overview", and robots directive "noindex, follow"
2. THE Dashboard System SHALL configure metadata for `/dashboard/analytics` with title "Analytics", description "Detailed analytics and insights", and robots directive "noindex, follow"
3. THE Dashboard System SHALL include breadcrumb configuration with label "Dashboard" for the main dashboard page
4. THE Dashboard System SHALL include breadcrumb configuration with label "Analytics" for the analytics page

### Requirement 20: Widget Data Context

**User Story:** As a widget component, I want to access dashboard data through a shared context, so that I can display information without individual API calls.

#### Acceptance Criteria

1. THE Dashboard System SHALL provide a DashboardDataContext that stores fetched dashboard statistics
2. THE Dashboard System SHALL fetch dashboard data once when the dashboard page mounts
3. THE Dashboard System SHALL make dashboard data available to all widget components through the context
4. WHEN the refresh button is clicked, THE Dashboard System SHALL update the context data
5. THE Dashboard System SHALL provide loading and error states in the context
6. WHERE a widget requires data not in the context, THE Dashboard System SHALL allow the widget to fetch additional data independently
