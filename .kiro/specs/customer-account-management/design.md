# Customer Account Management System - Design

## Overview

The Customer Account Management System provides a comprehensive interface for customers to manage their ecommerce profiles. The system is built on the existing NestJS backend and Next.js frontend, leveraging the established authentication system (CustomerAuthContext) and API client patterns. The architecture separates concerns into distinct modules: profile management, address management, payment methods, wishlist, and settings.

## Architecture

### Frontend Architecture

```
Account Dashboard (AccountDashboardClient)
├── AccountLayout (Navigation & Layout)
├── Profile Section
│   ├── ProfileCard (Display)
│   └── ProfileEditForm (Edit)
├── Addresses Section
│   ├── AddressList (Display)
│   ├── AddressForm (Add/Edit)
│   └── AddressCard (Individual Address)
├── Payment Methods Section
│   ├── PaymentMethodList (Display)
│   ├── PaymentMethodForm (Add/Edit)
│   └── PaymentMethodCard (Individual Method)
├── Wishlist Section
│   ├── WishlistGrid (Display)
│   ├── WishlistItem (Individual Item)
│   └── WishlistEmpty (Empty State)
├── Settings Section
│   ├── NotificationSettings
│   ├── PrivacySettings
│   ├── PasswordSettings
│   └── TwoFactorSettings
└── RecentOrders (Dashboard Widget)
```

### Backend Architecture

```
Customer Account Module
├── customer-account.controller.ts
├── customer-account.service.ts
├── dto/
│   ├── update-profile.dto.ts
│   ├── create-address.dto.ts
│   ├── update-address.dto.ts
│   ├── create-payment-method.dto.ts
│   └── update-payment-method.dto.ts
└── customer-account.module.ts

Related Modules
├── customers/ (Existing - Customer CRUD)
├── customer-auth/ (Existing - Authentication)
├── orders/ (Existing - Order Management)
└── wishlists/ (Existing - Wishlist Management)
```

## Components and Interfaces

### Frontend Components

#### 1. AccountLayout
- **Purpose**: Main layout wrapper for account pages
- **Props**: children (ReactNode)
- **Features**: Sidebar navigation, breadcrumbs, responsive design
- **Location**: `frontend/src/components/customer-account/AccountLayout.tsx`

#### 2. ProfileCard & ProfileEditForm
- **Purpose**: Display and edit customer profile information
- **Props**: user (CustomerProfile), onUpdate (callback)
- **Features**: Form validation, success/error notifications
- **Location**: `frontend/src/components/customer-account/ProfileCard.tsx`

#### 3. AddressList & AddressForm
- **Purpose**: Manage customer addresses
- **Props**: addresses (Address[]), onAdd/onEdit/onDelete (callbacks)
- **Features**: Add/edit/delete addresses, set default address
- **Location**: `frontend/src/components/customer-account/AddressList.tsx`

#### 4. PaymentMethodList & PaymentMethodForm
- **Purpose**: Manage saved payment methods
- **Props**: paymentMethods (PaymentMethod[]), onAdd/onEdit/onDelete (callbacks)
- **Features**: Add/edit/delete payment methods, set default
- **Location**: `frontend/src/components/customer-account/PaymentMethodList.tsx`

#### 5. WishlistGrid & WishlistItem
- **Purpose**: Display and manage wishlist items
- **Props**: items (WishlistItem[]), onRemove/onAddToCart (callbacks)
- **Features**: Product display, add to cart, remove from wishlist
- **Location**: `frontend/src/components/customer-account/WishlistGrid.tsx`

#### 6. AccountSettings
- **Purpose**: Manage account preferences and security
- **Props**: user (CustomerProfile), onUpdate (callback)
- **Features**: Notification preferences, password change, 2FA
- **Location**: `frontend/src/components/customer-account/AccountSettings.tsx`

### Backend Controllers & Services

#### CustomerAccountController
- **Endpoints**:
  - `GET /customer-account/profile` - Get current customer profile
  - `PATCH /customer-account/profile` - Update profile
  - `GET /customer-account/addresses` - List addresses
  - `POST /customer-account/addresses` - Create address
  - `PATCH /customer-account/addresses/:id` - Update address
  - `DELETE /customer-account/addresses/:id` - Delete address
  - `PATCH /customer-account/addresses/:id/default` - Set default address
  - `GET /customer-account/payment-methods` - List payment methods
  - `POST /customer-account/payment-methods` - Create payment method
  - `PATCH /customer-account/payment-methods/:id` - Update payment method
  - `DELETE /customer-account/payment-methods/:id` - Delete payment method
  - `PATCH /customer-account/payment-methods/:id/default` - Set default payment method
  - `GET /customer-account/settings` - Get account settings
  - `PATCH /customer-account/settings` - Update settings
  - `POST /customer-account/password/change` - Change password
  - `POST /customer-account/2fa/enable` - Enable 2FA
  - `POST /customer-account/2fa/disable` - Disable 2FA

