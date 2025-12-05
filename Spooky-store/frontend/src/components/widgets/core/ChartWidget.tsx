"use client";

import React, { lazy } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { WidgetContainer } from "./WidgetContainer";
import { BaseWidgetProps, ChartConfig } from "../types/widget.types";

/**
 * Props for the ChartWidget component
 */
export interface ChartWidgetProps extends BaseWidgetProps {
  /** Chart type */
  type: "line" | "bar" | "pie" | "area" | "composed";
  /** Chart data */
  data: Record<string, unknown>[];
  /** Optional title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Chart height in pixels */
  height?: number;
  /** Chart configuration */
  config: ChartConfig;
}

/**
 * Default theme chart colors
 */
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/**
 * ChartWidget Component
 * 
 * Wrapper for various chart types using Recharts.
 * Supports line, bar, pie, area, and composed charts.
 * Uses theme chart colors and responsive sizing.
 * 
 * @example Line chart
 * ```tsx
 * <ChartWidget
 *   type="line"
 *   title="Revenue Trend"
 *   data={[
 *     { month: 'Jan', revenue: 4000 },
 *     { month: 'Feb', revenue: 3000 },
 *     { month: 'Mar', revenue: 5000 },
 *   ]}
 *   config={{
 *     xAxisKey: 'month',
 *     dataKeys: ['revenue'],
 *     showLegend: true,
 *     showTooltip: true,
 *   }}
 * />
 * ```
 * 
 * @example Bar chart with multiple series
 * ```tsx
 * <ChartWidget
 *   type="bar"
 *   title="Sales Comparison"
 *   data={salesData}
 *   config={{
 *     xAxisKey: 'category',
 *     dataKeys: ['sales2023', 'sales2024'],
 *     showLegend: true,
 *   }}
 * />
 * ```
 * 
 * @example Pie chart
 * ```tsx
 * <ChartWidget
 *   type="pie"
 *   title="Market Share"
 *   data={marketData}
 *   config={{
 *     dataKeys: ['value'],
 *     showLegend: true,
 *   }}
 * />
 * ```
 */
export function ChartWidget({
  type,
  data,
  title,
  description,
  height = 300,
  config,
  loading = false,
  error,
  permission,
  className,
}: ChartWidgetProps) {
  const {
    xAxisKey,
    yAxisKey,
    dataKeys,
    colors = CHART_COLORS,
    showLegend = true,
    showTooltip = true,
    showGrid = true,
  } = config;

  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            {xAxisKey && (
              <XAxis
                dataKey={xAxisKey}
                className="text-xs text-muted-foreground"
              />
            )}
            {yAxisKey && (
              <YAxis className="text-xs text-muted-foreground" />
            )}
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--popover-foreground))" }}
              />
            )}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length] }}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            {xAxisKey && (
              <XAxis
                dataKey={xAxisKey}
                className="text-xs text-muted-foreground"
              />
            )}
            {yAxisKey && (
              <YAxis className="text-xs text-muted-foreground" />
            )}
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--popover-foreground))" }}
              />
            )}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </BarChart>
        );

      case "pie":
        return (
          <PieChart>
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
            )}
            {showLegend && <Legend />}
            <Pie
              data={data}
              dataKey={dataKeys[0]}
              nameKey={xAxisKey || "name"}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
          </PieChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            {xAxisKey && (
              <XAxis
                dataKey={xAxisKey}
                className="text-xs text-muted-foreground"
              />
            )}
            {yAxisKey && (
              <YAxis className="text-xs text-muted-foreground" />
            )}
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--popover-foreground))" }}
              />
            )}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case "composed":
        return (
          <ComposedChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            {xAxisKey && (
              <XAxis
                dataKey={xAxisKey}
                className="text-xs text-muted-foreground"
              />
            )}
            {yAxisKey && (
              <YAxis className="text-xs text-muted-foreground" />
            )}
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "hsl(var(--popover-foreground))" }}
              />
            )}
            {showLegend && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
              />
            ))}
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <WidgetContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      permission={permission}
      className={className}
    >
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </WidgetContainer>
  );
}

// Lazy-loaded version for code splitting
export const LazyChartWidget = lazy(() =>
  Promise.resolve({ default: ChartWidget })
);
