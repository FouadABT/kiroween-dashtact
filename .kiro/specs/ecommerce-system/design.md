# E-Commerce System Design

## Overview

This document outlines the technical design for integrating a modern e-commerce system into the existing dashboard starter kit. The system will seamlessly integrate with existing authentication, notification, and permission systems while providing comprehensive product management, order processing, inventory tracking, and customer portal functionality.

## Architecture

### System Components

**Backend Modules** (NestJS):
- `ecommerce` - Main e-commerce module
- `customers` - Customer management
- `products` - Product catalog management
- `orders` - Order processing and management
- `inventory` - Stock tracking and management

**Frontend Pages** (Next.js 14):
- `/dashboard/ecommerce` - E-commerce overview dashboard
- `/dashboard/ecommerce/products` - Product management
- `/dashboard/ecommerce/orders` - Order management
- `/dashboard/ecommerce/customers` - Customer management
- `/dashboard/ecommerce/inventory` - Inventory tracking
- `/portal/orders/[token]` - Public customer portal

**Integration Points**:
- Existing notification system for order alerts
- Existing permission system for access control
- Existing upload system for product images
- Existing theme system for UI consistency

## Data Models

### Customer Model

```prisma
model Customer {
  id              String   @id @default(cuid())
  email           String   @unique
  firstName       String   @map("first_name")
  lastName        String   @map("last_name")
  phone           String?
  company         String?
  
  // Addresses stored as JSON for flexibility
  shippingAddress Json?    @map("shipping_address")
  billingAddress  Json?    @map("billing_address")
  
  // Customer metadata
  notes           String?  @db.Text
  tags            String[] @default([])
  
  // Portal access
  portalToken     String?  @unique @map("portal_token")
  portalExpiresAt DateTime? @map("portal_expires_at")
  
  // Timestamps
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  lastOrderAt     DateTime? @map("last_order_at")
  
  // Relations
  orders          Order[]
  
  @@index([email])
  @@index([portalToken])
  @@index([createdAt])
  @@map("customers")
}
```

### Product Models

```prisma
model Product {
  id              String            @id @default(cuid())
  name            String
  slug            String            @unique
  description     String?           @db.Text
  shortDescription String?          @map("short_description")
  
  // Pricing
  basePrice       Decimal           @map("base_price") @db.Decimal(10, 2)
  compareAtPrice  Decimal?          @map("compare_at_price") @db.Decimal(10, 2)
  cost            Decimal?          @db.Decimal(10, 2)
  
  // SKU and tracking
  sku             String?           @unique
  barcode         String?
  
  // Images
  featuredImage   String?           @map("featured_image")
  images          String[]          @default([])
  
  // Status and visibility
  status          ProductStatus     @default(DRAFT)
  isVisible       Boolean           @default(true) @map("is_visible")
  isFeatured      Boolean           @default(false) @map("is_featured")
  
  // SEO
  metaTitle       String?           @map("meta_title")
  metaDescription String?           @map("meta_description")
  
  // Timestamps
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")
  publishedAt     DateTime?         @map("published_at")
  
  // Relations
  categories      ProductCategory[]
  tags            ProductTag[]
  variants        ProductVariant[]
  orderItems      OrderItem[]
  
  @@index([slug])
  @@index([status])
  @@index([isFeatured])
  @@map("products")
}
```


```prisma
model ProductCategory {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  parentId    String?   @map("parent_id")
  displayOrder Int      @default(0) @map("display_order")
  isVisible   Boolean   @default(true) @map("is_visible")
  image       String?
  
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  parent      ProductCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    ProductCategory[] @relation("CategoryHierarchy")
  products    Product[]
  
  @@index([slug])
  @@index([parentId])
  @@map("product_categories")
}

model ProductTag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  createdAt DateTime  @default(now()) @map("created_at")
  products  Product[]
  
  @@index([slug])
  @@map("product_tags")
}

model ProductVariant {
  id              String    @id @default(cuid())
  productId       String    @map("product_id")
  name            String
  sku             String?   @unique
  barcode         String?
  
  // Variant attributes (size, color, material, etc.)
  attributes      Json      // { "size": "Large", "color": "Blue" }
  
  // Pricing override
  price           Decimal?  @db.Decimal(10, 2)
  compareAtPrice  Decimal?  @map("compare_at_price") @db.Decimal(10, 2)
  cost            Decimal?  @db.Decimal(10, 2)
  
  // Images
  image           String?
  
  // Status
  isActive        Boolean   @default(true) @map("is_active")
  
  // Timestamps
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  // Relations
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  inventory       Inventory?
  orderItems      OrderItem[]
  
  @@index([productId])
  @@index([sku])
  @@map("product_variants")
}
```

