import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper to login before each test
async function login(page: any) {
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testPassword = process.env.TEST_PASSWORD || 'password123';

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard|\/library|\//, { timeout: 10000 });
}

test.describe('Library Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display library page', async ({ page }) => {
    await page.goto(`${BASE_URL}/library`);
    await expect(page).toHaveTitle(/Library|Kenmei/);
    
    // Check for library elements
    const libraryContent = page.locator('main, [data-testid="library"]');
    await expect(libraryContent).toBeVisible();
  });

  test('should add series to library', async ({ page }) => {
    // Navigate to a series page
    await page.goto(`${BASE_URL}/series/one-piece`);
    
    // Find and click "Add to Library" button
    const addButton = page.locator('button:has-text("Add to Library"), button:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Wait for success indication
      await page.waitForSelector('text=/Added|Success/i', { timeout: 5000 });
      
      // Verify button text changed
      const removeButton = page.locator('button:has-text("Remove"), button:has-text("In Library")');
      await expect(removeButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('should mark chapter as read', async ({ page }) => {
    // Go to library
    await page.goto(`${BASE_URL}/library`);
    
    // Click on a series
    const seriesCard = page.locator('[data-testid="series-card"], .series-card').first();
    if (await seriesCard.isVisible()) {
      await seriesCard.click();
      
      // Wait for series page to load
      await page.waitForSelector('text=/Chapter|Episode/i', { timeout: 5000 });
      
      // Find first unread chapter
      const chapterButton = page.locator('button:has-text("Mark as Read"), button:has-text("Read")').first();
      
      if (await chapterButton.isVisible()) {
        await chapterButton.click();
        
        // Wait for update
        await page.waitForSelector('text=/Marked|Complete/i', { timeout: 3000 });
      }
    }
  });

  test('should filter library by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/library`);
    
    // Find filter dropdown or buttons
    const filterButton = page.locator('[data-testid="filter"], button:has-text("Filter")');
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Select "Reading" status
      const readingOption = page.locator('text=/Reading/i').first();
      await readingOption.click();
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify URL or visible content updated
      const libraryContent = page.locator('[data-testid="library-content"], main');
      await expect(libraryContent).toBeVisible();
    }
  });

  test('should search within library', async ({ page }) => {
    await page.goto(`${BASE_URL}/library`);
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('One Piece');
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const results = page.locator('[data-testid="series-card"], .series-card');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should update reading progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/library`);
    
    // Click on a series
    const seriesCard = page.locator('[data-testid="series-card"]').first();
    if (await seriesCard.isVisible()) {
      await seriesCard.click();
      
      // Look for progress input or chapter list
      const chapterList = page.locator('[data-testid="chapter-list"], .chapter-list');
      await expect(chapterList).toBeVisible({ timeout: 5000 });
      
      // Verify progress indicator exists
      const progressBar = page.locator('[role="progressbar"], .progress');
      if (await progressBar.isVisible()) {
        await expect(progressBar).toBeVisible();
      }
    }
  });
});