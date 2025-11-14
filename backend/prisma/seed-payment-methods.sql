-- Payment Methods Seed Data
-- Cash on Delivery (enabled), Credit Card and PayPal (disabled for now)

-- Clear existing payment methods
DELETE FROM payment_methods;

-- Insert payment methods
INSERT INTO payment_methods (id, name, type, description, is_active, display_order, configuration, created_at, updated_at)
VALUES
  -- Cash on Delivery (ENABLED)
  (
    'pm_cod_001',
    'Cash on Delivery',
    'COD',
    'Pay with cash when your order is delivered to your doorstep',
    true,
    1,
    '{"fee": 0, "minOrderAmount": 0, "maxOrderAmount": 10000, "available": true}'::jsonb,
    NOW(),
    NOW()
  ),
  
  -- Credit Card (DISABLED - Coming Soon)
  (
    'pm_card_001',
    'Credit/Debit Card',
    'CARD',
    'Pay securely with your credit or debit card (Coming Soon)',
    false,
    2,
    '{"fee": 0, "minOrderAmount": 0, "maxOrderAmount": null, "available": false, "comingSoon": true}'::jsonb,
    NOW(),
    NOW()
  ),
  
  -- PayPal (DISABLED - Coming Soon)
  (
    'pm_paypal_001',
    'PayPal',
    'PAYPAL',
    'Pay with your PayPal account (Coming Soon)',
    false,
    3,
    '{"fee": 0, "minOrderAmount": 0, "maxOrderAmount": null, "available": false, "comingSoon": true}'::jsonb,
    NOW(),
    NOW()
  );

-- Verify insertion
SELECT id, name, type, is_active, display_order FROM payment_methods ORDER BY display_order;
