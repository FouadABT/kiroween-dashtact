-- ============================================
-- E-COMMERCE SEED DATA (Schema-Matched)
-- Using picsum.photos for product images
-- ============================================

-- PART 1: CATEGORIES
-- ============================================

INSERT INTO "product_categories" (id, name, slug, description, parent_id, display_order, is_visible, image, created_at, updated_at)
VALUES
  -- Main Categories
  ('cat_electronics', 'Electronics', 'electronics', 'Electronic devices and accessories', NULL, 1, true, 'https://picsum.photos/seed/cat-electronics/400/300', NOW(), NOW()),
  ('cat_clothing', 'Clothing', 'clothing', 'Fashion and apparel', NULL, 2, true, 'https://picsum.photos/seed/cat-clothing/400/300', NOW(), NOW()),
  ('cat_home', 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', NULL, 3, true, 'https://picsum.photos/seed/cat-home/400/300', NOW(), NOW()),
  ('cat_sports', 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', NULL, 4, true, 'https://picsum.photos/seed/cat-sports/400/300', NOW(), NOW()),
  
  -- Electronics Subcategories
  ('cat_computers', 'Computers', 'computers', 'Laptops, desktops, and accessories', 'cat_electronics', 1, true, 'https://picsum.photos/seed/cat-computers/400/300', NOW(), NOW()),
  ('cat_phones', 'Smartphones', 'smartphones', 'Mobile phones and accessories', 'cat_electronics', 2, true, 'https://picsum.photos/seed/cat-phones/400/300', NOW(), NOW()),
  ('cat_audio', 'Audio', 'audio', 'Headphones, speakers, and audio equipment', 'cat_electronics', 3, true, 'https://picsum.photos/seed/cat-audio/400/300', NOW(), NOW()),
  ('cat_cameras', 'Cameras', 'cameras', 'Digital cameras and photography equipment', 'cat_electronics', 4, true, 'https://picsum.photos/seed/cat-cameras/400/300', NOW(), NOW()),
  
  -- Clothing Subcategories
  ('cat_mens', 'Men''s Clothing', 'mens-clothing', 'Clothing for men', 'cat_clothing', 1, true, 'https://picsum.photos/seed/cat-mens/400/300', NOW(), NOW()),
  ('cat_womens', 'Women''s Clothing', 'womens-clothing', 'Clothing for women', 'cat_clothing', 2, true, 'https://picsum.photos/seed/cat-womens/400/300', NOW(), NOW()),
  ('cat_kids', 'Kids'' Clothing', 'kids-clothing', 'Clothing for children', 'cat_clothing', 3, true, 'https://picsum.photos/seed/cat-kids/400/300', NOW(), NOW()),
  
  -- Home Subcategories
  ('cat_furniture', 'Furniture', 'furniture', 'Indoor and outdoor furniture', 'cat_home', 1, true, 'https://picsum.photos/seed/cat-furniture/400/300', NOW(), NOW()),
  ('cat_decor', 'Home Decor', 'home-decor', 'Decorative items for your home', 'cat_home', 2, true, 'https://picsum.photos/seed/cat-decor/400/300', NOW(), NOW()),
  ('cat_kitchen', 'Kitchen', 'kitchen', 'Kitchen appliances and cookware', 'cat_home', 3, true, 'https://picsum.photos/seed/cat-kitchen/400/300', NOW(), NOW()),
  
  -- Sports Subcategories
  ('cat_fitness', 'Fitness', 'fitness', 'Fitness equipment and accessories', 'cat_sports', 1, true, 'https://picsum.photos/seed/cat-fitness/400/300', NOW(), NOW()),
  ('cat_camping', 'Camping', 'camping', 'Camping and hiking gear', 'cat_sports', 2, true, 'https://picsum.photos/seed/cat-camping/400/300', NOW(), NOW()),
  ('cat_cycling', 'Cycling', 'cycling', 'Bicycles and cycling accessories', 'cat_sports', 3, true, 'https://picsum.photos/seed/cat-cycling/400/300', NOW(), NOW());

-- PART 2: CUSTOMERS
-- ============================================

INSERT INTO customers (id, email, first_name, last_name, phone, company, shipping_address, billing_address, notes, tags, created_at, updated_at) VALUES
('cust001', 'john.doe@email.com', 'John', 'Doe', '+1-555-0101', NULL, 
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}'::json,
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}'::json,
 'VIP customer, prefers express shipping', ARRAY['vip', 'repeat-customer'], NOW() - INTERVAL '6 months', NOW()),

