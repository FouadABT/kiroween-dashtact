# E-Commerce Configuration Guide

## Overview

This guide explains how to configure and customize the e-commerce system in your dashboard application. The e-commerce system is a fully-featured module that can be enabled or disabled via environment variables and configured through a database-backed settings system.

## Table of Contents

1. [Enabling/Disabling E-Commerce](#enablingdisabling-e-commerce)
2. [Environment Variables](#environment-variables)
3. [Database Settings](#database-settings)
4. [Settings API](#settings-api)
5. [Frontend Integration](#frontend-integration)
6. [Customization](#customization)
7. [Troubleshooting](#troubleshooting)

## Enabling/Disabling E-Commerce

### Enable E-Commerce

1. **Set Environment Variable** (Frontend):
   ```env
   # frontend/.env.local
   NEXT_PUBLIC_ENABLE_ECOMMERCE=true
   ```

2. **Restart Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify**:
   - E-Commerce section appears in dashboard navigation
   - E-Commerce routes are accessible
   - Settings page available at `/dashboard/settings/ecommerce`

### Disable E-Commerce

1. **Set Environment Variable** (Frontend):
   ```env
   # frontend/.env.local
   NEXT_PUBLIC_ENABLE_ECOMMERCE=false
   ```

2. **Restart Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify**:
   - E-Commerce section hidden from navigation
   - E-Commerce routes redirect to dashboard
   - Settings page not accessible

## Environment Variables

### Frontend Variables

```env
# frontend/.env.local

# Enable/disable e-commerce feature
NEXT_PUBLIC_ENABLE_ECOMMERCE=true

# API URL (should already be configured)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend Variables

No additional environment variables required. Uses existing:
```env
# backend/.env

# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"

# JWT secret for authentication
JWT_SECRET=your-secret-key

# Server port
PORT=3001
```

## Database Settings

### Settings Model

The `EcommerceSettings` model stores configuration in the database:

```prisma
model EcommerceSettings {
  id                      String   @id @default(cuid())
  scope                   String   @default("global")
  userId                  String?  @unique
  storeName               String   @default("My Store")
  storeDescription        String?
  currency                String   @default("USD")
  currencySymbol          String   @default("$")
  taxRate                 Decimal  @default(0)
  taxLabel                String   @default("Tax")
  shippingEnabled         Boolean  @default(true)
  portalEnabled           Boolean  @default(true)
  allowGuestCheckout      Boolean  @default(false)
  trackInventory          Boolean  @default(true)
  lowStockThreshold       Int      @default(10)
  autoGenerateOrderNumbers Boolean @default(true)
  orderNumberPrefix       String   @default("ORD")
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

### Default Settings

Default global settings are created during database seeding:

```typescript
{
  scope: 'global',
  storeName: 'My Store',
  storeDescription: null,
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 0,
  taxLabel: 'Tax',
  shippingEnabled: true,
  portalEnabled: true,
  allowGuestCheckout: false,
  trackInventory: true,
  lowStockThreshold: 10,
  autoGenerateOrderNumbers: true,
  orderNumberPrefix: 'ORD',
}
```

### Settings Scope

Settings can be scoped to:
- **Global** (`scope: 'global'`): Applies to entire application
- **User** (`scope: 'user'`): User-specific overrides (future feature)

## Settings API

### Endpoints

#### Get Global Settings
```http
GET /ecommerce-settings/global
```
**Public endpoint** - No authentication required

**Response:**
```json
{
  "id": "clx...",
  "scope": "global",
  "storeName": "My Store",
  "currency": "USD",
  "currencySymbol": "$",
  "taxRate": 0,
  "taxLabel": "Tax",
  "shippingEnabled": true,
  "portalEnabled": true,
  "allowGuestCheckout": false,
  "trackInventory": true,
  "lowStockThreshold": 10,
  "autoGenerateOrderNumbers": true,
  "orderNumberPrefix": "ORD",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### Get User Settings
```http
GET /ecommerce-settings/user/:userId
Authorization: Bearer <token>
```
**Requires:** `settings:read` permission

#### Update Settings
```http
PATCH /ecommerce-settings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "storeName": "Updated Store Name",
  "taxRate": 8.5,
  "lowStockThreshold": 5
}
```
**Requires:** `settings:write` permission

**Response:** Updated settings object

### Using the API

#### cURL Example
```bash
# Get global settings
curl http://localhost:3001/ecommerce-settings/global

# Update settings (requires authentication)
curl -X PATCH http://localhost:3001/ecommerce-settings/clx... \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"storeName": "My Awesome Store", "taxRate": 8.5}'
```

#### JavaScript Example
```javascript
// Get global settings
const response = await fetch('http://localhost:3001/ecommerce-settings/global');
const settings = await response.json();

// Update settings
const updated = await fetch('http://localhost:3001/ecommerce-settings/clx...', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    storeName: 'My Awesome Store',
    taxRate: 8.5,
  }),
});
```

## Frontend Integration

### Using Settings Context

```typescript
import { useEcommerceSettings } from '@/contexts/EcommerceSettingsContext';

function MyComponent() {
  const { settings, isLoading, error, updateSettings } = useEcommerceSettings();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{settings.storeName}</h1>
      <p>Currency: {settings.currency}</p>
      <p>Tax Rate: {settings.taxRate}%</p>
    </div>
  );
}
```

### Helper Functions

#### Format Currency
```typescript
import { formatCurrency } from '@/contexts/EcommerceSettingsContext';

const price = 99.99;
const formatted = formatCurrency(price, settings);
// Output: "$99.99"
```

#### Calculate Tax
```typescript
import { calculateTax } from '@/contexts/EcommerceSettingsContext';

const subtotal = 100;
const tax = calculateTax(subtotal, settings);
// Output: 0 (if taxRate is 0)
// Output: 8.5 (if taxRate is 8.5)
```

#### Check Features
```typescript
import { 
  isInventoryTrackingEnabled,
  isPortalEnabled 
} from '@/contexts/EcommerceSettingsContext';

if (isInventoryTrackingEnabled(settings)) {
  // Show inventory management features
}

if (isPortalEnabled(settings)) {
  // Show customer portal link
}
```

### Settings Page

Access the settings page at:
```
/dashboard/settings/ecommerce
```

**Requirements:**
- User must be authenticated
- User must have `settings:write` permission
- E-commerce feature must be enabled (`NEXT_PUBLIC_ENABLE_ECOMMERCE=true`)

## Customization

### Store Information

**Store Name:**
- Displayed in customer portal header
- Used in email notifications
- Shown in order confirmations

**Store Description:**
- Optional tagline or description
- Displayed on customer portal

### Currency & Tax

**Currency Code:**
- ISO 4217 currency code (e.g., USD, EUR, GBP)
- Used for price formatting
- Affects payment processing

**Currency Symbol:**
- Symbol displayed with prices (e.g., $, €, £)
- Customizable for any currency

**Tax Rate:**
- Percentage (0-100)
- Applied to order subtotals
- Can be 0 for tax-exempt stores

**Tax Label:**
- Label shown on invoices (e.g., "Tax", "VAT", "GST")
- Customizable per region

### Customer Portal

**Enable Customer Portal:**
- Allows customers to view orders via secure link
- No account creation required
- Token-based authentication

**Allow Guest Checkout:**
- Let customers checkout without creating account
- Faster checkout process
- Reduces friction

**Enable Shipping:**
- Show shipping options during checkout
- Calculate shipping costs
- Track shipments

### Inventory

**Track Inventory:**
- Enable/disable inventory tracking
- Prevent overselling when enabled
- Show stock levels to customers

**Low Stock Threshold:**
- Number of items before "low stock" alert
- Triggers notifications to admins
- Default: 10 items

### Orders

**Auto-Generate Order Numbers:**
- Automatically create sequential order numbers
- Format: PREFIX-NUMBER (e.g., ORD-001)
- Ensures unique order identifiers

**Order Number Prefix:**
- Prefix for order numbers (e.g., ORD, INV, PO)
- Max 10 characters
- Helps organize orders

## Troubleshooting

### E-Commerce Not Showing

**Problem:** E-Commerce section not visible in navigation

**Solutions:**
1. Check environment variable:
   ```bash
   # frontend/.env.local
   NEXT_PUBLIC_ENABLE_ECOMMERCE=true
   ```

2. Restart development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Clear browser cache and reload

4. Check browser console for errors

### Settings Not Loading

**Problem:** Settings page shows loading spinner indefinitely

**Solutions:**
1. Verify backend is running:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Check API URL in frontend:
   ```bash
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. Test API endpoint directly:
   ```bash
   curl http://localhost:3001/ecommerce-settings/global
   ```

4. Check backend logs for errors

5. Verify database connection

### Settings Not Saving

**Problem:** Settings changes don't persist

**Solutions:**
1. Check user permissions:
   - User must have `settings:write` permission
   - Verify in database: `SELECT * FROM role_permissions WHERE role_id = 'user_role_id'`

2. Check authentication:
   - Ensure JWT token is valid
   - Check browser console for 401/403 errors

3. Verify API endpoint:
   ```bash
   curl -X PATCH http://localhost:3001/ecommerce-settings/ID \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"storeName": "Test"}'
   ```

4. Check backend logs for validation errors

### Feature Guard Redirecting

**Problem:** E-commerce pages redirect to dashboard

**Solutions:**
1. Verify feature flag is enabled:
   ```typescript
   // Check in browser console
   console.log(process.env.NEXT_PUBLIC_ENABLE_ECOMMERCE);
   ```

2. Ensure environment variable is set correctly

3. Restart development server after changing env vars

4. Check `featuresConfig.ecommerce.enabled` in code

### Cache Issues

**Problem:** Settings changes not reflecting immediately

**Solutions:**
1. Clear localStorage cache:
   ```javascript
   // In browser console
   localStorage.removeItem('ecommerce-settings');
   ```

2. Use refresh method:
   ```typescript
   const { refreshSettings } = useEcommerceSettings();
   await refreshSettings();
   ```

3. Cache TTL is 1 hour - wait or clear manually

## Examples

### Example 1: Basic Store Setup

```env
# frontend/.env.local
NEXT_PUBLIC_ENABLE_ECOMMERCE=true
```

Settings:
```json
{
  "storeName": "Tech Gadgets Store",
  "storeDescription": "Your one-stop shop for the latest tech",
  "currency": "USD",
  "currencySymbol": "$",
  "taxRate": 8.5,
  "taxLabel": "Sales Tax",
  "shippingEnabled": true,
  "portalEnabled": true,
  "allowGuestCheckout": true,
  "trackInventory": true,
  "lowStockThreshold": 5,
  "autoGenerateOrderNumbers": true,
  "orderNumberPrefix": "TGS"
}
```

### Example 2: European Store

```json
{
  "storeName": "Fashion Boutique",
  "currency": "EUR",
  "currencySymbol": "€",
  "taxRate": 20,
  "taxLabel": "VAT",
  "shippingEnabled": true,
  "portalEnabled": true,
  "allowGuestCheckout": false,
  "trackInventory": true,
  "lowStockThreshold": 10,
  "autoGenerateOrderNumbers": true,
  "orderNumberPrefix": "FB"
}
```

### Example 3: Digital Products Store

```json
{
  "storeName": "Digital Downloads",
  "currency": "USD",
  "currencySymbol": "$",
  "taxRate": 0,
  "taxLabel": "Tax",
  "shippingEnabled": false,
  "portalEnabled": true,
  "allowGuestCheckout": true,
  "trackInventory": false,
  "lowStockThreshold": 0,
  "autoGenerateOrderNumbers": true,
  "orderNumberPrefix": "DL"
}
```

## Best Practices

1. **Set Realistic Tax Rates**: Use accurate tax rates for your region
2. **Choose Clear Prefixes**: Use meaningful order number prefixes
3. **Enable Portal**: Customer portal improves customer experience
4. **Track Inventory**: Prevent overselling by enabling inventory tracking
5. **Set Appropriate Thresholds**: Adjust low stock threshold based on your business
6. **Test Settings**: Always test settings changes in development first
7. **Document Changes**: Keep track of settings changes for audit purposes
8. **Regular Backups**: Backup database regularly to preserve settings

## Support

For additional help:
- Check the main README.md
- Review the design document: `.kiro/specs/ecommerce-system/design.md`
- Review the requirements: `.kiro/specs/ecommerce-system/requirements.md`
- Check the implementation report: `ECOMMERCE_CONFIGURATION_COMPLETE.md`

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial release
- Global settings support
- Database-backed configuration
- Feature flag support
- Settings API
- Frontend context and UI
