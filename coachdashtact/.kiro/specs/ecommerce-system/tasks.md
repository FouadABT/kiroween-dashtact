# E-Commerce System Implementation Plan

- [x] 1. Extend database schema and models for e-commerce






- [x] 1.1 Add Customer model to Prisma schema with portal token support

  - Create Customer model with email, name, phone, addresses (JSON), portal token fields
  - Add indexes for email, portalToken, createdAt
  - _Requirements: 1.1, 1.2, 6.7, 6.8_


- [x] 1.2 Add Product models to Prisma schema

  - Create Product model with name, slug, description, pricing, SKU, images, status
  - Create ProductCategory model with hierarchical support (parent-child)
  - Create ProductTag model for flexible classification
  - Create ProductVariant model with attributes (JSON), pricing overrides
  - Add all necessary indexes and relations
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.6_



- [x] 1.3 Add Inventory models to Prisma schema


  - Create Inventory model with quantity, reserved, available, thresholds
  - Create InventoryAdjustment model for tracking stock changes
  - Add indexes and relations to ProductVariant

  - _Requirements: 1.6, 4.1, 4.2, 4.6_



- [x] 1.4 Add Order models to Prisma schema

  - Create Order model with orderNumber, status, pricing, addresses, timestamps
  - Create OrderItem model for line items
  - Create OrderStatusHistory model for status tracking
  - Create ShippingMethod model
  - Add all necessary enums (OrderStatus, PaymentStatus, FulfillmentStatus, ProductStatus)

  - Add indexes for orderNumber, status, customerId, createdAt
  - _Requirements: 1.7, 1.8, 1.9, 1.10, 5.1, 5.3, 5.4_

- [x] 1.5 Run database migration and generate Prisma client

  - Run `npm run prisma:migrate` to create migration
  - Run `npm run prisma:generate` to update Prisma client
  - Verify schema changes in database
  - _Requirements: 1.11, 1.12_

- [x] 2. Implement backend customer management module






- [x] 2.1 Create customers module structure

  - Generate NestJS module: `nest g module customers`
  - Generate service: `nest g service customers`
  - Generate controller: `nest g controller customers`
  - Register module in app.module.ts
  - _Requirements: 2.1_


- [x] 2.2 Create customer DTOs

  - Create CreateCustomerDto with validation
  - Create UpdateCustomerDto with validation
  - Create CustomerQueryDto for filtering
  - Create CustomerResponseDto for API responses
  - _Requirements: 2.2, 2.4, 2.5_

- [x] 2.3 Implement CustomersService methods


  - Implement findAll() with pagination and search
  - Implement findOne() with order history
  - Implement create() for new customers
  - Implement update() for customer updates
  - Implement delete() with order check
  - Implement generatePortalToken() for secure access
  - Implement getByPortalToken() for portal authentication
  - Implement getOrderHistory() and getStatistics()
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.1, 6.7_

- [x] 2.4 Implement CustomersController endpoints


  - Add GET /customers with permission guard (customers:read)
  - Add GET /customers/:id with permission guard
  - Add POST /customers with permission guard (customers:write)
  - Add PATCH /customers/:id with permission guard
  - Add DELETE /customers/:id with permission guard
  - Add POST /customers/:id/portal-token endpoint
  - Add GET /customers/portal/:token (public endpoint)
  - _Requirements: 2.8, 2.9, 6.1, 6.7_

- [x] 3. Implement backend product management module






- [x] 3.1 Create products module structure

  - Generate NestJS module, service, and controller
  - Register module in app.module.ts
  - _Requirements: 3.1_


- [x] 3.2 Create product DTOs

  - Create CreateProductDto with validation
  - Create UpdateProductDto with validation
  - Create CreateVariantDto with validation
  - Create ProductQueryDto for filtering
  - Create BulkStatusUpdateDto
  - _Requirements: 3.1, 3.4, 3.6, 3.7_

