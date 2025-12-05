# Implementation Plan

- [x] 1. Backend API - Profile, Addresses, and Payment Methods






- [x] 1.1 Create CustomerAccount module with controller and service


  - Create `backend/src/customer-account/customer-account.module.ts`
  - Create `backend/src/customer-account/customer-account.controller.ts` with endpoints for profile, addresses, and payment methods
  - Create `backend/src/customer-account/customer-account.service.ts` with business logic
  - Import module in `backend/src/app.module.ts`

  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_


- [x] 1.2 Create DTOs for profile and address management

  - Create `backend/src/customer-account/dto/update-profile.dto.ts` with validation
  - Create `backend/src/customer-account/dto/create-address.dto.ts` with validation
  - Create `backend/src/customer-account/dto/update-address.dto.ts` with validation

  - Create `backend/src/customer-account/dto/address-response.dto.ts`
  - _Requirements: 1.1, 2.1, 2.2, 2.3_


- [x] 1.3 Implement profile endpoints in controller

  - `GET /customer-account/profile` - Get current customer profile

  - `PATCH /customer-account/profile` - Update profile (firstName, lastName, phone, company)
  - Add JwtAuthGuard and PermissionsGuard
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [x] 1.4 Implement address management endpoints in controller

  - `GET /customer-account/addresses` - List all addresses
  - `POST /customer-account/addresses` - Create new address
  - `PATCH /customer-account/addresses/:id` - Update address
  - `DELETE /customer-account/addresses/:id` - Delete address
  - `PATCH /customer-account/addresses/:id/default` - Set default address
  - Add validation and error handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_


- [x] 1.5 Implement payment method endpoints in controller


  - `GET /customer-account/payment-methods` - List payment methods
  - `POST /customer-account/payment-methods` - Create payment method
  - `PATCH /customer-account/payment-methods/:id` - Update payment method
  - `DELETE /customer-account/payment-methods/:id` - Delete payment method
  - `PATCH /customer-account/payment-methods/:id/default` - Set default payment method
  - Add encryption for sensitive data
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ]* 1.6 Write property tests for profile and address management

  - **Property 1: Profile Update Persistence**
  - **Property 2: Address Uniqueness per Customer**
  - **Property 3: Default Address Exclusivity**
  - **Validates: Requirements 1.3, 1.4, 2.1, 2.3, 2.6**


- [x] 1.7 Checkpoint - Ensure all backend tests pass


  - Ensure all tests pass, ask the user if questions arise

- [x] 2. Backend API - Settings, Wishlist, and Authentication







- [x] 2.1 Create DTOs for settings and payment methods


  - Create `backend/src/customer-account/dto/create-payment-method.dto.ts`
  - Create `backend/src/customer-account/dto/update-payment-method.dto.ts`
  - Create `backend/src/customer-account/dto/account-settings.dto.ts`
  - Create `backend/src/customer-account/dto/change-password.dto.ts`
  - _Requirements: 3.1, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2.2 Implement account settings endpoints



  - `GET /customer-account/settings` - Get account settings
  - `PATCH /customer-account/settings` - Update notification and privacy settings
  - `POST /customer-account/password/change` - Change password with validation
  - `POST /customer-account/2fa/enable` - Enable two-factor authentication
  - `POST /customer-account/2fa/disable` - Disable two-factor authentication
  - Add password strength validation and 2FA code generation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_


- [x] 2.3 Implement wishlist integration endpoints


  - `GET /customer-account/wishlist` - Get customer's wishlist with product details
  - `POST /customer-account/wishlist/items` - Add product to wishlist
  - `DELETE /customer-account/wishlist/items/:productId` - Remove from wishlist
  - `GET /customer-account/wishlist/items/:productId` - Check if product in wishlist
  - Add product availability checking
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_


- [x] 2.4 Implement order history endpoint


  - `GET /customer-account/orders` - Get recent orders with pagination
  - Include order items, status, and totals
  - Add filtering by date range and status
  - _Requirements: 6.2, 6.3_


- [x] 2.5 Add authentication and authorization


  - Apply JwtAuthGuard to all endpoints
  - Verify customer owns the data being accessed
  - Add permission checks for sensitive operations
  - _Requirements: 6.5, 6.6, 8.2_

- [ ]* 2.6 Write property tests for settings and wishlist

  - **Property 4: Payment Method Encryption**
  - **Property 5: Wishlist Item Consistency**
  - **Property 6: Settings Synchronization**
  - **Validates: Requirements 3.3, 4.1, 4.4, 5.2, 5.3, 8.4**

- [x] 2.7 Checkpoint - Ensure all backend tests pass



  - Ensure all tests pass, ask the user if questions arise

