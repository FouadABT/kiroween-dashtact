-- Add landing and pages permissions to Admin role
-- This is a manual migration to fix missing permissions

-- Get Admin role ID and landing permission IDs, then insert
WITH admin_role AS (
  SELECT id FROM user_roles WHERE name = 'Admin'
),
landing_perms AS (
  SELECT id, name FROM permissions WHERE resource IN ('landing', 'pages')
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM admin_role),
  lp.id
FROM landing_perms lp
WHERE lp.name IN (
  'landing:read', 
  'landing:write', 
  'landing:publish',
  'pages:read',
  'pages:write',
  'pages:delete',
  'pages:publish'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;
