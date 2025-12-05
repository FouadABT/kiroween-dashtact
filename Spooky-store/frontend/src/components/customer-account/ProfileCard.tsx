'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomerAccount } from '@/types/storefront';
import { User, Mail, Phone, Edit } from 'lucide-react';

interface ProfileCardProps {
  user: CustomerAccount;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const customer = user.customer;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Profile</CardTitle>
        <Link href="/account/profile">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">
              {customer?.firstName} {customer?.lastName}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
            {user.emailVerified && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Verified
              </p>
            )}
          </div>
        </div>

        {customer?.phone && (
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
          </div>
        )}

        {user.lastLogin && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last login: {new Date(user.lastLogin).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
