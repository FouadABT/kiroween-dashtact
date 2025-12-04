'use client';

import { useEffect } from 'react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageHeader } from '@/components/widgets/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMetadata } from '@/contexts/MetadataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Import widget examples
import {
  StatsCardExample,
  StatsGridExample,
  DataTableExample,
  ChartWidgetExample,
  ActivityFeedExample,
} from '@/components/widgets/core/examples';

import {
  MetricCardExamples,
  ProgressWidgetExamples,
  ListWidgetExamples,
  CardGridExamples,
} from '@/components/widgets/data-display/examples';

import {
  QuickActionsExamples,
  FilterPanelExamples,
  SearchBarExamples,
  NotificationWidgetExamples,
} from '@/components/widgets/interactive/examples';

import {
  PageHeaderBasicExample,
  EmptyStateBasicExample,
  ErrorBoundaryBasicExample,
  SkeletonLoaderTextExample,
} from '@/components/widgets/layout/examples';

import {
  FormCardExample,
  DateRangePickerExample,
  MultiSelectExample,
  FileUploadExample,
} from '@/components/widgets/forms/examples';

import {
  UtilityWidgetsExamples,
} from '@/components/widgets/utility/examples';

import {
  KanbanBoardExample,
  CalendarExample,
  TreeViewExample,
  TimelineExample,
} from '@/components/widgets/advanced/examples';

import {
  UserCardExample,
  PricingCardExample,
  ComparisonTableExample,
  MapWidgetExample,
  ChatWidgetExample,
} from '@/components/widgets/specialized/examples';

import {
  ApiWidgetExample,
  PermissionWrapperExample,
  ThemePreviewExample,
  ExportButtonExample,
  BulkActionsExample,
} from '@/components/widgets/integration/examples';

/**
 * Widget category definitions
 */
interface WidgetCategory {
  id: string;
  name: string;
  description: string;
  widgets: WidgetDefinition[];
}

interface WidgetDefinition {
  name: string;
  description: string;
  component: React.ComponentType;
  code: string;
}

