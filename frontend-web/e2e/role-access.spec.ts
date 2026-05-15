import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Role-based route access', () => {
  test('customer cannot access /inventory', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/inventory');
    // Should be redirected away (dashboard or 404) — not show inventory
    await expect(page).not.toHaveURL(/\/inventory$/);
  });

  test('customer cannot access /employees', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/employees');
    await expect(page).not.toHaveURL(/\/employees$/);
  });

  test('customer cannot access /admin/tenants', async ({ page }) => {
    await loginAs(page, 'customer');
    await page.goto('/admin/tenants');
    await expect(page).not.toHaveURL(/\/admin\/tenants$/);
  });

  test('admin can access /inventory', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/inventory');
    await expect(page).toHaveURL(/\/inventory/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('admin can access /employees', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/employees');
    await expect(page).toHaveURL(/\/employees/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('admin can access /admin/tenants', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/tenants');
    await expect(page).toHaveURL(/\/admin\/tenants/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
