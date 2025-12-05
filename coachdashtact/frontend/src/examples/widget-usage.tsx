/**
 * Widget Usage Examples
 * 
 * Simple, correct examples demonstrating how to use each widget.
 * These examples match the actual widget implementations.
 */

'use client';

import React from 'react';
import {
  StatsCard,
  StatsGrid,
  ActivityFeed,
  MetricCard,
  ProgressWidget,
  ListWidget,
  QuickActions,
  FilterPanel,
  SearchBar,
} from '@/components/widgets';
import { Users, DollarSign, ShoppingCart, Plus, Edit, Trash } from 'lucide-react';
import type { StatItem, ActivityItem, ListItem, FilterConfig } from '@/components/widgets/types/widget.types';

// ============================================================================
// CORE WIDGETS
// ============================================================================

export function StatsCardExample() {
  return (
    <StatsCard
      title="Total Users"
      value={1234}
      icon={Users}
      trend={{ value: 12, direction: 'up', period: 'vs last month' }}
    />
  );
}

export function StatsGridExample() {
  const stats: StatItem[] = [
    {
      title: 'Total Users',
      value: 1234,
      icon: Users,
      trend: { value: 12, direction: 'up' },
    },
    {
      title: 'Revenue',
      value: '$45,678',
      icon: DollarSign,
      trend: { value: 8, direction: 'up' },
    },
    {
      title: 'Orders',
      value: 89,
      icon: ShoppingCart,
      trend: { value: 5, direction: 'down' },
    },
  ];

  return <StatsGrid stats={stats} columns={3} />;
}

export function ActivityFeedExample() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'User registered',
      description: 'John Doe created an account',
      timestamp: new Date(Date.now() - 3600000),
      type: 'info',
    },
    {
      id: '2',
      title: 'Order placed',
      description: 'Order #1234 was placed',
      timestamp: new Date(Date.now() - 7200000),
      type: 'success',
    },
  ];

  return <ActivityFeed activities={activities} maxItems={10} />;
}

// ============================================================================
// DATA DISPLAY WIDGETS
// ============================================================================

export function MetricCardExample() {
  return (
    <MetricCard
      label="Total Revenue"
      value={45678}
      format="currency"
      currency="USD"
      icon={DollarSign}
      comparison={{
        previousValue: 40000,
        percentageChange: 14.2,
        period: 'vs last month',
      }}
      color="success"
    />
  );
}

export function ProgressWidgetExample() {
  return (
    <ProgressWidget
      title="Project Completion"
      current={75}
      max={100}
      variant="bar"
      showPercentage
    />
  );
}

export function ListWidgetExample() {
  const items: ListItem[] = [
    { id: '1', title: 'Dashboard', icon: Users, description: '1,234 views' },
    { id: '2', title: 'Users', icon: Users, description: '567 active' },
    { id: '3', title: 'Orders', icon: ShoppingCart, description: '89 pending' },
  ];

  return (
    <ListWidget
      title="Quick Stats"
      items={items}
      onItemClick={(item) => console.log('Clicked:', item)}
      maxHeight="300px"
    />
  );
}

// ============================================================================
// INTERACTIVE WIDGETS
// ============================================================================

export function QuickActionsExample() {
  const actions = [
    {
      id: 'create',
      label: 'Create',
      icon: Plus,
      onClick: () => console.log('Create clicked'),
      variant: 'default' as const,
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
    },
  ];

  return <QuickActions actions={actions} layout="horizontal" />;
}

export function FilterPanelExample() {
  const filterConfig: FilterConfig[] = [
    {
      id: 'search',
      label: 'Search',
      type: 'text',
      defaultValue: '',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      id: 'date',
      label: 'Date',
      type: 'date',
    },
  ];

  return (
    <FilterPanel
      filters={filterConfig}
      onFilterChange={(filters) => console.log('Filters changed:', filters)}
    />
  );
}

export function SearchBarExample() {
  return (
    <SearchBar
      placeholder="Search..."
      onSearch={(query) => console.log('Search:', query)}
    />
  );
}

// ============================================================================
// COMPLETE DASHBOARD EXAMPLE
// ============================================================================

export function CompleteDashboardExample() {
  const stats: StatItem[] = [
    { title: 'Total Users', value: 1234, icon: Users, trend: { value: 12, direction: 'up' } },
    { title: 'Revenue', value: '$45,678', icon: DollarSign, trend: { value: 8, direction: 'up' } },
    { title: 'Orders', value: 89, icon: ShoppingCart, trend: { value: 5, direction: 'down' } },
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'User registered',
      description: 'John Doe created an account',
      timestamp: new Date(Date.now() - 3600000),
      type: 'info',
    },
    {
      id: '2',
      title: 'Order placed',
      description: 'Order #1234 was placed',
      timestamp: new Date(Date.now() - 7200000),
      type: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <StatsGrid stats={stats} columns={3} />

      {/* Activity Feed */}
      <ActivityFeed activities={activities} maxItems={5} />
    </div>
  );
}
