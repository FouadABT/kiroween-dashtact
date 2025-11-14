-- E-Commerce Seed Data - Part 2: Categories and Tags

-- Insert Product Categories
INSERT INTO product_categories (id, name, slug, description, display_order, is_visible, created_at, updated_at) VALUES
('cat001', 'Electronics', 'electronics', 'Electronic devices and accessories', 1, true, NOW(), NOW()),
('cat002', 'Clothing', 'clothing', 'Apparel and fashion items', 2, true, NOW(), NOW()),
('cat003', 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', 3, true, NOW(), NOW()),
('cat004', 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 4, true, NOW(), NOW()),
('cat005', 'Books', 'books', 'Books and educational materials', 5, true, NOW(), NOW());

-- Insert Product Tags
INSERT INTO product_tags (id, name, slug, created_at) VALUES
('tag001', 'Best Seller', 'best-seller', NOW()),
('tag002', 'New Arrival', 'new-arrival', NOW()),
('tag003', 'On Sale', 'on-sale', NOW()),
('tag004', 'Limited Edition', 'limited-edition', NOW()),
('tag005', 'Eco-Friendly', 'eco-friendly', NOW()),
('tag006', 'Premium', 'premium', NOW());
