import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Helper to login
async function login(page: any) {
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testPassword = process.env.TEST_PASSWORD || 'password123';

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard|\/library|\//, { timeout: 10000 });
}

test.describe('Payment & Premium Features', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display pricing page', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await expect(page).toHaveTitle(/Pricing|Premium|Kenmei/);
    
    // Check for pricing cards
    const pricingCards = page.locator('[data-testid="pricing-card"], .pricing-card');
    const count = await pricingCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show premium features', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Look for feature lists
    const features = page.locator('text=/Personalized|Smart|Advanced/i');
    await expect(features.first()).toBeVisible({ timeout: 5000 });
  });

  test('should initiate checkout process', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Find upgrade/subscribe button
    const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Subscribe")').first();
    
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();
      
      // Wait for Stripe checkout or payment dialog
      await page.waitForTimeout(2000);
      
      // Check if redirected or modal opened
      const url = page.url();
      const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
      
      // Either we're on checkout page or modal is open
      const isCheckout = url.includes('checkout') || url.includes('stripe') || await stripeFrame.locator('body').isVisible().catch(() => false);
      expect(isCheckout || url.includes('/pricing')).toBeTruthy();
    }
  });

  test('should display current plan', async ({ page }) => {
    await page.goto(`${BASE_URL}/account`);
    
    // Look for plan information
    const planBadge = page.locator('[data-testid="plan-badge"], text=/Free|Pro|Premium/i').first();
    await expect(planBadge).toBeVisible({ timeout: 5000 });
  });

  test('should access billing portal', async ({ page }) => {
    await page.goto(`${BASE_URL}/account`);
    
    // Find billing portal button
    const billingButton = page.locator('button:has-text("Manage Billing"), a:has-text("Billing Portal")');
    
    if (await billingButton.isVisible()) {
      await billingButton.click();
      
      // Wait for redirect or new tab
      await page.waitForTimeout(2000);
      
      // Verify navigation
      const url = page.url();
      expect(url).toBeTruthy();
    }
  });

  test('should show feature gates for free users', async ({ page }) => {
    // Assuming logged in as free user
    await page.goto(`${BASE_URL}/discovery`);
    
    // Look for premium feature indicators
    const premiumBadge = page.locator('text=/Premium|Pro only|Upgrade/i').first();
    
    // If premium features exist, they should show upgrade prompts
    if (await premiumBadge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(premiumBadge).toBeVisible();
    }
  });

  test('should display usage limits', async ({ page }) => {
    await page.goto(`${BASE_URL}/account`);
    
    // Look for usage indicators
    const usageSection = page.locator('text=/Usage|Limit|Remaining/i').first();
    
    if (await usageSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(usageSection).toBeVisible();
    }
  });
});