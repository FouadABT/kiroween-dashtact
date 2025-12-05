'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StorefrontHeader } from '@/components/storefront';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Package, Mail, ArrowRight } from 'lucide-react';

export default function SuccessPageClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');
  const [email, setEmail] = useState('');

  // Get email from localStorage if available
  useEffect(() => {
    const storedEmail = localStorage.getItem('checkoutEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      // Clear it after use
      localStorage.removeItem('checkoutEmail');
    }
  }, []);

  return (
    <>
      <StorefrontHeader />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Order Placed Successfully!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for your purchase
              </p>
            </div>

            {/* Order Details Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderNumber && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-muted-foreground">Order Number</span>
                    <span className="font-semibold text-lg">{orderNumber}</span>
                  </div>
                )}
                
                {orderId && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono text-sm">{orderId}</span>
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Confirmation Email</p>
                      <p className="text-muted-foreground">
                        A confirmation email has been sent to {email || 'your email address'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Order Processing</p>
                      <p className="text-muted-foreground">
                        Your order is being prepared for shipment
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Next Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>You'll receive an email confirmation with your order details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>We'll send you tracking information once your order ships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>You can track your order status anytime</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1" size="lg">
                <Link href="/shop">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              {orderId && (
                <Button asChild variant="outline" className="flex-1" size="lg">
                  <Link href={`/account/orders/${orderId}`}>
                    View Order Details
                  </Link>
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Need help? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
