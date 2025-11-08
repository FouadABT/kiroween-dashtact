import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics - Dashboard",
  description: "Analytics and reporting dashboard",
};

// Sample metrics comparison data
const metricsComparison = [
  {
    metric: "Revenue",
    current: "$45,231",
    previous: "$37,649",
    change: "+20.1%",
    trend: "up" as const
  },
  {
    metric: "Orders",
    current: "1,234",
    previous: "1,156",
    change: "+6.7%",
    trend: "up" as const
  },
  {
    metric: "Conversion Rate",
    current: "3.24%",
    previous: "3.67%",
    change: "-11.7%",
    trend: "down" as const
  },
  {
    metric: "Average Order Value",
    current: "$89.32",
    previous: "$82.15",
    change: "+8.7%",
    trend: "up" as const
  },
  {
    metric: "Customer Acquisition Cost",
    current: "$24.50",
    previous: "$28.90",
    change: "-15.2%",
    trend: "up" as const
  },
  {
    metric: "Return Rate",
    current: "2.1%",
    previous: "3.4%",
    change: "-38.2%",
    trend: "up" as const
  }
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Detailed analytics and insights for your business performance.
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>
              Monthly revenue performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
              <div className="text-center">
                <LineChart className="h-16 w-16 text-blue-400 mx-auto mb-3" />
                <p className="text-blue-600 font-medium text-lg">Line Chart</p>
                <p className="text-sm text-blue-500">Revenue trends visualization</p>
                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-blue-400">
                  <span>Jan: $32k</span>
                  <span>Feb: $38k</span>
                  <span>Mar: $45k</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Acquisition Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Acquisition
            </CardTitle>
            <CardDescription>
              New user registrations by channel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-green-400 mx-auto mb-3" />
                <p className="text-green-600 font-medium text-lg">Bar Chart</p>
                <p className="text-sm text-green-500">User acquisition by source</p>
                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-green-400">
                  <span>Organic: 45%</span>
                  <span>Paid: 35%</span>
                  <span>Social: 20%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Large Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Comprehensive view of key performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
            <div className="text-center">
              <TrendingUp className="h-20 w-20 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-600 font-medium text-xl">Multi-Series Chart</p>
              <p className="text-sm text-purple-500 mb-4">Combined performance metrics visualization</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-purple-400">
                <div className="bg-white/50 rounded p-2">
                  <div className="font-medium">Revenue</div>
                  <div>$45.2k</div>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <div className="font-medium">Users</div>
                  <div>2,350</div>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <div className="font-medium">Orders</div>
                  <div>1,234</div>
                </div>
                <div className="bg-white/50 rounded p-2">
                  <div className="font-medium">Growth</div>
                  <div>+20.1%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Conversion Funnel
            </CardTitle>
            <CardDescription>
              User journey conversion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-dashed border-orange-200">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-orange-400 mx-auto mb-2" />
                <p className="text-orange-600 font-medium">Funnel Chart</p>
                <p className="text-xs text-orange-500">Conversion analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Data</CardTitle>
            <CardDescription>
              User distribution by region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border-2 border-dashed border-teal-200">
              <div className="text-center">
                <div className="h-12 w-12 bg-teal-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MAP</span>
                </div>
                <p className="text-teal-600 font-medium">Heat Map</p>
                <p className="text-xs text-teal-500">Geographic distribution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Real-time Activity</CardTitle>
            <CardDescription>
              Live user activity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                  1,247 online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Page Views/min</span>
                <Badge variant="secondary">
                  342
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bounce Rate</span>
                <Badge variant="secondary">
                  23.4%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Session</span>
                <Badge variant="secondary">
                  4m 32s
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Comparison</CardTitle>
          <CardDescription>
            Current period vs. previous period performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Current Period</TableHead>
                <TableHead>Previous Period</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricsComparison.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{metric.metric}</TableCell>
                  <TableCell>{metric.current}</TableCell>
                  <TableCell className="text-muted-foreground">{metric.previous}</TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1 ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {metric.change}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={metric.trend === 'up' ? 'default' : 'destructive'}
                      className={metric.trend === 'up' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                    >
                      {metric.trend === 'up' ? 'Positive' : 'Negative'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}