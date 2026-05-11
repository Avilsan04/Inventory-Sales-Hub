import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test('admin can navigate to sales page', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/sales');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
});

test('POS page loads for admin', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/pos');
  await expect(page.locator('h1')).toBeVisible();
});
