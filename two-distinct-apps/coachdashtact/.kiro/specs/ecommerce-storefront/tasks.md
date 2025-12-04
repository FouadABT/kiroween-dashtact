# E-Commerce Storefront Implementation Plan

- [x] 1. Database Schema and Models for Storefront











- [x] 1.1 Add Cart and CartItem models to Prisma schema



  - Create Cart model with sessionId (String?, unique), userId (String?, optional), expiresAt (DateTime)
  - Add indexes for sessionId, userId, expiresAt
  - Create CartItem model with cartId, productId, productVariantId (optional), quantity (Int), priceSnapshot (Decimal)
  - Add unique constraint on [cartId, productId, productVariantId]
  - Add indexes for cartId, productId
  - Establish relations: Cart → CartItem (one-to-many), CartItem → Product, CartItem → ProductVariant
  - _Requirements: 1.1, 1.2, 1.7, 1.9_


- [x] 1.2 Add Wishlist and WishlistItem models to Prisma schema




  - Create Wishlist model with userId (String, unique), createdAt, updatedAt
  - Add index for userId
  - Create WishlistItem model with wishlistId, productId, productVariantId (optional), createdAt
  - Add unique constraint on [wishlistId, productId, productVariantId]
  - Add indexes for wishlistId, productId
  - Establish relations: Wishlist → WishlistItem (one-to-many), WishlistItem → Product, WishlistItem → ProductVariant
  - _Requirements: 1.3, 1.4, 1.7_



- [x] 1.3 Add CustomerAccount model to Prisma schema


  - Create CustomerAccount model with customerId (String, unique), email (String, unique), password (String)
  - Add emailVerified (Boolean, default: false), lastLogin (DateTime?, optional)
  - Add createdAt, updatedAt timestamps
  - Add indexes for email, customerId
  - Establish relation to existing Customer model (one-to-one)
  - Establish relations: CustomerAccount → Cart (one-to-many), CustomerAccount → Wishlist (one-to-one)
  - _Requirements: 1.5, 1.7_




- [x] 1.4 Add PaymentMethod model to Prisma schema


  - Create PaymentMethod model with name (String), type (String), description (String?, optional)
  - Add isActive (Boolean, default: true), displayOrder (Int, default: 0)
  - Add configuration (Json?, optional) for storing payment-specific settings (COD fees, restrictions, etc.)
  - Add createdAt, updatedAt timestamps
  - No relations needed (standalone configuration table)
  - _Requirements: 1.6, 1.7, 14.6_


- [x] 1.5 Run database migration and generate Prisma client


  - Run `npm run prisma:migrate` in backend directory to create migration
  - Run `npm run prisma:generate` to update Prisma client
  - Verify schema changes in database using Prisma Studio
  - Test that all relations are properly established
  - _Requirements: 1.7, 1.8_

- [x] 1.6 Create seed data for payment methods



  - Update `backend/prisma/seed.ts` to include payment methods
  - Add "Cash on Delivery" payment method: { name: "Cash on Delivery", type: "COD", isActive: true, displayOrder: 1 }
  - Add configuration: { fee: 0, minOrderAmount: 0, maxOrderAmount: null, availableCountries: [] }
  - Add placeholders for future payment methods (Credit Card, PayPal) with isActive: false
  - Run `npm run prisma:seed` to populate payment methods
  - _Requirements: 1.6, 14.1, 14.6_

- [x] 1.7 Create database cleanup script for expired carts



  - Create `backend/scripts/cleanup-expired-carts.ts` script
  - Query carts where expiresAt < now()
  - Delete expired carts (cascade will handle cart items)
  - Log number of carts cleaned up
  - Document how to schedule as cron job (daily at 2 AM)
  - _Requirements: 1.10_

- [-] 2. Backend API - Storefront, Cart, Checkout & Customer Auth








