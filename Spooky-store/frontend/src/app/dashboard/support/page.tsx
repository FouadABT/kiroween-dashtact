'use client';

import { useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useMetadata } from '@/contexts/MetadataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Code, 
  Database, 
  Layers, 
  Server, 
  Globe,
  ShoppingCart,
  Calendar,
  Bell,
  Users,
  Shield,
  Mail,
  MessageSquare,
  FileText,
  Palette,
  Layout,
  Boxes,
  Activity
} from 'lucide-react';

export default function SupportPage() {
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    updateMetadata({
      title: 'Support & Documentation',
      description: 'Project overview, features, and business logic',
    });
  }, [updateMetadata]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support & Documentation"
        description="Complete overview of your dashboard application"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="business">Business Logic</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Project Overview
              </CardTitle>
              <CardDescription>
                Full-stack dashboard application with comprehensive features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    Technology Stack
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <strong>Frontend:</strong> Next.js 14, TypeScript, Tailwind CSS</li>
                    <li>• <strong>Backend:</strong> NestJS, Prisma ORM</li>
                    <li>• <strong>Database:</strong> PostgreSQL</li>
                    <li>• <strong>UI Library:</strong> shadcn/ui components</li>
                    <li>• <strong>Authentication:</strong> JWT with refresh tokens</li>
                    <li>• <strong>Real-time:</strong> WebSocket for messaging & notifications</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Key Capabilities
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Role-based access control (RBAC)</li>
                    <li>• Dynamic permission system</li>
                    <li>• Customizable themes & branding</li>
                    <li>• Widget-based dashboard layouts</li>
                    <li>• Multi-language support ready</li>
                    <li>• SEO optimized with metadata system</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  Backend
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>NestJS REST API with modular architecture, guards, interceptors, and comprehensive validation.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Frontend
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Next.js 14 App Router with server components, client components, and optimized performance.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>PostgreSQL with Prisma ORM for type-safe database access and migrations.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Core Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Complete user lifecycle management</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• User CRUD operations</li>
                  <li>• Profile management with avatars</li>
                  <li>• Role assignment</li>
                  <li>• Activity tracking</li>
                  <li>• Bulk operations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Roles & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Flexible RBAC system</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Dynamic role creation</li>
                  <li>• Granular permissions</li>
                  <li>• Permission inheritance</li>
                  <li>• Resource-based access</li>
                  <li>• Audit logging</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  E-commerce
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Full e-commerce platform</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Product management</li>
                  <li>• Inventory tracking</li>
                  <li>• Order processing</li>
                  <li>• Customer accounts</li>
                  <li>• Payment & shipping methods</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Flexible CMS capabilities</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Blog posts with categories</li>
                  <li>• Custom pages builder</li>
                  <li>• Media library</li>
                  <li>• SEO optimization</li>
                  <li>• Draft & publish workflow</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Calendar System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Event management system</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Event creation & editing</li>
                  <li>• Recurring events</li>
                  <li>• Categories & colors</li>
                  <li>• Reminders</li>
                  <li>• Calendar views</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Real-time notification system</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• In-app notifications</li>
                  <li>• Email notifications</li>
                  <li>• WebSocket real-time updates</li>
                  <li>• Notification templates</li>
                  <li>• User preferences</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Messaging System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Internal messaging platform</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Direct messages</li>
                  <li>• Conversations</li>
                  <li>• Real-time chat</li>
                  <li>• Message history</li>
                  <li>• Read receipts</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Theming & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Customizable appearance</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Light/dark mode</li>
                  <li>• Custom color palettes</li>
                  <li>• Typography settings</li>
                  <li>• Logo & favicon upload</li>
                  <li>• Per-user preferences</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Landing Page Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Visual page builder</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Drag & drop sections</li>
                  <li>• Hero, features, pricing</li>
                  <li>• Dynamic header/footer</li>
                  <li>• SEO optimization</li>
                  <li>• Preview mode</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-primary" />
                  Widget System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Customizable dashboard widgets</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 40+ pre-built widgets</li>
                  <li>• Drag & drop layout</li>
                  <li>• Widget permissions</li>
                  <li>• Custom widgets</li>
                  <li>• Responsive grid</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Transactional email platform</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• SMTP configuration</li>
                  <li>• Email templates</li>
                  <li>• Variable substitution</li>
                  <li>• Email queue</li>
                  <li>• Delivery tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Activity Logging
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">Comprehensive audit trail</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• User actions tracking</li>
                  <li>• System events</li>
                  <li>• IP address logging</li>
                  <li>• Filterable logs</li>
                  <li>• Export capabilities</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>Technical overview of the application structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Backend Architecture (NestJS)
                  </h3>
                  <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                    <p><strong>Modular Structure:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• <code>auth/</code> - Authentication & authorization</li>
                      <li>• <code>users/</code> - User management</li>
                      <li>• <code>permissions/</code> - RBAC system</li>
                      <li>• <code>blog/</code> - Blog posts & categories</li>
                      <li>• <code>ecommerce/</code> - Products, orders, inventory</li>
                      <li>• <code>calendar/</code> - Events & scheduling</li>
                      <li>• <code>notifications/</code> - Notification system</li>
                      <li>• <code>messaging/</code> - Internal messaging</li>
                      <li>• <code>email/</code> - Email templates & sending</li>
                      <li>• <code>media/</code> - File uploads & management</li>
                      <li>• <code>pages/</code> - Custom pages CMS</li>
                      <li>• <code>landing/</code> - Landing page builder</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Frontend Architecture (Next.js 14)
                  </h3>
                  <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                    <p><strong>App Router Structure:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• <code>app/dashboard/</code> - Protected dashboard routes</li>
                      <li>• <code>app/login/</code> - Authentication pages</li>
                      <li>• <code>app/blog/</code> - Public blog</li>
                      <li>• <code>app/shop/</code> - E-commerce storefront</li>
                      <li>• <code>components/</code> - Reusable UI components</li>
                      <li>• <code>contexts/</code> - React context providers</li>
                      <li>• <code>lib/</code> - Utilities & helpers</li>
                      <li>• <code>hooks/</code> - Custom React hooks</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Database Schema (PostgreSQL + Prisma)
                  </h3>
                  <div className="pl-6 space-y-2 text-sm text-muted-foreground">
                    <p><strong>Core Tables:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• <code>users</code> - User accounts</li>
                      <li>• <code>user_roles</code> - Role definitions</li>
                      <li>• <code>permissions</code> - Permission registry</li>
                      <li>• <code>role_permissions</code> - Role-permission mapping</li>
                      <li>• <code>blog_posts</code> - Blog content</li>
                      <li>• <code>products</code> - E-commerce products</li>
                      <li>• <code>orders</code> - Customer orders</li>
                      <li>• <code>calendar_events</code> - Calendar entries</li>
                      <li>• <code>notifications</code> - User notifications</li>
                      <li>• <code>messages</code> - Internal messages</li>
                      <li>• <code>custom_pages</code> - CMS pages</li>
                      <li>• <code>landing_sections</code> - Landing page content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Logic Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Logic & Workflows</CardTitle>
              <CardDescription>Key business processes and rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Authentication Flow</h3>
                  <ol className="space-y-1 text-sm text-muted-foreground list-decimal ml-4">
                    <li>User submits credentials (email + password)</li>
                    <li>Backend validates credentials against database</li>
                    <li>If valid, generate JWT access token (15min) & refresh token (7 days)</li>
                    <li>Store refresh token in httpOnly cookie</li>
                    <li>Return access token to client</li>
                    <li>Client stores access token in localStorage</li>
                    <li>Auto-refresh access token 2 minutes before expiration</li>
                    <li>On logout, blacklist tokens and clear storage</li>
                  </ol>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Permission Checking</h3>
                  <ol className="space-y-1 text-sm text-muted-foreground list-decimal ml-4">
                    <li>User attempts to access protected resource</li>
                    <li>JWT guard validates access token</li>
                    <li>Extract user ID and role from token</li>
                    <li>Load user permissions from database (cached)</li>
                    <li>Check if user has required permission(s)</li>
                    <li>Grant or deny access based on permissions</li>
                    <li>Log access attempt for audit trail</li>
                  </ol>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">E-commerce Order Processing</h3>
                  <ol className="space-y-1 text-sm text-muted-foreground list-decimal ml-4">
                    <li>Customer adds products to cart</li>
                    <li>Calculate totals (subtotal, tax, shipping)</li>
                    <li>Customer proceeds to checkout</li>
                    <li>Validate inventory availability</li>
                    <li>Process payment through payment gateway</li>
                    <li>If successful, create order record</li>
                    <li>Decrement inventory quantities</li>
                    <li>Send order confirmation email</li>
                    <li>Create notification for admin</li>
                    <li>Update order status as it progresses</li>
                  </ol>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Notification Delivery</h3>
                  <ol className="space-y-1 text-sm text-muted-foreground list-decimal ml-4">
                    <li>System event triggers notification</li>
                    <li>Load notification template</li>
                    <li>Substitute dynamic variables</li>
                    <li>Check user notification preferences</li>
                    <li>Create notification record in database</li>
                    <li>Send via WebSocket for real-time delivery</li>
                    <li>Queue email notification if enabled</li>
                    <li>Mark as delivered when acknowledged</li>
                    <li>Auto-delete old notifications (configurable)</li>
                  </ol>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Content Publishing Workflow</h3>
                  <ol className="space-y-1 text-sm text-muted-foreground list-decimal ml-4">
                    <li>Author creates content (blog post, page)</li>
                    <li>Save as draft (not publicly visible)</li>
                    <li>Author can preview draft</li>
                    <li>Submit for review (optional workflow)</li>
                    <li>Editor reviews and approves/rejects</li>
                    <li>Set publish date (immediate or scheduled)</li>
                    <li>On publish, content becomes publicly visible</li>
                    <li>Generate SEO metadata and sitemap entry</li>
                    <li>Send notification to subscribers</li>
                    <li>Track views and engagement</li>
                  </ol>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold mb-2">Theme Customization</h3>
                  <ol className="space-y-1 text-sm text-muted-foreground list-decimal ml-4">
                    <li>User navigates to theme settings</li>
                    <li>Select color palette or customize colors</li>
                    <li>Choose typography (font family, sizes)</li>
                    <li>Preview changes in real-time</li>
                    <li>Save theme settings to database</li>
                    <li>Generate CSS variables from settings</li>
                    <li>Apply theme to user session</li>
                    <li>Sync theme across all user devices</li>
                    <li>Option to reset to default theme</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Measures</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Password Hashing:</strong> bcrypt with 10 salt rounds</li>
                <li>• <strong>JWT Tokens:</strong> Short-lived access tokens + long-lived refresh tokens</li>
                <li>• <strong>Token Blacklist:</strong> Revoked tokens stored until expiration</li>
                <li>• <strong>Rate Limiting:</strong> 5 attempts per 15 minutes on auth endpoints</li>
                <li>• <strong>CORS:</strong> Configured for specific origins only</li>
                <li>• <strong>Input Validation:</strong> DTO validation on all endpoints</li>
                <li>• <strong>SQL Injection:</strong> Protected by Prisma parameterized queries</li>
                <li>• <strong>XSS Protection:</strong> React built-in escaping + CSP headers</li>
                <li>• <strong>CSRF Protection:</strong> SameSite cookies</li>
                <li>• <strong>Audit Logging:</strong> All sensitive actions logged with IP and timestamp</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
