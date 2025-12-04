# E-Commerce Storefront Design

## Overview

This document outlines the technical design for a complete customer-facing e-commerce storefront that integrates with the existing WooCommerce-style backend. The storefront provides product browsing, cart management, checkout with Cash on Delivery payment, customer accounts, and order tracking.

## Architecture

### System Components

**Frontend Pages** (Next.js 14 App Router):
- `/shop` - Product catalog with filtering and search
- `/shop/category/[category]` - Category-specific product listing
- `/shop/[slug]` - Product detail page
- `/cart` - Shopping cart management
- `/checkout` - Checkout process
- `/checkout/success` - Order confirmation
- `/account` - Customer account dashboard
- `/account/register` - Customer registration
- `/account/login` - Customer login
- `/account/orders` - Order history
- `/account/orders/[id]` - Order details
- `/account/wishlist` - Wishlist management (optional)

**Backend Modules** (NestJS):
- `storefront` - Public storefront API module
- `cart` - Shopping cart management
- `checkout` - Order creation and checkout
- `customer-auth` - Customer authentication (separate from admin auth)
- `wishlist` - Wishlist management

**Integration Points**:
- Existing Products, Orders, Customers, Inventory modules
- Existing notification system for order confirmations
- Existing upload system for product images
- Existing theme system for consistent styling

## Data Models

### Cart Model

```prisma
model Cart {
  id         String     @id @default(cuid())
  sessionId  String?    @unique @map("session_id")  // For guest users
  userId     String?    @map("user_id")              // For logged-in users
  expiresAt  DateTime   @map("expires_at")           // Auto-cleanup abandoned carts
  createdAt  DateTime   @default(now()) @map("created_at")
  updatedAt  DateTime   @updatedAt @map("updated_at")
  
  items      CartItem[]
  customer   CustomerAccount? @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([sessionId])
  @@index([userId])
  @@index([expiresAt])
  @@map("carts")
}

model CartItem {
  id               String          @id @default(cuid())
  cartId           String          @map("cart_id")
  productId        String          @map("product_id")
  productVariantId String?         @map("product_variant_id")
  quantity         Int             @default(1)
  
  // Price snapshot at time of adding to cart
  priceSnapshot    Decimal         @map("price_snapshot") @db.Decimal(10, 2)
  
  createdAt        DateTime        @default(now()) @map("created_at")
  updatedAt        DateTime        @updatedAt @map("updated_at")
  
  cart             Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product          Product         @relation(fields: [productId], references: [id])
  productVariant   ProductVariant? @relation(fields: [productVariantId], references: [id])
  
  @@unique([cartId, productId, productVariantId])
  @@index([cartId])
  @@index([productId])
  @@map("cart_items")
}
```

### Wishlist Model (Optional)

```prisma
model Wishlist {
  id        String         @id @default(cuid())
  userId    String         @unique @map("user_id")
  createdAt DateTime       @default(now()) @map("created_at")
  updatedAt DateTime       @updatedAt @map("updated_at")
  
  items     WishlistItem[]
  customer  CustomerAccount @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("wishlists")
}

model WishlistItem {
  id               String          @id @default(cuid())
  wishlistId       String          @map("wishlist_id")
  productId        String          @map("product_id")
  productVariantId String?         @map("product_variant_id")
  createdAt        DateTime        @default(now()) @map("created_at")
  
  wishlist         Wishlist        @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  product          Product         @relation(fields: [productId], references: [id])
  productVariant   ProductVariant? @relation(fields: [productVariantId], references: [id])
  
  @@unique([wishlistId, productId, productVariantId])
  @@index([wishlistId])
  @@index([productId])
  @@map("wishlist_items")
}
```

### CustomerAccount Model

```prisma
model CustomerAccount {
  id            String    @id @default(cuid())
  customerId    String    @unique @map("customer_id")  // Links to existing Customer model
  email         String    @unique
  password      String                                  // Hashed with bcrypt
  emailVerified Boolean   @default(false) @map("email_verified")
  lastLogin     DateTime? @map("last_login")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  customer      Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  carts         Cart[]
  wishlist      Wishlist?
  
  @@index([email])
  @@index([customerId])
  @@map("customer_accounts")
}
```

### PaymentMethod Model

```prisma
model PaymentMethod {
  id            String   @id @default(cuid())
  name          String                                  // "Cash on Delivery", "Credit Card", etc.
  type          String                                  // "COD", "CARD", "PAYPAL", etc.
  description   String?
  isActive      Boolean  @default(true) @map("is_active")
  displayOrder  Int      @default(0) @map("display_order")
  
  // Configuration stored as JSON (fees, restrictions, etc.)
  configuration Json?
  
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  @@map("payment_methods")
}
```

## Components and Interfaces