- [ ] 3. Frontend Components - Account Layout and Profile Management



- [x] 3.1 Create AccountLayout component with navigation


  - Create `frontend/src/components/customer-account/AccountLayout.tsx`
  - Implement sidebar navigation with sections: Profile, Addresses, Payment Methods, Wishlist, Settings, Orders
  - Add breadcrumb navigation
  - Implement responsive mobile menu
  - Add active section highlighting
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_


- [x] 3.2 Create ProfileCard and ProfileEditForm components


  - Create `frontend/src/components/customer-account/ProfileCard.tsx` for display
  - Create `frontend/src/components/customer-account/ProfileEditForm.tsx` for editing
  - Implement form validation (required fields, email format)
  - Add success/error toast notifications
  - Implement loading states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_



- [ ] 3.3 Create AddressList and AddressForm components

  - Create `frontend/src/components/customer-account/AddressList.tsx`
  - Create `frontend/src/components/customer-account/AddressForm.tsx`
  - Create `frontend/src/components/customer-account/AddressCard.tsx`
  - Implement add/edit/delete address functionality
  - Add default address selection
  - Implement address type filtering (shipping/billing)

  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_


- [ ] 3.4 Create PaymentMethodList and PaymentMethodForm components

  - Create `frontend/src/components/customer-account/PaymentMethodList.tsx`
  - Create `frontend/src/components/customer-account/PaymentMethodForm.tsx`
  - Create `frontend/src/components/customer-account/PaymentMethodCard.tsx`
  - Implement add/edit/delete payment method functionality
  - Display masked card information (last 4 digits)
  - Add default payment method selection
  - Show expiration warnings for expired cards
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3.5 Update AccountDashboardClient to use new components


  - Import and integrate ProfileCard, AddressList, PaymentMethodList
  - Add tab/section navigation
  - Implement loading and error states
  - Add authentication check and redirect
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 3.6 Write unit tests for account components

  - Test ProfileEditForm validation
  - Test AddressForm validation and submission
  - Test PaymentMethodForm validation
  - Test component rendering and user interactions
  - _Requirements: 1.1, 2.1, 3.1_





- [ ] 3.7 Checkpoint - Ensure all frontend tests pass

  - Ensure all tests pass, ask the user if questions arise

- [-] 4. Frontend Components - Wishlist, Settings, and API Integration



- [x] 4.1 Create WishlistGrid and WishlistItem components



  - Create `frontend/src/components/customer-account/WishlistGrid.tsx`
  - Create `frontend/src/components/customer-account/WishlistItem.tsx`
  - Create `frontend/src/components/customer-account/WishlistEmpty.tsx`
  - Display products with images, names, prices, and availability
  - Implement add to cart functionality
  - Implement remove from wishlist functionality
  - Show empty state with product suggestions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_


- [x] 4.2 Create AccountSettings component


  - Create `frontend/src/components/customer-account/AccountSettings.tsx`
  - Create `frontend/src/components/customer-account/NotificationSettings.tsx`
  - Create `frontend/src/components/customer-account/PasswordSettings.tsx`
  - Create `frontend/src/components/customer-account/TwoFactorSettings.tsx`
  - Implement notification preference toggles
  - Implement password change form with validation
  - Implement 2FA enable/disable with verification
  - Add account deletion confirmation dialog
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_



- [ ] 4.3 Add API client methods for customer account

  - Add `CustomerAccountApi` class to `frontend/src/lib/api.ts`
  - Implement methods for profile, addresses, payment methods, settings, wishlist
  - Add error handling and type safety
  - Implement request/response DTOs

  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 8.1, 8.2, 8.3, 8.4_

- [x] 4.4 Integrate API calls into components


  - Update ProfileEditForm to call API on submit
  - Update AddressForm to call API on submit
  - Update PaymentMethodForm to call API on submit
  - Update WishlistGrid to call API for add/remove
  - Update AccountSettings to call API for updates
  - Add loading states and error handling
  - _Requirements: 1.3, 1.4, 2.3, 3.3, 4.2, 4.3, 5.2, 5.3, 8.1, 8.2, 8.3, 8.4_


- [x] 4.5 Implement data synchronization and caching


  - Add React Query or SWR for data fetching and caching
  - Implement optimistic updates for better UX
  - Add automatic refetch on window focus
  - Implement error recovery and retry logic
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 4.6 Write integration tests for account management

  - Test complete profile update flow
  - Test address add/edit/delete workflow
  - Test payment method management
  - Test wishlist operations
  - Test settings updates
  - Test error handling and recovery
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_


- [x] 4.7 Final Checkpoint - Ensure all tests pass and account page is complete


  - Ensure all tests pass, ask the user if questions arise
  - Verify all account sections are functional and integrated
