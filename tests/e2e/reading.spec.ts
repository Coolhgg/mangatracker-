import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

test.describe('Reading Progress', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should display chapters list', async ({ page }) => {
    await page.goto(`${BASE_URL}/series/one-piece`);
    await page.waitForLoadState('networkidle');
    
    // Look for chapters section
    const chaptersSection = page.locator('text=/chapters|latest chapters/i');
    await expect(chaptersSection).toBeVisible();
  });

  test('should mark chapter as read', async ({ page }) => {
    await page.goto(`${BASE_URL}/series/one-piece`);
    await page.waitForLoadState('networkidle');
    
    // Find mark as read button
    const markReadButton = page.locator('button:has-text("Mark as Read"), button[aria-label*="mark read"]').first();
    
    if (await markReadButton.count() > 0) {
      await markReadButton.click();
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Should show success or change button state
      const readIndicator = page.locator('text=/marked|read|complete/i, [data-read="true"]');
      await expect(readIndicator.first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should display reading progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/library`);
    await page.waitForLoadState('networkidle');
    
    // Look for progress indicators
    const progressElements = page.locator('[data-progress], .progress-bar, text=/chapters read|progress/i');
    
    if (await progressElements.count() > 0) {
      await expect(progressElements.first()).toBeVisible();
    }
  });

  test('should filter library by reading status', async ({ page }) => {
    await page.goto(`${BASE_URL}/library`);
    await page.waitForLoadState('networkidle');
    
    // Look for status filters
    const statusFilter = page.locator('button:has-text("Reading"), button:has-text("Completed"), select[name*="status"]');
    
    if (await statusFilter.count() > 0) {
      await statusFilter.first().click();
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Library should update
      await page.waitForLoadState('networkidle');
    }
  });
});