const categories: WidgetCategory[] = [
  {
    id: 'core',
    name: 'Core Widgets',
    description: 'Essential widgets for building dashboard interfaces',
    widgets: [
      {
        name: 'StatsCard',
        description: 'Display single metrics with icons, values, and trend indicators',
        component: StatsCardExample,
        code: `<StatsCard
  title="Total Users"
  value={1234}
  icon={Users}
  trend={{ value: 12, direction: 'up' }}
/>`,
      },
      {
        name: 'StatsGrid',
        description: 'Responsive grid layout for multiple stat cards',
        component: StatsGridExample,
        code: `<StatsGrid
  stats={[
    { title: 'Users', value: 1234, icon: Users },
    { title: 'Revenue', value: '$45,678', icon: DollarSign }
  ]}
  columns={3}
/>`,
      },
      {
        name: 'DataTable',
        description: 'Advanced table with search, sort, filter, and pagination',
        component: DataTableExample,
        code: `<DataTable
  data={users}
  columns={columns}
  searchable={true}
  pagination={true}
/>`,
      },
      {
        name: 'ChartWidget',
        description: 'Visualize data with line, bar, pie, and area charts',
        component: ChartWidgetExample,
        code: `<ChartWidget
  type="line"
  data={chartData}
  config={{
    xAxisKey: 'month',
    dataKeys: ['revenue', 'expenses']
  }}
/>`,
      },
      {
        name: 'ActivityFeed',
        description: 'Timeline of user activities and events',
        component: ActivityFeedExample,
        code: `<ActivityFeed
  activities={activities}
  groupByDate={true}
  maxItems={10}
/>`,
      },
    ],
  },
  {
    id: 'data-display',
    name: 'Data Display',
    description: 'Widgets for displaying data and metrics',
    widgets: [
      {
        name: 'MetricCard',
        description: 'Display metrics with comparisons and formatting',
        component: MetricCardExamples,
        code: `<MetricCard
  label="Revenue"
  value={45678}
  format="currency"
  comparison={{ previousValue: 40000 }}
/>`,
      },
      {
        name: 'ProgressWidget',
        description: 'Show progress with bar or circle variants',
        component: ProgressWidgetExamples,
        code: `<ProgressWidget
  title="Storage Used"
  current={75}
  max={100}
  variant="bar"
/>`,
      },
      {
        name: 'ListWidget',
        description: 'Display lists of items with icons and actions',
        component: ListWidgetExamples,
        code: `<ListWidget
  title="Recent Activities"
  items={items}
  onItemClick={handleClick}
/>`,
      },
      {
        name: 'CardGrid',
        description: 'Responsive grid for custom card layouts',
        component: CardGridExamples,
        code: `<CardGrid
  items={products}
  columns={3}
  renderCard={(item) => <ProductCard {...item} />}
/>`,
      },
    ],
  },
  {
    id: 'interactive',
    name: 'Interactive Widgets',
    description: 'User interaction and input widgets',
    widgets: [
      {
        name: 'QuickActions',
        description: 'Action buttons with permission checks',
        component: QuickActionsExamples,
        code: `<QuickActions
  actions={[
    { id: 'create', label: 'Create', icon: Plus, onClick: handleCreate }
  ]}
  layout="horizontal"
/>`,
      },
      {
        name: 'FilterPanel',
        description: 'Collapsible filter panel with multiple filter types',
        component: FilterPanelExamples,
        code: `<FilterPanel
  filters={filterConfig}
  onFilterChange={handleFilterChange}
/>`,
      },
      {
        name: 'SearchBar',
        description: 'Debounced search with suggestions',
        component: SearchBarExamples,
        code: `<SearchBar
  placeholder="Search..."
  onSearch={handleSearch}
  suggestions={suggestions}
/>`,
      },
      {
        name: 'NotificationWidget',
        description: 'Display and manage notifications',
        component: NotificationWidgetExamples,
        code: `<NotificationWidget
  notifications={notifications}
  onDismiss={handleDismiss}
/>`,
      },
    ],
  },
  {
    id: 'layout',
    name: 'Layout Widgets',
    description: 'Structural components for page layouts',
    widgets: [
      {
        name: 'PageHeader',
        description: 'Page title with breadcrumbs and actions',
        component: PageHeaderBasicExample,
        code: `<PageHeader
  title="Dashboard"
  description="Welcome back"
  breadcrumbs={breadcrumbs}
/>`,
      },
      {
        name: 'EmptyState',
        description: 'Display when no data is available',
        component: EmptyStateBasicExample,
        code: `<EmptyState
  icon={Inbox}
  title="No items"
  description="Get started by creating a new item"
/>`,
      },
      {
        name: 'ErrorBoundary',
        description: 'Catch and display React errors gracefully',
        component: ErrorBoundaryBasicExample,
        code: `<ErrorBoundary fallback={<ErrorMessage />}>
  <YourComponent />
</ErrorBoundary>`,
      },
      {
        name: 'SkeletonLoader',
        description: 'Loading placeholders for various content types',
        component: SkeletonLoaderTextExample,
        code: `<SkeletonLoader
  variant="card"
  count={3}
/>`,
      },
    ],
  },
  {
    id: 'forms',
    name: 'Form Widgets',
    description: 'Form components with validation',
    widgets: [
      {
        name: 'FormCard',
        description: 'Card wrapper for forms with actions',
        component: FormCardExample,
        code: `<FormCard
  title="User Profile"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
>
  {/* Form fields */}
</FormCard>`,
      },
      {
        name: 'DateRangePicker',
        description: 'Select date ranges with presets',
        component: DateRangePickerExample,
        code: `<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  presets={['today', 'last7days']}
/>`,
      },
      {
        name: 'MultiSelect',
        description: 'Searchable multi-option selection',
        component: MultiSelectExample,
        code: `<MultiSelect
  options={options}
  value={selected}
  onChange={setSelected}
/>`,
      },
      {
        name: 'FileUpload',
        description: 'Drag-and-drop file upload with validation',
        component: FileUploadExample,
        code: `<FileUpload
  accept="image/*"
  maxSize={5242880}
  onUpload={handleUpload}
/>`,
      },
    ],
  },
  {
    id: 'utility',
    name: 'Utility Widgets',
    description: 'Small reusable UI components',
    widgets: [
      {
        name: 'Utility Widgets',
        description: 'Badge, Avatar, Tooltip, and Modal components',
        component: UtilityWidgetsExamples,
        code: `<Badge variant="success">Active</Badge>

<Avatar
  src="/avatar.jpg"
  alt="John Doe"
  fallback="JD"
/>

<Tooltip content="Click to edit">
  <Button>Edit</Button>
</Tooltip>

<Modal
  open={isOpen}
  onClose={handleClose}
  title="Confirm Action"
>
  {/* Modal content */}
</Modal>`,
      },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced Widgets',
    description: 'Complex interactive components',
    widgets: [
      {
        name: 'KanbanBoard',
        description: 'Drag-and-drop task board',
        component: KanbanBoardExample,
        code: `<KanbanBoard
  columns={columns}
  onMove={handleMove}
/>`,
      },
      {
        name: 'Calendar',
        description: 'Event calendar with multiple views',
        component: CalendarExample,
        code: `<Calendar
  events={events}
  view="month"
  onEventClick={handleEventClick}
/>`,
      },
      {
        name: 'TreeView',
        description: 'Hierarchical data display',
        component: TreeViewExample,
        code: `<TreeView
  data={treeData}
  onNodeClick={handleNodeClick}
/>`,
      },
      {
        name: 'Timeline',
        description: 'Chronological event display',
        component: TimelineExample,
        code: `<Timeline
  events={events}
  orientation="vertical"
/>`,
      },
    ],
  },
  {
    id: 'specialized',
    name: 'Specialized Widgets',
    description: 'Domain-specific components',
    widgets: [
      {
        name: 'UserCard',
        description: 'User profile display card',
        component: UserCardExample,
        code: `<UserCard
  user={user}
  actions={actions}
/>`,
      },
      {
        name: 'PricingCard',
        description: 'Pricing plan display',
        component: PricingCardExample,
        code: `<PricingCard
  plan={plan}
  features={features}
  highlighted={true}
/>`,
      },
      {
        name: 'ComparisonTable',
        description: 'Feature comparison grid',
        component: ComparisonTableExample,
        code: `<ComparisonTable
  features={features}
  plans={plans}
/>`,
      },
      {
        name: 'MapWidget',
        description: 'Interactive map with markers',
        component: MapWidgetExample,
        code: `<MapWidget
  center={[lat, lng]}
  markers={markers}
/>`,
      },
      {
        name: 'ChatWidget',
        description: 'Chat interface with messages',
        component: ChatWidgetExample,
        code: `<ChatWidget
  messages={messages}
  onSend={handleSend}
/>`,
      },
    ],
  },
  {
    id: 'integration',
    name: 'Integration Helpers',
    description: 'Widgets for API and system integration',
    widgets: [
      {
        name: 'ApiWidget',
        description: 'Fetch and display API data',
        component: ApiWidgetExample,
        code: `<ApiWidget
  endpoint="/api/stats"
  refreshInterval={30000}
  render={(data) => <Stats data={data} />}
/>`,
      },
      {
        name: 'PermissionWrapper',
        description: 'Wrap components with permission checks',
        component: PermissionWrapperExample,
        code: `<PermissionWrapper permission="admin:access">
  <AdminPanel />
</PermissionWrapper>`,
      },
      {
        name: 'ThemePreview',
        description: 'Preview components in different themes',
        component: ThemePreviewExample,
        code: `<ThemePreview>
  <YourComponent />
</ThemePreview>`,
      },
      {
        name: 'ExportButton',
        description: 'Export data in multiple formats',
        component: ExportButtonExample,
        code: `<ExportButton
  data={data}
  format="csv"
  filename="export"
/>`,
      },
      {
        name: 'BulkActions',
        description: 'Actions for selected items',
        component: BulkActionsExample,
        code: `<BulkActions
  selectedIds={selectedIds}
  actions={actions}
/>`,
      },
    ],
  },
];

/**
 * Widget Gallery Page
 * 
 * Displays all available widgets organized by category with live examples and code snippets.
 * Requires "widgets:admin" permission to access.
 */
export default function WidgetGalleryPage() {
  const { updateMetadata } = useMetadata();

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: "Widgets",
      description: "Browse and manage dashboard widgets",
      keywords: ["widgets", "components", "dashboard"],
    });
  }, [updateMetadata]);

  return (
    <PermissionGuard permission="widgets:admin">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <PageHeader
          title="Widget Gallery"
          description="Explore the complete library of 40+ reusable, theme-aware, and permission-controlled UI components"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Widgets', href: '/dashboard/widgets' },
          ]}
        />

        <div className="mt-8">
          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 mb-8">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs lg:text-sm">
                  {category.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                  <Separator />
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {category.widgets.map((widget) => (
                    <Card key={widget.name} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{widget.name}</CardTitle>
                            <CardDescription className="mt-2">
                              {widget.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{category.name}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Live Example */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                            Live Example
                          </h4>
                          <div className="rounded-lg border bg-muted/30 p-6">
                            <widget.component />
                          </div>
                        </div>

                        {/* Code Snippet */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                            Usage
                          </h4>
                          <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
                            <code className="text-sm">{widget.code}</code>
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </PermissionGuard>
  );
}