### Inventory Model

```prisma
model Inventory {
  id                String         @id @default(cuid())
  productVariantId  String         @unique @map("product_variant_id")
  
  // Stock levels
  quantity          Int            @default(0)
  reserved          Int            @default(0)
  available         Int            @default(0) // Computed: quantity - reserved
  
  // Thresholds
  lowStockThreshold Int            @default(10) @map("low_stock_threshold")
  
  // Tracking
  trackInventory    Boolean        @default(true) @map("track_inventory")
  allowBackorder    Boolean        @default(false) @map("allow_backorder")
  
  // Timestamps
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")
  lastRestockedAt   DateTime?      @map("last_restocked_at")
  
  // Relations
  productVariant    ProductVariant @relation(fields: [productVariantId], references: [id], onDelete: Cascade)
  adjustments       InventoryAdjustment[]
  
  @@index([productVariantId])
  @@map("inventory")
}

model InventoryAdjustment {
  id          String    @id @default(cuid())
  inventoryId String    @map("inventory_id")
  
  // Adjustment details
  quantityChange Int    @map("quantity_change")
  reason      String
  notes       String?   @db.Text
  
  // Attribution
  userId      String?   @map("user_id")
  
  // Timestamps
  createdAt   DateTime  @default(now()) @map("created_at")
  
  // Relations
  inventory   Inventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  
  @@index([inventoryId])
  @@index([createdAt])
  @@map("inventory_adjustments")
}
```


### Order Models

```prisma
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique @map("order_number")
  customerId      String        @map("customer_id")
  
  // Order status
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING) @map("payment_status")
  fulfillmentStatus FulfillmentStatus @default(UNFULFILLED) @map("fulfillment_status")
  
  // Pricing
  subtotal        Decimal       @db.Decimal(10, 2)
  tax             Decimal       @default(0) @db.Decimal(10, 2)
  shipping        Decimal       @default(0) @db.Decimal(10, 2)
  discount        Decimal       @default(0) @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  
  // Shipping details
  shippingAddress Json          @map("shipping_address")
  billingAddress  Json          @map("billing_address")
  shippingMethodId String?      @map("shipping_method_id")
  trackingNumber  String?       @map("tracking_number")
  
  // Customer info snapshot
  customerEmail   String        @map("customer_email")
  customerName    String        @map("customer_name")
  customerPhone   String?       @map("customer_phone")
  
  // Notes
  customerNotes   String?       @map("customer_notes") @db.Text
  internalNotes   String?       @map("internal_notes") @db.Text
  
  // Timestamps
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  paidAt          DateTime?     @map("paid_at")
  shippedAt       DateTime?     @map("shipped_at")
  deliveredAt     DateTime?     @map("delivered_at")
  cancelledAt     DateTime?     @map("cancelled_at")
  
  // Relations
  customer        Customer      @relation(fields: [customerId], references: [id])
  items           OrderItem[]
  statusHistory   OrderStatusHistory[]
  shippingMethod  ShippingMethod? @relation(fields: [shippingMethodId], references: [id])
  
  @@index([customerId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
  @@map("orders")
}

model OrderItem {
  id                String         @id @default(cuid())
  orderId           String         @map("order_id")
  productId         String         @map("product_id")
  productVariantId  String?        @map("product_variant_id")
  
  // Product snapshot (in case product is deleted)
  productName       String         @map("product_name")
  variantName       String?        @map("variant_name")
  sku               String?
  
  // Pricing
  quantity          Int
  unitPrice         Decimal        @map("unit_price") @db.Decimal(10, 2)
  totalPrice        Decimal        @map("total_price") @db.Decimal(10, 2)
  
  // Timestamps
  createdAt         DateTime       @default(now()) @map("created_at")
  
  // Relations
  order             Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product           Product        @relation(fields: [productId], references: [id])
  productVariant    ProductVariant? @relation(fields: [productVariantId], references: [id])
  
  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

model OrderStatusHistory {
  id          String      @id @default(cuid())
  orderId     String      @map("order_id")
  
  // Status change
  fromStatus  OrderStatus? @map("from_status")
  toStatus    OrderStatus  @map("to_status")
  
  // Attribution
  userId      String?     @map("user_id")
  notes       String?     @db.Text
  
  // Timestamp
  createdAt   DateTime    @default(now()) @map("created_at")
  
  // Relations
  order       Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@index([orderId])
  @@index([createdAt])
  @@map("order_status_history")
}

model ShippingMethod {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  isActive    Boolean  @default(true) @map("is_active")
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  orders      Order[]
  
  @@map("shipping_methods")
}
```