- [x] 2.1 Create storefront module for public product API



  - Generate NestJS module, service, and controller
  - Implement StorefrontService methods: getPublicProducts(), getProductBySlug(), getProductsByCategory(), searchProducts(), getRelatedProducts(), getCategories()
  - Implement StorefrontController endpoints (all public, no auth): GET /storefront/products, GET /storefront/products/:slug, GET /storefront/categories, GET /storefront/categories/:slug/products, GET /storefront/search, GET /storefront/products/:id/related
  - Only return PUBLISHED products with proper filtering, sorting, and pagination
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [x] 2.2 Create cart module for shopping cart management



  - Generate NestJS module, service, and controller
  - Create DTOs: AddToCartDto, UpdateCartItemDto, CartResponseDto
  - Implement CartService methods: getOrCreateCart(), addItem(), updateItemQuantity(), removeItem(), getCartWithItems(), calculateCartTotals(), validateInventory(), clearCart(), mergeGuestCart()
  - Implement CartController endpoints (all public): GET /cart, POST /cart/items, PATCH /cart/items/:id, DELETE /cart/items/:id, GET /cart/totals, POST /cart/validate, DELETE /cart
  - Support both guest (sessionId) and logged-in (userId) carts
  - Store price snapshot when adding items to cart
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 2.3 Create customer-auth module for customer authentication



  - Generate NestJS module, service, and controller
  - Create DTOs: RegisterCustomerDto, LoginCustomerDto, CustomerProfileDto
  - Create separate JWT strategy for customer tokens (different from admin auth)
  - Implement CustomerAuthService methods: register(), login(), validateToken(), refreshToken(), logout(), getProfile(), updateProfile()
  - Implement CustomerAuthController endpoints: POST /customer-auth/register, POST /customer-auth/login, POST /customer-auth/logout, POST /customer-auth/refresh, GET /customer-auth/profile, PATCH /customer-auth/profile
  - Hash passwords with bcrypt, issue JWT tokens, merge guest cart on login
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 8.1, 8.2, 8.3, 8.9, 8.10_

- [x] 2.4 Create checkout module for order creation



  - Generate NestJS module, service, and controller
  - Create DTOs: CheckoutDto, ShippingAddressDto, BillingAddressDto, CreateOrderFromCartDto
  - Inject CartService, OrdersService, InventoryService, CustomersService, NotificationsService
  - Implement CheckoutService validation methods: validateCheckout(), validateShippingAddress(), validateBillingAddress(), validatePaymentMethod(), validateShippingMethod()
  - Implement CheckoutService calculation methods: calculateShipping(), calculateTax(), calculateOrderTotals()
  - Implement CheckoutService order creation: createOrderFromCart() - validate cart, calculate totals, create Customer/Order/OrderItems, reserve inventory, clear cart
  - Implement CheckoutService payment: processPayment() - for COD set paymentStatus to PENDING
  - Implement CheckoutService notifications: sendOrderConfirmation() - notify customer and admins
  - Implement CheckoutController endpoints: POST /checkout/validate, POST /checkout/calculate-shipping, POST /checkout/calculate-tax, POST /checkout/create-order, GET /checkout/payment-methods, GET /checkout/shipping-methods
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 6.1, 6.2, 6.3, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9_

- [x] 2.5 Create customer-orders module for order history



  - Generate NestJS module, service, and controller
  - Inject OrdersService from existing orders module
  - Implement CustomerOrdersService methods: getCustomerOrders(), getOrderDetails(), cancelOrder(), reorderItems()
  - Validate customer owns the order before any operation
  - Implement CustomerOrdersController endpoints (all authenticated): GET /customer/orders, GET /customer/orders/:id, POST /customer/orders/:id/cancel, POST /customer/orders/:id/reorder
  - Use customer JWT guard for authentication
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

- [x] 2.6 Create wishlist module (Optional)



  - Generate NestJS module, service, and controller
  - Implement WishlistService methods: getOrCreateWishlist(), addItem(), removeItem(), getWishlistWithItems(), moveToCart()
  - Implement WishlistController endpoints (all authenticated): GET /wishlist, POST /wishlist/items, DELETE /wishlist/items/:id, POST /wishlist/items/:id/move-to-cart
  - Require customer authentication for all endpoints
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_

- [x] 2.7 Add COD configuration to EcommerceSettings




  - Add fields to EcommerceSettings model: codEnabled (Boolean), codFee (Decimal), codMinOrderAmount (Decimal), codMaxOrderAmount (Decimal?), codAvailableCountries (String[])
  - Run migration and update seed data with COD defaults
  - Implement COD validation in CheckoutService: check enabled, validate min/max amounts, validate country restrictions, add COD fee to total
  - _Requirements: 14.6, 14.7, 14.8_

- [-] 3. Frontend Storefront - Product Catalog, Cart & Checkout








- [x] 3.1 Create storefront types and API client




  - Create frontend/src/types/storefront.ts with Cart, CartItem, Wishlist, CustomerAccount, CheckoutData interfaces
  - Add storefront API methods to frontend/src/lib/api.ts
  - Implement product methods: getProducts(), getProductBySlug(), getCategories(), searchProducts(), getRelatedProducts()
  - Implement cart methods: getCart(), addToCart(), updateCartItem(), removeCartItem(), clearCart(), validateCart()
  - Implement checkout methods: validateCheckout(), calculateShipping(), calculateTax(), createOrder(), getPaymentMethods(), getShippingMethods()
  - _Requirements: 2.1, 4.1, 5.1_

