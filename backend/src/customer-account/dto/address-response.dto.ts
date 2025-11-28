import { AddressType } from './create-address.dto';

export class AddressResponseDto {
  id: string;
  customerId: string;
  type: AddressType;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  apartment?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