### Backend Services

#### StorefrontService
- `getPublicProducts(filters)` - Get published products for catalog
- `getProductBySlug(slug)` - Get product details for detail page
- `getProductsByCategory(categorySlug, filters)` - Get category products
- `searchProducts(query, filters)` - Search products
- `getRelatedProducts(productId)` - Get related products
- `getCategories()` - Get all categories with product counts

#### CartService
- `getOrCreateCart(sessionId, userId)` - Get existing or create new cart
- `addItem(cartId, productId, variantId, quantity)` - Add item to cart
- `updateItemQuantity(cartItemId, quantity)` - Update quantity
- `removeItem(cartItemId)` - Remove item from cart
- `getCartWithItems(cartId)` - Get cart with all items
- `calculateCartTotals(cartId)` - Calculate subtotal, tax, total
- `validateInventory(cartId)` - Check if all items are in stock
- `clearCart(cartId)` - Remove all items
- `mergeGuestCart(guestSessionId, userId)` - Merge guest cart with user cart on login
- `cleanupExpiredCarts()` - Cron job to delete expired carts

#### CheckoutService
- `validateCheckout(cartId, shippingAddress, billingAddress)` - Validate checkout data
- `calculateShipping(cartId, shippingAddress, shippingMethodId)` - Calculate shipping cost
- `calculateTax(cartId, shippingAddress)` - Calculate tax
- `createOrder(checkoutDto)` - Create order from cart
- `reserveInventory(orderItems)` - Reserve stock for order
- `processPayment(orderId, paymentMethodId)` - Process payment (COD = skip)
- `sendOrderConfirmation(orderId)` - Send confirmation notification

#### CustomerAuthService
- `register(email, password, name, phone)` - Register new customer
- `login(email, password)` - Authenticate customer
- `validateToken(token)` - Validate JWT token
- `refreshToken(refreshToken)` - Refresh access token
- `logout(userId)` - Logout customer
- `requestPasswordReset(email)` - Send password reset email (future)
- `resetPassword(token, newPassword)` - Reset password (future)

#### WishlistService (Optional)
- `getOrCreateWishlist(userId)` - Get or create wishlist
- `addItem(userId, productId, variantId)` - Add to wishlist
- `removeItem(wishlistItemId)` - Remove from wishlist
- `getWishlistWithItems(userId)` - Get wishlist with products
- `moveToCart(wishlistItemId, cartId)` - Move item to cart

### Frontend Components

#### Shop Pages

**Product Catalog** (`/shop`):
- `ProductGrid` - Grid layout of product cards
- `ProductCard` - Individual product display
- `ProductFilters` - Category, price, search filters
- `ProductSort` - Sort dropdown (price, name, newest)
- `Pagination` - Page navigation
- `CategorySidebar` - Category tree navigation
- `SearchBar` - Product search input

**Product Detail** (`/shop/[slug]`):
- `ProductGallery` - Image gallery with zoom
- `ProductInfo` - Name, price, SKU, description
- `VariantSelector` - Size, color, etc. selection
- `QuantitySelector` - Quantity input with +/- buttons
- `AddToCartButton` - Add to cart action
- `AddToWishlistButton` - Add to wishlist (logged-in only)
- `RelatedProducts` - Related product carousel
- `ProductBreadcrumb` - Breadcrumb navigation

#### Cart & Checkout

**Shopping Cart** (`/cart`):
- `CartItemList` - List of cart items
- `CartItem` - Individual item with image, name, quantity, price
- `QuantityUpdater` - Update quantity inline
- `RemoveButton` - Remove item from cart
- `CartSummary` - Subtotal, tax, shipping, total
- `CheckoutButton` - Proceed to checkout
- `EmptyCart` - Empty state message

**Checkout** (`/checkout`):
- `CheckoutForm` - Multi-step or single-page form
- `ShippingAddressForm` - Shipping address fields
- `BillingAddressForm` - Billing address fields
- `ShippingMethodSelector` - Select shipping method
- `PaymentMethodSelector` - Select payment method (COD)
- `OrderSummary` - Review order items and totals
- `PlaceOrderButton` - Submit order
- `CheckoutProgress` - Progress indicator

**Order Confirmation** (`/checkout/success`):
- `OrderConfirmation` - Success message
- `OrderSummary` - Order details
- `OrderNumber` - Prominent order number display
- `TrackingLink` - Link to customer portal
- `ContinueShoppingButton` - Return to shop

#### Customer Account

**Account Dashboard** (`/account`):
- `AccountLayout` - Sidebar navigation layout
- `ProfileCard` - Customer profile summary
- `RecentOrders` - Recent order list
- `QuickActions` - Edit profile, view orders, wishlist

