import { test, expect } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Log in');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1, h2')).toContainText(/log in|sign in/i);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Register');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1, h2')).toContainText(/register|sign up|create account/i);
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.click('button[type="submit"]');
    // Check for HTML5 validation or custom error messages
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should register new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';

    await page.goto(`${BASE_URL}/register`);
    
    // Fill in registration form
    await page.fill('input[name="name"]', `Test User ${timestamp}`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="password"]:not([name="confirmPassword"])', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message or redirect
    await page.waitForTimeout(2000);
    
    // Should either redirect to login or show success message
    const currentUrl = page.url();
    const hasSuccessMessage = await page.locator('text=/success|registered|created/i').count() > 0;
    
    expect(currentUrl.includes('/login') || hasSuccessMessage).toBeTruthy();
  });

  test('should login with valid credentials', async ({ page }) => {
    // This test assumes you have seeded test data
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    // Wait for redirect or dashboard
    await page.waitForTimeout(2000);
    
    // Should redirect away from login page
    expect(page.url()).not.toContain('/login');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(1000);
    
    // Should show error message
    const errorMessage = page.locator('text=/invalid|error|incorrect/i');
    await expect(errorMessage).toBeVisible();
  });
});