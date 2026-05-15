-- Seed default tenant if none exists
INSERT INTO tenants (name, plan, status, created_at, owner_email)
SELECT 'Inventory Sales Hub', 'BASIC', 'ACTIVE', NOW(), 'admin@inventorysaleshub.com'
WHERE NOT EXISTS (SELECT 1 FROM tenants LIMIT 1);