- [x] 3.3 Implement ProductsService methods


  - Implement findAll() with category/tag/status filtering
  - Implement findOne() with variants
  - Implement findBySlug() for public access
  - Implement create() with slug generation
  - Implement update() for products
  - Implement delete() with order check
  - Implement addVariant(), updateVariant(), deleteVariant()
  - Implement bulkUpdateStatus() for multiple products
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 3.4 Implement ProductsController endpoints


  - Add GET /products with permission guard (products:read)
  - Add GET /products/:id with permission guard
  - Add GET /products/slug/:slug (public endpoint)
  - Add POST /products with permission guard (products:write)
  - Add PATCH /products/:id with permission guard
  - Add DELETE /products/:id with permission guard (products:delete)
  - Add variant management endpoints
  - Add POST /products/bulk-status endpoint
  - _Requirements: 3.9, 3.10, 3.11_

- [x] 4. Implement backend inventory management module






- [x] 4.1 Create inventory module structure


  - Generate NestJS module, service, and controller
  - Register module in app.module.ts
  - _Requirements: 4.1_

- [x] 4.2 Create inventory DTOs


  - Create AdjustInventoryDto with validation
  - Create InventoryQueryDto for filtering
  - Create ReserveStockDto and ReleaseStockDto
  - _Requirements: 4.6_

- [x] 4.3 Implement InventoryService methods


  - Implement findAll() with low stock filtering
  - Implement findByVariant() for specific variant
  - Implement adjustQuantity() with reason tracking
  - Implement reserveStock() for order placement
  - Implement releaseStock() for order cancellation
  - Implement checkAvailability() for stock validation
  - Implement getLowStockItems() for alerts
  - Implement getAdjustmentHistory()
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 4.4 Implement InventoryController endpoints


  - Add GET /inventory with permission guard (inventory:read)
  - Add GET /inventory/variant/:id with permission guard
  - Add POST /inventory/adjust with permission guard (inventory:write)
  - Add GET /inventory/low-stock with permission guard
  - Add POST /inventory/reserve and /inventory/release endpoints
  - _Requirements: 4.8, 4.9_

- [x] 5. Implement backend order management module





- [x] 5.1 Create orders module structure


  - Generate NestJS module, service, and controller
  - Register module in app.module.ts
  - Inject CustomersService, ProductsService, InventoryService, NotificationsService
  - _Requirements: 5.1_

- [x] 5.2 Create order DTOs


  - Create CreateOrderDto with validation
  - Create UpdateOrderStatusDto with validation
  - Create OrderQueryDto for filtering
  - Create AddOrderNoteDto
  - _Requirements: 5.1, 5.3, 5.6_

- [x] 5.3 Implement OrdersService core methods


  - Implement findAll() with status/date/customer filtering
  - Implement findOne() with items and history
  - Implement findByOrderNumber() for lookups
  - Implement create() with inventory reservation and total calculation
  - Implement calculateTotals() helper method
  - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 5.4 Implement OrdersService status management


  - Implement updateStatus() with validation and history tracking
  - Implement cancel() with inventory release
  - Implement addNote() for internal notes
  - Implement getStatusHistory()
  - Add status transition validation logic
  - _Requirements: 5.3, 5.4, 5.7_


- [x] 5.5 Implement OrdersController endpoints


  - Add GET /orders with permission guard (orders:read)
  - Add GET /orders/:id with permission guard
  - Add GET /orders/number/:orderNumber with permission guard
  - Add POST /orders with permission guard (orders:write)
  - Add PATCH /orders/:id/status with permission guard
  - Add POST /orders/:id/notes with permission guard
  - Add POST /orders/:id/cancel with permission guard (orders:delete)
  - _Requirements: 5.8, 5.9, 5.10_

- [x] 6. Integrate notification system for e-commerce events




