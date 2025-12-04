'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  User,
  Package,
  Heart,
  LogOut,
  Home,
  Menu,
  CreditCard,
  Settings,
} from 'lucide-react';

interface AccountLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/account',
    icon: Home,
  },
  {
    name: 'Profile',
    href: '/account/profile',
    icon: User,
  },
  {
    name: 'Addresses',
    href: '/account/addresses',
    icon: Package,
  },
  {
    name: 'Payment Methods',
    href: '/account/payment-methods',
    icon: CreditCard,
  },
  {
    name: 'Wishlist',
    href: '/account/wishlist',
    icon: Heart,
  },
  {
    name: 'Settings',
    href: '/account/settings',
    icon: Settings,
  },
  {
    name: 'Orders',
    href: '/account/orders',
    icon: Package,
  },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  breadcrumbs.push({ label: 'Account', href: '/account' });

  if (segments.length > 1) {
    const lastSegment = segments[segments.length - 1];
    const label = lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    breadcrumbs.push({ label, href: pathname });
  }

  return breadcrumbs;
}

function NavigationMenu() {
  const pathname = usePathname();
  const { logout } = useCustomerAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}

      <div className="pt-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Storefront
            </Link>
            <Link href="/shop">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block space-y-2">
            <NavigationMenu />
          </aside>

          {/* Mobile Menu */}
          <div className="lg:hidden mb-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="mt-8">
                  <NavigationMenu />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
