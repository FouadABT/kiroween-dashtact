export class CartItemResponseDto {
  id: string;
  cartId: string;
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  priceSnapshot: string; // Decimal as string
  createdAt: Date;
  updatedAt: Date;
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

export class CartResponseDto {
  id: string;
  sessionId?: string | null;
  userId?: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemResponseDto[];
  subtotal: string; // Calculated total
  itemCount: number; // Total number of items
}
