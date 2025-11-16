/**
 * Layout Template Registry
 * 
 * Central registry of all available dashboard layout templates.
 * Templates are organized by category and include AI-friendly descriptions.
 */

import { LayoutTemplate } from './layout-template.interface';

/**
 * Analytics Dashboard Template
 * 
 * Optimized for data visualization and metrics tracking.
 * Includes revenue charts, statistics grids, and detailed data tables.
 * 
 * Use cases:
 * - Financial reporting and analysis
 * - Sales performance tracking
 * - Business metrics monitoring
 * - KPI dashboards
 */
export const ANALYTICS_DASHBOARD_TEMPLATE: LayoutTemplate = {
  key: 'analytics-dashboard',
  name: 'Analytics Dashboard',
  description: 'Comprehensive analytics dashboard with revenue charts, stats grid, and data tables for financial and business metrics tracking',
  category: 'analytics',
  useCases: [
    'Financial reporting and analysis',
    'Sales performance tracking',
    'Business metrics monitoring',
    'KPI dashboards',
    'Revenue trend analysis',
  ],
  tags: ['analytics', 'charts', 'metrics', 'revenue', 'data-visualization'],
  widgets: [
    {
      widgetKey: 'revenue-chart',
      gridSpan: 8,
      position: 0,
      config: {
        title: 'Revenue Trends',
        chartType: 'line',
        timeRange: '30d',
      },
    },
    {
      widgetKey: 'stats-grid',
      gridSpan: 4,
      position: 1,
      config: {
        metrics: ['total-revenue', 'growth-rate', 'avg-order-value'],
      },
    },
    {
      widgetKey: 'data-table',
      gridSpan: 12,
      position: 2,
      config: {
        title: 'Recent Transactions',
        pageSize: 10,
      },
    },
  ],
  metadata: {
    author: 'System',
    version: '1.0.0',
    createdAt: '2024-01-01',
  },
};

/**
 * Management Overview Template
 * 
 * Designed for team management and operational oversight.
 * Features stats cards, activity feeds, and quick action buttons.
 * 
 * Use cases:
 * - Team performance monitoring
 * - Task and project management
 * - Operational dashboards
 * - Manager workspaces
 */
export const MANAGEMENT_OVERVIEW_TEMPLATE: LayoutTemplate = {
  key: 'management-overview',
  name: 'Management Overview',
  description: 'Management-focused dashboard with stats cards, activity feed, and quick actions for team oversight and operational control',
  category: 'management',
  useCases: [
    'Team performance monitoring',
    'Task and project management',
    'Operational dashboards',
    'Manager workspaces',
    'Team activity tracking',
  ],
  tags: ['management', 'overview', 'team', 'operations', 'activity'],
  widgets: [
    {
      widgetKey: 'stats-card',
      gridSpan: 4,
      position: 0,
      config: {
        title: 'Team Performance',
        metrics: ['active-users', 'completed-tasks', 'pending-approvals'],
      },
    },
    {
      widgetKey: 'activity-feed',
      gridSpan: 8,
      position: 1,
      config: {
        title: 'Recent Activity',
        limit: 15,
        showTimestamps: true,
      },
    },
    {
      widgetKey: 'quick-actions',
      gridSpan: 12,
      position: 2,
      config: {
        actions: ['create-task', 'approve-request', 'send-message'],
      },
    },
  ],
  metadata: {
    author: 'System',
    version: '1.0.0',
    createdAt: '2024-01-01',
  },
};

/**
 * Monitoring Console Template
 * 
 * Real-time monitoring and alerting dashboard.
 * Includes charts, progress indicators, and notification widgets.
 * 
 * Use cases:
 * - System health monitoring
 * - Application performance tracking
 * - Alert management
 * - DevOps dashboards
 */
export const MONITORING_CONSOLE_TEMPLATE: LayoutTemplate = {
  key: 'monitoring-console',
  name: 'Monitoring Console',
  description: 'Real-time monitoring dashboard with charts, progress indicators, and notifications for system health and performance tracking',
  category: 'monitoring',
  useCases: [
    'System health monitoring',
    'Application performance tracking',
    'Alert management',
    'DevOps dashboards',
    'Infrastructure monitoring',
  ],
  tags: ['monitoring', 'alerts', 'performance', 'real-time', 'devops'],
  widgets: [
    {
      widgetKey: 'chart-widget',
      gridSpan: 6,
      position: 0,
      config: {
        title: 'System Performance',
        chartType: 'area',
        metrics: ['cpu-usage', 'memory-usage'],
      },
    },
    {
      widgetKey: 'progress-widget',
      gridSpan: 6,
      position: 1,
      config: {
        title: 'Resource Utilization',
        showPercentages: true,
      },
    },
    {
      widgetKey: 'notification-widget',
      gridSpan: 12,
      position: 2,
      config: {
        title: 'System Alerts',
        priority: 'high',
        autoRefresh: true,
      },
    },
  ],
  metadata: {
    author: 'System',
    version: '1.0.0',
    createdAt: '2024-01-01',
  },
};

/**
 * All available templates
 */
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  ANALYTICS_DASHBOARD_TEMPLATE,
  MANAGEMENT_OVERVIEW_TEMPLATE,
  MONITORING_CONSOLE_TEMPLATE,
];

/**
 * Get template by key
 */
export function getTemplateByKey(key: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((template) => template.key === key);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter((template) => template.category === category);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): string[] {
  const categories = LAYOUT_TEMPLATES.map((template) => template.category).filter(
    (category): category is string => category !== undefined
  );
  return Array.from(new Set(categories));
}

/**
 * Search templates by query
 */
export function searchTemplates(query: string): LayoutTemplate[] {
  const lowerQuery = query.toLowerCase();
  return LAYOUT_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      template.useCases?.some((useCase) => useCase.toLowerCase().includes(lowerQuery))
  );
}
