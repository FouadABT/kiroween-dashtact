export interface CustomerProfileDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    company: string | null;
    shippingAddress: any;
    billingAddress: any;
  };
}

export interface CustomerAuthResponseDto {
  accessToken: string;
  refreshToken: string;
  customer: CustomerProfileDto;
}