- [x] 6.1 Add notification integration to OrdersService


  - Send "New Order" notification to admins on order creation
  - Use category WORKFLOW, priority HIGH
  - Include order number and customer name in message
  - Add action link to view order details
  - Filter recipients by orders:read permission
  - _Requirements: 7.1, 7.4, 7.5, 7.6, 7.8_

- [x] 6.2 Add notification integration to InventoryService



  - Send "Low Stock Alert" notification when inventory below threshold
  - Use category WORKFLOW, priority NORMAL
  - Include product name and available quantity
  - Add action link to inventory page
  - Filter recipients by inventory:read permission
  - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.7_


- [x] 6.3 Add notification for order status changes


  - Send notification when order status updated
  - Include old and new status in message
  - Notify assigned admin or all with orders:read permission
  - _Requirements: 7.2, 7.4, 7.8_

- [x] 7. Add e-commerce permissions to auth system






- [x] 7.1 Add e-commerce permissions to seed data

  - Add customers:read, customers:write, customers:delete
  - Add products:read, products:write, products:delete
  - Add orders:read, orders:write, orders:delete
  - Add inventory:read, inventory:write
  - Update backend/prisma/seed-data/auth.seed.ts
  - _Requirements: 8.1, 8.2, 8.3, 8.4_


- [x] 7.2 Assign permissions to roles

  - Assign all e-commerce permissions to Admin role
  - Assign read/write permissions to Manager role (no delete)
  - Update role configurations in seed data
  - Run `npm run prisma:seed` to update database
  - _Requirements: 8.5, 8.6_

- [-] 8. Implement frontend product management UI





- [x] 8.1 Create frontend types for e-commerce


  - Create frontend/src/types/ecommerce.ts with Product, Customer, Order, Inventory interfaces
  - Match backend DTOs structure

  - _Requirements: 3.1, 3.2, 3.3_

- [x] 8.2 Create products API client

  - Add product API methods to frontend/src/lib/api.ts
  - Implement getProducts(), getProduct(), createProduct(), updateProduct(), deleteProduct()
  - Implement variant management methods
  - _Requirements: 3.1, 3.9_


- [x] 8.3 Create products list page

  - Create frontend/src/app/dashboard/ecommerce/products/page.tsx
  - Implement ProductsList component with grid/list view
  - Add ProductCard component for individual products
  - Add ProductFilters for category/status/tag filtering
  - Add ProductSearch component
  - Add BulkActions toolbar
  - Protect with PermissionGuard (products:read)
  - _Requirements: 3.1, 3.9, 9.1, 9.2, 9.3, 9.4, 9.5_




- [-] 8.4 Create product editor page

  - Create frontend/src/app/dashboard/ecommerce/products/new/page.tsx
  - Create frontend/src/app/dashboard/ecommerce/products/[id]/edit/page.tsx
  - Implement ProductEditor component with form
  - Add VariantManager for managing variants
  - Add ImageGallery for product images
  - Use existing upload system for images
  - Protect with PermissionGuard (products:write)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.10_

- [x] 9. Implement frontend order management UI




- [x] 9.1 Create orders API client


  - Add order API methods to frontend/src/lib/api.ts
  - Implement getOrders(), getOrder(), createOrder(), updateOrderStatus(), cancelOrder()
  - _Requirements: 5.1, 5.8_

- [x] 9.2 Create orders list page


  - Create frontend/src/app/dashboard/ecommerce/orders/page.tsx
  - Implement OrdersList component with table view
  - Add OrderCard component for order summaries
  - Add OrderFilters for status/date/customer filtering
  - Protect with PermissionGuard (orders:read)
  - _Requirements: 5.1, 5.8, 9.1, 9.2, 9.3, 9.4_

- [x] 9.3 Create order details page


  - Create frontend/src/app/dashboard/ecommerce/orders/[id]/page.tsx
  - Implement OrderDetails component showing items, totals, addresses
  - Add OrderStatusUpdater for changing status
  - Add OrderTimeline for visual status history
  - Add OrderNotes section for internal notes
  - Protect with PermissionGuard (orders:read)
  - _Requirements: 5.2, 5.3, 5.4, 5.9_

