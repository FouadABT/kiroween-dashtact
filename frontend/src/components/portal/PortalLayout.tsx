'use client';

import { Customer } from '@/types/ecommerce';
import { Package } from 'lucide-react';

interface PortalLayoutProps {
  children: React.ReactNode;
  customer?: Customer;
}

export function PortalLayout({ children, customer }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Order Portal</h1>
                {customer && (
                  <p className="text-sm text-muted-foreground">
                    Welcome, {customer.firstName} {customer.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} E-Commerce System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
