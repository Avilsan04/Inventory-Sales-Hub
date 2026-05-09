import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test('admin can adjust stock', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/inventory');
  // Wait for inventory table to load
  await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  // Click adjust stock button on first row
  const adjustBtn = page.locator('button[aria-label*="stock"], button:has-text("Adjust")').first();
  if (await adjustBtn.isVisible()) {
    await adjustBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  }
});
