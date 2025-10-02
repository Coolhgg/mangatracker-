import { test, expect } from "@playwright/test";

test.describe("Homepage - All Sections", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Kenmei/i);
  });

  test("should display navigation with all links", async ({ page }) => {
    await page.goto("/");
    
    // Check logo
    await expect(page.locator("img[alt*='Kenmei'], a[href='/']")).toBeVisible();
    
    // Check navigation links
    const navLinks = ["Track", "Discover", "Social", "Premium", "Resources"];
    for (const link of navLinks) {
      await expect(page.getByRole("link", { name: new RegExp(link, "i") })).toBeVisible();
    }
    
    // Check auth buttons
    await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
  });

  test("should display hero section with CTA", async ({ page }) => {
    await page.goto("/");
    
    // Hero headline
    await expect(page.locator("text=/Every Series.*One Tracker/i")).toBeVisible();
    
    // Hero subtitle
    await expect(page.locator("text=/sync.*reading.*20.*sites/i")).toBeVisible();
    
    // CTA button
    const ctaButton = page.getByRole("link", { name: /get started for free/i }).first();
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute("href", /\/(register|login)/);
  });

  test("should display cross-site tracking section", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.locator("text=/Cross-site tracking/i")).toBeVisible();
    await expect(page.locator("text=/Track Everything, Everywhere/i")).toBeVisible();
    await expect(page.locator("text=/Find Your Next Read/i")).toBeVisible();
    await expect(page.locator("text=/Your Library, Your Way/i")).toBeVisible();
  });

  test("should display platform action section", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.locator("text=/See the platform in action/i")).toBeVisible();
    await expect(page.locator("text=/Take Control of Your Collection/i")).toBeVisible();
  });

  test("should display discovery section", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.locator("text=/Ultimate Tracking Tool/i")).toBeVisible();
    await expect(page.locator("text=/Start discovering/i")).toBeVisible();
  });

  test("should display community section", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.locator("text=/More Than Just Tracking/i")).toBeVisible();
    await expect(page.locator("text=/Join the Community/i")).toBeVisible();
  });

  test("should display premium section", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.locator("text=/Go Premium.*Unlock More/i")).toBeVisible();
    await expect(page.locator("text=/Personalized Recommendations/i")).toBeVisible();
  });

  test("should display final CTA section", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.locator("text=/Ready for Your Next Favourite Read/i")).toBeVisible();
    const finalCta = page.getByRole("link", { name: /get started for free/i }).last();
    await expect(finalCta).toBeVisible();
  });

  test("should display footer with all links", async ({ page }) => {
    await page.goto("/");
    
    // Footer sections
    await expect(page.locator("text=/Product/i")).toBeVisible();
    await expect(page.locator("text=/Resources/i")).toBeVisible();
    await expect(page.locator("text=/Legal/i")).toBeVisible();
    await expect(page.locator("text=/Social/i")).toBeVisible();
    
    // Footer links
    await expect(page.getByRole("link", { name: /Privacy/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Terms/i })).toBeVisible();
  });

  test("should navigate to register page from CTA", async ({ page }) => {
    await page.goto("/");
    
    const ctaButton = page.getByRole("link", { name: /get started for free/i }).first();
    await ctaButton.click();
    
    await page.waitForURL(/\/(register|login)/);
    expect(page.url()).toMatch(/\/(register|login)/);
  });

  test("should have responsive design - mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    await expect(page).toHaveTitle(/Kenmei/i);
    await expect(page.locator("text=/Every Series.*One Tracker/i")).toBeVisible();
  });

  test("should have responsive design - tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    
    await expect(page).toHaveTitle(/Kenmei/i);
    await expect(page.locator("text=/Every Series.*One Tracker/i")).toBeVisible();
  });
});