**Registration** (`/account/register`):
- `RegistrationForm` - Email, password, name, phone
- `PasswordStrengthIndicator` - Visual password strength
- `TermsCheckbox` - Terms and conditions acceptance

**Login** (`/account/login`):
- `LoginForm` - Email and password fields
- `RememberMeCheckbox` - Remember me option
- `ForgotPasswordLink` - Password reset link (future)
- `RegisterLink` - Link to registration

**Order History** (`/account/orders`):
- `OrderList` - Table or card list of orders
- `OrderCard` - Order summary card
- `OrderStatusBadge` - Visual status indicator
- `ViewDetailsButton` - Link to order details

**Order Details** (`/account/orders/[id]`):
- `OrderHeader` - Order number, date, status
- `OrderItemList` - List of order items
- `OrderTimeline` - Visual status timeline
- `ShippingInfo` - Shipping address and tracking
- `BillingInfo` - Billing address
- `OrderActions` - Cancel, reorder buttons

**Wishlist** (`/account/wishlist`):
- `WishlistGrid` - Grid of wishlist items
- `WishlistItem` - Product card with add to cart
- `RemoveFromWishlistButton` - Remove item
- `EmptyWishlist` - Empty state message

### API Endpoints

#### Storefront API (Public)
```typescript
GET    /storefront/products                    // List published products
GET    /storefront/products/:slug              // Get product by slug
GET    /storefront/categories                  // List categories
GET    /storefront/categories/:slug/products   // Get category products
GET    /storefront/search?q=query              // Search products
GET    /storefront/products/:id/related        // Get related products
```

#### Cart API
```typescript
GET    /cart                                   // Get current cart
POST   /cart/items                             // Add item to cart
PATCH  /cart/items/:id                         // Update item quantity
DELETE /cart/items/:id                         // Remove item
GET    /cart/totals                            // Get cart totals
POST   /cart/validate                          // Validate inventory
DELETE /cart                                   // Clear cart
```

#### Checkout API
```typescript
POST   /checkout/validate                      // Validate checkout data
POST   /checkout/calculate-shipping            // Calculate shipping
POST   /checkout/calculate-tax                 // Calculate tax
POST   /checkout/create-order                  // Create order
GET    /checkout/payment-methods               // Get available payment methods
GET    /checkout/shipping-methods              // Get available shipping methods
```

#### Customer Auth API
```typescript
POST   /customer-auth/register                 // Register customer
POST   /customer-auth/login                    // Login customer
POST   /customer-auth/logout                   // Logout customer
POST   /customer-auth/refresh                  // Refresh token
GET    /customer-auth/profile                  // Get customer profile
PATCH  /customer-auth/profile                  // Update profile
```

#### Customer Orders API (Authenticated)
```typescript
GET    /customer/orders                        // Get customer orders
GET    /customer/orders/:id                    // Get order details
POST   /customer/orders/:id/cancel             // Cancel order
POST   /customer/orders/:id/reorder            // Reorder items
```

#### Wishlist API (Authenticated)
```typescript
GET    /wishlist                               // Get wishlist
POST   /wishlist/items                         // Add to wishlist
DELETE /wishlist/items/:id                     // Remove from wishlist
POST   /wishlist/items/:id/move-to-cart        // Move to cart
```

## Data Flow

### Product Browsing Flow

1. **Customer visits /shop**
2. **Fetch products** - GET /storefront/products with filters
3. **Display grid** - Render ProductGrid with ProductCards
4. **Apply filters** - Update URL params and refetch
5. **Click product** - Navigate to /shop/[slug]
6. **Fetch product details** - GET /storefront/products/:slug
7. **Display details** - Render ProductGallery, ProductInfo, etc.

### Add to Cart Flow

1. **Customer clicks "Add to Cart"**
2. **Get or create cart** - Check localStorage for sessionId or userId
3. **Add item** - POST /cart/items with productId, variantId, quantity
4. **Update cart count** - Update cart icon badge
5. **Show confirmation** - Toast notification "Added to cart"
6. **Update cart** - Refetch cart data

### Checkout Flow

1. **Customer clicks "Proceed to Checkout"**
2. **Navigate to /checkout**
3. **Check authentication** - Redirect to login if required (optional)
4. **Display checkout form** - Shipping, billing, payment
5. **Validate form** - Client-side validation
6. **Calculate totals** - POST /checkout/calculate-shipping and /checkout/calculate-tax
7. **Submit order** - POST /checkout/create-order
8. **Reserve inventory** - Backend reserves stock
9. **Create order** - Backend creates Order record
10. **Clear cart** - Backend clears cart
11. **Send notification** - Backend sends order confirmation
12. **Redirect to success** - Navigate to /checkout/success with order number

### Customer Registration Flow