- [x] 3.2 Create product catalog page (/shop)






  - Create frontend/src/app/shop/page.tsx with SSR for SEO
  - Implement ProductGrid component with responsive layout (1/2/3/4 columns based on screen size)
  - Implement ProductCard component with image, name, price, "Add to Cart" button, "Out of Stock" badge
  - Implement ProductFilters component with category tree, price range slider, search input
  - Implement ProductSort component with dropdown (price low-high, high-low, name, newest)
  - Implement Pagination component with page numbers and next/prev buttons
  - Fetch products with filters, sort, and pagination from API
  - Update URL params when filters change for shareable links
  - Add loading states and error handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [x] 3.3 Create category page (/shop/category/[category])






  - Create frontend/src/app/shop/category/[category]/page.tsx with SSR
  - Reuse ProductGrid, ProductCard, ProductFilters, ProductSort, Pagination components
  - Fetch products for specific category from API
  - Display category name, description, and product count
  - Show breadcrumb navigation: Home > Shop > Category Name
  - Generate metadata for SEO (title, description, structured data)
  - _Requirements: 2.1, 2.2, 2.10_


- [x] 3.4 Create product detail page (/shop/[slug])




  - Create frontend/src/app/shop/[slug]/page.tsx with SSR
  - Implement ProductGallery component with main image, thumbnails, zoom on hover, lightbox on click
  - Implement ProductInfo component with name, price, SKU, short description, full description
  - Implement VariantSelector component for size, color, etc. with visual swatches
  - Implement QuantitySelector component with +/- buttons and input field
  - Implement AddToCartButton component with loading state and success feedback
  - Implement AddToWishlistButton component (show only if logged in)
  - Implement RelatedProducts carousel with 4-6 products
  - Show breadcrumb: Home > Shop > Category > Product Name
  - Update price, availability, and image when variant selected
  - Generate structured data (JSON-LD) for product
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 3.5 Create shopping cart page (/cart)






  - Create frontend/src/app/cart/page.tsx
  - Implement CartItemList component with table or card layout
  - Implement CartItem component with product image, name, variant, quantity selector, price, remove button
  - Implement QuantityUpdater component for inline quantity changes with debounced API calls
  - Implement CartSummary component with subtotal, estimated tax, estimated shipping, total
  - Implement CheckoutButton component that validates inventory before proceeding
  - Show EmptyCart component with "Continue Shopping" button when cart is empty
  - Add loading states for cart operations
  - Show error messages for out-of-stock items
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [x] 3.6 Create checkout page (/checkout)






  - Create frontend/src/app/checkout/page.tsx
  - Implement CheckoutForm component with multi-step or single-page layout
  - Implement ShippingAddressForm component with all required fields (name, address, city, state, zip, phone)
  - Implement BillingAddressForm component with "Same as shipping" checkbox
  - Implement ShippingMethodSelector component with radio buttons and prices
  - Implement PaymentMethodSelector component showing COD with description
  - Implement OrderSummary component showing all items, quantities, prices, and totals
  - Implement PlaceOrderButton component with loading state
  - Add CheckoutProgress indicator (Shipping → Payment → Review)
  - Validate all fields with real-time error messages
  - Calculate shipping and tax in real-time as user fills form
  - Prevent duplicate submissions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 14.1, 14.4_

- [ ] 3.7 Create order confirmation page (/checkout/success)

  - Create frontend/src/app/checkout/success/page.tsx
  - Implement OrderConfirmation component with success icon and message
  - Display order number prominently with copy button
  - Implement OrderSummary component showing all order details
  - Display shipping address and estimated delivery date
  - Display payment method (Cash on Delivery) with instructions
  - Provide link to customer portal for order tracking
  - Add ContinueShoppingButton component
  - Prevent duplicate orders on page refresh (check order ID in URL)
  - Clear cart from localStorage/session
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 14.4, 14.9_
- [x] 3.8 Add responsive design and mobile optimization




- [ ] 3.8 Add responsive design and mobile optimization


  - Ensure all pages use responsive Tailwind classes (sm:, md:, lg:, xl:)
  - Implement mobile navigation with hamburger menu for categories
  - Optimize product grid: 1 column (mobile), 2-3 columns (tablet), 4 columns (desktop)
  - Use touch-friendly button sizes (min 44x44px) for mobile
  - Implement lazy loading for product images with Next.js Image component
  - Optimize checkout form for mobile with stacked layout
  - Add swipe gestures for product image galleries
  - Test on mobile devices (iOS Safari, Chrome Android)
  - Ensure fast load times on mobile networks (< 3s)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10_

- [x] 3.9 Implement SEO and performance optimizations






  - Add unique meta titles and descriptions to all pages using Next.js metadata API
  - Use semantic HTML with proper heading hierarchy (h1, h2, h3)
  - Generate structured data (JSON-LD) for products, breadcrumbs, organization
  - Create XML sitemap including all product and category pages
  - Use Next.js SSR for product pages and SSG for category pages
  - Use Next.js Image component for all images with proper sizes and formats
  - Implement lazy loading for below-the-fold content
  - Run Lighthouse audit and achieve 90+ Performance score
  - Implement caching strategy for product catalog (5 min TTL)
  - Use CDN for static assets (images, CSS, JS)
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10_

