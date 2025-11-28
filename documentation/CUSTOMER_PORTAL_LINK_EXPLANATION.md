# Customer Portal Link Feature - Explanation

## What is "Generate Portal Link"?

The **Generate Portal Link** feature creates a secure, unique URL that allows customers to view their order history without needing to log in or create an account.

## How It Works

### 1. Generate Token
When you click "Generate Portal Link" on a customer's detail page:
- A unique, secure token is generated for that customer
- The token is stored in the database with an expiration date (30 days)
- A special URL is created using this token

### 2. Portal Link Format
```
https://yourdomain.com/portal/orders/{unique-token}
```

Example:
```
http://localhost:3000/portal/orders/abc123xyz789
```

### 3. Customer Access
When a customer visits this link:
- They can view all their orders
- They can see order details, tracking information, and status
- They can download invoices
- **No login required** - the token authenticates them

### 4. Security Features
- Token expires after 30 days
- Each customer has a unique token
- Token can be regenerated anytime (old token becomes invalid)
- No password or account needed

## Use Cases

### 1. Guest Checkout Follow-Up
- Customer places order without creating account
- You generate portal link and email it to them
- They can track their order without logging in

### 2. Customer Support
- Customer calls asking about their orders
- You generate link and send via email/SMS
- They can self-serve and view order history

### 3. Order Tracking
- Customer wants to check order status
- Send them portal link instead of making them create account
- Reduces friction and improves experience

## How to Use

### Step 1: Navigate to Customer
1. Go to **Dashboard → E-commerce → Customers**
2. Click on a customer to view their details

### Step 2: Generate Link
1. Click **"Generate Portal Link"** button
2. Wait for token generation (takes 1-2 seconds)
3. Dialog appears with the unique link

### Step 3: Share with Customer
1. Click **"Copy"** to copy the link
2. Send via email, SMS, or chat
3. Customer can access their orders immediately

### Step 4: Customer Views Orders
Customer clicks the link and sees:
- List of all their orders
- Order details (items, shipping, payment)
- Order status and tracking
- Ability to download invoices

## Portal Features

### What Customers Can See:
✅ Order history (all orders)
✅ Order details (items, quantities, prices)
✅ Shipping address
✅ Billing information
✅ Order status (Pending, Processing, Shipped, Delivered)
✅ Tracking information (if available)
✅ Order timeline (status changes)

### What Customers Cannot Do:
❌ Place new orders (must go to shop)
❌ Edit existing orders
❌ Cancel orders
❌ Change shipping address
❌ Access other customers' orders

## Technical Details

### Database Schema
```prisma
model Customer {
  id           String    @id
  email        String
  firstName    String
  lastName     String
  portalToken  String?   @unique  // Unique token for portal access
  tokenExpiry  DateTime? // When token expires
  // ... other fields
}
```

### API Endpoints

**Generate Token:**
```
POST /customers/{id}/generate-portal-token
Response: { portalToken: "abc123...", tokenExpiry: "2024-02-15" }
```

**Access Portal:**
```
GET /portal/orders/{token}
Response: List of customer's orders
```

### Token Generation
- Uses cryptographically secure random string
- Format: 32-character alphanumeric string
- Stored hashed in database for security
- Expires after 30 days

## Benefits

### For Business:
1. **Reduced Support Tickets** - Customers self-serve
2. **Better Experience** - No forced account creation
3. **Increased Trust** - Transparent order tracking
4. **Faster Resolution** - Quick access to order info

### For Customers:
1. **No Account Needed** - Access orders instantly
2. **Easy Tracking** - One-click order status
3. **Secure** - Unique, expiring link
4. **Convenient** - Bookmark link for future use

## Best Practices

### When to Generate Links:
✅ After guest checkout completion
✅ When customer requests order status
✅ For VIP customers (proactive service)
✅ After shipping confirmation

### When to Regenerate:
✅ Customer lost original link
✅ Token expired (after 30 days)
✅ Security concern (suspected sharing)
✅ Customer requests new link

### Security Tips:
⚠️ Don't share links publicly
⚠️ Send via secure channels (email, SMS)
⚠️ Regenerate if compromised
⚠️ Monitor for suspicious access

## Fixing the NaN Issue

### Problem
The "Lifetime Value" shows `$NaN` when:
- Customer has no orders
- Order totals are not calculated
- Data is missing or invalid

### Solution Applied
Updated `CustomerStats.tsx` to handle missing values:

```typescript
// Before (causes NaN)
${parseFloat(stats.lifetimeValue).toFixed(2)}

// After (shows $0.00 if invalid)
${(parseFloat(stats.lifetimeValue) || 0).toFixed(2)}
```

### Result
- Shows `$0.00` for new customers
- Shows actual value when orders exist
- No more NaN errors

## Example Workflow

### Scenario: Guest Checkout
1. **Customer** places order without account
2. **System** creates customer record
3. **Admin** views customer in dashboard
4. **Admin** clicks "Generate Portal Link"
5. **System** creates unique token
6. **Admin** copies link and emails customer
7. **Customer** clicks link in email
8. **Customer** sees order status and tracking
9. **Customer** bookmarks link for future use

### Scenario: Support Request
1. **Customer** calls: "Where's my order?"
2. **Support** looks up customer
3. **Support** generates portal link
4. **Support** sends link via SMS
5. **Customer** views order status instantly
6. **Support** ticket resolved quickly

## Configuration

### Token Expiration
Default: 30 days

To change, update in backend:
```typescript
// backend/src/customers/customers.service.ts
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 30); // Change 30 to desired days
```

### Portal URL
Automatically uses your domain:
```typescript
const baseUrl = window.location.origin;
const link = `${baseUrl}/portal/orders/${token}`;
```

Production example:
```
https://yourstore.com/portal/orders/abc123xyz789
```

## Troubleshooting

### Link Not Working
- Check token hasn't expired (30 days)
- Verify customer ID is correct
- Ensure portal feature is enabled
- Check backend is running

### Cannot Generate Link
- Verify you have `customers:write` permission
- Check customer exists in database
- Ensure backend API is accessible
- Look for errors in browser console

### Customer Cannot Access
- Verify link was copied correctly
- Check token hasn't expired
- Ensure customer has orders
- Verify portal route exists

## Related Files

### Backend:
- `backend/src/customers/customers.controller.ts` - Generate token endpoint
- `backend/src/customers/customers.service.ts` - Token generation logic
- `backend/src/portal/` - Portal access routes

### Frontend:
- `frontend/src/app/dashboard/ecommerce/customers/[id]/page.tsx` - Generate button
- `frontend/src/app/portal/orders/[token]/page.tsx` - Portal view
- `frontend/src/components/portal/` - Portal components
- `frontend/src/components/customers/CustomerStats.tsx` - **FIXED** NaN issue

## Summary

The **Generate Portal Link** feature:
- Creates secure, temporary access links for customers
- Allows order tracking without account creation
- Improves customer experience and reduces support load
- Expires after 30 days for security
- Can be regenerated anytime

The **NaN issue** has been fixed by adding fallback values to handle missing or invalid data.
