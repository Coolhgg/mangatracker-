import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

test.describe('Comments and Ratings', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should display comments on series page', async ({ page }) => {
    await page.goto(`${BASE_URL}/series/one-piece`);
    await page.waitForLoadState('networkidle');
    
    // Look for comments section
    const commentsSection = page.locator('[data-testid="comments"], .comments, section:has-text("Comments")');
    await expect(commentsSection).toBeVisible();
  });

  test('should allow posting a comment', async ({ page }) => {
    await page.goto(`${BASE_URL}/series/one-piece`);
    await page.waitForLoadState('networkidle');
    
    const testComment = `Test comment ${Date.now()}`;
    
    // Find comment textarea
    const textarea = page.locator('textarea[placeholder*="comment"], textarea[name="comment"]');
    await textarea.fill(testComment);
    
    // Submit comment
    const submitButton = page.locator('button[type="submit"]:has-text("Post"), button:has-text("Comment")');
    await submitButton.click();
    
    // Wait for comment to appear
    await page.waitForTimeout(2000);
    
    // Verify comment appears
    await expect(page.locator(`text=${testComment}`)).toBeVisible();
  });

  test('should allow rating a series', async ({ page }) => {
    await page.goto(`${BASE_URL}/series/one-piece`);
    await page.waitForLoadState('networkidle');
    
    // Find rating stars or buttons
    const ratingButton = page.locator('[data-rating="5"], button[aria-label*="5 stars"], .star-5');
    
    if (await ratingButton.count() > 0) {
      await ratingButton.first().click();
      
      // Wait for rating to be saved
      await page.waitForTimeout(1000);
      
      // Should show success feedback
      const successMessage = page.locator('text=/rated|success|thank you/i');
      await expect(successMessage).toBeVisible({ timeout: 3000 });
    }
  });

  test('should allow reacting to comments', async ({ page }) => {
    await page.goto(`${BASE_URL}/series/one-piece`);
    await page.waitForLoadState('networkidle');
    
    // Find reaction buttons
    const reactionButton = page.locator('button[aria-label*="like"], button[aria-label*="upvote"], .reaction-button').first();
    
    if (await reactionButton.count() > 0) {
      const initialText = await reactionButton.textContent();
      await reactionButton.click();
      
      // Wait for reaction to register
      await page.waitForTimeout(1000);
      
      // Text should change (count should increase)
      const newText = await reactionButton.textContent();
      expect(newText).not.toBe(initialText);
    }
  });
});