### Enums

```prisma
enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum FulfillmentStatus {
  UNFULFILLED
  PARTIALLY_FULFILLED
  FULFILLED
}
```

## Components and Interfaces

### Backend Services

#### CustomersService
- `findAll(filters)` - List customers with pagination and search
- `findOne(id)` - Get customer details with order history
- `create(dto)` - Create new customer
- `update(id, dto)` - Update customer information
- `delete(id)` - Soft delete customer (if no orders)
- `generatePortalToken(id)` - Generate secure portal access token
- `getByPortalToken(token)` - Retrieve customer by portal token
- `getOrderHistory(id)` - Get customer's order history
- `getStatistics(id)` - Calculate customer lifetime value and metrics

#### ProductsService
- `findAll(filters)` - List products with filtering and pagination
- `findOne(id)` - Get product details with variants
- `findBySlug(slug)` - Get product by slug
- `create(dto)` - Create new product
- `update(id, dto)` - Update product
- `delete(id)` - Delete product
- `addVariant(productId, dto)` - Add product variant
- `updateVariant(variantId, dto)` - Update variant
- `deleteVariant(variantId)` - Delete variant
- `bulkUpdateStatus(ids, status)` - Bulk status update

#### OrdersService
- `findAll(filters)` - List orders with filtering
- `findOne(id)` - Get order details
- `findByOrderNumber(orderNumber)` - Get order by number
- `create(dto)` - Create new order
- `updateStatus(id, status, userId)` - Update order status
- `addNote(id, note, userId)` - Add internal note
- `calculateTotals(items, shipping, tax, discount)` - Calculate order totals
- `getStatusHistory(id)` - Get order status history
- `cancel(id, reason, userId)` - Cancel order

#### InventoryService
- `findAll(filters)` - List inventory with low stock alerts
- `findByVariant(variantId)` - Get inventory for variant
- `adjustQuantity(variantId, change, reason, userId)` - Adjust inventory
- `reserveStock(variantId, quantity)` - Reserve stock for order
- `releaseStock(variantId, quantity)` - Release reserved stock
- `checkAvailability(variantId, quantity)` - Check if stock available
- `getLowStockItems()` - Get items below threshold
- `getAdjustmentHistory(inventoryId)` - Get adjustment history

### Frontend Components

#### Dashboard Pages

**Products Page** (`/dashboard/ecommerce/products`):
- ProductsList - Grid/list view of products
- ProductCard - Individual product card
- ProductFilters - Filter by category, status, tags
- ProductSearch - Search products
- BulkActions - Bulk operations toolbar
- ProductEditor - Create/edit product form
- VariantManager - Manage product variants
- ImageGallery - Product image management

**Orders Page** (`/dashboard/ecommerce/orders`):
- OrdersList - Table view of orders
- OrderCard - Order summary card
- OrderFilters - Filter by status, date, customer
- OrderDetails - Detailed order view
- OrderStatusUpdater - Status change interface
- OrderTimeline - Visual status timeline
- OrderNotes - Internal notes section

**Customers Page** (`/dashboard/ecommerce/customers`):
- CustomersList - Table view of customers
- CustomerCard - Customer summary card
- CustomerSearch - Search customers
- CustomerDetails - Detailed customer view
- CustomerOrderHistory - Customer's orders
- CustomerStats - Lifetime value, order count

