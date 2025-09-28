import { test, expect } from '@playwright/test';

// Basic UI smoke for public routes and homepage landmarks
// Relies on tests/e2e/global-setup.ts to seed DB and set localStorage bearer_token

test.describe('Public pages smoke', () => {
  test('homepage renders and has main content', async ({ page }) => {
    const res = await page.goto('/', { waitUntil: 'networkidle' });
    expect(res?.ok()).toBeTruthy();

    await expect(page.locator('main')).toBeVisible();

    // Basic sanity: no generic application error text visible
    await expect(page.locator('text=/Application error|Unhandled error|404|500/i')).toHaveCount(0);
  });

  test('key public routes respond and render', async ({ page }) => {
    const routes = [
      '/',
      '/pricing',
      '/discover',
      '/search',
      '/login',
      '/register',
      '/legal/privacy',
      '/legal/terms',
      '/legal/cookies',
    ];

    for (const path of routes) {
      const res = await page.goto(path, { waitUntil: 'networkidle' });
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('text=/Application error|Unhandled error|500/i')).toHaveCount(0);
    }
  });

  test('navigate via some internal links from homepage (safe whitelist)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const safeLinks = [
      '/pricing',
      '/discover',
      '/search',
      '/login',
      '/register',
    ];

    for (const href of safeLinks) {
      const link = page.locator(`a[href="${href}"]`).first();
      const exists = await link.count();
      if (exists > 0) {
        await Promise.all([
          page.waitForLoadState('networkidle'),
          link.click(),
        ]);
        await expect(page.locator('main')).toBeVisible();
        await page.goBack({ waitUntil: 'networkidle' });
      }
    }
  });
});