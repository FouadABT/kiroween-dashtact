'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CustomerAccountApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PaymentMethodFormProps {
  id?: string;
  onSave?: (paymentMethod: any) => void;
  onCancel?: () => void;
}

export function PaymentMethodForm({
  id,
  onSave,
  onCancel,
}: PaymentMethodFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    type: 'card',
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.type === 'card') {
      if (!formData.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }

      if (!formData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required';
      }

      if (!formData.expiryMonth) {
        newErrors.expiryMonth = 'Expiry month is required';
      }

      if (!formData.expiryYear) {
        newErrors.expiryYear = 'Expiry year is required';
      }

      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      processedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const paymentData = {
        type: formData.type as 'card' | 'cod' | 'bank_transfer',
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardExpiry: `${formData.expiryMonth}/${formData.expiryYear}`,
        cardCvc: formData.cvv,
      };

      const savedMethod = id
        ? await CustomerAccountApi.updatePaymentMethod(id, paymentData)
        : await CustomerAccountApi.createPaymentMethod(paymentData);

      toast.success(
        id
          ? 'Payment method updated successfully'
          : 'Payment method added successfully'
      );
      onSave?.(savedMethod);
    } catch (error) {
      console.error('Payment method save error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save payment method'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {id ? 'Edit' : 'Add'} Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Payment Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange('type', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'card' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="1234 5678 9012 3456"
                  className={errors.cardNumber ? 'border-destructive' : ''}
                />
                {errors.cardNumber && (
                  <p className="text-sm text-destructive">{errors.cardNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name *</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="John Doe"
                  className={errors.cardholderName ? 'border-destructive' : ''}
                />
                {errors.cardholderName && (
                  <p className="text-sm text-destructive">
                    {errors.cardholderName}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Month *</Label>
                  <Select
                    value={formData.expiryMonth}
                    onValueChange={(value) =>
                      handleSelectChange('expiryMonth', value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={
                        errors.expiryMonth ? 'border-destructive' : ''
                      }
                    >
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = String(i + 1).padStart(2, '0');
                        return (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.expiryMonth && (
                    <p className="text-sm text-destructive">
                      {errors.expiryMonth}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Year *</Label>
                  <Select
                    value={formData.expiryYear}
                    onValueChange={(value) =>
                      handleSelectChange('expiryYear', value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className={
                        errors.expiryYear ? 'border-destructive' : ''
                      }
                    >
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => {
                        const year = String(
                          new Date().getFullYear() + i
                        ).slice(-2);
                        return (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.expiryYear && (
                    <p className="text-sm text-destructive">
                      {errors.expiryYear}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="123"
                    maxLength={4}
                    className={errors.cvv ? 'border-destructive' : ''}
                  />
                  {errors.cvv && (
                    <p className="text-sm text-destructive">{errors.cvv}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {formData.type === 'cod' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                You will pay when your order is delivered. No payment information
                is required now.
              </p>
            </div>
          )}

          {formData.type === 'bank_transfer' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Bank transfer details will be provided after you place your order.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Saving...' : 'Save Payment Method'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
