'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StorefrontProductResponseDto } from '@/types/ecommerce';
import { StorefrontHeader } from '@/components/storefront';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { ProductGallery } from '@/components/storefront/ProductGallery';
import { ProductInfo } from '@/components/storefront/ProductInfo';
import { VariantSelector } from '@/components/storefront/VariantSelector';
import { QuantitySelector } from '@/components/storefront/QuantitySelector';
import { AddToCartButton } from '@/components/storefront/AddToCartButton';
import { AddToWishlistButton } from '@/components/storefront/AddToWishlistButton';
import { RelatedProducts } from '@/components/storefront/RelatedProducts';
import { useAuth } from '@/contexts/AuthContext';

interface ProductDetailClientProps {
  product: StorefrontProductResponseDto;
  relatedProducts: StorefrontProductResponseDto[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // State for selected variant and quantity
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  
  // Get selected variant details
  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId);
  
  // Calculate current price (variant price overrides base price)
  const currentPrice = selectedVariant?.price !== null && selectedVariant?.price !== undefined
    ? selectedVariant.price
    : product.basePrice;
  
  // Check availability
  const isAvailable = selectedVariant
    ? (selectedVariant.inventory?.available || 0) > 0
    : true; // If no variants, assume available
  
  const availableQuantity = selectedVariant
    ? selectedVariant.inventory?.available || 0
    : 999; // If no variants, set high number
  
  // Get current image (variant image overrides product image)
  // Note: Variants don't have images in the current schema
  const currentImage = product.featuredImage;
  
  // Build breadcrumb dynamic values
  const breadcrumbValues = {
    productName: product.name,
    categoryName: product.categories?.[0]?.name || 'Products',
  };
  
  return (
    <>
      <StorefrontHeader />
      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb dynamicValues={breadcrumbValues} />
        </div>
      
      {/* Product Detail Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Product Gallery */}
          <div>
            <ProductGallery
              images={product.images}
              featuredImage={currentImage || product.featuredImage}
              productName={product.name}
            />
          </div>
          
          {/* Right Column: Product Info and Actions */}
          <div className="space-y-6">
            {/* Product Info */}
            <ProductInfo
              name={product.name}
              price={currentPrice}
              compareAtPrice={product.compareAtPrice}
              sku={selectedVariant?.sku || undefined}
              shortDescription={product.shortDescription}
              description={product.description}
              isAvailable={isAvailable}
            />
            
            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onVariantChange={setSelectedVariantId}
              />
            )}
            
            {/* Quantity Selector */}
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              maxQuantity={availableQuantity}
              disabled={!isAvailable}
            />
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <AddToCartButton
                productId={product.id}
                productVariantId={selectedVariantId}
                quantity={quantity}
                disabled={!isAvailable}
                className="flex-1"
              />
              
              {isAuthenticated && (
                <AddToWishlistButton
                  productId={product.id}
                  productVariantId={selectedVariantId}
                />
              )}
            </div>
            
            {/* Out of Stock Message */}
            {!isAvailable && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">Out of Stock</p>
                <p className="text-xs mt-1">This product is currently unavailable.</p>
              </div>
            )}
            
            {/* Product Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="pt-6 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category: any) => (
                    <button
                      key={category.id}
                      onClick={() => router.push(`/shop/category/${category.slug}`)}
                      className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
      </div>
    </>
  );
}
