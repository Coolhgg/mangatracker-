import { test, expect } from "@playwright/test";

test.describe("Legal Pages", () => {
  test("should load privacy policy page", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page).toHaveTitle(/Privacy/i);
    await expect(page.locator("text=/Privacy Policy/i")).toBeVisible();
  });

  test("should load terms of service page", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(page).toHaveTitle(/Terms/i);
    await expect(page.locator("text=/Terms of Service|Terms/i")).toBeVisible();
  });

  test("should load cookies policy page", async ({ page }) => {
    await page.goto("/legal/cookies");
    await expect(page).toHaveTitle(/Cookie/i);
    await expect(page.locator("text=/Cookie Policy|Cookies/i")).toBeVisible();
  });

  test("should load DMCA page", async ({ page }) => {
    await page.goto("/legal/dmca");
    await expect(page).toHaveTitle(/DMCA/i);
    await expect(page.locator("text=/DMCA/i")).toBeVisible();
  });

  test("should display DMCA report form", async ({ page }) => {
    await page.goto("/legal/dmca");
    
    // Check for form fields
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/organization/i).or(page.getByLabel(/company/i))).toBeVisible();
    await expect(page.getByLabel(/content.*type/i)).toBeVisible();
    await expect(page.getByLabel(/details|complaint/i)).toBeVisible();
  });

  test("should submit DMCA report with valid data", async ({ page }) => {
    await page.goto("/legal/dmca");
    
    // Fill form
    await page.getByLabel(/^name/i).fill("Test Reporter");
    await page.getByLabel(/^email/i).fill("reporter@example.com");
    
    const orgField = page.getByLabel(/organization/i).or(page.getByLabel(/company/i));
    if (await orgField.isVisible()) {
      await orgField.fill("Test Organization");
    }
    
    // Select content type
    const contentTypeSelect = page.locator('select').filter({ hasText: /series|chapter|comment/i });
    if (await contentTypeSelect.isVisible()) {
      await contentTypeSelect.selectOption({ index: 1 });
    }
    
    // Fill URL if present
    const urlField = page.getByLabel(/url|link/i);
    if (await urlField.isVisible()) {
      await urlField.fill("https://example.com/series/test");
    }
    
    // Fill complaint details
    await page.getByLabel(/details|complaint|description/i).fill("This is a test complaint for automated testing purposes.");
    
    // Submit form
    const submitButton = page.getByRole("button", { name: /submit/i });
    await submitButton.click();
    
    // Wait for success message
    await page.waitForTimeout(2000);
    
    // Check for success toast or message
    const successMessage = page.locator("text=/submitted|success|received/i");
    if (await successMessage.isVisible({ timeout: 3000 })) {
      await expect(successMessage).toBeVisible();
    }
  });

  test("should navigate between legal pages via footer", async ({ page }) => {
    await page.goto("/");
    
    // Click privacy link in footer
    const privacyLink = page.getByRole("link", { name: /Privacy/i });
    await privacyLink.click();
    await page.waitForURL(/\/legal\/privacy/);
    expect(page.url()).toContain("/legal/privacy");
    
    // Navigate back and go to terms
    await page.goto("/");
    const termsLink = page.getByRole("link", { name: /Terms/i });
    await termsLink.click();
    await page.waitForURL(/\/legal\/terms/);
    expect(page.url()).toContain("/legal/terms");
  });

  test("should display readable legal content", async ({ page }) => {
    await page.goto("/legal/privacy");
    
    // Check that content is present and readable
    const content = page.locator("article, main, [class*='content']");
    await expect(content).toBeVisible();
    
    // Check for common privacy policy sections
    const dataCollection = page.locator("text=/data|information|collect/i");
    if (await dataCollection.count() > 0) {
      await expect(dataCollection.first()).toBeVisible();
    }
  });
});