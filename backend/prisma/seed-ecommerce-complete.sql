-- ============================================
-- E-COMMERCE COMPLETE SEED DATA
-- Using picsum.photos for product images
-- ============================================

-- PART 1: CATEGORIES
-- ============================================

INSERT INTO "product_categories" (id, name, slug, description, parent_id, display_order, is_active, created_at, updated_at)
VALUES
  -- Main Categories
  ('cat_electronics', 'Electronics', 'electronics', 'Electronic devices and accessories', NULL, 1, true, NOW(), NOW()),
  ('cat_clothing', 'Clothing', 'clothing', 'Fashion and apparel', NULL, 2, true, NOW(), NOW()),
  ('cat_home', 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', NULL, 3, true, NOW(), NOW()),
  ('cat_sports', 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', NULL, 4, true, NOW(), NOW()),
  ('cat_books', 'Books & Media', 'books-media', 'Books, movies, and music', NULL, 5, true, NOW(), NOW()),
  
  -- Electronics Subcategories
  ('cat_computers', 'Computers', 'computers', 'Laptops, desktops, and accessories', 'cat_electronics', 1, true, NOW(), NOW()),
  ('cat_phones', 'Smartphones', 'smartphones', 'Mobile phones and accessories', 'cat_electronics', 2, true, NOW(), NOW()),
  ('cat_audio', 'Audio', 'audio', 'Headphones, speakers, and audio equipment', 'cat_electronics', 3, true, NOW(), NOW()),
  ('cat_cameras', 'Cameras', 'cameras', 'Digital cameras and photography equipment', 'cat_electronics', 4, true, NOW(), NOW()),
  
  -- Clothing Subcategories
  ('cat_mens', 'Men''s Clothing', 'mens-clothing', 'Clothing for men', 'cat_clothing', 1, true, NOW(), NOW()),
  ('cat_womens', 'Women''s Clothing', 'womens-clothing', 'Clothing for women', 'cat_clothing', 2, true, NOW(), NOW()),
  ('cat_kids', 'Kids'' Clothing', 'kids-clothing', 'Clothing for children', 'cat_clothing', 3, true, NOW(), NOW()),
  
  -- Home Subcategories
  ('cat_furniture', 'Furniture', 'furniture', 'Indoor and outdoor furniture', 'cat_home', 1, true, NOW(), NOW()),
  ('cat_decor', 'Home Decor', 'home-decor', 'Decorative items for your home', 'cat_home', 2, true, NOW(), NOW()),
  ('cat_kitchen', 'Kitchen', 'kitchen', 'Kitchen appliances and cookware', 'cat_home', 3, true, NOW(), NOW()),
  
  -- Sports Subcategories
  ('cat_fitness', 'Fitness', 'fitness', 'Fitness equipment and accessories', 'cat_sports', 1, true, NOW(), NOW()),
  ('cat_camping', 'Camping', 'camping', 'Camping and hiking gear', 'cat_sports', 2, true, NOW(), NOW()),
  ('cat_cycling', 'Cycling', 'cycling', 'Bicycles and cycling accessories', 'cat_sports', 3, true, NOW(), NOW());

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

-- PART 3: PRODUCTS (Electronics)
-- ============================================

INSERT INTO products (id, name, slug, description, short_description, sku, price, compare_at_price, cost, category_id, images, is_active, is_featured, meta_title, meta_description, created_at, updated_at) VALUES

-- Laptops
('prod001', 'MacBook Pro 16"', 'macbook-pro-16', 
 'Powerful laptop with M3 Pro chip, 16GB RAM, and stunning Retina display. Perfect for professionals and creators.',
 'Professional laptop with M3 Pro chip',
 'LAPTOP-MBP16-001', 2499.00, 2799.00, 1800.00, 'cat_computers',
 ARRAY['https://picsum.photos/seed/laptop1/800/600', 'https://picsum.photos/seed/laptop1a/800/600', 'https://picsum.photos/seed/laptop1b/800/600'],
 true, true, 'MacBook Pro 16" - Professional Laptop', 'High-performance laptop for professionals', NOW() - INTERVAL '3 months', NOW()),

('prod002', 'Dell XPS 15', 'dell-xps-15',
 'Premium Windows laptop with Intel i7, 32GB RAM, and 4K OLED display. Ideal for content creation and gaming.',
 'Premium Windows laptop with 4K display',
 'LAPTOP-DELLXPS-002', 1899.00, 2199.00, 1400.00, 'cat_computers',
 ARRAY['https://picsum.photos/seed/laptop2/800/600', 'https://picsum.photos/seed/laptop2a/800/600'],
 true, true, 'Dell XPS 15 - Premium Laptop', 'Powerful Windows laptop with stunning display', NOW() - INTERVAL '2 months', NOW()),

('prod003', 'ThinkPad X1 Carbon', 'thinkpad-x1-carbon',
 'Business ultrabook with legendary keyboard, 16GB RAM, and all-day battery life. Built for productivity.',
 'Business ultrabook with legendary keyboard',
 'LAPTOP-THINKPAD-003', 1599.00, 1899.00, 1200.00, 'cat_computers',
 ARRAY['https://picsum.photos/seed/laptop3/800/600', 'https://picsum.photos/seed/laptop3a/800/600'],
 true, false, 'ThinkPad X1 Carbon - Business Laptop', 'Professional laptop for business users', NOW() - INTERVAL '1 month', NOW()),

-- Smartphones
('prod004', 'iPhone 15 Pro', 'iphone-15-pro',
 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Available in multiple colors.',
 'Latest iPhone with titanium design',
 'PHONE-IP15PRO-004', 1199.00, 1299.00, 800.00, 'cat_phones',
 ARRAY['https://picsum.photos/seed/phone1/800/600', 'https://picsum.photos/seed/phone1a/800/600', 'https://picsum.photos/seed/phone1b/800/600', 'https://picsum.photos/seed/phone1c/800/600'],
 true, true, 'iPhone 15 Pro - Latest Smartphone', 'Premium smartphone with advanced features', NOW() - INTERVAL '1 month', NOW()),

('prod005', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra',
 'Flagship Android phone with S Pen, 200MP camera, and stunning AMOLED display. The ultimate productivity phone.',
 'Flagship Android with S Pen',
 'PHONE-SAMS24U-005', 1299.00, 1399.00, 850.00, 'cat_phones',
 ARRAY['https://picsum.photos/seed/phone2/800/600', 'https://picsum.photos/seed/phone2a/800/600', 'https://picsum.photos/seed/phone2b/800/600'],
 true, true, 'Samsung Galaxy S24 Ultra', 'Ultimate Android smartphone', NOW() - INTERVAL '2 months', NOW()),

('prod006', 'Google Pixel 8 Pro', 'google-pixel-8-pro',
 'Pure Android experience with incredible AI features and best-in-class camera. Made by Google.',
 'Pure Android with AI features',
 'PHONE-PIXEL8P-006', 999.00, 1099.00, 650.00, 'cat_phones',
 ARRAY['https://picsum.photos/seed/phone3/800/600', 'https://picsum.photos/seed/phone3a/800/600'],
 true, false, 'Google Pixel 8 Pro', 'AI-powered Android smartphone', NOW() - INTERVAL '3 months', NOW()),

-- Audio Equipment
('prod007', 'Sony WH-1000XM5', 'sony-wh-1000xm5',
 'Industry-leading noise canceling headphones with exceptional sound quality and 30-hour battery life.',
 'Premium noise canceling headphones',
 'AUDIO-SONYWH-007', 399.00, 449.00, 250.00, 'cat_audio',
 ARRAY['https://picsum.photos/seed/audio1/800/600', 'https://picsum.photos/seed/audio1a/800/600', 'https://picsum.photos/seed/audio1b/800/600'],
 true, true, 'Sony WH-1000XM5 Headphones', 'Best noise canceling headphones', NOW() - INTERVAL '4 months', NOW()),

('prod008', 'AirPods Pro 2', 'airpods-pro-2',
 'Apple''s premium wireless earbuds with active noise cancellation and spatial audio. Perfect for iPhone users.',
 'Premium wireless earbuds',
 'AUDIO-AIRPODS-008', 249.00, 279.00, 150.00, 'cat_audio',
 ARRAY['https://picsum.photos/seed/audio2/800/600', 'https://picsum.photos/seed/audio2a/800/600'],
 true, true, 'AirPods Pro 2', 'Premium wireless earbuds', NOW() - INTERVAL '2 months', NOW()),

('prod009', 'Bose SoundLink Revolve+', 'bose-soundlink-revolve',
 'Portable Bluetooth speaker with 360-degree sound and 16-hour battery. Water-resistant design.',
 'Portable 360-degree speaker',
 'AUDIO-BOSE-009', 329.00, 379.00, 200.00, 'cat_audio',
 ARRAY['https://picsum.photos/seed/audio3/800/600', 'https://picsum.photos/seed/audio3a/800/600'],
 true, false, 'Bose SoundLink Revolve+', 'Portable Bluetooth speaker', NOW() - INTERVAL '5 months', NOW()),

-- Cameras
('prod010', 'Canon EOS R6 Mark II', 'canon-eos-r6-mark-ii',
 'Full-frame mirrorless camera with 24MP sensor, 40fps burst, and advanced autofocus. Professional photography.',
 'Professional mirrorless camera',
 'CAM-CANONR6-010', 2499.00, 2799.00, 1800.00, 'cat_cameras',
 ARRAY['https://picsum.photos/seed/camera1/800/600', 'https://picsum.photos/seed/camera1a/800/600', 'https://picsum.photos/seed/camera1b/800/600'],
 true, true, 'Canon EOS R6 Mark II', 'Professional mirrorless camera', NOW() - INTERVAL '3 months', NOW());

-- PART 4: PRODUCTS (Clothing)
-- ============================================

INSERT INTO products (id, name, slug, description, short_description, sku, price, compare_at_price, cost, category_id, images, is_active, is_featured, meta_title, meta_description, created_at, updated_at) VALUES

-- Men's Clothing
('prod011', 'Classic Denim Jacket', 'classic-denim-jacket',
 'Timeless denim jacket made from premium cotton. Features button closure and multiple pockets. Available in multiple washes.',
 'Timeless denim jacket',
 'MENS-DENIM-011', 89.00, 119.00, 45.00, 'cat_mens',
 ARRAY['https://picsum.photos/seed/mens1/800/600', 'https://picsum.photos/seed/mens1a/800/600', 'https://picsum.photos/seed/mens1b/800/600'],
 true, true, 'Classic Denim Jacket for Men', 'Premium denim jacket', NOW() - INTERVAL '2 months', NOW()),

('prod012', 'Slim Fit Chinos', 'slim-fit-chinos',
 'Comfortable slim-fit chinos perfect for casual or business casual wear. Stretch fabric for all-day comfort.',
 'Comfortable slim-fit chinos',
 'MENS-CHINO-012', 59.00, 79.00, 30.00, 'cat_mens',
 ARRAY['https://picsum.photos/seed/mens2/800/600', 'https://picsum.photos/seed/mens2a/800/600'],
 true, false, 'Slim Fit Chinos', 'Comfortable casual pants', NOW() - INTERVAL '1 month', NOW()),

('prod013', 'Oxford Button-Down Shirt', 'oxford-button-down-shirt',
 'Classic oxford shirt in premium cotton. Perfect for office or casual occasions. Easy care fabric.',
 'Classic oxford shirt',
 'MENS-OXFORD-013', 49.00, 69.00, 25.00, 'cat_mens',
 ARRAY['https://picsum.photos/seed/mens3/800/600', 'https://picsum.photos/seed/mens3a/800/600'],
 true, false, 'Oxford Button-Down Shirt', 'Classic dress shirt', NOW() - INTERVAL '3 months', NOW()),

-- Women's Clothing
('prod014', 'Floral Summer Dress', 'floral-summer-dress',
 'Beautiful floral print dress perfect for summer. Lightweight fabric with flattering fit. Multiple patterns available.',
 'Beautiful floral summer dress',
 'WOMENS-DRESS-014', 79.00, 99.00, 40.00, 'cat_womens',
 ARRAY['https://picsum.photos/seed/womens1/800/600', 'https://picsum.photos/seed/womens1a/800/600', 'https://picsum.photos/seed/womens1b/800/600'],
 true, true, 'Floral Summer Dress', 'Beautiful summer dress', NOW() - INTERVAL '1 month', NOW()),

('prod015', 'High-Waisted Jeans', 'high-waisted-jeans',
 'Trendy high-waisted jeans with stretch denim. Flattering fit and comfortable all-day wear.',
 'Trendy high-waisted jeans',
 'WOMENS-JEANS-015', 69.00, 89.00, 35.00, 'cat_womens',
 ARRAY['https://picsum.photos/seed/womens2/800/600', 'https://picsum.photos/seed/womens2a/800/600'],
 true, true, 'High-Waisted Jeans', 'Trendy denim jeans', NOW() - INTERVAL '2 months', NOW()),

('prod016', 'Cashmere Sweater', 'cashmere-sweater',
 'Luxurious 100% cashmere sweater. Incredibly soft and warm. Available in multiple colors.',
 'Luxurious cashmere sweater',
 'WOMENS-CASH-016', 149.00, 199.00, 75.00, 'cat_womens',
 ARRAY['https://picsum.photos/seed/womens3/800/600', 'https://picsum.photos/seed/womens3a/800/600'],
 true, false, 'Cashmere Sweater', 'Luxury cashmere knitwear', NOW() - INTERVAL '4 months', NOW()),

-- Kids' Clothing
('prod017', 'Kids Graphic T-Shirt Pack', 'kids-graphic-tshirt-pack',
 'Fun graphic t-shirts for kids. Pack of 3 with different designs. 100% cotton, machine washable.',
 'Fun graphic t-shirts pack',
 'KIDS-TSHIRT-017', 29.00, 39.00, 15.00, 'cat_kids',
 ARRAY['https://picsum.photos/seed/kids1/800/600', 'https://picsum.photos/seed/kids1a/800/600'],
 true, false, 'Kids Graphic T-Shirt Pack', 'Fun t-shirts for kids', NOW() - INTERVAL '2 months', NOW());

-- PART 5: PRODUCTS (Home & Garden)
-- ============================================

INSERT INTO products (id, name, slug, description, short_description, sku, price, compare_at_price, cost, category_id, images, is_active, is_featured, meta_title, meta_description, created_at, updated_at) VALUES

-- Furniture
('prod018', 'Modern Sectional Sofa', 'modern-sectional-sofa',
 'Spacious L-shaped sectional sofa with premium fabric upholstery. Comfortable seating for the whole family.',
 'Spacious L-shaped sectional',
 'FURN-SOFA-018', 1299.00, 1599.00, 800.00, 'cat_furniture',
 ARRAY['https://picsum.photos/seed/furniture1/800/600', 'https://picsum.photos/seed/furniture1a/800/600', 'https://picsum.photos/seed/furniture1b/800/600'],
 true, true, 'Modern Sectional Sofa', 'Comfortable sectional sofa', NOW() - INTERVAL '3 months', NOW()),

('prod019', 'Dining Table Set', 'dining-table-set',
 'Elegant dining table with 6 chairs. Solid wood construction with modern design. Perfect for family dinners.',
 'Elegant dining set for 6',
 'FURN-DINING-019', 899.00, 1199.00, 550.00, 'cat_furniture',
 ARRAY['https://picsum.photos/seed/furniture2/800/600', 'https://picsum.photos/seed/furniture2a/800/600'],
 true, false, 'Dining Table Set', 'Elegant dining furniture', NOW() - INTERVAL '2 months', NOW()),

('prod020', 'Ergonomic Office Chair', 'ergonomic-office-chair',
 'Premium ergonomic chair with lumbar support and adjustable features. Perfect for home office or workspace.',
 'Premium ergonomic office chair',
 'FURN-CHAIR-020', 399.00, 499.00, 250.00, 'cat_furniture',
 ARRAY['https://picsum.photos/seed/furniture3/800/600', 'https://picsum.photos/seed/furniture3a/800/600'],
 true, true, 'Ergonomic Office Chair', 'Comfortable office seating', NOW() - INTERVAL '1 month', NOW()),

-- Home Decor
('prod021', 'Abstract Canvas Art Set', 'abstract-canvas-art-set',
 'Set of 3 abstract canvas prints. Modern design perfect for living room or bedroom. Ready to hang.',
 'Modern abstract canvas set',
 'DECOR-ART-021', 129.00, 179.00, 65.00, 'cat_decor',
 ARRAY['https://picsum.photos/seed/decor1/800/600', 'https://picsum.photos/seed/decor1a/800/600', 'https://picsum.photos/seed/decor1b/800/600'],
 true, false, 'Abstract Canvas Art Set', 'Modern wall art', NOW() - INTERVAL '2 months', NOW()),

('prod022', 'Decorative Throw Pillows', 'decorative-throw-pillows',
 'Set of 4 decorative throw pillows with removable covers. Various patterns and colors available.',
 'Decorative pillow set',
 'DECOR-PILLOW-022', 49.00, 69.00, 25.00, 'cat_decor',
 ARRAY['https://picsum.photos/seed/decor2/800/600', 'https://picsum.photos/seed/decor2a/800/600'],
 true, false, 'Decorative Throw Pillows', 'Stylish throw pillows', NOW() - INTERVAL '3 months', NOW()),

-- Kitchen
('prod023', 'Stainless Steel Cookware Set', 'stainless-steel-cookware-set',
 'Professional 10-piece cookware set. Stainless steel construction with aluminum core for even heating.',
 'Professional cookware set',
 'KITCHEN-COOK-023', 299.00, 399.00, 180.00, 'cat_kitchen',
 ARRAY['https://picsum.photos/seed/kitchen1/800/600', 'https://picsum.photos/seed/kitchen1a/800/600', 'https://picsum.photos/seed/kitchen1b/800/600'],
 true, true, 'Stainless Steel Cookware Set', 'Professional cookware', NOW() - INTERVAL '4 months', NOW()),

('prod024', 'Stand Mixer', 'stand-mixer',
 'Powerful 5-quart stand mixer with multiple attachments. Perfect for baking and cooking enthusiasts.',
 'Powerful stand mixer',
 'KITCHEN-MIXER-024', 349.00, 449.00, 220.00, 'cat_kitchen',
 ARRAY['https://picsum.photos/seed/kitchen2/800/600', 'https://picsum.photos/seed/kitchen2a/800/600'],
 true, true, 'Stand Mixer', 'Professional stand mixer', NOW() - INTERVAL '2 months', NOW());

-- PART 6: PRODUCTS (Sports & Books)
-- ============================================

INSERT INTO products (id, name, slug, description, short_description, sku, price, compare_at_price, cost, category_id, images, is_active, is_featured, meta_title, meta_description, created_at, updated_at) VALUES

-- Fitness Equipment
('prod025', 'Adjustable Dumbbells Set', 'adjustable-dumbbells-set',
 'Space-saving adjustable dumbbells from 5-52.5 lbs. Perfect for home gym. Includes storage tray.',
 'Adjustable dumbbells 5-52.5 lbs',
 'FITNESS-DUMB-025', 399.00, 499.00, 250.00, 'cat_fitness',
 ARRAY['https://picsum.photos/seed/fitness1/800/600', 'https://picsum.photos/seed/fitness1a/800/600', 'https://picsum.photos/seed/fitness1b/800/600'],
 true, true, 'Adjustable Dumbbells Set', 'Home gym dumbbells', NOW() - INTERVAL '3 months', NOW()),

('prod026', 'Yoga Mat Premium', 'yoga-mat-premium',
 'Extra-thick yoga mat with non-slip surface. Eco-friendly materials. Includes carrying strap.',
 'Premium non-slip yoga mat',
 'FITNESS-YOGA-026', 49.00, 69.00, 25.00, 'cat_fitness',
 ARRAY['https://picsum.photos/seed/fitness2/800/600', 'https://picsum.photos/seed/fitness2a/800/600'],
 true, false, 'Premium Yoga Mat', 'Non-slip yoga mat', NOW() - INTERVAL '2 months', NOW()),

('prod027', 'Resistance Bands Set', 'resistance-bands-set',
 'Complete resistance bands set with 5 different resistance levels. Includes door anchor and handles.',
 'Complete resistance bands set',
 'FITNESS-BAND-027', 29.00, 39.00, 15.00, 'cat_fitness',
 ARRAY['https://picsum.photos/seed/fitness3/800/600', 'https://picsum.photos/seed/fitness3a/800/600'],
 true, false, 'Resistance Bands Set', 'Workout resistance bands', NOW() - INTERVAL '1 month', NOW()),

-- Camping Equipment
('prod028', '4-Person Camping Tent', '4-person-camping-tent',
 'Spacious 4-person tent with waterproof design. Easy setup with color-coded poles. Includes carry bag.',
 'Waterproof 4-person tent',
 'CAMP-TENT-028', 199.00, 249.00, 120.00, 'cat_camping',
 ARRAY['https://picsum.photos/seed/camping1/800/600', 'https://picsum.photos/seed/camping1a/800/600', 'https://picsum.photos/seed/camping1b/800/600'],
 true, true, '4-Person Camping Tent', 'Family camping tent', NOW() - INTERVAL '4 months', NOW()),

('prod029', 'Sleeping Bag -20°F', 'sleeping-bag-20f',
 'Cold-weather sleeping bag rated to -20°F. Mummy style with hood. Compressible and lightweight.',
 'Cold-weather sleeping bag',
 'CAMP-SLEEP-029', 89.00, 119.00, 55.00, 'cat_camping',
 ARRAY['https://picsum.photos/seed/camping2/800/600', 'https://picsum.photos/seed/camping2a/800/600'],
 true, false, 'Sleeping Bag -20°F', 'Winter sleeping bag', NOW() - INTERVAL '5 months', NOW()),

-- Cycling
('prod030', 'Mountain Bike 29"', 'mountain-bike-29',
 'Full-suspension mountain bike with 29" wheels. 21-speed Shimano gears. Perfect for trails and off-road.',
 'Full-suspension mountain bike',
 'CYCLE-MTB-030', 899.00, 1199.00, 550.00, 'cat_cycling',
 ARRAY['https://picsum.photos/seed/cycling1/800/600', 'https://picsum.photos/seed/cycling1a/800/600', 'https://picsum.photos/seed/cycling1b/800/600'],
 true, true, 'Mountain Bike 29"', 'Off-road mountain bike', NOW() - INTERVAL '3 months', NOW());

-- PART 7: PRODUCT VARIANTS
-- ============================================

-- Laptop variants (Storage options)
INSERT INTO product_variants (id, product_id, name, sku, price, compare_at_price, cost, stock_quantity, low_stock_threshold, attributes, is_active, created_at, updated_at) VALUES
('var001', 'prod001', '512GB SSD', 'LAPTOP-MBP16-512', 2499.00, 2799.00, 1800.00, 15, 5, '{"storage": "512GB", "color": "Space Gray"}'::json, true, NOW(), NOW()),
('var002', 'prod001', '1TB SSD', 'LAPTOP-MBP16-1TB', 2799.00, 3099.00, 2000.00, 10, 5, '{"storage": "1TB", "color": "Space Gray"}'::json, true, NOW(), NOW()),
('var003', 'prod001', '2TB SSD', 'LAPTOP-MBP16-2TB', 3299.00, 3599.00, 2400.00, 5, 3, '{"storage": "2TB", "color": "Space Gray"}'::json, true, NOW(), NOW());

-- Phone variants (Storage & Color)
INSERT INTO product_variants (id, product_id, name, sku, price, compare_at_price, cost, stock_quantity, low_stock_threshold, attributes, is_active, created_at, updated_at) VALUES
('var004', 'prod004', '128GB Natural Titanium', 'PHONE-IP15PRO-128-NAT', 1199.00, 1299.00, 800.00, 25, 10, '{"storage": "128GB", "color": "Natural Titanium"}'::json, true, NOW(), NOW()),
('var005', 'prod004', '256GB Natural Titanium', 'PHONE-IP15PRO-256-NAT', 1299.00, 1399.00, 850.00, 20, 10, '{"storage": "256GB", "color": "Natural Titanium"}'::json, true, NOW(), NOW()),
('var006', 'prod004', '512GB Natural Titanium', 'PHONE-IP15PRO-512-NAT', 1499.00, 1599.00, 950.00, 15, 8, '{"storage": "512GB", "color": "Natural Titanium"}'::json, true, NOW(), NOW()),
('var007', 'prod004', '128GB Blue Titanium', 'PHONE-IP15PRO-128-BLU', 1199.00, 1299.00, 800.00, 20, 10, '{"storage": "128GB", "color": "Blue Titanium"}'::json, true, NOW(), NOW()),
('var008', 'prod004', '256GB Blue Titanium', 'PHONE-IP15PRO-256-BLU', 1299.00, 1399.00, 850.00, 18, 10, '{"storage": "256GB", "color": "Blue Titanium"}'::json, true, NOW(), NOW());

-- Clothing variants (Size & Color)
INSERT INTO product_variants (id, product_id, name, sku, price, compare_at_price, cost, stock_quantity, low_stock_threshold, attributes, is_active, created_at, updated_at) VALUES
('var009', 'prod011', 'Small - Light Wash', 'MENS-DENIM-S-LIGHT', 89.00, 119.00, 45.00, 30, 10, '{"size": "S", "color": "Light Wash"}'::json, true, NOW(), NOW()),
('var010', 'prod011', 'Medium - Light Wash', 'MENS-DENIM-M-LIGHT', 89.00, 119.00, 45.00, 40, 10, '{"size": "M", "color": "Light Wash"}'::json, true, NOW(), NOW()),
('var011', 'prod011', 'Large - Light Wash', 'MENS-DENIM-L-LIGHT', 89.00, 119.00, 45.00, 35, 10, '{"size": "L", "color": "Light Wash"}'::json, true, NOW(), NOW()),
('var012', 'prod011', 'XL - Light Wash', 'MENS-DENIM-XL-LIGHT', 89.00, 119.00, 45.00, 25, 10, '{"size": "XL", "color": "Light Wash"}'::json, true, NOW(), NOW()),
('var013', 'prod011', 'Small - Dark Wash', 'MENS-DENIM-S-DARK', 89.00, 119.00, 45.00, 28, 10, '{"size": "S", "color": "Dark Wash"}'::json, true, NOW(), NOW()),
('var014', 'prod011', 'Medium - Dark Wash', 'MENS-DENIM-M-DARK', 89.00, 119.00, 45.00, 38, 10, '{"size": "M", "color": "Dark Wash"}'::json, true, NOW(), NOW()),
('var015', 'prod011', 'Large - Dark Wash', 'MENS-DENIM-L-DARK', 89.00, 119.00, 45.00, 32, 10, '{"size": "L", "color": "Dark Wash"}'::json, true, NOW(), NOW());

-- Women's dress variants
INSERT INTO product_variants (id, product_id, name, sku, price, compare_at_price, cost, stock_quantity, low_stock_threshold, attributes, is_active, created_at, updated_at) VALUES
('var016', 'prod014', 'Small - Blue Floral', 'WOMENS-DRESS-S-BLUE', 79.00, 99.00, 40.00, 25, 8, '{"size": "S", "pattern": "Blue Floral"}'::json, true, NOW(), NOW()),
('var017', 'prod014', 'Medium - Blue Floral', 'WOMENS-DRESS-M-BLUE', 79.00, 99.00, 40.00, 30, 8, '{"size": "M", "pattern": "Blue Floral"}'::json, true, NOW(), NOW()),
('var018', 'prod014', 'Large - Blue Floral', 'WOMENS-DRESS-L-BLUE', 79.00, 99.00, 40.00, 22, 8, '{"size": "L", "pattern": "Blue Floral"}'::json, true, NOW(), NOW()),
('var019', 'prod014', 'Small - Pink Floral', 'WOMENS-DRESS-S-PINK', 79.00, 99.00, 40.00, 20, 8, '{"size": "S", "pattern": "Pink Floral"}'::json, true, NOW(), NOW()),
('var020', 'prod014', 'Medium - Pink Floral', 'WOMENS-DRESS-M-PINK', 79.00, 99.00, 40.00, 28, 8, '{"size": "M", "pattern": "Pink Floral"}'::json, true, NOW(), NOW());

-- PART 8: INVENTORY RECORDS
-- ============================================

-- Create inventory records for products without variants
INSERT INTO inventory (id, product_id, variant_id, stock_quantity, reserved_quantity, low_stock_threshold, location, notes, created_at, updated_at) VALUES
('inv001', 'prod002', NULL, 25, 2, 5, 'Warehouse A - Electronics', 'Dell XPS 15 stock', NOW(), NOW()),
('inv002', 'prod003', NULL, 18, 1, 5, 'Warehouse A - Electronics', 'ThinkPad stock', NOW(), NOW()),
('inv003', 'prod005', NULL, 30, 3, 8, 'Warehouse A - Electronics', 'Samsung Galaxy stock', NOW(), NOW()),
('inv004', 'prod006', NULL, 22, 2, 8, 'Warehouse A - Electronics', 'Pixel stock', NOW(), NOW()),
('inv005', 'prod007', NULL, 45, 5, 10, 'Warehouse A - Audio', 'Sony headphones stock', NOW(), NOW()),
('inv006', 'prod008', NULL, 60, 8, 15, 'Warehouse A - Audio', 'AirPods stock', NOW(), NOW()),
('inv007', 'prod009', NULL, 35, 3, 10, 'Warehouse A - Audio', 'Bose speaker stock', NOW(), NOW()),
('inv008', 'prod010', NULL, 12, 1, 3, 'Warehouse A - Cameras', 'Canon camera stock', NOW(), NOW()),
('inv009', 'prod012', NULL, 80, 10, 20, 'Warehouse B - Clothing', 'Chinos stock', NOW(), NOW()),
('inv010', 'prod013', NULL, 100, 12, 25, 'Warehouse B - Clothing', 'Oxford shirts stock', NOW(), NOW()),
('inv011', 'prod015', NULL, 75, 8, 20, 'Warehouse B - Clothing', 'Jeans stock', NOW(), NOW()),
('inv012', 'prod016', NULL, 40, 4, 10, 'Warehouse B - Clothing', 'Cashmere sweaters stock', NOW(), NOW()),
('inv013', 'prod017', NULL, 120, 15, 30, 'Warehouse B - Clothing', 'Kids t-shirts stock', NOW(), NOW()),
('inv014', 'prod018', NULL, 8, 1, 2, 'Warehouse C - Furniture', 'Sectional sofas stock', NOW(), NOW()),
('inv015', 'prod019', NULL, 12, 2, 3, 'Warehouse C - Furniture', 'Dining sets stock', NOW(), NOW()),
('inv016', 'prod020', NULL, 25, 3, 5, 'Warehouse C - Furniture', 'Office chairs stock', NOW(), NOW()),
('inv017', 'prod021', NULL, 50, 5, 15, 'Warehouse C - Decor', 'Canvas art sets stock', NOW(), NOW()),
('inv018', 'prod022', NULL, 80, 10, 20, 'Warehouse C - Decor', 'Throw pillows stock', NOW(), NOW()),
('inv019', 'prod023', NULL, 30, 3, 8, 'Warehouse C - Kitchen', 'Cookware sets stock', NOW(), NOW()),
('inv020', 'prod024', NULL, 20, 2, 5, 'Warehouse C - Kitchen', 'Stand mixers stock', NOW(), NOW()),
('inv021', 'prod025', NULL, 35, 4, 10, 'Warehouse D - Sports', 'Dumbbells stock', NOW(), NOW()),
('inv022', 'prod026', NULL, 100, 12, 25, 'Warehouse D - Sports', 'Yoga mats stock', NOW(), NOW()),
('inv023', 'prod027', NULL, 150, 18, 40, 'Warehouse D - Sports', 'Resistance bands stock', NOW(), NOW()),
('inv024', 'prod028', NULL, 20, 2, 5, 'Warehouse D - Sports', 'Camping tents stock', NOW(), NOW()),
('inv025', 'prod029', NULL, 40, 4, 10, 'Warehouse D - Sports', 'Sleeping bags stock', NOW(), NOW()),
('inv026', 'prod030', NULL, 15, 2, 4, 'Warehouse D - Sports', 'Mountain bikes stock', NOW(), NOW());

-- Create inventory records for variants
INSERT INTO inventory (id, product_id, variant_id, stock_quantity, reserved_quantity, low_stock_threshold, location, notes, created_at, updated_at) VALUES
('inv027', 'prod001', 'var001', 15, 2, 5, 'Warehouse A - Electronics', 'MacBook 512GB', NOW(), NOW()),
('inv028', 'prod001', 'var002', 10, 1, 5, 'Warehouse A - Electronics', 'MacBook 1TB', NOW(), NOW()),
('inv029', 'prod001', 'var003', 5, 0, 3, 'Warehouse A - Electronics', 'MacBook 2TB', NOW(), NOW()),
('inv030', 'prod004', 'var004', 25, 3, 10, 'Warehouse A - Electronics', 'iPhone 128GB Natural', NOW(), NOW()),
('inv031', 'prod004', 'var005', 20, 2, 10, 'Warehouse A - Electronics', 'iPhone 256GB Natural', NOW(), NOW()),
('inv032', 'prod004', 'var006', 15, 2, 8, 'Warehouse A - Electronics', 'iPhone 512GB Natural', NOW(), NOW()),
('inv033', 'prod004', 'var007', 20, 2, 10, 'Warehouse A - Electronics', 'iPhone 128GB Blue', NOW(), NOW()),
('inv034', 'prod004', 'var008', 18, 2, 10, 'Warehouse A - Electronics', 'iPhone 256GB Blue', NOW(), NOW()),
('inv035', 'prod011', 'var009', 30, 3, 10, 'Warehouse B - Clothing', 'Denim S Light', NOW(), NOW()),
('inv036', 'prod011', 'var010', 40, 4, 10, 'Warehouse B - Clothing', 'Denim M Light', NOW(), NOW()),
('inv037', 'prod011', 'var011', 35, 4, 10, 'Warehouse B - Clothing', 'Denim L Light', NOW(), NOW()),
('inv038', 'prod011', 'var012', 25, 3, 10, 'Warehouse B - Clothing', 'Denim XL Light', NOW(), NOW()),
('inv039', 'prod011', 'var013', 28, 3, 10, 'Warehouse B - Clothing', 'Denim S Dark', NOW(), NOW()),
('inv040', 'prod011', 'var014', 38, 4, 10, 'Warehouse B - Clothing', 'Denim M Dark', NOW(), NOW()),
('inv041', 'prod011', 'var015', 32, 3, 10, 'Warehouse B - Clothing', 'Denim L Dark', NOW(), NOW()),
('inv042', 'prod014', 'var016', 25, 3, 8, 'Warehouse B - Clothing', 'Dress S Blue', NOW(), NOW()),
('inv043', 'prod014', 'var017', 30, 3, 8, 'Warehouse B - Clothing', 'Dress M Blue', NOW(), NOW()),
('inv044', 'prod014', 'var018', 22, 2, 8, 'Warehouse B - Clothing', 'Dress L Blue', NOW(), NOW()),
('inv045', 'prod014', 'var019', 20, 2, 8, 'Warehouse B - Clothing', 'Dress S Pink', NOW(), NOW()),
('inv046', 'prod014', 'var020', 28, 3, 8, 'Warehouse B - Clothing', 'Dress M Pink', NOW(), NOW());

-- PART 9: ORDERS
-- ============================================

-- Create orders with various statuses
INSERT INTO orders (id, order_number, customer_id, status, payment_status, fulfillment_status, subtotal, tax, shipping_cost, discount, total, currency, shipping_address, billing_address, customer_notes, internal_notes, tracking_number, tracking_url, created_at, updated_at) VALUES

-- Completed orders
('ord001', 'ORD-2024-001', 'cust001', 'COMPLETED', 'PAID', 'DELIVERED', 2499.00, 199.92, 0.00, 0.00, 2698.92, 'USD',
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}'::json,
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}'::json,
 'Please deliver to front desk', 'VIP customer - priority shipping',
 '1Z999AA10123456784', 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
 NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days'),

('ord002', 'ORD-2024-002', 'cust002', 'COMPLETED', 'PAID', 'DELIVERED', 5997.00, 479.76, 0.00, 599.70, 5877.06, 'USD',
 '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90001", "country": "USA"}'::json,
 '{"street": "789 Corporate Blvd", "city": "Los Angeles", "state": "CA", "zip": "90002", "country": "USA"}'::json,
 'Business order - invoice required', 'Bulk order - 10% discount applied',
 '1Z999AA10123456785', 'https://www.ups.com/track?tracknum=1Z999AA10123456785',
 NOW() - INTERVAL '28 days', NOW() - INTERVAL '23 days'),

('ord003', 'ORD-2024-003', 'cust004', 'COMPLETED', 'PAID', 'DELIVERED', 648.00, 51.84, 15.00, 0.00, 714.84, 'USD',
 '{"street": "321 Elm St", "city": "Houston", "state": "TX", "zip": "77001", "country": "USA"}'::json,
 '{"street": "321 Elm St", "city": "Houston", "state": "TX", "zip": "77001", "country": "USA"}'::json,
 NULL, 'Standard shipping',
 '1Z999AA10123456786', 'https://www.ups.com/track?tracknum=1Z999AA10123456786',
 NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days'),

-- Processing orders
('ord004', 'ORD-2024-004', 'cust003', 'PROCESSING', 'PAID', 'PENDING', 1899.00, 151.92, 0.00, 0.00, 2050.92, 'USD',
 '{"street": "789 Pine Rd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}'::json,
 '{"street": "789 Pine Rd", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}'::json,
 'First order - excited!', 'New customer - ensure quality check',
 NULL, NULL,
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

('ord005', 'ORD-2024-005', 'cust006', 'PROCESSING', 'PAID', 'PENDING', 428.00, 34.24, 12.00, 0.00, 474.24, 'USD',
 '{"street": "987 Cedar Ln", "city": "Philadelphia", "state": "PA", "zip": "19101", "country": "USA"}'::json,
 '{"street": "987 Cedar Ln", "city": "Philadelphia", "state": "PA", "zip": "19101", "country": "USA"}'::json,
 'Eco-friendly packaging please', 'Customer prefers sustainable options',
 NULL, NULL,
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

-- Shipped orders
('ord006', 'ORD-2024-006', 'cust001', 'SHIPPED', 'PAID', 'SHIPPED', 1299.00, 103.92, 0.00, 0.00, 1402.92, 'USD',
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}'::json,
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}'::json,
 'Leave at door if not home', 'VIP - expedited shipping',
 '1Z999AA10123456787', 'https://www.ups.com/track?tracknum=1Z999AA10123456787',
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day'),

('ord007', 'ORD-2024-007', 'cust009', 'SHIPPED', 'PAID', 'SHIPPED', 2798.00, 223.84, 0.00, 0.00, 3021.84, 'USD',
 '{"street": "369 Willow Way", "city": "Dallas", "state": "TX", "zip": "75201", "country": "USA"}'::json,
 '{"street": "369 Willow Way", "city": "Dallas", "state": "TX", "zip": "75201", "country": "USA"}'::json,
 'Tech enthusiast - handle with care', 'High-value electronics',
 '1Z999AA10123456788', 'https://www.ups.com/track?tracknum=1Z999AA10123456788',
 NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),

-- Pending orders
('ord008', 'ORD-2024-008', 'cust007', 'PENDING', 'PENDING', 'PENDING', 899.00, 71.92, 25.00, 0.00, 995.92, 'USD',
 '{"street": "147 Birch St", "city": "San Antonio", "state": "TX", "zip": "78201", "country": "USA"}'::json,
 '{"street": "147 Birch St", "city": "San Antonio", "state": "TX", "zip": "78201", "country": "USA"}'::json,
 NULL, 'Awaiting payment confirmation',
 NULL, NULL,
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('ord009', 'ORD-2024-009', 'cust010', 'PENDING', 'PENDING', 'PENDING', 228.00, 18.24, 10.00, 0.00, 256.24, 'USD',
 '{"street": "741 Aspen Ct", "city": "San Jose", "state": "CA", "zip": "95101", "country": "USA"}'::json,
 '{"street": "741 Aspen Ct", "city": "San Jose", "state": "CA", "zip": "95101", "country": "USA"}'::json,
 'Gift wrap please', 'Customer requested gift wrapping',
 NULL, NULL,
 NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Cancelled order
('ord010', 'ORD-2024-010', 'cust005', 'CANCELLED', 'REFUNDED', 'CANCELLED', 1599.00, 127.92, 0.00, 0.00, 1726.92, 'USD',
 '{"street": "654 Maple Dr", "city": "Phoenix", "state": "AZ", "zip": "85001", "country": "USA"}'::json,
 '{"street": "654 Maple Dr", "city": "Phoenix", "state": "AZ", "zip": "85001", "country": "USA"}'::json,
 'Changed mind - please cancel', 'Customer requested cancellation - refund processed',
 NULL, NULL,
 NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days');

-- PART 10: ORDER ITEMS
-- ============================================

INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, unit_price, subtotal, tax, total, created_at, updated_at) VALUES

-- Order 1 items (MacBook)
('item001', 'ord001', 'prod001', 'var001', 1, 2499.00, 2499.00, 199.92, 2698.92, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),

-- Order 2 items (Bulk business order - 3 iPhones)
('item002', 'ord002', 'prod004', 'var004', 1, 1199.00, 1199.00, 95.92, 1294.92, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('item003', 'ord002', 'prod004', 'var005', 1, 1299.00, 1299.00, 103.92, 1402.92, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('item004', 'ord002', 'prod004', 'var007', 1, 1199.00, 1199.00, 95.92, 1294.92, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('item005', 'ord002', 'prod008', NULL, 2, 249.00, 498.00, 39.84, 537.84, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('item006', 'ord002', 'prod020', NULL, 1, 399.00, 399.00, 31.92, 430.92, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('item007', 'ord002', 'prod023', NULL, 1, 299.00, 299.00, 23.92, 322.92, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('item008', 'ord002', 'prod024', NULL, 1, 349.00, 349.00, 27.92, 376.92, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),

-- Order 3 items (Audio equipment)
('item009', 'ord003', 'prod007', NULL, 1, 399.00, 399.00, 31.92, 430.92, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
('item010', 'ord003', 'prod008', NULL, 1, 249.00, 249.00, 19.92, 268.92, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

-- Order 4 items (Dell laptop)
('item011', 'ord004', 'prod002', NULL, 1, 1899.00, 1899.00, 151.92, 2050.92, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Order 5 items (Fitness equipment)
('item012', 'ord005', 'prod025', NULL, 1, 399.00, 399.00, 31.92, 430.92, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('item013', 'ord005', 'prod026', NULL, 1, 49.00, 49.00, 3.92, 52.92, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Order 6 items (Samsung phone)
('item014', 'ord006', 'prod005', NULL, 1, 1299.00, 1299.00, 103.92, 1402.92, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- Order 7 items (MacBook + accessories)
('item015', 'ord007', 'prod001', 'var002', 1, 2799.00, 2799.00, 223.92, 3022.92, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

-- Order 8 items (Mountain bike)
('item016', 'ord008', 'prod030', NULL, 1, 899.00, 899.00, 71.92, 970.92, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Order 9 items (Clothing)
('item017', 'ord009', 'prod014', 'var017', 1, 79.00, 79.00, 6.32, 85.32, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('item018', 'ord009', 'prod015', NULL, 1, 69.00, 69.00, 5.52, 74.52, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('item019', 'ord009', 'prod016', NULL, 1, 149.00, 149.00, 11.92, 160.92, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Order 10 items (Cancelled - ThinkPad)
('item020', 'ord010', 'prod003', NULL, 1, 1599.00, 1599.00, 127.92, 1726.92, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

-- PART 11: ORDER NOTES & TIMELINE
-- ============================================

INSERT INTO order_notes (id, order_id, note, is_customer_visible, created_by, created_at) VALUES
('note001', 'ord001', 'Order received and payment confirmed', true, 'System', NOW() - INTERVAL '30 days'),
('note002', 'ord001', 'Order packed and ready for shipment', false, 'Warehouse Staff', NOW() - INTERVAL '29 days'),
('note003', 'ord001', 'Shipped via UPS - tracking number provided', true, 'System', NOW() - INTERVAL '28 days'),
('note004', 'ord001', 'Delivered successfully', true, 'System', NOW() - INTERVAL '25 days'),

('note005', 'ord002', 'Bulk business order - priority processing', false, 'Admin', NOW() - INTERVAL '28 days'),
('note006', 'ord002', '10% business discount applied', false, 'Admin', NOW() - INTERVAL '28 days'),
('note007', 'ord002', 'All items packed and shipped', true, 'System', NOW() - INTERVAL '26 days'),
('note008', 'ord002', 'Delivered to corporate address', true, 'System', NOW() - INTERVAL '23 days'),

('note009', 'ord004', 'Payment received - processing order', true, 'System', NOW() - INTERVAL '3 days'),
('note010', 'ord004', 'Quality check in progress', false, 'QA Team', NOW() - INTERVAL '2 days'),

('note011', 'ord006', 'VIP customer - expedited processing', false, 'Admin', NOW() - INTERVAL '5 days'),
('note012', 'ord006', 'Shipped with express delivery', true, 'System', NOW() - INTERVAL '1 day'),

('note013', 'ord010', 'Customer requested cancellation', false, 'Support', NOW() - INTERVAL '10 days'),
('note014', 'ord010', 'Refund processed to original payment method', true, 'System', NOW() - INTERVAL '9 days');

INSERT INTO order_timeline (id, order_id, status, description, created_at) VALUES
-- Order 1 timeline
('time001', 'ord001', 'PENDING', 'Order placed', NOW() - INTERVAL '30 days'),
('time002', 'ord001', 'PROCESSING', 'Payment confirmed', NOW() - INTERVAL '29 days + 2 hours'),
('time003', 'ord001', 'SHIPPED', 'Order shipped', NOW() - INTERVAL '28 days'),
('time004', 'ord001', 'COMPLETED', 'Order delivered', NOW() - INTERVAL '25 days'),

-- Order 2 timeline
('time005', 'ord002', 'PENDING', 'Order placed', NOW() - INTERVAL '28 days'),
('time006', 'ord002', 'PROCESSING', 'Payment confirmed', NOW() - INTERVAL '27 days + 4 hours'),
('time007', 'ord002', 'SHIPPED', 'Order shipped', NOW() - INTERVAL '26 days'),
('time008', 'ord002', 'COMPLETED', 'Order delivered', NOW() - INTERVAL '23 days'),

-- Order 4 timeline
('time009', 'ord004', 'PENDING', 'Order placed', NOW() - INTERVAL '3 days'),
('time010', 'ord004', 'PROCESSING', 'Payment confirmed', NOW() - INTERVAL '2 days + 6 hours'),

-- Order 6 timeline
('time011', 'ord006', 'PENDING', 'Order placed', NOW() - INTERVAL '5 days'),
('time012', 'ord006', 'PROCESSING', 'Payment confirmed', NOW() - INTERVAL '4 days + 8 hours'),
('time013', 'ord006', 'SHIPPED', 'Order shipped', NOW() - INTERVAL '1 day'),

-- Order 10 timeline (cancelled)
('time014', 'ord010', 'PENDING', 'Order placed', NOW() - INTERVAL '10 days'),
('time015', 'ord010', 'CANCELLED', 'Order cancelled by customer', NOW() - INTERVAL '9 days');

-- PART 12: INVENTORY ADJUSTMENTS
-- ============================================

INSERT INTO inventory_adjustments (id, inventory_id, type, quantity, reason, reference_id, notes, adjusted_by, created_at) VALUES

-- Stock received adjustments
('adj001', 'inv001', 'STOCK_IN', 30, 'Initial stock received', NULL, 'New shipment from supplier', 'admin', NOW() - INTERVAL '60 days'),
('adj002', 'inv005', 'STOCK_IN', 50, 'Restock', NULL, 'Popular item - increased inventory', 'admin', NOW() - INTERVAL '45 days'),
('adj003', 'inv006', 'STOCK_IN', 100, 'Restock', NULL, 'High demand product', 'admin', NOW() - INTERVAL '40 days'),
('adj004', 'inv021', 'STOCK_IN', 40, 'Initial stock', NULL, 'New product launch', 'admin', NOW() - INTERVAL '35 days'),

-- Sales adjustments (from orders)
('adj005', 'inv027', 'SALE', -1, 'Order sale', 'ord001', 'MacBook sold to customer', 'system', NOW() - INTERVAL '30 days'),
('adj006', 'inv030', 'SALE', -1, 'Order sale', 'ord002', 'iPhone sold - business order', 'system', NOW() - INTERVAL '28 days'),
('adj007', 'inv031', 'SALE', -1, 'Order sale', 'ord002', 'iPhone sold - business order', 'system', NOW() - INTERVAL '28 days'),
('adj008', 'inv033', 'SALE', -1, 'Order sale', 'ord002', 'iPhone sold - business order', 'system', NOW() - INTERVAL '28 days'),
('adj009', 'inv006', 'SALE', -2, 'Order sale', 'ord002', 'AirPods sold - bulk order', 'system', NOW() - INTERVAL '28 days'),
('adj010', 'inv005', 'SALE', -1, 'Order sale', 'ord003', 'Sony headphones sold', 'system', NOW() - INTERVAL '20 days'),
('adj011', 'inv006', 'SALE', -1, 'Order sale', 'ord003', 'AirPods sold', 'system', NOW() - INTERVAL '20 days'),

-- Damage adjustments
('adj012', 'inv008', 'DAMAGE', -2, 'Damaged in warehouse', NULL, 'Dropped during handling - insurance claim filed', 'warehouse_manager', NOW() - INTERVAL '25 days'),
('adj013', 'inv014', 'DAMAGE', -1, 'Customer return - damaged', 'ord001', 'Damaged during shipping - refund issued', 'support', NOW() - INTERVAL '22 days'),

-- Return adjustments
('adj014', 'inv029', 'RETURN', 1, 'Customer return', 'ord010', 'Order cancelled - item returned to stock', 'system', NOW() - INTERVAL '9 days'),

-- Theft/Loss adjustments
('adj015', 'inv022', 'LOSS', -5, 'Inventory discrepancy', NULL, 'Missing items during audit', 'warehouse_manager', NOW() - INTERVAL '15 days'),

-- Transfer adjustments
('adj016', 'inv016', 'TRANSFER', -3, 'Transfer to Store A', NULL, 'Moved to retail location', 'warehouse_manager', NOW() - INTERVAL '12 days'),
('adj017', 'inv023', 'TRANSFER', 20, 'Transfer from Store B', NULL, 'Excess stock from retail', 'warehouse_manager', NOW() - INTERVAL '10 days'),

-- Correction adjustments
('adj018', 'inv011', 'CORRECTION', 5, 'Inventory count correction', NULL, 'Physical count revealed discrepancy', 'admin', NOW() - INTERVAL '8 days'),
('adj019', 'inv019', 'CORRECTION', -2, 'Inventory count correction', NULL, 'System error - correcting count', 'admin', NOW() - INTERVAL '5 days'),

-- Recent restocks
('adj020', 'inv027', 'STOCK_IN', 10, 'Restock', NULL, 'Popular model - additional units ordered', 'admin', NOW() - INTERVAL '3 days'),
('adj021', 'inv005', 'STOCK_IN', 20, 'Restock', NULL, 'Bestseller - maintaining stock levels', 'admin', NOW() - INTERVAL '2 days'),
('adj022', 'inv042', 'STOCK_IN', 15, 'Restock', NULL, 'Summer collection restock', 'admin', NOW() - INTERVAL '1 day');

-- ============================================
-- SUMMARY STATISTICS
-- ============================================

-- Total Categories: 18 (5 main + 13 subcategories)
-- Total Customers: 10
-- Total Products: 30 (across all categories)
-- Total Product Variants: 20 (for configurable products)
-- Total Inventory Records: 46
-- Total Orders: 10 (various statuses)
-- Total Order Items: 20
-- Total Order Notes: 14
-- Total Timeline Events: 15
-- Total Inventory Adjustments: 22

-- Order Status Distribution:
-- - COMPLETED: 3 orders
-- - PROCESSING: 2 orders
-- - SHIPPED: 2 orders
-- - PENDING: 2 orders
-- - CANCELLED: 1 order

-- Product Categories:
-- - Electronics (Computers, Phones, Audio, Cameras)
-- - Clothing (Men's, Women's, Kids')
-- - Home & Garden (Furniture, Decor, Kitchen)
-- - Sports & Outdoors (Fitness, Camping, Cycling)

-- All images use picsum.photos with unique seeds for variety
-- Price range: $29 - $3,299
-- Total order value: ~$20,000

-- ============================================
-- EXECUTION INSTRUCTIONS
-- ============================================

-- To load this seed data:
-- 1. Ensure your database is set up and migrations are run
-- 2. Execute this SQL file:
--    psql -U your_username -d your_database -f seed-ecommerce-complete.sql
-- 
-- Or from within psql:
--    \i /path/to/seed-ecommerce-complete.sql
--
-- To reset and reload:
--    DELETE FROM inventory_adjustments;
--    DELETE FROM order_timeline;
--    DELETE FROM order_notes;
--    DELETE FROM order_items;
--    DELETE FROM orders;
--    DELETE FROM inventory;
--    DELETE FROM product_variants;
--    DELETE FROM products;
--    DELETE FROM customers;
--    DELETE FROM product_categories;
--    Then run this file again.

-- ============================================
-- END OF SEED DATA
-- ============================================
