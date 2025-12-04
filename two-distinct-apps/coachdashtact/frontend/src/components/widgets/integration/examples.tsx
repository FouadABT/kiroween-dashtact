'use client';

import React, { useState } from 'react';
import {
  ApiWidget,
  PermissionWrapper,
  InlinePermissionWrapper,
  ThemePreview,
  InlineThemePreview,
  ExportButton,
  BulkActions,
  CompactBulkActions,
} from './index';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash, Download, Mail, Edit, Archive } from 'lucide-react';

/**
 * Integration Widgets Examples
 * 
 * Demonstrates usage of all integration helper components
 */

// Example 1: ApiWidget
export function ApiWidgetExample() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ApiWidget Examples</h3>

      {/* Basic API widget */}
      <ApiWidget<{ total: number; active: number }>
        title="User Statistics"
        endpoint="/api/stats/users"
        render={(data, refresh) => (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data.total || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{data.active || 0}</p>
              </div>
            </div>
            <Button onClick={refresh} size="sm" variant="outline">
              Refresh Data
            </Button>
          </div>
        )}
      />

      {/* API widget with auto-refresh */}
      <ApiWidget<{ cpu: number; memory: number }>
        title="Live Metrics"
        endpoint="/api/metrics/live"
        refreshInterval={30000} // Refresh every 30 seconds
        permission="metrics:read"
        render={(data) => (
          <div className="text-sm">
            <p>CPU: {data.cpu}%</p>
            <p>Memory: {data.memory}%</p>
            <p className="text-xs text-muted-foreground mt-2">
              Auto-refreshes every 30 seconds
            </p>
          </div>
        )}
      />

      {/* API widget with transform */}
      <ApiWidget<Array<{ description: string }>>
        title="Recent Activity"
        endpoint="/api/activity/recent"
        transform={(data) => {
          const items = (data as { items: Array<{ description: string }> }).items;
          return items.slice(0, 5);
        }}
        render={(items) => (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="text-sm">
                {item.description}
              </li>
            ))}
          </ul>
        )}
      />
    </div>
  );
}

// Example 2: PermissionWrapper
export function PermissionWrapperExample() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">PermissionWrapper Examples</h3>

      {/* Single permission */}
      <PermissionWrapper permission="users:read">
        <Card className="p-4">
          <p>This content requires users:read permission</p>
        </Card>
      </PermissionWrapper>

      {/* Multiple permissions (require all) */}
      <PermissionWrapper
        permission={['users:read', 'users:write']}
        requireAll={true}
      >
        <Card className="p-4">
          <p>This content requires both users:read AND users:write</p>
        </Card>
      </PermissionWrapper>

      {/* Multiple permissions (require any) */}
      <PermissionWrapper
        permission={['users:admin', 'users:write']}
        requireAll={false}
      >
        <Card className="p-4">
          <p>This content requires users:admin OR users:write</p>
        </Card>
      </PermissionWrapper>

      {/* Custom access denied message */}
      <PermissionWrapper
        permission="admin:access"
        accessDeniedMessage="Only administrators can access this feature. Please contact support for access."
      >
        <Card className="p-4">
          <p>Admin-only content</p>
        </Card>
      </PermissionWrapper>

      {/* Inline permission wrapper (no fallback UI) */}
      <div className="flex gap-2">
        <Button>Always Visible</Button>
        <InlinePermissionWrapper permission="users:delete">
          <Button variant="destructive">Delete (requires permission)</Button>
        </InlinePermissionWrapper>
      </div>
    </div>
  );
}

// Example 3: ThemePreview
export function ThemePreviewExample() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ThemePreview Examples</h3>

      {/* Basic theme preview */}
      <ThemePreview
        title="Button Component"
        description="Standard button in different themes"
        component={<Button>Click me</Button>}
        code={`<Button>Click me</Button>`}
      />

      {/* Theme preview with variants */}
      <ThemePreview
        title="Button Variants"
        description="All button variants"
        variants={[
          {
            label: 'Default',
            component: <Button>Default</Button>,
            code: '<Button>Default</Button>',
          },
          {
            label: 'Secondary',
            component: <Button variant="secondary">Secondary</Button>,
            code: '<Button variant="secondary">Secondary</Button>',
          },
          {
            label: 'Outline',
            component: <Button variant="outline">Outline</Button>,
            code: '<Button variant="outline">Outline</Button>',
          },
          {
            label: 'Destructive',
            component: <Button variant="destructive">Destructive</Button>,
            code: '<Button variant="destructive">Destructive</Button>',
          },
        ]}
      />

      {/* Inline theme preview */}
      <div className="flex items-center gap-4">
        <span className="text-sm">Quick preview:</span>
        <InlineThemePreview
          component={<Button size="sm">Example</Button>}
          code="<Button size='sm'>Example</Button>"
        />
      </div>
    </div>
  );
}