- [x] 10. Implement customer management UI and portal




- [x] 10.1 Create customers API client


  - Add customer API methods to frontend/src/lib/api.ts
  - Implement getCustomers(), getCustomer(), createCustomer(), updateCustomer(), deleteCustomer()
  - Implement generatePortalToken() and getByPortalToken()
  - _Requirements: 2.1, 2.8_

- [x] 10.2 Create customers list page


  - Create frontend/src/app/dashboard/ecommerce/customers/page.tsx
  - Implement CustomersList component with table view
  - Add CustomerCard component
  - Add CustomerSearch component
  - Protect with PermissionGuard (customers:read)
  - _Requirements: 2.1, 2.2, 2.8, 9.1, 9.2_

- [x] 10.3 Create customer details page



  - Create frontend/src/app/dashboard/ecommerce/customers/[id]/page.tsx
  - Implement CustomerDetails component
  - Add CustomerOrderHistory showing all orders
  - Add CustomerStats showing lifetime value and metrics
  - Add button to generate portal token
  - Protect with PermissionGuard (customers:read)
  - _Requirements: 2.3, 2.7, 2.8_

- [x] 10.4 Create customer portal page


  - Create frontend/src/app/portal/orders/[token]/page.tsx
  - Implement PortalLayout (public, no dashboard navigation)
  - Implement OrderList showing customer's orders
  - Implement OrderDetails with status and timeline
  - Add OrderStatus visual indicator
  - Add TrackingInfo for shipping
  - No authentication required (token-based access)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.9_

- [x] 10.5 Add e-commerce navigation to dashboard


  - Update frontend/src/contexts/NavigationContext.tsx
  - Add "E-Commerce" section with Products, Orders, Customers, Inventory menu items
  - Add appropriate permissions to each menu item
  - Add icons for each menu item
  - _Requirements: 8.7, 9.1, 9.2_

- [x] 10.6 Create inventory management page


  - Create frontend/src/app/dashboard/ecommerce/inventory/page.tsx
  - Implement InventoryList component with table view
  - Add LowStockAlert component for warnings
  - Add InventoryAdjuster form for stock adjustments
  - Add AdjustmentHistory component
  - Protect with PermissionGuard (inventory:read)
  - _Requirements: 4.1, 4.7, 4.8, 9.1, 9.2_

- [x] 10.7 Create e-commerce dashboard overview


  - Create frontend/src/app/dashboard/ecommerce/page.tsx
  - Display total revenue, order count, average order value
  - Show top-selling products
  - Display order status distribution
  - Show inventory status summary
  - Add date range filtering
  - Protect with PermissionGuard (orders:read)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.7, 10.9_

- [x] 11. Implement e-commerce configuration system








- [x] 11.1 Add EcommerceSettings model to database schema



  - Add EcommerceSettings model to backend/prisma/schema.prisma
  - Include fields: storeName (String), storeDescription (String?)
  - Add currency (String, default: 'USD'), currencySymbol (String, default: '$')
  - Add taxRate (Decimal, default: 0), taxLabel (String, default: 'Tax')
  - Add shippingEnabled (Boolean, default: true)
  - Add portalEnabled (Boolean, default: true), allowGuestCheckout (Boolean, default: false)
  - Add trackInventory (Boolean, default: true), lowStockThreshold (Int, default: 10)
  - Add autoGenerateOrderNumbers (Boolean, default: true), orderNumberPrefix (String, default: 'ORD')
  - Add scope field ('global' or 'user'), userId (String?, optional)
  - Add createdAt, updatedAt timestamps
  - Run migration: `npm run prisma:migrate`
  - Generate client: `npm run prisma:generate`
  - _Requirements: Database-backed configuration_

