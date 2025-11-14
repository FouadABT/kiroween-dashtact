/**
 * Storefront Types
 * Types for customer-facing e-commerce storefront
 * Includes cart, wishlist, customer accounts, and checkout
 */

import {
  Product,
  ProductVariant,
  Address,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  PaymentMethod,
  ShippingMethod,
} from './ecommerce';

// ============================================================================
// Cart Types
// ============================================================================

export interface Cart {
  id: string;
  sessionId?: string | null;
  userId?: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  subtotal: string; // Calculated total
  itemCount: number; // Total number of items
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  priceSnapshot: string; // Decimal as string - price at time of adding
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    featuredImage?: string | null;
    basePrice: string;
    status: string;
    isVisible: boolean;
  };
  productVariant?: {
    id: string;
    name: string;
    price?: string | null;
    image?: string | null;
    attributes: Record<string, any>;
    inventory?: {
      quantity: number;
      reserved: number;
      available: number;
      trackInventory: boolean;
      allowBackorder: boolean;
    };
  } | null;
}

export interface AddToCartDto {
  sessionId?: string;
  userId?: string;
  productId: string;
  productVariantId?: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface ValidateCartResponse {
  valid: boolean;
  errors?: Array<{
    itemId: string;
    productId: string;
    productName: string;
    error: string;
    availableQuantity?: number;
  }>;
}

// ============================================================================
// Wishlist Types
// ============================================================================

export interface Wishlist {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: WishlistItem[];
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  productVariantId?: string | null;
  createdAt: string;
  product?: Product;
  productVariant?: ProductVariant | null;
}

export interface AddToWishlistDto {
  productId: string;
  productVariantId?: string;
}

// ============================================================================
// Customer Account Types
// ============================================================================

export interface CustomerAccount {
  id: string;
  customerId: string;
  email: string;
  emailVerified: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    shippingAddress?: Address | null;
    billingAddress?: Address | null;
  };
}

export interface RegisterCustomerDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginCustomerDto {
  email: string;
  password: string;
}

export interface CustomerAuthResponse {
  accessToken: string;
  refreshToken: string;
  customer: CustomerAccount;
}

export interface UpdateCustomerProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
}

// ============================================================================
// Checkout Types
// ============================================================================

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  addressLine1?: string; // Frontend uses this
  addressLine2?: string; // Frontend uses this
  address1?: string;     // Backend expects this
  address2?: string;     // Backend expects this
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CheckoutData {
  cartId: string;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  shippingMethodId?: string;
  paymentMethodId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  sameAsBilling?: boolean; // UI helper
}

export interface ValidateCheckoutDto {
  cartId: string;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  shippingMethodId?: string;
  paymentMethodId: string;
}

export interface ValidateCheckoutResponse {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface CalculateShippingDto {
  cartId: string;
  shippingAddress: CheckoutAddress;
  shippingMethodId?: string;
}

export interface CalculateShippingResponse {
  shippingCost: number;
  estimatedDeliveryDays?: number;
  availableMethods: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    estimatedDays?: number;
  }>;
}

export interface CalculateTaxDto {
  cartId: string;
  shippingAddress: CheckoutAddress;
}

export interface CalculateTaxResponse {
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
}

export interface CreateOrderFromCartDto {
  sessionId?: string;
  userId?: string;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  sameAsShipping: boolean;
  shippingMethodId: string;
  paymentMethodId: string;
  customerEmail?: string;
  customerNotes?: string;
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  total: string;
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: {
    id: string;
    name: string;
    type: string;
    description?: string;
  };
  shippingMethod?: {
    id: string;
    name: string;
    description?: string;
    estimatedDeliveryDays?: number;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    variantName?: string;
    sku?: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    image?: string;
  }>;
  estimatedDeliveryDate?: string;
  createdAt: string;
}

// ============================================================================
// Payment & Shipping Methods
// ============================================================================

export interface PaymentMethodOption extends PaymentMethod {
  available: boolean;
  fee?: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  availableCountries?: string[];
}

export interface ShippingMethodOption extends ShippingMethod {
  available: boolean;
  estimatedDays?: number;
  minOrderAmount?: number;
  maxOrderAmount?: number;
  availableCountries?: string[];
}

export interface GetShippingMethodsDto {
  cartId: string;
  shippingAddress: CheckoutAddress;
}

// ============================================================================
// Customer Orders (Order History)
// ============================================================================

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  total: string;
  itemCount: number;
  createdAt: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  trackingNumber?: string | null;
  items?: Array<{
    id: string;
    productName: string;
    variantName?: string;
    quantity: number;
    unitPrice: string;
    image?: string;
  }>;
}

export interface CustomerOrderDetails extends CustomerOrder {
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  shippingAddress: Address;
  billingAddress: Address;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  internalNotes?: string;
  paymentMethod?: {
    name: string;
    type: string;
  };
  shippingMethod?: {
    name: string;
    description?: string;
  };
  statusHistory?: Array<{
    id: string;
    fromStatus?: OrderStatus;
    toStatus: OrderStatus;
    notes?: string;
    createdAt: string;
  }>;
}

export interface CancelOrderDto {
  reason?: string;
}

export interface ReorderDto {
  orderId: string;
}

// ============================================================================
// Storefront Query & Response Types
// ============================================================================

export interface StorefrontProductFilters {
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  inStock?: boolean;
}

export interface StorefrontProductSort {
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';
}

export interface StorefrontPagination {
  page?: number;
  limit?: number;
}

export interface StorefrontQueryParams extends StorefrontProductFilters, StorefrontProductSort, StorefrontPagination {}

// ============================================================================
// UI Helper Types
// ============================================================================

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number;
  featuredImage?: string;
  isInStock: boolean;
  isFeatured: boolean;
  shortDescription?: string;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
  children?: CategoryTreeNode[];
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface VariantOption {
  name: string; // e.g., "Size", "Color"
  values: string[]; // e.g., ["S", "M", "L"], ["Red", "Blue"]
}

export interface SelectedVariant {
  variantId: string;
  attributes: Record<string, string>; // e.g., { size: "M", color: "Red" }
  price: number;
  isAvailable: boolean;
  availableQuantity: number;
}

// ============================================================================
// Form State Types
// ============================================================================

export interface CheckoutFormState {
  step: 'shipping' | 'payment' | 'review';
  shippingAddress: Partial<CheckoutAddress>;
  billingAddress: Partial<CheckoutAddress>;
  sameAsBilling: boolean;
  shippingMethodId?: string;
  paymentMethodId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export interface AddressFormState extends Partial<CheckoutAddress> {
  errors: Record<string, string>;
}

// ============================================================================
// Error Types
// ============================================================================

export interface StorefrontError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface CartError extends StorefrontError {
  itemId?: string;
  productId?: string;
  availableQuantity?: number;
}

export interface CheckoutError extends StorefrontError {
  step?: 'shipping' | 'payment' | 'review';
}
