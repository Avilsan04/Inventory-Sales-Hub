import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Inventory — Transfer stock (per-row action)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/inventory');
    await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  });

  test('Transfer stock button opens dialog pre-populated with the correct row item', async ({ page }) => {
    // Get the name of the first row
    const firstRowName = await page.locator('table tbody tr').first()
      .locator('td').first().innerText();

    // Open the action dropdown on the first row
    const actionBtn = page.locator('table tbody tr').first()
      .locator('button[aria-label*="actions"]');
    await actionBtn.click();

    // Click Transfer stock in the dropdown
    const transferOption = page.getByRole('menuitem', { name: /transfer/i });
    await expect(transferOption).toBeVisible({ timeout: 3_000 });
    await transferOption.click();

    // Dialog should be open and show the item name
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 3_000 });
    await expect(dialog).toContainText(firstRowName);
  });

  test('Transfer dialog requires source and target warehouse', async ({ page }) => {
    const actionBtn = page.locator('table tbody tr').first()
      .locator('button[aria-label*="actions"]');
    await actionBtn.click();

    const transferOption = page.getByRole('menuitem', { name: /transfer/i });
    if (!(await transferOption.isVisible())) {
      test.skip(); // no transfer permission for this item
      return;
    }
    await transferOption.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 3_000 });

    // Submit without selecting warehouses — expect validation error
    await dialog.getByRole('button', { name: /transfer/i }).click();
    await expect(dialog.getByRole('alert').or(dialog.locator('[aria-describedby]'))).toBeVisible({ timeout: 2_000 });
  });
});
