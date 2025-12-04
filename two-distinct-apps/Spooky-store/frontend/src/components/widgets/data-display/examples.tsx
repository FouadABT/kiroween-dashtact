/**
 * Data Display Widgets - Usage Examples
 * 
 * This file contains example implementations of all data display widgets.
 * Use these as reference when implementing widgets in your application.
 */

import React from "react";
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Bell,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ProgressWidget } from "./ProgressWidget";
import { ListWidget } from "./ListWidget";
import { CardGrid } from "./CardGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * MetricCard Examples
 */
export function MetricCardExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Currency format with comparison */}
      <MetricCard
        label="Total Revenue"
        value={45678}
        format="currency"
        currency="USD"
        icon={DollarSign}
        comparison={{
          previousValue: 40000,
          percentageChange: 14.2,
          period: "vs last month",
        }}
        color="success"
      />

      {/* Number format with positive trend */}
      <MetricCard
        label="Active Users"
        value={1234}
        format="number"
        icon={Users}
        comparison={{
          previousValue: 1100,
          percentageChange: 12.2,
          period: "vs last week",
        }}
        color="primary"
      />

      {/* Percentage format */}
      <MetricCard
        label="Conversion Rate"
        value={3.5}
        format="percentage"
        icon={TrendingUp}
        description="Last 30 days"
        color="accent"
      />

      {/* With negative trend */}
      <MetricCard
        label="Cart Abandonment"
        value={24.5}
        format="percentage"
        icon={ShoppingCart}
        comparison={{
          previousValue: 28.0,
          percentageChange: -12.5,
          period: "vs last month",
        }}
        color="warning"
      />

      {/* Simple metric without comparison */}
      <MetricCard
        label="Total Orders"
        value={892}
        format="number"
        icon={ShoppingCart}
        description="This month"
        color="secondary"
      />

      {/* Large currency value */}
      <MetricCard
        label="Annual Revenue"
        value={1250000}
        format="currency"
        currency="USD"
        icon={DollarSign}
        comparison={{
          previousValue: 1100000,
          percentageChange: 13.6,
          period: "vs last year",
        }}
        color="success"
      />
    </div>
  );
}

/**
 * ProgressWidget Examples
 */
export function ProgressWidgetExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Bar variant with percentage */}
      <ProgressWidget
        title="Storage Used"
        current={75}
        max={100}
        variant="bar"
        label="GB"
        showPercentage
        showValue
        description="Cloud storage usage"
      />

      {/* Circle variant */}
      <ProgressWidget
        title="Project Completion"
        current={45}
        max={100}
        variant="circle"
        showValue={false}
        description="Tasks completed"
        color="primary"
      />

      {/* Bar with custom color */}
      <ProgressWidget
        title="Sales Target"
        current={8500}
        max={10000}
        variant="bar"
        showPercentage
        showValue
        color="success"
        description="Monthly goal"
      />

      {/* Circle with success color */}
      <ProgressWidget
        title="Course Progress"
        current={90}
        max={100}
        variant="circle"
        color="success"
        description="Lessons completed"
      />

      {/* Bar with warning color */}
      <ProgressWidget
        title="Disk Space"
        current={85}
        max={100}
        variant="bar"
        label="GB"
        showPercentage
        showValue
        color="warning"
        description="Server storage"
      />

      {/* Circle with accent color */}
      <ProgressWidget
        title="Profile Completion"
        current={60}
        max={100}
        variant="circle"
        color="accent"
        description="Complete your profile"
      />
    </div>
  );
}

/**
 * ListWidget Examples
 */
export function ListWidgetExamples() {
  const activities = [
    {
      id: "1",
      title: "User logged in",
      description: "2 minutes ago",
      icon: Users,
      metadata: { badge: "New" },
    },
    {
      id: "2",
      title: "File uploaded",
      description: "5 minutes ago",
      icon: FileText,
    },
    {
      id: "3",
      title: "Task completed",
      description: "10 minutes ago",
      icon: CheckCircle,
    },
    {
      id: "4",
      title: "Alert triggered",
      description: "15 minutes ago",
      icon: AlertCircle,
    },
    {
      id: "5",
      title: "New notification",
      description: "20 minutes ago",
      icon: Bell,
    },
  ];

  const notifications = [
    {
      id: "1",
      title: "New message from John",
      description: "Hey, can we schedule a meeting?",
      icon: Bell,
    },
    {
      id: "2",
      title: "Payment received",
      description: "$500 from Client ABC",
      icon: DollarSign,
    },
    {
      id: "3",
      title: "Report generated",
      description: "Monthly sales report is ready",
      icon: FileText,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* With click handler and chevron */}
      <ListWidget
        title="Recent Activities"
        items={activities}
        onItemClick={(item) => console.log("Clicked:", item)}
        showChevron
        maxHeight="400px"
      />

      {/* Without click handler */}
      <ListWidget
        title="Notifications"
        items={notifications}
        maxHeight="400px"
        description="Latest updates"
      />

      {/* Empty state */}
      <ListWidget
        title="Tasks"
        items={[]}
        emptyMessage="No tasks available"
      />
    </div>
  );
}