('cust002', 'sarah.smith@email.com', 'Sarah', 'Smith', '+1-555-0102', 'Tech Solutions Inc', 
 '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "USA"}'::json,
 '{"street": "789 Corporate Blvd", "city": "Los Angeles", "state": "CA", "zip": "90002", "country": "USA"}'::json,
 'Business account, bulk orders', ARRAY['business', 'wholesale'], NOW() - INTERVAL '4 months', NOW()),

('cust003', 'mike.johnson@email.com', 'Mike', 'Johnson', '+1-555-0103', NULL,
 '{"street": "789 Pine Rd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}'::json,
 '{"street": "789 Pine Rd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}'::json,
 'First-time buyer', ARRAY['new-customer'], NOW() - INTERVAL '1 month', NOW()),

('cust004', 'emily.brown@email.com', 'Emily', 'Brown', '+1-555-0104', NULL,
 '{"street": "321 Elm St", "city": "Houston", "state": "TX", "zip": "77001", "country": "USA"}'::json,
 '{"street": "321 Elm St", "city": "Houston", "state": "TX", "zip": "77001", "country": "USA"}'::json,
 'Frequent buyer, loves discounts', ARRAY['frequent-buyer', 'discount-hunter'], NOW() - INTERVAL '8 months', NOW()),

('cust005', 'david.wilson@email.com', 'David', 'Wilson', '+1-555-0105', 'Wilson Enterprises',
 '{"street": "654 Maple Dr", "city": "Phoenix", "state": "AZ", "zip": "85001", "country": "USA"}'::json,
 '{"street": "654 Maple Dr", "city": "Phoenix", "state": "AZ", "zip": "85001", "country": "USA"}'::json,
 'Corporate account', ARRAY['business'], NOW() - INTERVAL '1 year', NOW()),

('cust006', 'lisa.anderson@email.com', 'Lisa', 'Anderson', '+1-555-0106', NULL,
 '{"street": "987 Cedar Ln", "city": "Philadelphia", "state": "PA", "zip": "19101", "country": "USA"}'::json,
 '{"street": "987 Cedar Ln", "city": "Philadelphia", "state": "PA", "zip": "19101", "country": "USA"}'::json,
 'Prefers eco-friendly products', ARRAY['eco-conscious'], NOW() - INTERVAL '3 months', NOW()),

('cust007', 'robert.taylor@email.com', 'Robert', 'Taylor', '+1-555-0107', NULL,
 '{"street": "147 Birch St", "city": "San Antonio", "state": "TX", "zip": "78201", "country": "USA"}'::json,
 '{"street": "147 Birch St", "city": "San Antonio", "state": "TX", "zip": "78201", "country": "USA"}'::json,
 NULL, ARRAY[], NOW() - INTERVAL '2 months', NOW()),

('cust008', 'jennifer.martinez@email.com', 'Jennifer', 'Martinez', '+1-555-0108', 'Martinez Retail',
 '{"street": "258 Spruce Ave", "city": "San Diego", "state": "CA", "zip": "92101", "country": "USA"}'::json,
 '{"street": "258 Spruce Ave", "city": "San Diego", "state": "CA", "zip": "92101", "country": "USA"}'::json,
 'Retail partner', ARRAY['business', 'partner'], NOW() - INTERVAL '2 years', NOW()),

('cust009', 'william.garcia@email.com', 'William', 'Garcia', '+1-555-0109', NULL,
 '{"street": "369 Willow Way", "city": "Dallas", "state": "TX", "zip": "75201", "country": "USA"}'::json,
 '{"street": "369 Willow Way", "city": "Dallas", "state": "TX", "zip": "75201", "country": "USA"}'::json,
 'Tech enthusiast', ARRAY['tech-savvy'], NOW() - INTERVAL '5 months', NOW()),

('cust010', 'amanda.rodriguez@email.com', 'Amanda', 'Rodriguez', '+1-555-0110', NULL,
 '{"street": "741 Aspen Ct", "city": "San Jose", "state": "CA", "zip": "95101", "country": "USA"}'::json,
 '{"street": "741 Aspen Ct", "city": "San Jose", "state": "CA", "zip": "95101", "country": "USA"}'::json,
 'Fashion forward', ARRAY['fashion', 'influencer'], NOW() - INTERVAL '7 months', NOW());

-- PART 3: PRODUCTS
-- Note: Schema uses base_price, compare_at_price, featured_image, status, is_visible, is_featured
-- ============================================