- [x] 11.2 Create e-commerce settings backend module



  - Generate NestJS module: `nest g module ecommerce-settings`
  - Generate service: `nest g service ecommerce-settings`
  - Generate controller: `nest g controller ecommerce-settings`
  - Create DTOs: CreateEcommerceSettingsDto, UpdateEcommerceSettingsDto
  - Implement service methods: findGlobal(), findByUserId(), create(), update()
  - Add GET /ecommerce-settings/global endpoint (public or authenticated)
  - Add PATCH /ecommerce-settings/:id endpoint (requires settings:write permission)
  - Register module in app.module.ts
  - _Requirements: Backend API for settings management_

- [x] 11.3 Add default e-commerce settings to seed data



  - Update backend/prisma/seed.ts
  - Add default global e-commerce settings
  - Set storeName: 'My Store', currency: 'USD', taxRate: 0
  - Set all boolean flags to sensible defaults (enabled: true)
  - Run seed: `npm run prisma:seed`
  - _Requirements: Default configuration on fresh install_


- [x] 11.4 Add e-commerce feature flag to features.config.ts


  - Update frontend/src/config/features.config.ts
  - Add EcommerceConfig interface with enabled property only
  - Add ecommerce property to FeaturesConfig interface
  - Read from NEXT_PUBLIC_ENABLE_ECOMMERCE environment variable
  - Set enabled: process.env.NEXT_PUBLIC_ENABLE_ECOMMERCE === 'true'
  - _Requirements: Environment-based feature toggle_

- [x] 11.5 Create e-commerce settings context for frontend



  - Create frontend/src/contexts/EcommerceSettingsContext.tsx
  - Fetch settings from /ecommerce-settings/global on mount
  - Provide settings object to all e-commerce components
  - Include: storeName, currency, currencySymbol, taxRate, etc.
  - Cache settings in localStorage with TTL
  - Provide updateSettings() method for admin users
  - _Requirements: Frontend access to database settings_


- [x] 11.6 Add e-commerce settings page to dashboard


  - Create frontend/src/app/dashboard/settings/ecommerce/page.tsx
  - Show settings form only if NEXT_PUBLIC_ENABLE_ECOMMERCE=true
  - Add form fields for all EcommerceSettings properties
  - Group settings: Store Info, Currency & Tax, Customer Portal, Inventory, Orders
  - Save settings via API (requires settings:write permission)
  - Show success/error notifications
  - Protect with PermissionGuard (settings:write)
  - _Requirements: Admin UI for configuration_


- [x] 11.7 Implement conditional e-commerce navigation


  - Update frontend/src/contexts/NavigationContext.tsx
  - Check featuresConfig.ecommerce.enabled before adding e-commerce menu items
  - Hide entire "E-Commerce" section when NEXT_PUBLIC_ENABLE_ECOMMERCE=false
  - Follow same pattern as blog navigation
  - _Requirements: Dynamic navigation based on feature flag_


- [x] 11.8 Add feature guards to e-commerce routes


  - Create frontend/src/components/ecommerce/EcommerceFeatureGuard.tsx
  - Check featuresConfig.ecommerce.enabled
  - Redirect to /dashboard with notFound() if disabled
  - Apply to all e-commerce pages:
    - /dashboard/ecommerce/page.tsx
    - /dashboard/ecommerce/products/page.tsx
    - /dashboard/ecommerce/orders/page.tsx
    - /dashboard/ecommerce/customers/page.tsx
    - /dashboard/ecommerce/inventory/page.tsx
  - Apply to customer portal: /portal/orders/[token]/page.tsx
  - _Requirements: Route protection based on feature flag_

- [x] 11.9 Use settings in e-commerce components



  - Update OrdersService to use taxRate from settings
  - Update ProductsService to use currency from settings
  - Update InventoryService to use lowStockThreshold from settings
  - Update order number generation to use orderNumberPrefix
  - Display currency symbol in all price displays
  - Use storeName in customer portal header
  - _Requirements: Apply settings throughout e-commerce system_

