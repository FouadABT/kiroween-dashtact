'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Heart, User, ShoppingBag } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      title: 'View Orders',
      description: 'Track your order history',
      href: '/account/orders',
      icon: Package,
      variant: 'default' as const,
    },
    {
      title: 'Edit Profile',
      description: 'Update your information',
      href: '/account/profile',
      icon: User,
      variant: 'outline' as const,
    },
    {
      title: 'Wishlist',
      description: 'View saved items',
      href: '/account/wishlist',
      icon: Heart,
      variant: 'outline' as const,
    },
    {
      title: 'Continue Shopping',
      description: 'Browse our products',
      href: '/shop',
      icon: ShoppingBag,
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Button
                variant={action.variant}
                className="w-full justify-start h-auto py-3"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
