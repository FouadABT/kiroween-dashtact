'use client';

import React, { useState } from 'react';
import { QuickActions, FilterPanel, SearchBar, NotificationWidget } from './index';
import { Plus, Edit, Trash, Download, Upload, Settings } from 'lucide-react';

/**
 * QuickActions Examples
 */
export function QuickActionsExamples() {
  const actions = [
    {
      id: 'create',
      label: 'Create New',
      icon: Plus,
      onClick: () => console.log('Create clicked'),
      variant: 'default' as const,
      permission: 'posts:write',
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: () => console.log('Edit clicked'),
      variant: 'secondary' as const,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash,
      onClick: () => console.log('Delete clicked'),
      variant: 'destructive' as const,
      permission: 'posts:delete',
    },
    {
      id: 'download',
      label: 'Download',
      icon: Download,
      onClick: () => console.log('Download clicked'),
      variant: 'outline' as const,
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: Upload,
      onClick: () => console.log('Upload clicked'),
      variant: 'outline' as const,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => console.log('Settings clicked'),
      variant: 'ghost' as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Horizontal Layout</h3>
        <QuickActions actions={actions} layout="horizontal" />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Vertical Layout</h3>
        <QuickActions actions={actions} layout="vertical" />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Grid Layout (3 columns)</h3>
        <QuickActions actions={actions} layout="grid" columns={3} />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Grid Layout (4 columns)</h3>
        <QuickActions actions={actions} layout="grid" columns={4} />
      </div>
    </div>
  );
}

/**
 * FilterPanel Examples
 */
export function FilterPanelExamples() {
  const filters = [
    {
      id: 'search',
      label: 'Search',
      type: 'text' as const,
      defaultValue: '',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
      ],
    },
    {
      id: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Technology', value: 'tech' },
        { label: 'Business', value: 'business' },
        { label: 'Design', value: 'design' },
      ],
    },
    {
      id: 'date',
      label: 'Created Date',
      type: 'date' as const,
    },
    {
      id: 'price',
      label: 'Price Range',
      type: 'range' as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Filter Panel</h3>
        <FilterPanel
          filters={filters}
          defaultOpen={true}
          onFilterChange={(filters) => console.log('Filters changed:', filters)}
        />
      </div>
    </div>
  );
}

/**
 * SearchBar Examples
 */
export function SearchBarExamples() {
  const suggestions = [
    { id: '1', label: 'John Doe', value: 'john' },
    { id: '2', label: 'Jane Smith', value: 'jane' },
    { id: '3', label: 'Bob Johnson', value: 'bob' },
    { id: '4', label: 'Alice Williams', value: 'alice' },
    { id: '5', label: 'Charlie Brown', value: 'charlie' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Simple Search Bar</h3>
        <SearchBar
          placeholder="Search users..."
          onSearch={(query) => console.log('Search:', query)}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Search Bar with Suggestions</h3>
        <SearchBar
          placeholder="Search users..."
          onSearch={(query) => console.log('Search:', query)}
          suggestions={suggestions}
          showSuggestions={true}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Custom Debounce (500ms)</h3>
        <SearchBar
          placeholder="Search with 500ms debounce..."
          onSearch={(query) => console.log('Search:', query)}
          debounceMs={500}
        />
      </div>
    </div>
  );
}

/**
 * NotificationWidget Examples
 */
export function NotificationWidgetExamples() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Success',
      message: 'Your changes have been saved successfully',
      type: 'success' as const,
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      title: 'Warning',
      message: 'Your session will expire in 5 minutes',
      type: 'warning' as const,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      read: false,
    },
    {
      id: '3',
      title: 'Error',
      message: 'Failed to upload file. Please try again.',
      type: 'error' as const,
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      read: false,
    },
    {
      id: '4',
      title: 'Information',
      message: 'New features are now available',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: true,
    },
    {
      id: '5',
      title: 'Update Available',
      message: 'A new version of the app is available',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      read: true,
    },
  ]);

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDismissAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: unknown) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Notification Widget (Top Position)</h3>
        <NotificationWidget
          notifications={notifications}
          maxVisible={5}
          position="top"
          onDismiss={handleDismiss}
          onDismissAll={handleDismissAll}
          onNotificationClick={handleNotificationClick}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Notification Widget (Bottom Position)</h3>
        <NotificationWidget
          notifications={notifications.slice(0, 3)}
          maxVisible={3}
          position="bottom"
          onDismiss={handleDismiss}
          onDismissAll={handleDismissAll}
        />
      </div>
    </div>
  );
}

/**
 * Combined Example - Search with Filters
 */
export function CombinedExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  const filterConfig = [
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      id: 'date',
      label: 'Date',
      type: 'date' as const,
    },
  ];

  const actions = [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: () => console.log('Export with filters:', { searchQuery, filters }),
      variant: 'outline' as const,
    },
    {
      id: 'create',
      label: 'Create New',
      icon: Plus,
      onClick: () => console.log('Create new'),
      variant: 'default' as const,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Combined: Search + Filters + Actions</h3>
      
      <SearchBar
        placeholder="Search..."
        onSearch={setSearchQuery}
      />
      
      <FilterPanel
        filters={filterConfig}
        onFilterChange={setFilters}
      />
      
      <QuickActions actions={actions} layout="horizontal" />
      
      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-2 font-semibold">Current State:</h4>
        <pre className="text-xs">
          {JSON.stringify({ searchQuery, filters }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