**Inventory Page** (`/dashboard/ecommerce/inventory`):
- InventoryList - Table view of inventory
- InventoryCard - Stock level card
- LowStockAlert - Low stock warnings
- InventoryAdjuster - Adjust stock form
- AdjustmentHistory - History of changes
- BulkImport - CSV import for inventory

#### Customer Portal

**Portal Page** (`/portal/orders/[token]`):
- PortalLayout - Public layout (no dashboard nav)
- OrderList - Customer's orders
- OrderDetails - Order details view
- OrderStatus - Visual status indicator
- OrderTimeline - Delivery progress
- TrackingInfo - Shipping tracking

### API Endpoints

#### Customers API
```typescript
GET    /customers                    // List customers
GET    /customers/:id                // Get customer
POST   /customers                    // Create customer
PATCH  /customers/:id                // Update customer
DELETE /customers/:id                // Delete customer
GET    /customers/:id/orders         // Get customer orders
POST   /customers/:id/portal-token   // Generate portal token
GET    /customers/portal/:token      // Get by portal token
```

#### Products API
```typescript
GET    /products                     // List products
GET    /products/:id                 // Get product
GET    /products/slug/:slug          // Get by slug
POST   /products                     // Create product
PATCH  /products/:id                 // Update product
DELETE /products/:id                 // Delete product
POST   /products/:id/variants        // Add variant
PATCH  /products/variants/:id        // Update variant
DELETE /products/variants/:id        // Delete variant
POST   /products/bulk-status         // Bulk status update
```


#### Orders API
```typescript
GET    /orders                       // List orders
GET    /orders/:id                   // Get order
GET    /orders/number/:orderNumber   // Get by order number
POST   /orders                       // Create order
PATCH  /orders/:id/status            // Update status
POST   /orders/:id/notes             // Add note
POST   /orders/:id/cancel            // Cancel order
GET    /orders/:id/history           // Get status history
```

#### Inventory API
```typescript
GET    /inventory                    // List inventory
GET    /inventory/variant/:id        // Get by variant
POST   /inventory/adjust             // Adjust quantity
GET    /inventory/low-stock          // Get low stock items
GET    /inventory/:id/history        // Get adjustment history
POST   /inventory/reserve            // Reserve stock
POST   /inventory/release            // Release stock
```

## Data Flow

### Order Creation Flow

1. **Customer places order** (via API or admin creates)
2. **Validate inventory** - Check stock availability
3. **Reserve stock** - Reserve quantities for order items
4. **Calculate totals** - Compute subtotal, tax, shipping, total
5. **Create order** - Save order to database
6. **Create order items** - Save line items
7. **Send notification** - Notify admins of new order
8. **Generate portal token** - Create customer portal access
9. **Send customer email** - Email with portal link (future)

### Order Status Update Flow

1. **Admin updates status** (e.g., PENDING → PROCESSING)
2. **Validate transition** - Check if status change is valid
3. **Update order** - Change order status
4. **Record history** - Log status change with user and timestamp
5. **Trigger actions** - Based on new status:
   - SHIPPED: Update shippedAt timestamp
   - DELIVERED: Update deliveredAt timestamp
   - CANCELLED: Release reserved inventory
6. **Send notification** - Notify relevant parties

### Inventory Adjustment Flow

1. **Admin adjusts inventory** (add/remove stock)
2. **Validate adjustment** - Check permissions
3. **Update inventory** - Modify quantity
4. **Recalculate available** - available = quantity - reserved
5. **Record adjustment** - Log change with reason and user
6. **Check threshold** - If below low stock threshold
7. **Send notification** - Alert admins of low stock

## Error Handling

### Validation Errors
- Invalid product data (missing required fields)
- Invalid order data (negative quantities)
- Invalid inventory adjustment (insufficient stock)
- Invalid status transitions

### Business Logic Errors
- Insufficient inventory for order
- Cannot delete customer with orders
- Cannot delete product with pending orders
- Invalid order status transition

### Error Response Format
```typescript
{
  statusCode: 400,
  message: "Insufficient inventory for product variant",
  error: "Bad Request",
  details: {
    variantId: "abc123",
    requested: 10,
    available: 5
  }
}
```

## Testing Strategy

