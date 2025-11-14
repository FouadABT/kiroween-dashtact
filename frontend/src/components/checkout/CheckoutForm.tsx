'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutFormState, PaymentMethodOption, ShippingMethodOption } from '@/types/storefront';
import { Cart } from '@/types/ecommerce';
import { CheckoutApi } from '@/lib/api';
import { ShippingAddressForm } from './ShippingAddressForm';
import { BillingAddressForm } from './BillingAddressForm';
import { ShippingMethodSelector } from './ShippingMethodSelector';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PlaceOrderButton } from './PlaceOrderButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CheckoutFormProps {
  cart: Cart;
  formState: CheckoutFormState;
  paymentMethods: PaymentMethodOption[];
  shippingMethods: ShippingMethodOption[];
  onFormChange: (updates: Partial<CheckoutFormState>) => void;
  onStepChange: (step: 'shipping' | 'payment' | 'review') => void;
  onShippingMethodsLoad: (methods: ShippingMethodOption[]) => void;
}

export function CheckoutForm({
  cart,
  formState,
  paymentMethods,
  shippingMethods,
  onFormChange,
  onStepChange,
  onShippingMethodsLoad,
}: CheckoutFormProps) {
  const router = useRouter();
  const [isCalculating, setIsCalculating] = useState(false);

  // Load shipping methods when shipping address is complete
  useEffect(() => {
    if (isShippingAddressComplete() && shippingMethods.length === 0) {
      loadShippingMethods();
    }
  }, [formState.shippingAddress]);

  const isShippingAddressComplete = (): boolean => {
    const addr = formState.shippingAddress;
    return !!(
      addr.firstName &&
      addr.lastName &&
      addr.addressLine1 &&
      addr.city &&
      addr.state &&
      addr.postalCode &&
      addr.country &&
      formState.customerEmail &&
      formState.customerName
    );
  };

  const isBillingAddressComplete = (): boolean => {
    if (formState.sameAsBilling) return true;
    const addr = formState.billingAddress;
    return !!(
      addr.firstName &&
      addr.lastName &&
      addr.addressLine1 &&
      addr.city &&
      addr.state &&
      addr.postalCode &&
      addr.country
    );
  };

  const loadShippingMethods = async () => {
    try {
      setIsCalculating(true);
      const methods = await CheckoutApi.getShippingMethods();
      onShippingMethodsLoad(methods);
      
      // Set default shipping method
      if (methods.length > 0 && !formState.shippingMethodId) {
        onFormChange({ shippingMethodId: methods[0].id });
      }
    } catch (error) {
      console.error('Failed to load shipping methods:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNext = () => {
    if (formState.step === 'shipping') {
      if (!isShippingAddressComplete()) {
        onFormChange({
          errors: { ...formState.errors, shipping: 'Please complete all required fields' },
        });
        return;
      }
      onStepChange('payment');
    } else if (formState.step === 'payment') {
      if (!formState.shippingMethodId) {
        onFormChange({
          errors: { ...formState.errors, shipping: 'Please select a shipping method' },
        });
        return;
      }
      if (!formState.paymentMethodId) {
        onFormChange({
          errors: { ...formState.errors, payment: 'Please select a payment method' },
        });
        return;
      }
      if (!isBillingAddressComplete()) {
        onFormChange({
          errors: { ...formState.errors, billing: 'Please complete billing address' },
        });
        return;
      }
      onStepChange('review');
    }
  };

  const handleBack = () => {
    if (formState.step === 'payment') {
      onStepChange('shipping');
    } else if (formState.step === 'review') {
      onStepChange('payment');
    }
  };

  const handlePlaceOrder = async () => {
    try {
      onFormChange({ isSubmitting: true, errors: {} });

      // Get session ID
      const sessionId = typeof window !== 'undefined'
        ? localStorage.getItem('cartSessionId') || ''
        : '';

      // Transform address format from addressLine1/addressLine2 to address1/address2
      const transformAddress = (addr: any) => ({
        firstName: addr.firstName || '',
        lastName: addr.lastName || '',
        address1: addr.addressLine1 || addr.address1 || '',
        address2: addr.addressLine2 || addr.address2 || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
        country: addr.country || '',
        phone: addr.phone || formState.customerPhone || '',
      });

      // Create order
      const order = await CheckoutApi.createOrder({
        sessionId,
        shippingAddress: transformAddress(formState.shippingAddress),
        billingAddress: formState.sameAsBilling
          ? transformAddress(formState.shippingAddress)
          : transformAddress(formState.billingAddress),
        sameAsShipping: formState.sameAsBilling,
        shippingMethodId: formState.shippingMethodId!,
        paymentMethodId: formState.paymentMethodId!,
        customerEmail: formState.customerEmail,
        customerNotes: formState.customerNotes || '',
      });

      // Clear cart session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartSessionId');
      }

      // Redirect to success page
      router.push(`/checkout/success?orderId=${order.id}&orderNumber=${order.orderNumber}`);
    } catch (error: any) {
      console.error('Failed to place order:', error);
      onFormChange({
        isSubmitting: false,
        errors: {
          ...formState.errors,
          submit: error.message || 'Failed to place order. Please try again.',
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Shipping Information */}
      {formState.step === 'shipping' && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ShippingAddressForm
              address={formState.shippingAddress}
              customerEmail={formState.customerEmail}
              customerName={formState.customerName}
              customerPhone={formState.customerPhone}
              customerNotes={formState.customerNotes}
              errors={formState.errors}
              onChange={(updates: Partial<CheckoutFormState>) => onFormChange(updates)}
            />

            {formState.errors.shipping && (
              <div className="text-sm text-destructive">
                {formState.errors.shipping}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleNext} size="lg">
                Continue to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment & Billing */}
      {formState.step === 'payment' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Method</CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingMethodSelector
                methods={shippingMethods}
                selectedMethodId={formState.shippingMethodId}
                isLoading={isCalculating}
                onChange={(methodId: string) => onFormChange({ shippingMethodId: methodId })}
              />
              {formState.errors.shipping && (
                <div className="text-sm text-destructive mt-2">
                  {formState.errors.shipping}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelector
                methods={paymentMethods}
                selectedMethodId={formState.paymentMethodId}
                onChange={(methodId: string) => onFormChange({ paymentMethodId: methodId })}
              />
              {formState.errors.payment && (
                <div className="text-sm text-destructive mt-2">
                  {formState.errors.payment}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <BillingAddressForm
                address={formState.billingAddress}
                sameAsShipping={formState.sameAsBilling}
                shippingAddress={formState.shippingAddress}
                errors={formState.errors}
                onChange={(updates: Partial<CheckoutFormState>) => onFormChange(updates)}
              />
              {formState.errors.billing && (
                <div className="text-sm text-destructive mt-2">
                  {formState.errors.billing}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button onClick={handleBack} variant="outline" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shipping
            </Button>
            <Button onClick={handleNext} size="lg">
              Review Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* Review & Place Order */}
      {formState.step === 'review' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Review Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Shipping Address Summary */}
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{formState.shippingAddress.firstName} {formState.shippingAddress.lastName}</p>
                  <p>{formState.shippingAddress.addressLine1}</p>
                  {formState.shippingAddress.addressLine2 && (
                    <p>{formState.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {formState.shippingAddress.city}, {formState.shippingAddress.state}{' '}
                    {formState.shippingAddress.postalCode}
                  </p>
                  <p>{formState.shippingAddress.country}</p>
                </div>
              </div>

              {/* Billing Address Summary */}
              <div>
                <h3 className="font-semibold mb-2">Billing Address</h3>
                <div className="text-sm text-muted-foreground">
                  {formState.sameAsBilling ? (
                    <p>Same as shipping address</p>
                  ) : (
                    <>
                      <p>{formState.billingAddress.firstName} {formState.billingAddress.lastName}</p>
                      <p>{formState.billingAddress.addressLine1}</p>
                      {formState.billingAddress.addressLine2 && (
                        <p>{formState.billingAddress.addressLine2}</p>
                      )}
                      <p>
                        {formState.billingAddress.city}, {formState.billingAddress.state}{' '}
                        {formState.billingAddress.postalCode}
                      </p>
                      <p>{formState.billingAddress.country}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Shipping Method Summary */}
              <div>
                <h3 className="font-semibold mb-2">Shipping Method</h3>
                <div className="text-sm text-muted-foreground">
                  {shippingMethods.find(m => m.id === formState.shippingMethodId)?.name || 'N/A'}
                </div>
              </div>

              {/* Payment Method Summary */}
              <div>
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <div className="text-sm text-muted-foreground">
                  {paymentMethods.find(m => m.id === formState.paymentMethodId)?.name || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {formState.errors.submit && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
              {formState.errors.submit}
            </div>
          )}

          <div className="flex justify-between">
            <Button onClick={handleBack} variant="outline" size="lg" disabled={formState.isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payment
            </Button>
            <PlaceOrderButton
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={formState.isSubmitting}
            />
          </div>
        </>
      )}
    </div>
  );
}
