'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CartApi, CheckoutApi } from '@/lib/api';
import { CheckoutFormState, PaymentMethodOption, ShippingMethodOption } from '@/types/storefront';
import { Cart } from '@/types/ecommerce';
import { StorefrontHeader } from '@/components/storefront';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

export default function CheckoutPageClient() {
  const router = useRouter();
  const { user: customer } = useCustomerAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState<CheckoutFormState>({
    step: 'shipping',
    shippingAddress: {},
    billingAddress: {},
    sameAsBilling: true,
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    customerNotes: '',
    errors: {},
    isSubmitting: false,
  });

  // Get or create session ID for guest users
  const getSessionId = (): string => {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
  };

  // Load cart and payment methods on mount
  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sessionId = getSessionId();
      
      // Load cart
      const cartData = await CartApi.getCart(sessionId);
      
      // Redirect to cart if empty
      if (!cartData || cartData.items.length === 0) {
        router.push('/cart');
        return;
      }
      
      setCart(cartData);
      
      // Load payment methods
      const methods = await CheckoutApi.getPaymentMethods();
      setPaymentMethods(methods);
      
      // Set default payment method (COD - first available method)
      const defaultMethod = methods.find(m => m.available);
      if (defaultMethod) {
        setFormState(prev => ({ ...prev, paymentMethodId: defaultMethod.id }));
      }
    } catch (err) {
      console.error('Failed to load checkout data:', err);
      setError('Failed to load checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (updates: Partial<CheckoutFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const handleStepChange = (step: 'shipping' | 'payment' | 'review') => {
    setFormState(prev => ({ ...prev, step }));
  };

  if (isLoading) {
    return (
      <>
        <StorefrontHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <StorefrontHeader />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            {error}
          </div>
          </div>
        </div>
      </>
    );
  }

  if (!cart) {
    return null;
  }

  return (
    <>
      <StorefrontHeader />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-foreground">Checkout</h1>

        {/* Guest Checkout Info */}
        {!customer && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Checking out as a guest. <Link href="/account/register" className="underline font-medium">Create an account</Link> to track your orders and save your information for faster checkout.
              </span>
              <Button asChild variant="outline" size="sm" className="ml-4">
                <Link href="/account/login">Login</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={formState.step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Checkout Form - Takes 2 columns on large screens, stacked on mobile */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <CheckoutForm
              cart={cart}
              formState={formState}
              paymentMethods={paymentMethods}
              shippingMethods={shippingMethods}
              onFormChange={handleFormChange}
              onStepChange={handleStepChange}
              onShippingMethodsLoad={setShippingMethods}
            />
          </div>

          {/* Order Summary - Takes 1 column on large screens, shown first on mobile */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-4">
              <OrderSummary
                cart={cart}
                shippingCost={
                  formState.shippingMethodId
                    ? Number(shippingMethods.find(m => m.id === formState.shippingMethodId)?.price || 0)
                    : 0
                }
                taxAmount={0} // Will be calculated in real-time
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
