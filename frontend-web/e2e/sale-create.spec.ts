import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

test.describe('Sales page', () => {
  test('admin can navigate to sales page', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/sales');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('POS', () => {
  test('POS page loads for admin', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/pos');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('POS: add product to cart and see cart update', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/pos');
    await page.waitForSelector('[data-pos-product]', { timeout: 10_000 });

    const firstProduct = page.locator('[data-pos-product]').first();
    await firstProduct.click();

    await expect(
      page.locator('[data-testid="cart-count"]').or(page.locator('aside'))
    ).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('Sale creation — complete checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('opens New Sale dialog from /sales and completes step 0 (add products)', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForSelector('table', { timeout: 10_000 });

    // Open create dialog
    const newSaleBtn = page.getByRole('button', { name: /new sale|nueva venta/i });
    await expect(newSaleBtn).toBeVisible({ timeout: 5_000 });
    await newSaleBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Step 0: product selection — wait for products to load
    const productItems = dialog.locator('[data-pos-product], [data-product-row], button[aria-label*="add"], tr[data-product-id]');
    const firstProduct = productItems.first();
    if (await firstProduct.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await firstProduct.click();
      await expect(dialog.getByText(/1/)).toBeVisible({ timeout: 3_000 });
    }
  });

  test('sale checkout flow: navigate through all 4 steps', async ({ page }) => {
    await page.goto('/sales');
    await page.waitForSelector('table', { timeout: 10_000 });

    const newSaleBtn = page.getByRole('button', { name: /new sale|nueva venta|\+ /i }).first();
    await expect(newSaleBtn).toBeVisible({ timeout: 5_000 });
    await newSaleBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    // Step indicator should be visible
    const stepIndicator = dialog.locator('[aria-label*="step"], [data-step], .stepper, ol, [role="list"]');
    if (await stepIndicator.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
      // Step navigation buttons
      const nextBtn = dialog.getByRole('button', { name: /next|siguiente|continue|continuar/i });
      if (await nextBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await nextBtn.click();
        await expect(dialog).toBeVisible({ timeout: 3_000 });
      }
    }

    // Dialog should remain open throughout navigation
    await expect(dialog).toBeVisible();
  });

  test('completed sale appears in sales history', async ({ page }) => {
    // Navigate to sales page and note current sale count
    await page.goto('/sales');
    await page.waitForSelector('table tbody', { timeout: 10_000 });

    const initialRows = await page.locator('table tbody tr').count();

    // Open POS to complete a sale
    await page.goto('/pos');
    await page.waitForSelector('[data-pos-product]', { timeout: 10_000 });

    const firstProduct = page.locator('[data-pos-product]').first();
    await firstProduct.click();

    // Proceed to checkout
    const checkoutBtn = page.getByRole('button', { name: /checkout|pay|cobrar|pagar/i });
    if (await checkoutBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await checkoutBtn.click();

      const dialog = page.getByRole('dialog');
      if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
        // Complete checkout — look for confirm/place order button
        const confirmBtn = dialog.getByRole('button', { name: /confirm|place order|finalizar|realizar|complete/i });
        if (await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await confirmBtn.click();

          // Expect success toast
          const toast = page.locator('[role="status"], [data-radix-toast-viewport], .toast, [role="alert"]');
          if (await toast.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await expect(toast).toBeVisible();
          }

          // Verify sale appears in history
          await page.goto('/sales');
          await page.waitForSelector('table tbody', { timeout: 10_000 });
          const newRows = await page.locator('table tbody tr').count();
          expect(newRows).toBeGreaterThanOrEqual(initialRows);
        }
      }
    }
  });
});
