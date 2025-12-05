/**
 * E-Commerce Types
 * Synced with backend/prisma/schema.prisma e-commerce models
 */

// Enums
export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'UNFULFILLED',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  FULFILLED = 'FULFILLED',
}

// Address Interface (used in JSON fields)
// Synced with backend/src/orders/dto/create-order.dto.ts AddressDto
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  apartment?: string;
}

// Customer Address (stored in database)
// Synced with backend/prisma/schema.prisma Address model
export interface CustomerAddress {
  id: string;
  customerId: string;
  type: string; // 'shipping' or 'billing'
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  apartment?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
} 

// Customer
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  company?: string | null;
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  notes?: string | null;
  tags: string[];
  portalToken?: string | null;
  portalExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastOrderAt?: string | null;
}

export interface CreateCustomerDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  tags?: string[];
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  basePrice: string; // Decimal as string
  compareAtPrice?: string | null;
  cost?: string | null;
  sku?: string | null;
  barcode?: string | null;
  featuredImage?: string | null;
  images: string[];
  status: ProductStatus;
  isVisible: boolean;
  isFeatured: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  categories?: ProductCategory[];
  tags?: ProductTag[];
  variants?: ProductVariant[];
}

export interface CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  basePrice: number;
  compareAtPrice?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  featuredImage?: string;
  images?: string[];
  status?: ProductStatus;
  isVisible?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// Product Category
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  displayOrder: number;
  isVisible: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: ProductCategory | null;
  children?: ProductCategory[];
}

export interface CreateProductCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
  isVisible?: boolean;
  image?: string;
}

export interface UpdateProductCategoryDto extends Partial<CreateProductCategoryDto> {}

// Product Tag
export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreateProductTagDto {
  name: string;
  slug: string;
}

export interface UpdateProductTagDto extends Partial<CreateProductTagDto> {}

// Product Variant
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  attributes: Record<string, any>; // JSON
  price?: string | null;
  compareAtPrice?: string | null;
  cost?: string | null;
  image?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  inventory?: Inventory;
}

export interface CreateProductVariantDto {
  productId: string;
  name: string;
  sku?: string;
  barcode?: string;
  attributes: Record<string, any>;
  price?: number;
  compareAtPrice?: number;
  cost?: number;
  image?: string;
  isActive?: boolean;
}

export interface UpdateProductVariantDto extends Partial<Omit<CreateProductVariantDto, 'productId'>> {}

// Inventory
export interface Inventory {
  id: string;
  productVariantId: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  createdAt: string;
  updatedAt: string;
  lastRestockedAt?: string | null;
}

export interface CreateInventoryDto {
  productVariantId: string;
  quantity?: number;
  reserved?: number;
  available?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorder?: boolean;
}

export interface UpdateInventoryDto extends Partial<Omit<CreateInventoryDto, 'productVariantId'>> {}

// Inventory Adjustment
export interface InventoryAdjustment {
  id: string;
  inventoryId: string;
  quantityChange: number;
  reason: string;
  notes?: string | null;
  userId?: string | null;
  createdAt: string;
}

export interface AdjustInventoryDto {
  productVariantId: string;
  quantityChange: number;
  reason: string;
  notes?: string;
  userId?: string;
}

// Deprecated: Use AdjustInventoryDto instead
export interface CreateInventoryAdjustmentDto extends AdjustInventoryDto {}

// Order
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: string; // Decimal as string
  tax: string;
  shipping: string;
  discount: string;
  total: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethodId?: string | null;
  trackingNumber?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  customerNotes?: string | null;
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  customer?: Customer;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  shippingMethod?: ShippingMethod | null;
}

// Synced with backend/src/orders/dto/create-order.dto.ts
export interface CreateOrderDto {
  customerId: string;
  items: CreateOrderItemDto[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethodId?: string;
  tax?: number;
  shipping?: number;
  discount?: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  internalNotes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  trackingNumber?: string;
  internalNotes?: string;
  shippingMethodId?: string;
}

// Order Item
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productVariantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: string; // Decimal as string
  totalPrice: string;
  createdAt: string;
}