- [ ] 4. Frontend Customer Account - Registration, Login & Order Management








- [x] 4.1 Create customer authentication pages



  - Create frontend/src/app/account/register/page.tsx
  - Implement RegistrationForm component with email, password, name, phone fields
  - Implement PasswordStrengthIndicator component with visual feedback
  - Add TermsCheckbox component for terms and conditions
  - Validate email format and password strength (min 8 chars, uppercase, lowercase, number)
  - Submit to /customer-auth/register API
  - Store JWT tokens in localStorage and httpOnly cookies
  - Redirect to /account dashboard on success
  - Create frontend/src/app/account/login/page.tsx
  - Implement LoginForm component with email and password fields
  - Add RememberMeCheckbox component
  - Add ForgotPasswordLink component (placeholder for future)
  - Add RegisterLink component
  - Submit to /customer-auth/login API
  - Store JWT tokens and merge guest cart with user cart
  - Redirect to /account or previous page
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_



- [ ] 4.2 Create customer account dashboard

  - Create frontend/src/app/account/page.tsx
  - Implement AccountLayout component with sidebar navigation (Profile, Orders, Wishlist, Logout)
  - Implement ProfileCard component showing customer name, email, phone
  - Implement RecentOrders component showing last 5 orders with status badges
  - Add QuickActions component with buttons (Edit Profile, View All Orders, View Wishlist)
  - Protect with authentication guard (redirect to login if not authenticated)
  - Fetch customer profile and recent orders from API
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_



- [ ] 4.3 Create order history and details pages

  - Create frontend/src/app/account/orders/page.tsx
  - Implement OrderList component with table or card layout
  - Implement OrderCard component with order number, date, status badge, total, "View Details" button
  - Sort orders by date (newest first)
  - Add pagination if many orders
  - Protect with authentication guard
  - Create frontend/src/app/account/orders/[id]/page.tsx
  - Implement OrderHeader component with order number, date, status badge
  - Implement OrderItemList component showing all items with images, names, quantities, prices
  - Implement OrderTimeline component with visual progress (Pending → Processing → Shipped → Delivered)
  - Implement ShippingInfo component with address, tracking number, estimated delivery
  - Implement BillingInfo component with billing address and payment method
  - Implement OrderActions component with Cancel button (if PENDING) and Reorder button
  - Protect with authentication guard
  - Validate customer owns the order
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

- [x] 4.4 Create wishlist page (Optional)


  - Create frontend/src/app/account/wishlist/page.tsx
  - Implement WishlistGrid component with responsive layout
  - Implement WishlistItem component with product image, name, price, variant
  - Add AddToCartButton for each item
  - Add RemoveFromWishlistButton for each item
  - Show EmptyWishlist component with message and "Browse Products" button
  - Protect with authentication guard
  - Fetch wishlist from API
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_


- [ ] 4.5 Implement customer authentication context

  - Create frontend/src/contexts/CustomerAuthContext.tsx
  - Provide customer auth state: user, isAuthenticated, isLoading
  - Provide auth methods: login(), logout(), register(), refreshToken()
  - Store tokens in localStorage and httpOnly cookies
  - Auto-refresh tokens before expiration
  - Merge guest cart with user cart on login
  - Provide authentication guard HOC for protected routes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.9, 7.10_

- [x] 4.6 Add security measures


  - Ensure all pages use HTTPS in production
  - Implement CSRF protection on all forms using tokens
  - Use secure, httpOnly cookies for refresh tokens
  - Implement rate limiting on auth endpoints (5 attempts per 15 min)
  - Validate and sanitize all user inputs on client and server
  - Add session timeout after 30 minutes of inactivity
  - Log all authentication attempts for security monitoring
  - Test for XSS vulnerabilities in user-generated content
  - Test for SQL injection (Prisma ORM should prevent)
  - Review GDPR compliance for customer data (consent, data export, deletion)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10_

- [x] 4.7 Create storefront documentation



  - Create STOREFRONT_USER_GUIDE.md for customers (how to shop, checkout, track orders)
  - Create STOREFRONT_DEVELOPER_GUIDE.md for developers (architecture, API, deployment)
  - Document all API endpoints with request/response examples
  - Document environment variables (NEXT_PUBLIC_API_URL, etc.)
  - Document deployment process (build, migrate, seed, deploy)
  - Add troubleshooting section (common errors, solutions)
  - Include screenshots of key pages (catalog, cart, checkout, account)
  - Document COD payment setup and configuration
  - _Requirements: All requirements_
