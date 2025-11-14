/**
 * Core Widgets Usage Examples
 * 
 * This file demonstrates how to use the core widget components.
 */

import React from "react";
import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import {
  StatsCard,
  StatsGrid,
  DataTable,
  ChartWidget,
  ActivityFeed,
} from "./index";
import { ColumnDef } from "@tanstack/react-table";

// ============================================================================
// StatsCard Examples
// ============================================================================

export function StatsCardExample() {
  return (
    <div className="space-y-4">
      {/* Basic StatsCard */}
      <StatsCard title="Total Users" value={1234} />

      {/* StatsCard with icon */}
      <StatsCard
        title="Revenue"
        value="$45,678"
        icon={DollarSign}
        color="primary"
      />

      {/* StatsCard with trend */}
      <StatsCard
        title="Active Users"
        value={2543}
        icon={Users}
        trend={{ value: 12, direction: "up", period: "vs last month" }}
        color="success"
      />

      {/* StatsCard with permission */}
      <StatsCard
        title="Admin Stats"
        value={999}
        icon={TrendingUp}
        permission="analytics:read"
      />
    </div>
  );
}

// ============================================================================
// StatsGrid Examples
// ============================================================================

export function StatsGridExample() {
  const stats = [
    {
      title: "Total Users",
      value: 1234,
      icon: Users,
      trend: { value: 12, direction: "up" as const },
    },
    {
      title: "Revenue",
      value: "$45,678",
      icon: DollarSign,
      trend: { value: 8, direction: "up" as const },
      color: "primary",
    },
    {
      title: "Orders",
      value: 567,
      icon: ShoppingCart,
      trend: { value: 3, direction: "down" as const },
    },
  ];

  return (
    <div className="space-y-8">
      {/* 3-column grid */}
      <StatsGrid stats={stats} columns={3} />

      {/* 4-column grid */}
      <StatsGrid stats={stats} columns={4} />

      {/* With loading state */}
      <StatsGrid stats={stats} columns={2} loading={true} />
    </div>
  );
}

// ============================================================================
// DataTable Examples
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function DataTableExample() {
  const users: User[] = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "Manager" },
  ];

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Basic table */}
      <DataTable data={users} columns={columns} />

      {/* Table with search and pagination */}
      <DataTable
        data={users}
        columns={columns}
        searchable={true}
        pagination={true}
        title="User Management"
      />

      {/* Table with row actions */}
      <DataTable
        data={users}
        columns={columns}
        actions={(row) => (
          <button onClick={() => console.log("Edit", row)}>Edit</button>
        )}
      />
    </div>
  );
}

// ============================================================================
// ChartWidget Examples
// ============================================================================

export function ChartWidgetExample() {
  const lineData = [
    { month: "Jan", revenue: 4000, expenses: 2400 },
    { month: "Feb", revenue: 3000, expenses: 1398 },
    { month: "Mar", revenue: 5000, expenses: 3800 },
    { month: "Apr", revenue: 4500, expenses: 3908 },
    { month: "May", revenue: 6000, expenses: 4800 },
  ];

  const pieData = [
    { name: "Product A", value: 400 },
    { name: "Product B", value: 300 },
    { name: "Product C", value: 200 },
    { name: "Product D", value: 100 },
  ];

  return (
    <div className="space-y-8">
      {/* Line chart */}
      <ChartWidget
        type="line"
        title="Revenue Trend"
        data={lineData}
        config={{
          xAxisKey: "month",
          dataKeys: ["revenue", "expenses"],
          showLegend: true,
          showTooltip: true,
        }}
      />

      {/* Bar chart */}
      <ChartWidget
        type="bar"
        title="Monthly Comparison"
        data={lineData}
        config={{
          xAxisKey: "month",
          dataKeys: ["revenue", "expenses"],
          showLegend: true,
        }}
      />

      {/* Pie chart */}
      <ChartWidget
        type="pie"
        title="Product Distribution"
        data={pieData}
        config={{
          dataKeys: ["value"],
          showLegend: true,
        }}
        height={400}
      />

      {/* Area chart */}
      <ChartWidget
        type="area"
        title="Growth Over Time"
        data={lineData}
        config={{
          xAxisKey: "month",
          dataKeys: ["revenue"],
          showGrid: true,
        }}
      />
    </div>
  );
}

// ============================================================================
// ActivityFeed Examples
// ============================================================================

export function ActivityFeedExample() {
  // Use fixed dates for examples
  const activities = [
    {
      id: "1",
      type: "user_created",
      title: "New user registered",
      description: "John Doe joined the platform",
      timestamp: new Date("2024-01-15T10:30:00"), // Fixed date
      user: {
        name: "John Doe",
        avatar: "/avatars/john.jpg",
      },
    },
    {
      id: "2",
      type: "post_created",
      title: "New post published",
      description: "Jane Smith published a new article",
      timestamp: new Date("2024-01-15T09:00:00"), // Fixed date
      user: {
        name: "Jane Smith",
        avatar: "/avatars/jane.jpg",
      },
    },
    {
      id: "3",
      type: "comment_added",
      title: "New comment",
      description: "Bob Johnson commented on your post",
      timestamp: new Date("2024-01-14T15:00:00"), // Fixed date
      user: {
        name: "Bob Johnson",
      },
      metadata: {
        postId: "123",
        commentId: "456",
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Basic activity feed */}
      <ActivityFeed activities={activities} />

      {/* Activity feed with date grouping */}
      <ActivityFeed
        title="Recent Activity"
        activities={activities}
        groupByDate={true}
      />

      {/* Activity feed with limited items */}
      <ActivityFeed
        activities={activities}
        maxItems={2}
        showMoreButton={true}
      />

      {/* Activity feed with permission */}
      <ActivityFeed
        title="Admin Activity"
        activities={activities}
        permission="activity:read"
      />
    </div>
  );
}
