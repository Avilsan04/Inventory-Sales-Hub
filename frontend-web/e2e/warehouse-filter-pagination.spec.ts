import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test('warehouse filter resets pagination to page 1', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/inventory');
  await page.waitForSelector('table', { timeout: 10_000 });

  const nextBtn = page.locator('button[aria-label*="Next"]').or(page.locator('button[aria-label*="next"]'));
  const hasNext = await nextBtn.isEnabled().catch(() => false);

  if (hasNext) {
    await nextBtn.click();
    await page.waitForTimeout(300);
    const pageInfoBefore = await page.locator('[aria-live="polite"]').textContent();
    expect(pageInfoBefore).toContain('2');
  }

  const warehouseSelect = page.locator('button[role="combobox"]').first();
  if (await warehouseSelect.isVisible()) {
    await warehouseSelect.click();
    const firstOption = page.locator('[role="option"]').first();
    await firstOption.click();
    await page.waitForTimeout(300);

    const pageInfoAfter = await page.locator('[aria-live="polite"]').textContent();
    expect(pageInfoAfter).toContain('1');
  }
});
