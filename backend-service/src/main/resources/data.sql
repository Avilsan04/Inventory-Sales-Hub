-- Seed default tenant if none exists
INSERT INTO tenants (name, plan, status, created_at, owner_email)
SELECT 'Inventory Sales Hub', 'BASIC', 'ACTIVE', NOW(), 'admin@inventorysaleshub.com'
WHERE NOT EXISTS (SELECT 1 FROM tenants LIMIT 1);

-- Rebuild role check constraint to include CUSTOMER and COMPANY
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER', 'COMPANY'));
