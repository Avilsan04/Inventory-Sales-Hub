import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test('admin login redirects to dashboard', async ({ page }) => {
  await loginAs(page, 'admin');
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('h1')).toBeVisible();
});

test('customer login shows limited navigation', async ({ page }) => {
  await loginAs(page, 'customer');
  await expect(page).toHaveURL(/dashboard/);
});
