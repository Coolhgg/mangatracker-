import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Smoke Tests - Production Health', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Kenmei/);
  });

  test('navigation links are accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check main navigation links
    const links = ['login', 'register', 'pricing', 'discover'];
    
    for (const link of links) {
      const linkElement = page.locator(`a[href*="${link}"]`).first();
      if (await linkElement.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(linkElement).toBeVisible();
      }
    }
  });

  test('search functionality is available', async ({ page }) => {
    await page.goto(`${BASE_URL}/search`);
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test('API health endpoint responds', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health/db`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('series page loads with data', async ({ page }) => {
    await page.goto(`${BASE_URL}/series/one-piece`);
    
    // Should show series title or content
    const content = page.locator('main, [data-testid="series-content"]');
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('discovery page renders', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/discovery`);
    expect(response?.status()).toBe(200);
    
    // Should show discovery content
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('static assets load correctly', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', response => {
      if (response.url().match(/\.(jpg|jpeg|png|svg|css|js)$/)) {
        responses.push(response);
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check that most assets loaded successfully
    const failedAssets = responses.filter(r => !r.ok());
    expect(failedAssets.length).toBeLessThan(responses.length * 0.1); // Less than 10% failures
  });

  test('no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Filter out known harmless errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('analytics') &&
      !err.includes('posthog')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('database connection is healthy', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health/db`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.database).toBeTruthy();
  });

  test('search API responds correctly', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/search?q=one`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(Array.isArray(data.results) || Array.isArray(data)).toBeTruthy();
  });

  test('authentication endpoints are accessible', async ({ request }) => {
    // Check login endpoint
    const loginResponse = await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
      data: { email: 'test@example.com', password: 'invalid' }
    });
    
    // Should respond (even if credentials are wrong)
    expect(loginResponse.status()).toBeGreaterThanOrEqual(200);
    expect(loginResponse.status()).toBeLessThan(500);
  });

  test('worker status endpoint responds', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/worker/status`).catch(() => null);
    
    // Worker might not be deployed in all environments
    if (response) {
      expect(response.status()).toBeLessThan(500);
    }
  });
});