// Example 4: ExportButton
export function ExportButtonExample() {
  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">ExportButton Examples</h3>

      {/* Basic export button */}
      <div className="flex gap-2">
        <ExportButton
          data={sampleData}
          filename="users-export"
          formats={['csv', 'json']}
        />
      </div>

      {/* Export with permission */}
      <div className="flex gap-2">
        <ExportButton
          data={sampleData}
          filename="users"
          formats={['csv', 'json', 'excel']}
          permission="users:export"
        />
      </div>

      {/* Icon only export button */}
      <div className="flex gap-2">
        <ExportButton
          data={sampleData}
          formats={['csv']}
          iconOnly
          size="icon"
        />
      </div>

      {/* Custom export handler */}
      <div className="flex gap-2">
        <ExportButton
          data={sampleData}
          filename="custom-export"
          formats={['csv', 'json']}
          onExport={async (format, data) => {
            console.log(`Exporting ${data.length} items as ${format}`);
            // Custom export logic here
            alert(`Custom export: ${format} format with ${data.length} items`);
          }}
        />
      </div>
    </div>
  );
}

// Example 5: BulkActions
export function BulkActionsExample() {
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]);

  const handleDelete = async (ids: string[] | number[]) => {
    console.log('Deleting items:', ids);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Deleted ${ids.length} items`);
    setSelectedIds([]);
  };

  const handleExport = (ids: string[] | number[]) => {
    console.log('Exporting items:', ids);
    alert(`Exported ${ids.length} items`);
  };

  const handleEmail = (ids: string[] | number[]) => {
    console.log('Sending email to:', ids);
    alert(`Sent email to ${ids.length} users`);
  };

  const handleArchive = async (ids: string[] | number[]) => {
    console.log('Archiving items:', ids);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Archived ${ids.length} items`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">BulkActions Examples</h3>

      {/* Basic bulk actions */}
      <BulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        actions={[
          {
            label: 'Delete',
            icon: <Trash className="w-4 h-4" />,
            onClick: handleDelete,
            variant: 'destructive',
            requireConfirm: true,
            confirmMessage: 'Are you sure you want to delete these items?',
          },
          {
            label: 'Export',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExport,
          },
        ]}
      />

      {/* Bulk actions with permissions */}
      <BulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        actions={[
          {
            label: 'Edit',
            icon: <Edit className="w-4 h-4" />,
            onClick: (ids) => alert(`Editing ${ids.length} items`),
            permission: 'users:write',
          },
          {
            label: 'Delete',
            icon: <Trash className="w-4 h-4" />,
            onClick: handleDelete,
            permission: 'users:delete',
            variant: 'destructive',
            requireConfirm: true,
          },
          {
            label: 'Send Email',
            icon: <Mail className="w-4 h-4" />,
            onClick: handleEmail,
            permission: 'users:email',
            inDropdown: true,
          },
          {
            label: 'Archive',
            icon: <Archive className="w-4 h-4" />,
            onClick: handleArchive,
            inDropdown: true,
          },
        ]}
      />

      {/* Compact bulk actions */}
      <CompactBulkActions
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        actions={[
          {
            label: 'Delete',
            icon: <Trash className="w-4 h-4" />,
            onClick: handleDelete,
            variant: 'destructive',
          },
          {
            label: 'Export',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExport,
          },
        ]}
      />

      {/* Sticky bulk actions */}
      <div className="h-64 overflow-auto border border-border rounded-lg p-4">
        <BulkActions
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          position="sticky"
          actions={[
            {
              label: 'Delete',
              icon: <Trash className="w-4 h-4" />,
              onClick: handleDelete,
              variant: 'destructive',
            },
          ]}
        />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="p-2 bg-muted rounded">
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Combined example
export function IntegrationWidgetsShowcase() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Integration Widgets</h2>
        <p className="text-muted-foreground">
          Helper components for API integration, permissions, theming, and data operations
        </p>
      </div>

      <ApiWidgetExample />
      <PermissionWrapperExample />
      <ThemePreviewExample />
      <ExportButtonExample />
      <BulkActionsExample />
    </div>
  );
}