export interface CreateOrderItemDto {
  productId: string;
  productVariantId?: string;
  quantity: number;
}

// Order Status History
export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  userId?: string | null;
  notes?: string | null;
  createdAt: string;
}

// Shipping Method
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string | null;
  price: string; // Decimal as string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShippingMethodDto {
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateShippingMethodDto extends Partial<CreateShippingMethodDto> {}

// Query DTOs
export interface ProductQueryDto {
  status?: ProductStatus;
  isVisible?: boolean;
  isFeatured?: boolean;
  categoryId?: string;
  tagId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'basePrice' | 'createdAt' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderQueryDto {
  customerId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'orderNumber' | 'createdAt' | 'total';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerQueryDto {
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'email' | 'firstName' | 'lastName' | 'createdAt' | 'lastOrderAt';
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryQueryDto {
  search?: string;
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'quantity' | 'available';
  sortOrder?: 'asc' | 'desc';
}

export interface ReserveStockDto {
  productVariantId: string;
  quantity: number;
}

export interface ReleaseStockDto {
  productVariantId: string;
  quantity: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Order List Response (matches backend OrderListResponseDto)
export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Product List Response (matches backend ProductListResponseDto)
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Customer List Response (matches backend CustomerListResponseDto)
export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// E-Commerce Settings
export interface EcommerceSettings {
  id: string;
  scope: 'global' | 'user';
  userId?: string | null;
  storeName: string;
  storeDescription?: string | null;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxLabel: string;
  shippingEnabled: boolean;
  portalEnabled: boolean;
  allowGuestCheckout: boolean;
  trackInventory: boolean;
  lowStockThreshold: number;
  autoGenerateOrderNumbers: boolean;
  orderNumberPrefix: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEcommerceSettingsDto {
  scope: 'global' | 'user';
  userId?: string;
  storeName: string;
  storeDescription?: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxLabel: string;
  shippingEnabled: boolean;
  portalEnabled: boolean;
  allowGuestCheckout: boolean;
  trackInventory: boolean;
  lowStockThreshold: number;
  autoGenerateOrderNumbers: boolean;
  orderNumberPrefix: string;
}

export interface UpdateEcommerceSettingsDto {
  storeName?: string;
  storeDescription?: string | null;
  currency?: string;
  currencySymbol?: string;
  taxRate?: number;
  taxLabel?: string;
  shippingEnabled?: boolean;
  portalEnabled?: boolean;
  allowGuestCheckout?: boolean;
  trackInventory?: boolean;
  lowStockThreshold?: number;
  autoGenerateOrderNumbers?: boolean;
  orderNumberPrefix?: string;
}

// Cart & Storefront Types

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
  };
  productVariant?: {
    id: string;
    name: string;
    price?: string | null;
    image?: string | null;
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

export interface CustomerAccount {
  id: string;
  customerId: string;
  email: string;
  emailVerified: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  isActive: boolean;
  displayOrder: number;
  configuration?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

// Storefront Query Types (Public-Facing E-Commerce)

export enum SortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export interface StorefrontQueryDto {
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
}

export interface StorefrontProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  basePrice: number;
  compareAtPrice?: number | null;
  featuredImage?: string | null;
  images: string[];
  status: ProductStatus;
  isVisible: boolean;
  isFeatured: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  variants?: Array<{
    id: string;
    name: string;
    sku?: string | null;
    attributes: Record<string, any>;
    price?: number | null;
    isActive: boolean;
    inventory?: {
      quantity: number;
      reserved: number;
      available: number;
    };
  }>;
}

export interface StorefrontProductListResponseDto {
  products: StorefrontProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StorefrontCategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount: number;
  children?: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    productCount: number;
  }>;
}