#### CustomerAccountService
- **Methods**:
  - `getProfile(customerId)` - Retrieve customer profile
  - `updateProfile(customerId, dto)` - Update profile information
  - `getAddresses(customerId)` - List all addresses
  - `createAddress(customerId, dto)` - Create new address
  - `updateAddress(customerId, addressId, dto)` - Update address
  - `deleteAddress(customerId, addressId)` - Delete address
  - `setDefaultAddress(customerId, addressId, type)` - Set default address
  - `getPaymentMethods(customerId)` - List payment methods
  - `createPaymentMethod(customerId, dto)` - Create payment method
  - `updatePaymentMethod(customerId, methodId, dto)` - Update payment method
  - `deletePaymentMethod(customerId, methodId)` - Delete payment method
  - `setDefaultPaymentMethod(customerId, methodId)` - Set default payment method
  - `getSettings(customerId)` - Get account settings
  - `updateSettings(customerId, dto)` - Update settings
  - `changePassword(customerId, oldPassword, newPassword)` - Change password
  - `enableTwoFactor(customerId)` - Enable 2FA
  - `disableTwoFactor(customerId)` - Disable 2FA

## Data Models

### Customer (Existing)
```typescript
interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  tags: string[];
  portalToken?: string;
  portalExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastOrderAt?: Date;
}
```

### CustomerAccount (Existing)
```typescript
interface CustomerAccount {
  id: string;
  customerId: string;
  email: string;
  password: string;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Address (New)
```typescript
interface Address {
  id: string;
  customerId: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### PaymentMethod (Existing)
```typescript
interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'cod' | 'bank_transfer';
  description?: string;
  isActive: boolean;
  displayOrder: number;
  configuration?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### CustomerPaymentMethod (New)
```typescript
interface CustomerPaymentMethod {
  id: string;
  customerId: string;
  paymentMethodId: string;
  cardLast4?: string;
  cardExpiry?: string;
  cardBrand?: string;
  billingAddressId?: string;
  isDefault: boolean;
  encryptedData?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### AccountSettings (New)
```typescript
interface AccountSettings {
  id: string;
  customerId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  twoFactorEnabled: boolean;
  privacyLevel: 'public' | 'private' | 'friends_only';
  createdAt: Date;
  updatedAt: Date;
}
```

### Wishlist (Existing)
```typescript
interface Wishlist {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: WishlistItem[];
}

interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  productVariantId?: string;
  createdAt: Date;
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Profile Update Persistence
*For any* customer profile update, after successfully saving changes to the database, retrieving the customer profile should return the updated values.
**Validates: Requirements 1.3, 1.4, 8.1**

### Property 2: Address Uniqueness per Customer
*For any* customer, the system should not allow duplicate addresses with identical street, city, state, postal code, and country combinations.
**Validates: Requirements 2.1, 2.3**

### Property 3: Default Address Exclusivity
*For any* customer and address type (shipping/billing), only one address should be marked as default at any time.
**Validates: Requirements 2.6**

### Property 4: Payment Method Encryption
*For any* saved payment method, sensitive data (card numbers, expiry dates) should be encrypted before storage and decrypted only when needed for display or processing.
**Validates: Requirements 3.3, 8.3**

### Property 5: Wishlist Item Consistency
*For any* wishlist item, the product referenced should exist in the products table and be accessible to the customer.
**Validates: Requirements 4.1, 4.4**

### Property 6: Settings Synchronization
*For any* account settings update, the change should be immediately reflected in subsequent API calls without requiring page refresh.
**Validates: Requirements 5.2, 5.3, 8.4**

### Property 7: Address Deletion Safety
*For any* address deletion, if the address is marked as default, the system should automatically assign another address as default before deletion.
**Validates: Requirements 2.5, 2.6**

### Property 8: Authentication Requirement
*For any* customer account endpoint, unauthenticated requests should be rejected with a 401 status code.
**Validates: Requirements 6.5, 6.6**

## Error Handling

### Frontend Error Handling
- **Validation Errors**: Display field-level error messages in forms
- **Network Errors**: Show toast notification with retry option
- **Authentication Errors**: Redirect to login page with return URL
- **Server Errors**: Display user-friendly error message with error code
- **Optimistic Updates**: Revert UI changes if server update fails

### Backend Error Handling
- **Validation Errors**: Return 400 with detailed field errors
- **Not Found Errors**: Return 404 with resource identifier
- **Conflict Errors**: Return 409 for duplicate addresses/payment methods
- **Authentication Errors**: Return 401 for missing/invalid tokens
- **Authorization Errors**: Return 403 for insufficient permissions
- **Server Errors**: Return 500 with error tracking ID

## Testing Strategy

### Unit Testing
- Test profile update validation
- Test address uniqueness constraints
- Test default address logic
- Test payment method encryption/decryption
- Test wishlist item operations
- Test settings update logic

### Property-Based Testing
- **Property 1**: Generate random profile updates and verify persistence
- **Property 2**: Generate multiple addresses and verify no duplicates
- **Property 3**: Generate address updates and verify only one default
- **Property 4**: Generate payment methods and verify encryption
- **Property 5**: Generate wishlist items and verify product existence
- **Property 6**: Generate settings updates and verify synchronization
- **Property 7**: Generate address deletions and verify default reassignment
- **Property 8**: Generate unauthenticated requests and verify rejection

### Integration Testing
- Test complete profile update flow (frontend to backend)
- Test address management workflow
- Test payment method save and retrieval
- Test wishlist add/remove operations
- Test settings persistence across sessions
- Test authentication and authorization

### E2E Testing
- Test complete account management workflow
- Test navigation between account sections
- Test form validation and error handling
- Test responsive design on mobile/tablet
- Test session management and timeout