/**
 * CardGrid Examples
 */
export function CardGridExamples() {
  const products = [
    { id: 1, name: "Product A", price: 29.99, status: "In Stock" },
    { id: 2, name: "Product B", price: 49.99, status: "Low Stock" },
    { id: 3, name: "Product C", price: 19.99, status: "In Stock" },
    { id: 4, name: "Product D", price: 39.99, status: "Out of Stock" },
    { id: 5, name: "Product E", price: 59.99, status: "In Stock" },
    { id: 6, name: "Product F", price: 24.99, status: "In Stock" },
  ];

  const users = [
    { id: 1, name: "John Doe", role: "Admin", email: "john@example.com" },
    { id: 2, name: "Jane Smith", role: "User", email: "jane@example.com" },
    { id: 3, name: "Bob Johnson", role: "Manager", email: "bob@example.com" },
    { id: 4, name: "Alice Brown", role: "User", email: "alice@example.com" },
  ];

  return (
    <div className="space-y-8">
      {/* Product cards - 3 columns */}
      <CardGrid
        title="Products"
        description="Available products in inventory"
        items={products}
        columns={3}
        gap="md"
        renderCard={(product) => (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-2xl font-bold text-primary mb-2">
                ${product.price}
              </p>
              <Badge
                variant={
                  product.status === "In Stock"
                    ? "default"
                    : product.status === "Low Stock"
                    ? "secondary"
                    : "destructive"
                }
              >
                {product.status}
              </Badge>
            </CardContent>
          </Card>
        )}
      />

      {/* User cards - 4 columns */}
      <CardGrid
        title="Team Members"
        items={users}
        columns={4}
        gap="sm"
        renderCard={(user) => (
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{user.name}</h3>
              <p className="text-sm text-muted-foreground mb-1">{user.role}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>
        )}
      />

      {/* Loading state */}
      <CardGrid
        title="Loading Products"
        items={[]}
        columns={3}
        loading={true}
        loadingCount={6}
        renderCard={() => null}
      />

      {/* Empty state */}
      <CardGrid
        title="No Items"
        items={[]}
        columns={3}
        emptyMessage="No items to display"
        renderCard={() => null}
      />
    </div>
  );
}

/**
 * Combined Example - Dashboard Layout
 */
export function DataDisplayDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Revenue"
          value={45678}
          format="currency"
          icon={DollarSign}
          comparison={{
            previousValue: 40000,
            percentageChange: 14.2,
            period: "vs last month",
          }}
          color="success"
        />
        <MetricCard
          label="Users"
          value={1234}
          format="number"
          icon={Users}
          comparison={{
            previousValue: 1100,
            percentageChange: 12.2,
          }}
        />
        <MetricCard
          label="Orders"
          value={892}
          format="number"
          icon={ShoppingCart}
        />
        <MetricCard
          label="Conversion"
          value={3.5}
          format="percentage"
          icon={TrendingUp}
        />
      </div>

      {/* Progress and List Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProgressWidget
          title="Monthly Goal"
          current={8500}
          max={10000}
          variant="bar"
          showPercentage
          showValue
          color="primary"
        />
        <ProgressWidget
          title="Project Status"
          current={75}
          max={100}
          variant="circle"
          color="success"
        />
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListWidget
          title="Recent Activities"
          items={[
            {
              id: "1",
              title: "User logged in",
              description: "2 minutes ago",
              icon: Users,
            },
            {
              id: "2",
              title: "File uploaded",
              description: "5 minutes ago",
              icon: FileText,
            },
          ]}
          showChevron
        />
        <ListWidget
          title="Notifications"
          items={[
            {
              id: "1",
              title: "New message",
              description: "From John Doe",
              icon: Bell,
            },
          ]}
        />
      </div>
    </div>
  );
}
