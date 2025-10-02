import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

test.describe('Series Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto(BASE_URL);
  });

  test('should display series on homepage', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check for series cards or titles
    const seriesElements = page.locator('[data-testid="series-card"], .series-card, article');
    const count = await seriesElements.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to series detail page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and click first series link
    const firstSeries = page.locator('a[href*="/series/"]').first();
    await firstSeries.click();
    
    // Should navigate to series detail page
    await expect(page).toHaveURL(/.*\/series\/.+/);
    
    // Should show series information
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should add series to library when logged in', async ({ page, context }) => {
    // Login first (assumes you have test credentials)
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Navigate to a series
    await page.goto(`${BASE_URL}/series/one-piece`);
    
    // Click add to library button
    const addButton = page.locator('button:has-text("Add to Library"), button:has-text("Add")');
    await addButton.click();
    
    // Wait for success feedback
    await page.waitForTimeout(1000);
    
    // Button should change or show success message
    const successIndicator = page.locator('text=/added|success|in library/i');
    await expect(successIndicator).toBeVisible();
  });

  test('should prompt login when adding to library without auth', async ({ page }) => {
    // Navigate to a series without logging in
    await page.goto(`${BASE_URL}/series/one-piece`);
    
    // Click add to library button
    const addButton = page.locator('button:has-text("Add to Library"), button:has-text("Add")');
    await addButton.click();
    
    // Should redirect to login or show login prompt
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl.includes('/login') || currentUrl.includes('redirect')).toBeTruthy();
  });
});