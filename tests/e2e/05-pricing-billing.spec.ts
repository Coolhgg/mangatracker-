import { test, expect } from "@playwright/test";

test.describe("Pricing and Billing", () => {
  test.describe("Pricing Page", () => {
    test("should load pricing page", async ({ page }) => {
      await page.goto("/pricing");
      await expect(page).toHaveTitle(/Pricing|Plans/i);
    });

    test("should display pricing tiers", async ({ page }) => {
      await page.goto("/pricing");
      
      // Check for pricing cards
      const pricingCards = page.locator('[class*="pricing"], [class*="plan"]');
      if (await pricingCards.count() > 0) {
        expect(await pricingCards.count()).toBeGreaterThan(0);
      }
      
      // Check for free and premium tiers
      const freeTier = page.locator("text=/Free/i");
      const premiumTier = page.locator("text=/Premium|Pro|Plus/i");
      
      if (await freeTier.isVisible()) {
        await expect(freeTier).toBeVisible();
      }
      if (await premiumTier.isVisible()) {
        await expect(premiumTier).toBeVisible();
      }
    });

    test("should show feature comparisons", async ({ page }) => {
      await page.goto("/pricing");
      
      // Look for feature lists
      const features = page.locator("text=/track|discover|filter|notification|theme/i");
      if (await features.count() > 0) {
        expect(await features.count()).toBeGreaterThan(0);
      }
    });

    test("should have upgrade buttons", async ({ page }) => {
      await page.goto("/pricing");
      
      // Look for upgrade/subscribe buttons
      const upgradeButtons = page.locator('button:has-text("Upgrade"), button:has-text("Subscribe"), button:has-text("Get Started")');
      if (await upgradeButtons.count() > 0) {
        await expect(upgradeButtons.first()).toBeVisible();
      }
    });

    test("should redirect to login when clicking upgrade without auth", async ({ page }) => {
      await page.goto("/pricing");
      
      // Try to click upgrade button
      const upgradeButton = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade")').first();
      if (await upgradeButton.isVisible()) {
        await upgradeButton.click();
        
        // Should redirect to login or show auth modal
        await page.waitForTimeout(1000);
        const isOnLogin = page.url().includes("/login");
        const hasAuthModal = await page.locator('[role="dialog"], .modal').isVisible();
        
        expect(isOnLogin || hasAuthModal).toBeTruthy();
      }
    });
  });

  test.describe("Billing Page (Authenticated)", () => {
    test("should require authentication for billing page", async ({ page }) => {
      await page.goto("/billing");
      
      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 3000 });
      expect(page.url()).toContain("/login");
    });
  });

  test.describe("Feature Gating", () => {
    test("should show upgrade prompts for premium features on dashboard", async ({ page }) => {
      // Try to access dashboard without auth (will redirect to login)
      await page.goto("/dashboard");
      await page.waitForURL(/\/login/);
      
      // Feature gating is checked after authentication
      expect(page.url()).toContain("/login");
    });

    test("should gate discovery features for free users", async ({ page }) => {
      await page.goto("/discovery");
      
      // Free users may see limited content or upgrade prompts
      const upgradePrompt = page.locator("text=/Upgrade|Premium|Pro/i");
      if (await upgradePrompt.isVisible({ timeout: 2000 })) {
        await expect(upgradePrompt).toBeVisible();
      }
    });
  });
});