1. **Customer visits /account/register**
2. **Fill form** - Email, password, name, phone
3. **Validate** - Client-side validation (email format, password strength)
4. **Submit** - POST /customer-auth/register
5. **Hash password** - Backend hashes with bcrypt
6. **Create CustomerAccount** - Backend creates account
7. **Create Customer** - Backend creates Customer record
8. **Issue JWT** - Backend returns access and refresh tokens
9. **Store tokens** - Frontend stores in localStorage and cookies
10. **Redirect** - Navigate to /account dashboard

### Customer Login Flow

1. **Customer visits /account/login**
2. **Fill form** - Email and password
3. **Submit** - POST /customer-auth/login
4. **Validate credentials** - Backend checks email and password
5. **Issue JWT** - Backend returns tokens
6. **Store tokens** - Frontend stores tokens
7. **Merge carts** - Backend merges guest cart with user cart
8. **Redirect** - Navigate to /account or previous page

## Error Handling

### Validation Errors
- Invalid email format
- Weak password (< 8 characters)
- Missing required fields
- Invalid quantity (< 1 or > inventory)
- Invalid product or variant ID

### Business Logic Errors
- Product out of stock
- Cart item no longer available
- Shipping method not available for address
- Payment method not available
- Order total below minimum for COD

### Authentication Errors
- Invalid credentials
- Email already registered
- Token expired
- Unauthorized access to account pages

### Error Response Format
```typescript
{
  statusCode: 400,
  message: "Product is out of stock",
  error: "Bad Request",
  details: {
    productId: "abc123",
    variantId: "xyz789",
    requested: 5,
    available: 0
  }
}
```

## Security Considerations

### Authentication & Authorization
- Customer authentication separate from admin authentication
- JWT tokens with 15-minute access token, 7-day refresh token
- Secure, httpOnly cookies for refresh tokens
- CSRF protection on all forms
- Rate limiting on login and registration (5 attempts per 15 minutes)

### Data Protection
- All passwords hashed with bcrypt (10 salt rounds)
- No credit card storage (PCI compliance)
- HTTPS required for all pages
- Input sanitization to prevent XSS
- SQL injection prevention via Prisma ORM

### Session Management
- Guest carts identified by secure sessionId (32 bytes)
- Session timeout after 30 minutes of inactivity
- Cart expiration after 7 days
- Token blacklist for logout

## Performance Optimization

### Database Indexes
- Cart: sessionId, userId, expiresAt
- CartItem: cartId, productId
- CustomerAccount: email, customerId
- Wishlist: userId
- WishlistItem: wishlistId, productId

### Caching Strategy
- Product catalog cached for 5 minutes
- Category list cached for 10 minutes
- Cart data not cached (real-time)
- Product detail pages cached for 1 minute

### Frontend Optimization
- Server-side rendering (SSR) for product pages
- Static generation (SSG) for category pages
- Image optimization with Next.js Image component
- Lazy loading for below-the-fold content
- Code splitting for route-based chunks
- Prefetching for product links on hover

### API Optimization
- Pagination for product lists (default 24 per page)
- Eager loading for cart items with product data
- Batch inventory checks for cart validation
- Debounced search queries (300ms)

## Testing Strategy

### Unit Tests
- Service methods (cart, checkout, auth)
- Business logic (totals calculation, inventory validation)
- Validation logic (DTOs, forms)
- Helper functions (password hashing, token generation)

### Integration Tests
- API endpoints (request/response)
- Database operations (Prisma queries)
- Service interactions (cart → checkout → order)
- Authentication flow (register → login → logout)

### E2E Tests
- Complete shopping flow (browse → add to cart → checkout → order)
- Customer registration and login
- Cart management (add, update, remove)
- Wishlist management
- Order history viewing

### Performance Tests
- Product catalog load time (< 2s)
- Checkout process completion time (< 5s)
- Cart operations response time (< 500ms)
- Concurrent user handling (100+ users)

## Deployment Considerations

### Environment Variables
```env
# Frontend
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_STOREFRONT_URL=https://shop.example.com
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_GUEST_CHECKOUT=true

# Backend
CUSTOMER_JWT_SECRET=your-customer-jwt-secret
CUSTOMER_JWT_EXPIRATION=15m
CUSTOMER_REFRESH_TOKEN_EXPIRATION=7d
CART_EXPIRATION_DAYS=7
```

### Database Migration
1. Run Prisma migration: `npm run prisma:migrate`
2. Generate Prisma client: `npm run prisma:generate`
3. Seed payment methods: `npm run prisma:seed`
4. Verify schema changes

### Monitoring
- Track cart abandonment rate
- Monitor checkout completion rate
- Track product page views
- Monitor API response times
- Alert on inventory issues
- Track customer registration rate

