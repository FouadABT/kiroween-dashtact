-- E-Commerce Seed Data - Part 3: Products

-- Insert Products (15 diverse products)
INSERT INTO products (id, name, slug, description, short_description, base_price, compare_at_price, cost, sku, featured_image, images, status, is_visible, is_featured, created_at, updated_at, published_at) VALUES
('prod001', 'Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 
 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.', 
 'Premium wireless headphones with ANC', 89.99, 129.99, 45.00, 'WBH-001', 
 '/products/headphones.jpg', ARRAY['/products/headphones-1.jpg', '/products/headphones-2.jpg'], 
 'PUBLISHED', true, true, NOW() - INTERVAL '3 months', NOW(), NOW() - INTERVAL '3 months'),

('prod002', 'Smart Watch Pro', 'smart-watch-pro',
 'Advanced fitness tracking, heart rate monitoring, GPS, and smartphone notifications. Water-resistant up to 50m.',
 'Advanced fitness smartwatch', 199.99, 249.99, 95.00, 'SWP-001',
 '/products/smartwatch.jpg', ARRAY['/products/smartwatch-1.jpg', '/products/smartwatch-2.jpg'],
 'PUBLISHED', true, true, NOW() - INTERVAL '2 months', NOW(), NOW() - INTERVAL '2 months'),

('prod003', 'Organic Cotton T-Shirt', 'organic-cotton-tshirt',
 '100% organic cotton, eco-friendly dyes, comfortable fit. Available in multiple colors and sizes.',
 'Eco-friendly organic cotton tee', 24.99, 34.99, 8.00, 'OCT-001',
 '/products/tshirt.jpg', ARRAY['/products/tshirt-1.jpg'],
 'PUBLISHED', true, false, NOW() - INTERVAL '1 month', NOW(), NOW() - INTERVAL '1 month'),

('prod004', 'Yoga Mat Premium', 'yoga-mat-premium',
 'Extra thick 6mm yoga mat with non-slip surface. Includes carrying strap. Perfect for yoga, pilates, and floor exercises.',
 'Premium 6mm yoga mat', 39.99, 59.99, 15.00, 'YMP-001',
 '/products/yogamat.jpg', ARRAY['/products/yogamat-1.jpg'],
 'PUBLISHED', true, false, NOW() - INTERVAL '2 months', NOW(), NOW() - INTERVAL '2 months'),

('prod005', 'Stainless Steel Water Bottle', 'stainless-steel-water-bottle',
 'Insulated stainless steel bottle keeps drinks cold for 24h or hot for 12h. BPA-free, leak-proof design.',
 'Insulated water bottle 32oz', 29.99, NULL, 10.00, 'SSWB-001',
 '/products/bottle.jpg', ARRAY['/products/bottle-1.jpg'],
 'PUBLISHED', true, false, NOW() - INTERVAL '1 month', NOW(), NOW() - INTERVAL '1 month');
