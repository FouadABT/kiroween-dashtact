# E-Commerce Seed Data Guide

## Overview

Comprehensive seed data for testing the e-commerce system with realistic products, customers, orders, and inventory using images from **picsum.photos**.

## File Location

`backend/prisma/seed-ecommerce-complete.sql`

## What's Included

### 📦 Products (30 items)
- **Electronics** (10 products)
  - Laptops: MacBook Pro, Dell XPS, ThinkPad
  - Smartphones: iPhone 15 Pro, Samsung Galaxy S24, Google Pixel 8
  - Audio: Sony WH-1000XM5, AirPods Pro, Bose Speaker
  - Cameras: Canon EOS R6 Mark II

- **Clothing** (7 products)
  - Men's: Denim Jacket, Chinos, Oxford Shirt
  - Women's: Floral Dress, High-Waisted Jeans, Cashmere Sweater
  - Kids: Graphic T-Shirt Pack

- **Home & Garden** (7 products)
  - Furniture: Sectional Sofa, Dining Set, Office Chair
  - Decor: Canvas Art, Throw Pillows
  - Kitchen: Cookware Set, Stand Mixer

- **Sports & Outdoors** (6 products)
  - Fitness: Dumbbells, Yoga Mat, Resistance Bands
  - Camping: Tent, Sleeping Bag
  - Cycling: Mountain Bike

### 👥 Customers (10 profiles)
- Mix of individual and business customers
- Various locations across USA
- Different customer types: VIP, wholesale, new, frequent buyers
- Realistic shipping and billing addresses

### 📋 Orders (10 orders)
- **Completed**: 3 orders (delivered)
- **Processing**: 2 orders (payment confirmed)
- **Shipped**: 2 orders (in transit)
- **Pending**: 2 orders (awaiting payment)
- **Cancelled**: 1 order (refunded)

### 🎨 Product Variants (20 variants)
- Laptop storage options (512GB, 1TB, 2TB)
- Phone colors and storage (Natural/Blue Titanium, 128GB-512GB)
- Clothing sizes and colors (S-XL, various washes/patterns)

### 📊 Inventory (46 records)
- Stock quantities for all products and variants
- Multiple warehouse locations
- Low stock thresholds configured
- Reserved quantities for pending orders

### 📝 Order Details
- Order notes (14 entries)
- Timeline events (15 entries)
- Order items (20 line items)
- Tracking numbers for shipped orders

### 🔄 Inventory Adjustments (22 records)
- Stock received
- Sales transactions
- Damage reports
- Returns
- Transfers between locations
- Inventory corrections

## Image URLs

All product images use **picsum.photos** with unique seeds:

```
https://picsum.photos/seed/{category}{number}/800/600
```

Examples:
- `https://picsum.photos/seed/laptop1/800/600`
- `https://picsum.photos/seed/phone2/800/600`
- `https://picsum.photos/seed/mens3/800/600`

Each product has 2-4 images for gallery display.

## How to Load

### Method 1: Using psql
```bash
cd backend
psql -U your_username -d your_database -f prisma/seed-ecommerce-complete.sql
```

### Method 2: From psql prompt
```sql
\i /path/to/backend/prisma/seed-ecommerce-complete.sql
```

### Method 3: Copy and paste
Open the SQL file and copy/paste sections into your database client.

## Reset and Reload

To clear existing data and reload:

```sql
-- Clear all ecommerce data (in order)
DELETE FROM inventory_adjustments;
DELETE FROM order_timeline;
DELETE FROM order_notes;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM inventory;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM customers;
DELETE FROM product_categories;

-- Then reload the seed file
\i /path/to/seed-ecommerce-complete.sql
```

## Data Statistics

- **18 Categories** (5 main + 13 subcategories)
- **10 Customers** (diverse profiles)
- **30 Products** (across all categories)
- **20 Product Variants** (configurable options)
- **46 Inventory Records** (products + variants)
- **10 Orders** (various statuses)
- **20 Order Items** (line items)
- **14 Order Notes** (customer and internal)
- **15 Timeline Events** (order history)
- **22 Inventory Adjustments** (stock movements)

## Price Range

- **Lowest**: $29 (Kids T-Shirt Pack)
- **Highest**: $3,299 (MacBook Pro 2TB)
- **Total Order Value**: ~$20,000

## Testing Scenarios

### 1. Product Browsing
- Browse by category (Electronics, Clothing, Home, Sports)
- Filter by price range
- Search products
- View product details with image galleries

### 2. Inventory Management
- Check stock levels
- View low stock alerts
- Process inventory adjustments
- Track stock movements

### 3. Order Processing
- View orders by status
- Process pending orders
- Update order status
- Add order notes
- Track shipments

### 4. Customer Management
- View customer profiles
- Check order history
- Manage customer tags
- View shipping addresses

### 5. Reporting
- Sales by category
- Top-selling products
- Inventory turnover
- Customer lifetime value

## Product Highlights

### Featured Products
- MacBook Pro 16" ($2,499)
- iPhone 15 Pro ($1,199)
- Samsung Galaxy S24 Ultra ($1,299)
- Sony WH-1000XM5 ($399)
- Canon EOS R6 Mark II ($2,499)
- Modern Sectional Sofa ($1,299)
- Adjustable Dumbbells ($399)
- 4-Person Camping Tent ($199)

### Best Sellers (by order frequency)
- AirPods Pro 2 (3 orders)
- iPhone 15 Pro (3 orders)
- Sony WH-1000XM5 (1 order)

## Warehouse Locations

- **Warehouse A - Electronics**: Laptops, phones, audio, cameras
- **Warehouse B - Clothing**: Men's, women's, kids' apparel
- **Warehouse C - Home**: Furniture, decor, kitchen items
- **Warehouse D - Sports**: Fitness, camping, cycling gear

## Order Tracking

Sample tracking numbers (UPS format):
- `1Z999AA10123456784` - Completed order
- `1Z999AA10123456785` - Completed order
- `1Z999AA10123456786` - Completed order
- `1Z999AA10123456787` - Shipped order
- `1Z999AA10123456788` - Shipped order

## Customer Types

- **VIP**: John Doe (cust001) - Priority shipping, repeat customer
- **Business**: Sarah Smith (cust002), David Wilson (cust005), Jennifer Martinez (cust008)
- **New**: Mike Johnson (cust003) - First-time buyer
- **Frequent**: Emily Brown (cust004) - Discount hunter
- **Eco-conscious**: Lisa Anderson (cust006) - Prefers sustainable products
- **Tech Enthusiast**: William Garcia (cust009)
- **Fashion Forward**: Amanda Rodriguez (cust010)

## Notes

- All timestamps are relative to NOW() for realistic date ranges
- Tax calculated at 8% (configurable)
- Shipping costs vary by order size
- Business customers receive bulk discounts
- VIP customers get free shipping
- All products have SEO-friendly slugs
- Meta titles and descriptions included for SEO

## Next Steps

After loading the seed data:

1. **Verify Data**: Check that all records loaded correctly
2. **Test Frontend**: Browse products, view orders, check inventory
3. **Test API**: Make API calls to verify endpoints work
4. **Run Tests**: Execute e2e tests with seed data
5. **Customize**: Modify products, prices, or quantities as needed

## Support

If you encounter issues:
1. Check database connection
2. Verify Prisma schema matches SQL structure
3. Check for foreign key constraint errors
4. Review error messages for specific issues
5. Try loading in smaller sections if needed

---

**Ready to test your e-commerce system with realistic data!** 🚀
