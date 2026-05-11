import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test('admin can create a product', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/products');
  await page.click('button:has-text("+ ")');
  await page.fill('input[placeholder="Product name"]', 'Test Product E2E');
  await page.fill('input[placeholder="PRD-001"]', 'E2E-001');
  await page.fill('input[type="number"]', '9.99');
  await page.click('button[type="submit"]:has-text("Create")');
  await expect(page.getByText('Product created', { exact: true })).toBeVisible({ timeout: 5_000 });
});
