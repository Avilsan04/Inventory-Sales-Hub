import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Inventory — Transfer stock (per-row action)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/inventory');
    await page.waitForSelector('table tbody tr', { timeout: 10_000 });
  });

  test('Transfer stock button opens dialog pre-populated with the correct row item', async ({ page }) => {
    const firstRowName = await page.locator('table tbody tr').first()
      .locator('td').first().innerText();

    // aria-label is "Actions for <name>" — case-insensitive match
    const actionBtn = page.locator('table tbody tr').first()
      .getByRole('button', { name: /actions for|acciones para/i });
    await actionBtn.click();

    const transferOption = page.getByRole('menuitem', { name: /transfer/i });
    await expect(transferOption).toBeVisible({ timeout: 3_000 });
    await transferOption.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 3_000 });
    await expect(dialog).toContainText(firstRowName);
  });

  test('Transfer dialog requires source and target warehouse', async ({ page }) => {
    const actionBtn = page.locator('table tbody tr').first()
      .getByRole('button', { name: /actions for|acciones para/i });
    await actionBtn.click();

    const transferOption = page.getByRole('menuitem', { name: /transfer/i });
    if (!(await transferOption.isVisible())) {
      test.skip();
      return;
    }
    await transferOption.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 3_000 });

    await dialog.getByRole('button', { name: /transfer/i }).click();
    await expect(dialog.getByRole('alert').first()).toBeVisible({ timeout: 2_000 });
  });
});
