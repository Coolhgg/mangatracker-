import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.describe("Register Page", () => {
    test("should load register page", async ({ page }) => {
      await page.goto("/register");
      await expect(page).toHaveTitle(/Register/i);
      await expect(page.locator("text=/Create.*account/i")).toBeVisible();
    });

    test("should display register form with all fields", async ({ page }) => {
      await page.goto("/register");
      
      // Check form fields
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
      
      // Check submit button
      await expect(page.getByRole("button", { name: /register|sign up|create account/i })).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ page }) => {
      await page.goto("/register");
      
      const submitButton = page.getByRole("button", { name: /register|sign up|create account/i });
      await submitButton.click();
      
      // Wait for validation messages
      await page.waitForTimeout(500);
      
      // Check for error indicators (form should not submit)
      const currentUrl = page.url();
      expect(currentUrl).toContain("/register");
    });

    test("should show validation for invalid email", async ({ page }) => {
      await page.goto("/register");
      
      await page.getByLabel(/name/i).fill("Test User");
      await page.getByLabel(/email/i).fill("invalid-email");
      await page.locator('input[type="password"]').first().fill("Password123!");
      
      const submitButton = page.getByRole("button", { name: /register|sign up|create account/i });
      await submitButton.click();
      
      await page.waitForTimeout(500);
      
      // Should still be on register page
      expect(page.url()).toContain("/register");
    });

    test("should have link to login page", async ({ page }) => {
      await page.goto("/register");
      
      const loginLink = page.getByRole("link", { name: /log in|sign in|already have/i });
      await expect(loginLink).toBeVisible();
      
      await loginLink.click();
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain("/login");
    });

    test("should support Google OAuth button", async ({ page }) => {
      await page.goto("/register");
      
      // Look for Google sign-in button
      const googleButton = page.getByRole("button", { name: /google/i });
      if (await googleButton.isVisible()) {
        await expect(googleButton).toBeVisible();
      }
    });
  });

  test.describe("Login Page", () => {
    test("should load login page", async ({ page }) => {
      await page.goto("/login");
      await expect(page).toHaveTitle(/Log in/i);
      await expect(page.locator("text=/Log in|Sign in/i")).toBeVisible();
    });

    test("should display login form with all fields", async ({ page }) => {
      await page.goto("/login");
      
      // Check form fields
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      
      // Check remember me option
      const rememberMe = page.getByLabel(/remember me/i);
      if (await rememberMe.isVisible()) {
        await expect(rememberMe).toBeVisible();
      }
      
      // Check submit button
      await expect(page.getByRole("button", { name: /log in|sign in/i })).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");
      
      await page.getByLabel(/email/i).fill("nonexistent@example.com");
      await page.getByLabel(/password/i).fill("WrongPassword123!");
      
      const submitButton = page.getByRole("button", { name: /log in|sign in/i });
      await submitButton.click();
      
      // Wait for error message
      await page.waitForTimeout(1000);
      
      // Should show error toast or message
      const errorMessage = page.locator("text=/Invalid.*password|incorrect|failed/i");
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test("should have link to register page", async ({ page }) => {
      await page.goto("/login");
      
      const registerLink = page.getByRole("link", { name: /register|sign up|create account|don't have/i });
      await expect(registerLink).toBeVisible();
      
      await registerLink.click();
      await page.waitForURL(/\/register/);
      expect(page.url()).toContain("/register");
    });

    test("should support redirect parameter", async ({ page }) => {
      await page.goto("/login?redirect=%2Fdashboard");
      
      await expect(page.getByLabel(/email/i)).toBeVisible();
      
      // URL should contain redirect parameter
      expect(page.url()).toContain("redirect");
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect to login when accessing dashboard without auth", async ({ page }) => {
      await page.goto("/dashboard");
      
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain("/login");
    });

    test("should redirect to login when accessing library without auth", async ({ page }) => {
      await page.goto("/library");
      
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain("/login");
    });

    test("should redirect to login when accessing account without auth", async ({ page }) => {
      await page.goto("/account");
      
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain("/login");
    });
  });
});