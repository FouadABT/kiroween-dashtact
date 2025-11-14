-- E-Commerce Seed Data - Part 1: Customers
-- Execute this script to populate test data for ecommerce

-- Insert Customers (10 diverse customer profiles)
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
 'Retail partner', ARRAY['business', 'partner'], NOW() - INTERVAL '2 years', NOW());
