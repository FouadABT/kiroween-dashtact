"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Calendar,
  Plus
} from "lucide-react";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Sample data for dashboard stats
const dashboardStats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up" as const,
    icon: DollarSign,
    description: "from last month"
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+180.1%",
    trend: "up" as const,
    icon: Users,
    description: "from last month"
  },
  {
    title: "Orders",
    value: "12,234",
    change: "+19%",
    trend: "up" as const,
    icon: ShoppingCart,
    description: "from last month"
  },
  {
    title: "Growth Rate",
    value: "573",
    change: "-4.3%",
    trend: "down" as const,
    icon: TrendingUp,
    description: "from last month"
  }
];

// Sample recent activity data
const recentActivity = [
  {
    id: 1,
    type: "sale",
    message: "New sale of $2,400 from John Doe",
    time: "2 minutes ago",
    status: "success"
  },
  {
    id: 2,
    type: "user",
    message: "New user registration: jane.smith@example.com",
    time: "5 minutes ago",
    status: "info"
  },
  {
    id: 3,
    type: "order",
    message: "Order #1234 has been shipped",
    time: "10 minutes ago",
    status: "success"
  },
  {
    id: 4,
    type: "alert",
    message: "Server response time increased by 15%",
    time: "15 minutes ago",
    status: "warning"
  },
  {
    id: 5,
    type: "payment",
    message: "Payment of $1,200 received from ABC Corp",
    time: "1 hour ago",
    status: "success"
  }
];

// Sample quick actions
const quickActions = [
  { title: "Add New Product", icon: Plus, description: "Create a new product listing" },
  { title: "View Analytics", icon: BarChart3, description: "Check detailed analytics" },
  { title: "Generate Report", icon: PieChart, description: "Create monthly report" },
  { title: "Schedule Meeting", icon: Calendar, description: "Book a team meeting" }
];

export default function DashboardPage() {
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome to your dashboard. Here&apos;s what&apos;s happening with your business today.
        </p>
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div 
        className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 lg:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                    {stat.title}
                  </CardTitle>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                  </motion.div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <motion.div
                      animate={{ 
                        y: stat.trend === "up" ? [-1, 1, -1] : [1, -1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                      )}
                    </motion.div>
                    <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                      {stat.change}
                    </span>
                    <span className="ml-1">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts and Activity Section */}
      <motion.div 
        className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3"
        variants={itemVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Chart Placeholder 1 */}
        <motion.div
          className="lg:col-span-2"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BarChart3 className="h-5 w-5" />
                </motion.div>
                Revenue Overview
              </CardTitle>
              <CardDescription>
                Monthly revenue trends for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] sm:h-[250px] lg:h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-gray-500 font-medium">Chart Placeholder</p>
                  <p className="text-sm text-gray-400">Revenue chart will be displayed here</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Activity className="h-5 w-5" />
                </motion.div>
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div 
                    key={activity.id} 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div 
                      className={`h-2 w-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 leading-tight">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Additional Charts and Quick Actions */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Chart Placeholder 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sales Distribution
            </CardTitle>
            <CardDescription>
              Product category performance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[225px] lg:h-[250px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Pie Chart Placeholder</p>
                <p className="text-sm text-gray-400">Sales distribution chart</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4 hover:bg-gray-50"
                  >
                    <Icon className="h-5 w-5 mr-3 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{action.title}</div>
                      <div className="text-sm text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Key performance indicators and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Sales Target</span>
                <Badge variant="secondary">75%</Badge>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-gray-500">$75,000 of $100,000 goal</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Customer Satisfaction</span>
                <Badge variant="secondary">92%</Badge>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-gray-500">4.6/5.0 average rating</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Project Completion</span>
                <Badge variant="secondary">68%</Badge>
              </div>
              <Progress value={68} className="h-2" />
              <p className="text-xs text-gray-500">17 of 25 projects done</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Team Productivity</span>
                <Badge variant="secondary">85%</Badge>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-gray-500">Above average performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}