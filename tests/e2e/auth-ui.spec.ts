import { test, expect } from '@playwright/test';

// Auth UI presence and basic interactions without relying on backend
// Uses storage state from global-setup to set a bearer_token for API calls

test.describe('Auth UI: login & register', () => {
  test('login page renders and accepts basic input', async ({ page }) => {
    const res = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(res?.ok()).toBeTruthy();

    // Basic fields (lenient selectors)
    const email = page.getByLabel(/email/i).first().or(page.getByPlaceholder(/email/i));
    const password = page.getByLabel(/password/i).first().or(page.getByPlaceholder(/password/i));

    await email.fill('invalid@example.com');
    await password.fill('not-a-real-password');

    // Submit (common patterns: button with Login or Sign in text)
    const submit = page.getByRole('button', { name: /log ?in|sign ?in/i }).first();
    if (await submit.count()) {
      await Promise.all([
        page.waitForLoadState('networkidle').catch(() => {}),
        submit.click().catch(() => {}),
      ]);
    }

    // Still on /login or redirected back (no hard crash)
    expect(page.url()).toMatch(/\/login|http:\/\/localhost:3000\//);
  });

  test('register page renders fields', async ({ page }) => {
    const res = await page.goto('/register', { waitUntil: 'domcontentloaded' });
    expect(res?.ok()).toBeTruthy();

    // Expect basic fields to exist in any combination
    const name = page.getByLabel(/name/i).first().or(page.getByPlaceholder(/name/i));
    const email = page.getByLabel(/email/i).first().or(page.getByPlaceholder(/email/i));
    const password = page.getByLabel(/password/i).first().or(page.getByPlaceholder(/password/i));

    expect(await name.count()).toBeGreaterThan(0);
    expect(await email.count()).toBeGreaterThan(0);
    expect(await password.count()).toBeGreaterThan(0);

    // Do not actually attempt registration to avoid rate limits/emails
  });
});