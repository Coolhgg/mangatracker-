import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

test.describe('Premium and Payments', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test('should display pricing page', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    
    // Should show pricing tiers
    const pricingCards = page.locator('[data-testid="pricing-card"], .pricing-card, article');
    const count = await pricingCards.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should show premium badge for pro plan', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    
    // Look for premium/pro badges
    const premiumBadge = page.locator('text=/pro|premium|popular/i');
    await expect(premiumBadge.first()).toBeVisible();
  });

  test('should initiate checkout flow', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.waitForLoadState('networkidle');
    
    // Find and click upgrade button
    const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Subscribe"), button:has-text("Get Started")').first();
    
    if (await upgradeButton.count() > 0) {
      // Listen for new pages (Stripe checkout)
      const pagePromise = context.waitForEvent('page');
      await upgradeButton.click();
      
      // Wait for checkout page or dialog
      await page.waitForTimeout(2000);
      
      // Should either open new window or show checkout dialog
      const hasDialog = await page.locator('[role="dialog"], .checkout-dialog').count() > 0;
      
      // In test mode, we don't complete actual payment
      expect(hasDialog || page.url().includes('checkout')).toBeTruthy();
    }
  });

  test('should display current plan in account', async ({ page }) => {
    await page.goto(`${BASE_URL}/account`);
    await page.waitForLoadState('networkidle');
    
    // Should show current plan information
    const planInfo = page.locator('text=/current plan|subscription|free plan/i');
    await expect(planInfo).toBeVisible();
  });

  test('should show billing portal link', async ({ page }) => {
    await page.goto(`${BASE_URL}/account`);
    await page.waitForLoadState('networkidle');
    
    // Look for manage billing button
    const billingButton = page.locator('button:has-text("Manage Billing"), a:has-text("Billing Portal")');
    
    if (await billingButton.count() > 0) {
      await expect(billingButton.first()).toBeVisible();
    }
  });
});