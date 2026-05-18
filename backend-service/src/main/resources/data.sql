-- Seed default tenant if none exists
INSERT INTO tenants (name, plan, status, created_at, owner_email)
SELECT 'Inventory Sales Hub', 'BASIC', 'ACTIVE', NOW(), 'admin@inventorysaleshub.com'
WHERE NOT EXISTS (SELECT 1 FROM tenants LIMIT 1);

-- Rebuild role check constraint to include all valid roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER', 'COMPANY'));

-- Back-fill tenant_id on existing rows that predate the migration (use tenant 1 as default)
UPDATE products SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE customers SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE sales SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE suppliers SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE categories SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE users SET tenant_id = NULL WHERE role = 'ADMIN';
UPDATE users SET tenant_id = 1 WHERE tenant_id IS NULL AND role != 'ADMIN';