- [x] 11.10 Create e-commerce configuration documentation



  - Create ECOMMERCE_CONFIGURATION_GUIDE.md
  - Document NEXT_PUBLIC_ENABLE_ECOMMERCE environment variable
  - Document all database settings and their purposes
  - Explain how to enable/disable e-commerce feature
  - Document settings API endpoints
  - Add troubleshooting section
  - Include examples for different scenarios
  - _Requirements: Comprehensive documentation_

- [x] 12. Implement comprehensive e-commerce testing









- [x] 12.1 Create backend unit tests for products module



  - Create backend/src/products/products.service.spec.ts
  - Test findAll(), findOne(), create(), update(), delete()
  - Test variant management methods
  - Test slug generation and uniqueness
  - Test bulk status updates
  - Mock Prisma client
  - _Requirements: Backend test coverage_

- [x] 12.2 Create backend unit tests for orders module




  - Create backend/src/orders/orders.service.spec.ts
  - Test order creation with inventory reservation
  - Test status updates and validation
  - Test order cancellation with inventory release
  - Test total calculations
  - Test order notes functionality
  - Mock dependencies (CustomersService, InventoryService, NotificationsService)
  - _Requirements: Backend test coverage_

- [x] 12.3 Create backend unit tests for inventory module



  - Create backend/src/inventory/inventory.service.spec.ts
  - Test stock adjustments with history tracking
  - Test reserve/release stock operations
  - Test low stock detection
  - Test availability checks
  - Mock Prisma client
  - _Requirements: Backend test coverage_

- [x] 12.4 Create backend unit tests for customers module




  - Create backend/src/customers/customers.service.spec.ts
  - Test CRUD operations
  - Test portal token generation and validation
  - Test customer statistics calculation
  - Test order history retrieval
  - Mock Prisma client
  - _Requirements: Backend test coverage_

- [x] 12.5 Create backend E2E tests for e-commerce workflows




  - Create backend/test/ecommerce-workflow.e2e-spec.ts
  - Test complete order flow: create customer → create product → place order → update status
  - Test inventory reservation and release flow
  - Test customer portal access with token
  - Test permission-based access control
  - Test notification triggers
  - Use test database
  - _Requirements: Integration testing_

- [x] 12.6 Create frontend component tests for products


  - Create frontend/src/__tests__/products/ProductsList.test.tsx
  - Test product filtering and search
  - Test bulk actions
  - Test product card rendering
  - Mock API calls
  - _Requirements: Frontend test coverage_

- [x] 12.7 Create frontend component tests for orders


  - Create frontend/src/__tests__/orders/OrdersList.test.tsx
  - Create frontend/src/__tests__/orders/OrderDetails.test.tsx
  - Test order filtering
  - Test status updates
  - Test order timeline rendering
  - Mock API calls
  - _Requirements: Frontend test coverage_

- [x] 12.8 Create frontend component tests for customer portal


  - Create frontend/src/__tests__/portal/CustomerPortal.test.tsx
  - Test token-based access
  - Test order list rendering
  - Test order tracking display
  - Test public access (no auth required)
  - Mock API calls
  - _Requirements: Frontend test coverage_

- [x] 12.9 Create frontend integration tests for e-commerce


  - Create frontend/src/__tests__/integration/ecommerce-integration.test.tsx
  - Test navigation between e-commerce pages
  - Test permission-based UI rendering
  - Test configuration toggle (enable/disable e-commerce)
  - Test end-to-end user workflows
  - _Requirements: Integration testing_

- [x] 12.10 Add e-commerce test documentation



  - Create ECOMMERCE_TESTING_GUIDE.md
  - Document test setup and running instructions
  - Document test data requirements
  - Document mock strategies
  - Document coverage goals (80%+ target)
  - Add troubleshooting section
  - _Requirements: Testing documentation_
