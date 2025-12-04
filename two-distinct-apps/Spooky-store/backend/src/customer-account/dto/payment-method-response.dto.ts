import { PaymentMethodType } from './create-payment-method.dto';

export class PaymentMethodResponseDto {
  id: string;
  customerId: string;
  paymentMethodId: string;
  type: PaymentMethodType;
  cardLast4?: string;
  cardExpiry?: string;
  cardBrand?: string;
  billingAddressId?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
