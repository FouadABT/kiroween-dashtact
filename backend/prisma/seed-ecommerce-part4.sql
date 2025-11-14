-- E-Commerce Seed Data - Part 4: More Products

INSERT INTO products (id, name, slug, description, short_description, base_price, compare_at_price, cost, sku, featured_image, images, status, is_visible, is_featured, created_at, updated_at, published_at) VALUES
('prod006', 'LED Desk Lamp', 'led-desk-lamp',
 'Adjustable LED desk lamp with touch controls, USB charging port, and 5 brightness levels. Energy efficient.',
 'Adjustable LED desk lamp', 44.99, 64.99, 18.00, 'LDL-001',
 '/products/lamp.jpg', ARRAY['/products/lamp-1.jpg'],
 'PUBLISHED', true, false, NOW() - INTERVAL '3 weeks', NOW(), NOW() - INTERVAL '3 weeks'),

('prod007', 'Mechanical Keyboard RGB', 'mechanical-keyboard-rgb',
 'Gaming mechanical keyboard with RGB backlighting, programmable keys, and tactile switches. Perfect for gamers and typists.',
 'RGB mechanical gaming keyboard', 119.99, 159.99, 55.00, 'MKR-001',
 '/products/keyboard.jpg', ARRAY['/products/keyboard-1.jpg', '/products/keyboard-2.jpg'],
 'PUBLISHED', true, true, NOW() - INTERVAL '1 month', NOW(), NOW() - INTERVAL '1 month'),

('prod008', 'Running Shoes Pro', 'running-shoes-pro',
 'Professional running shoes with advanced cushioning and breathable mesh. Designed for long-distance runners.',
 'Professional running shoes', 89.99, 119.99, 35.00, 'RSP-001',
 '/products/shoes.jpg', ARRAY['/products/shoes-1.jpg'],
 'PUBLISHED', true, false, NOW() - INTERVAL '2 weeks', NOW(), NOW() - INTERVAL '2 weeks'),

('prod009', 'Coffee Maker Deluxe', 'coffee-maker-deluxe',
 'Programmable coffee maker with thermal carafe, brew strength control, and auto-shutoff. Makes 12 cups.',
 '12-cup programmable coffee maker', 79.99, 99.99, 32.00, 'CMD-001',
 '/products/coffee.jpg', ARRAY['/products/coffee-1.jpg'],
 'PUBLISHED', true, false, NOW() - INTERVAL '5 weeks', NOW(), NOW() - INTERVAL '5 weeks'),

('prod010', 'Backpack Travel Pro', 'backpack-travel-pro',
 'Durable travel backpack with laptop compartment, USB charging port, and water-resistant material. TSA-friendly.',
 'Travel backpack with USB port', 59.99, 79.99, 25.00, 'BTP-001',
 '/products/backpack.jpg', ARRAY['/products/backpack-1.jpg'],
 'PUBLISHED', true, false, NOW() - INTERVAL '1 month', NOW(), NOW() - INTERVAL '1 month');
