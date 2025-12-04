# Checkout Page

## Overview

The checkout page provides a complete multi-step checkout experience for customers to complete their purchase with Cash on Delivery (COD) payment.

## Features

### Multi-Step Checkout Process

1. **Shipping Information**
   - Customer contact details (name, email, phone)
   - Shipping address with all required fields
   - Order notes (optional)
   - Real-time validation

2. **Payment & Billing**
   - Shipping method selection with prices and estimated delivery
   - Payment method selection (COD with description)
   - Billing address with "Same as shipping" option
   - Real-time shipping cost calculation

3. **Review & Place Order**
   - Complete order summary
   - Address verification
   - Shipping and payment method confirmation
   - Secure order placement with duplicate prevention

### Components

#### CheckoutPageClient
Main client component that manages checkout state and orchestrates the checkout flow.

**Features:**
- Cart loading and validation
- Payment methods loading
- Form state management
- Session ID management for guest users
- Error handling

#### CheckoutProgress
Visual progress indicator showing current step in the checkout process.

**Steps:**
1. Shipping
2. Payment
3. Review

#### CheckoutForm
Main form component that handles the multi-step checkout flow.

**Features:**
- Step navigation with validation
- Real-time shipping method loading
- Address validation
- Order creation
- Error handling

#### ShippingAddressForm
Form for collecting customer and shipping information.

**Fields:**
- Customer name (required)
- Email (required)
- Phone (optional)
- First name (required)
- Last name (required)
- Address line 1 (required)
- Address line 2 (optional)
- City (required)
- State/Province (required)
- Postal code (required)
- Country (required)
- Order notes (optional)

#### BillingAddressForm
Form for collecting billing address with "Same as shipping" option.

**Features:**
- Checkbox to use shipping address
- Conditional rendering of billing fields
- All standard address fields

#### ShippingMethodSelector
Radio group selector for available shipping methods.

**Features:**
- Visual method cards with icons
- Price display (Free or amount)
- Estimated delivery days
- Availability indicators
- Loading state

#### PaymentMethodSelector
Radio group selector for payment methods.

**Features:**
- Payment method cards with icons
- COD description and instructions
- Fee display (if applicable)
- Min/max order amount display
- Availability indicators

#### OrderSummary
Sticky sidebar showing order details and totals.

**Features:**
- Cart items with images
- Quantity and prices
- Subtotal calculation
- Shipping cost
- Tax calculation
- Total amount
- Item count

#### PlaceOrderButton
Final order submission button with loading state.

**Features:**
- Loading indicator during submission
- Secure checkout badge
- Terms and conditions notice
- Disabled state during processing

## Data Flow

### 1. Page Load
```
1. Load cart from API
2. Validate cart has items (redirect to /cart if empty)
3. Load payment methods
4. Set default payment method (COD)
5. Initialize form state
```

### 2. Shipping Step
```
1. User fills shipping address
2. Real-time validation
3. Load shipping methods when address complete
4. Set default shipping method
5. Continue to payment
```

### 3. Payment Step
```
1. Display shipping methods
2. User selects shipping method
3. Display payment methods
4. User selects payment method (COD)
5. User fills billing address or uses shipping
6. Continue to review
```

### 4. Review Step
```
1. Display all information for review
2. Show address summaries
3. Show shipping and payment methods
4. User places order
5. Create order via API
6. Clear cart session
7. Redirect to success page
```

## API Integration

### Endpoints Used

- `GET /cart` - Load cart
- `GET /checkout/payment-methods` - Load payment methods
- `POST /checkout/shipping-methods` - Load shipping methods
- `POST /checkout/create-order` - Create order

### Request/Response Types

All types are defined in `frontend/src/types/storefront.ts`:
- `CheckoutFormState` - Form state management
- `CheckoutAddress` - Address format for checkout
- `PaymentMethodOption` - Payment method data
- `ShippingMethodOption` - Shipping method data
- `CreateOrderFromCartDto` - Order creation payload
- `OrderConfirmation` - Order creation response

## Validation

### Client-Side Validation

- Required field validation
- Email format validation
- Real-time error messages
- Step-by-step validation before proceeding

### Server-Side Validation

- Cart inventory validation
- Shipping method availability
- Payment method availability
- Address validation
- COD restrictions (if configured)

## Error Handling

### User-Friendly Errors

- Field-level validation errors
- Step-level error messages
- API error messages
- Loading states
- Retry mechanisms

### Error Recovery

- Form state preservation
- Back navigation
- Clear error messages
- Actionable error feedback

## Security

### Duplicate Prevention

- Disabled submit button during processing
- Session clearing after order
- Order ID in success URL

### Data Protection

- No sensitive payment data stored
- Session-based cart management
- Secure API communication

## Responsive Design

### Mobile Optimization

- Single column layout on mobile
- Touch-friendly form inputs
- Sticky order summary
- Optimized progress indicator
- Large tap targets

### Desktop Experience

- Two-column layout (form + summary)
- Sticky sidebar
- Horizontal progress indicator
- Efficient use of space

## Accessibility

### ARIA Labels

- Form labels properly associated
- Error messages announced
- Progress indicator accessible
- Button states communicated

### Keyboard Navigation

- Tab order follows visual flow
- Enter to submit forms
- Escape to cancel (where applicable)
- Focus management

## Testing

### Manual Testing Checklist

- [ ] Load checkout with items in cart
- [ ] Fill shipping address
- [ ] Verify shipping methods load
- [ ] Select shipping method
- [ ] Select payment method (COD)
- [ ] Toggle "Same as shipping" checkbox
- [ ] Fill billing address
- [ ] Review order details
- [ ] Place order
- [ ] Verify redirect to success page
- [ ] Verify cart cleared

### Edge Cases

- [ ] Empty cart redirect
- [ ] Invalid shipping address
- [ ] No shipping methods available
- [ ] No payment methods available
- [ ] API errors
- [ ] Network failures
- [ ] Duplicate submissions

## Future Enhancements

### Planned Features

1. **Additional Payment Methods**
   - Credit card integration
   - PayPal
   - Digital wallets

2. **Guest Checkout**
   - Optional account creation
   - Email verification
   - Order tracking link

3. **Address Book**
   - Saved addresses for logged-in users
   - Quick address selection
   - Address validation service

4. **Shipping Estimates**
   - Real-time carrier rates
   - Multiple shipping options
   - Delivery date selection

5. **Promo Codes**
   - Discount code input
   - Automatic discount application
   - Coupon validation

6. **Order Notes**
   - Gift messages
   - Special instructions
   - Delivery preferences

## Related Files

- `/app/checkout/page.tsx` - Page component
- `/app/checkout/CheckoutPageClient.tsx` - Client component
- `/components/checkout/*` - All checkout components
- `/types/storefront.ts` - Type definitions
- `/lib/api.ts` - API client methods
