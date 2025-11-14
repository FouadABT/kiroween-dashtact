# Shopping Cart Page

This directory contains the shopping cart page implementation for the e-commerce storefront.

## Files

- `page.tsx` - Server component that generates metadata and renders the cart page
- `CartPageClient.tsx` - Client component that handles cart state and operations

## Features

### Cart Management
- View all items in cart with product images, names, variants, and prices
- Update item quantities with debounced API calls (500ms)
- Remove individual items from cart
- Clear entire cart with confirmation
- Real-time cart total calculations

### Empty State
- Displays friendly empty cart message when no items
- "Continue Shopping" button to return to shop

### Cart Summary
- Subtotal calculation
- Estimated tax (10%)
- Estimated shipping (free over $50, otherwise $5.99)
- Total calculation
- Free shipping progress indicator

### Checkout
- Validates inventory before proceeding to checkout
- Shows validation errors for out-of-stock items
- Redirects to checkout page on success

## Components Used

All cart components are located in `frontend/src/components/cart/`:

- `CartItemList` - List container for cart items with clear cart button
- `CartItem` - Individual cart item display with image, details, and actions
- `QuantityUpdater` - Inline quantity editor with +/- buttons and input
- `CartSummary` - Order summary with subtotal, tax, shipping, and total
- `CheckoutButton` - Validates cart and proceeds to checkout
- `EmptyCart` - Empty state display

## Session Management

For guest users (not logged in):
- Session ID is generated and stored in localStorage as `cart_session_id`
- Format: `guest_{timestamp}_{random}`
- Used to maintain cart across page refreshes

For authenticated users:
- User ID is used instead of session ID
- Cart is merged on login

## API Integration

Uses `CartApi` from `@/lib/api.ts`:
- `getCart(sessionId)` - Load cart for guest or authenticated user
- `updateCartItem(itemId, { quantity })` - Update item quantity
- `removeCartItem(itemId)` - Remove item from cart
- `clearCart(cartId)` - Clear all items
- `validateCart(cartId)` - Validate inventory before checkout

## Type Definitions

Uses types from `@/types/ecommerce.ts`:
- `Cart` - Cart with items, subtotal, and item count
- `CartItem` - Individual cart item with product and variant details
- `UpdateCartItemDto` - DTO for updating item quantity

## Error Handling

- Loading states with spinner
- Error messages for failed operations
- Validation errors for out-of-stock items
- Confirmation dialog for clearing cart

## Responsive Design

- Mobile: Single column layout
- Desktop: Two-column layout (cart items + summary sidebar)
- Sticky summary on desktop for easy access to checkout

## Metadata & SEO

- Title: "Shopping Cart"
- Description: "Review your cart and proceed to checkout"
- Robots: noindex, follow (cart is user-specific, shouldn't be indexed)
- Breadcrumb: Home > Cart

## Future Enhancements

- Save for later functionality
- Coupon code input
- Gift wrapping options
- Estimated delivery date
- Product recommendations
- Cart abandonment recovery
