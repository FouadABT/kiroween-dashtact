-- Grant all e-commerce permissions to Super Admin role

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM user_roles WHERE name = 'Super Admin'),
  p.id
FROM permissions p
WHERE p.resource IN ('orders', 'products', 'customers', 'inventory')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = (SELECT id FROM user_roles WHERE name = 'Super Admin')
  AND rp.permission_id = p.id
);

-- Verify the permissions were added
SELECT 
  ur.name as role_name,
  COUNT(p.id) as total_permissions,
  COUNT(CASE WHEN p.resource IN ('orders', 'products', 'customers', 'inventory') THEN 1 END) as ecommerce_permissions
FROM user_roles ur
LEFT JOIN role_permissions rp ON ur.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE ur.name = 'Super Admin'
GROUP BY ur.name;
