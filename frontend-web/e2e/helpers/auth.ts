import type { Page } from '@playwright/test';

type Role = 'admin' | 'customer' | 'test' | 'company';

const CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: { email: 'admin@ish.dev', password: 'admin123' },
  customer: { email: 'cliente@ish.dev', password: 'customer123' },
  test: { email: 'test@ish.dev', password: 'test123' },
  company: { email: 'empresa@ish.dev', password: 'company123' },
};

export async function loginAs(page: Page, role: Role): Promise<void> {
  const { email, password } = CREDENTIALS[role];
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10_000 });
}