### Unit Tests
- Service methods (CRUD operations)
- Business logic (order calculations, inventory checks)
- Validation logic (DTOs, status transitions)
- Helper functions (token generation, slug creation)

### Integration Tests
- API endpoints (request/response)
- Database operations (Prisma queries)
- Service interactions (orders → inventory)
- Notification integration

### E2E Tests
- Complete order flow (create → process → ship → deliver)
- Inventory management flow (adjust → check → alert)
- Customer portal access (token → view orders)
- Permission-based access control

## Security Considerations

### Authentication & Authorization
- All admin endpoints protected with JWT authentication
- Permission-based access control:
  - `customers:read`, `customers:write`, `customers:delete`
  - `products:read`, `products:write`, `products:delete`
  - `orders:read`, `orders:write`, `orders:delete`
  - `inventory:read`, `inventory:write`
- Customer portal uses secure token-based access (no login required)

### Data Validation
- All DTOs validated with class-validator
- Sanitize user inputs to prevent XSS
- Validate file uploads (product images)
- Validate numeric inputs (prices, quantities)

### Token Security
- Portal tokens are cryptographically secure (32 bytes)
- Tokens expire after 30 days
- Tokens are unique per customer
- Tokens can be regenerated

## Performance Optimization

### Database Indexes
- Customer email, portal token
- Product slug, status, featured
- Order number, status, customer, date
- Inventory variant, low stock
- Composite indexes for common queries

### Caching Strategy
- Cache product catalog (5 minutes TTL)
- Cache customer portal data (10 minutes TTL)
- Cache inventory levels (1 minute TTL)
- Invalidate cache on updates

### Pagination
- Default limit: 20 items
- Maximum limit: 100 items
- Cursor-based pagination for large datasets
- Offset-based pagination for small datasets

## Integration with Existing Systems

### Notification System Integration

**New Order Notification**:
```typescript
await this.notificationsService.create({
  userId: adminId,
  title: 'New Order Received',
  message: `Order #${order.orderNumber} from ${order.customerName}`,
  category: 'WORKFLOW',
  priority: 'HIGH',
  actionUrl: `/dashboard/ecommerce/orders/${order.id}`,
  actionLabel: 'View Order',
  requiredPermission: 'orders:read',
});
```

**Low Stock Alert**:
```typescript
await this.notificationsService.create({
  userId: adminId,
  title: 'Low Stock Alert',
  message: `${product.name} is running low (${inventory.available} remaining)`,
  category: 'WORKFLOW',
  priority: 'NORMAL',
  actionUrl: `/dashboard/ecommerce/inventory`,
  actionLabel: 'View Inventory',
  requiredPermission: 'inventory:read',
});
```

### Permission System Integration

**Seed Permissions**:
```typescript
// In backend/prisma/seed-data/auth.seed.ts
{
  name: 'customers:read',
  resource: 'customers',
  action: 'read',
  description: 'View customers'
},
{
  name: 'products:write',
  resource: 'products',
  action: 'write',
  description: 'Create/edit products'
},
// ... more permissions
```

**Assign to Roles**:
```typescript
ADMIN: {
  permissions: [
    'customers:*',
    'products:*',
    'orders:*',
    'inventory:*',
  ],
},
MANAGER: {
  permissions: [
    'customers:read',
    'products:read', 'products:write',
    'orders:read', 'orders:write',
    'inventory:read',
  ],
},
```

### Upload System Integration

Use existing upload service for product images:
```typescript
// Upload product image
const file = await this.uploadsService.uploadFile(image, 'products');
product.featuredImage = file.url;
```

### Theme System Integration

All e-commerce UI components will:
- Use existing design tokens (colors, typography)
- Support light/dark theme modes
- Follow existing component patterns
- Use shadcn/ui components

## Deployment Considerations

### Database Migration
1. Run Prisma migration: `npm run prisma:migrate`
2. Generate Prisma client: `npm run prisma:generate`
3. Seed permissions: `npm run prisma:seed`
4. Verify schema changes

### Environment Variables
```env
# No new environment variables required
# Uses existing DATABASE_URL, JWT_SECRET, etc.
```

### Monitoring
- Track order creation rate
- Monitor inventory levels
- Alert on failed order processing
- Track API response times
- Monitor notification delivery
