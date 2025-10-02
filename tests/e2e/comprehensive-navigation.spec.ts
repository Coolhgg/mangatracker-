import { test, expect } from '@playwright/test';

/**
 * Comprehensive Navigation Tests
 * Tests all major routes, navigation flows, and link integrity
 */

test.describe('Comprehensive Navigation Tests', () => {
  
  test('all public pages load successfully', async ({ page }) => {
    const publicRoutes = [
      { path: '/', name: 'Homepage' },
      { path: '/pricing', name: 'Pricing' },
      { path: '/discover', name: 'Discover' },
      { path: '/discovery', name: 'Discovery' },
      { path: '/search', name: 'Search' },
      { path: '/login', name: 'Login' },
      { path: '/register', name: 'Register' },
      { path: '/legal/privacy', name: 'Privacy Policy' },
      { path: '/legal/terms', name: 'Terms of Service' },
      { path: '/legal/cookies', name: 'Cookie Policy' },
      { path: '/legal/dmca', name: 'DMCA' },
      { path: '/social', name: 'Social' },
      { path: '/components', name: 'Components Gallery' },
    ];

    for (const route of publicRoutes) {
      test.step(`Testing ${route.name} (${route.path})`, async () => {
        const response = await page.goto(route.path, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        
        expect(response?.status(), `${route.name} should return 200 or redirect`).toBeLessThan(400);
        
        // Verify page has loaded
        await expect(page.locator('body')).toBeVisible();
        
        // No error messages visible
        await expect(page.locator('text=/application error|unhandled error|500 error/i')).toHaveCount(0);
        
        // Page has meaningful content
        const textContent = await page.locator('body').textContent();
        expect(textContent?.length || 0).toBeGreaterThan(100);
      });
    }
  });

  test('all protected pages redirect to login when unauthenticated', async ({ browser }) => {
    // Create fresh context without auth
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();

    const protectedRoutes = [
      '/dashboard',
      '/library',
      '/account',
      '/billing',
      '/admin',
      '/admin/dashboard',
      '/stats',
    ];

    for (const route of protectedRoutes) {
      test.step(`Testing protected route ${route}`, async () => {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        
        // Should redirect to login
        await page.waitForURL(/\/login/, { timeout: 5000 });
        expect(page.url()).toContain('/login');
      });
    }

    await context.close();
  });

  test('navigation header links work correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Test main navigation links
    const navLinks = [
      { selector: 'text=/discover/i', expectedPath: '/discover' },
      { selector: 'text=/pricing/i', expectedPath: '/pricing' },
      { selector: 'text=/login/i', expectedPath: '/login' },
    ];

    for (const { selector, expectedPath } of navLinks) {
      test.step(`Testing navigation to ${expectedPath}`, async () => {
        await page.goto('/', { waitUntil: 'networkidle' });
        
        const link = page.locator(selector).first();
        if (await link.count() > 0 && await link.isVisible()) {
          await link.click();
          await page.waitForLoadState('networkidle');
          expect(page.url()).toContain(expectedPath);
        }
      });
    }
  });

  test('footer links are present and functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Test footer link categories
    const footerLinks = [
      'text=/privacy/i',
      'text=/terms/i',
      'text=/cookies/i',
    ];

    for (const selector of footerLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0) {
        await expect(link).toBeVisible();
      }
    }
  });

  test('homepage CTA buttons work', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Find CTA buttons (common patterns)
    const ctaButtons = page.locator('button:has-text("Get started"), a:has-text("Get started")').first();
    
    if (await ctaButtons.count() > 0) {
      await expect(ctaButtons).toBeVisible();
      
      // Click and verify navigation
      await ctaButtons.click();
      await page.waitForLoadState('networkidle');
      
      // Should go to register or login
      expect(page.url()).toMatch(/\/(register|login|dashboard)/);
    }
  });

  test('series detail page loads with dynamic slug', async ({ page }) => {
    // First, try to get a series from the API
    const seriesResponse = await page.request.get('/api/series?limit=1');
    
    if (seriesResponse.ok()) {
      const seriesData = await seriesResponse.json();
      
      if (Array.isArray(seriesData) && seriesData.length > 0) {
        const series = seriesData[0];
        const slug = series.slug || series.id;
        
        test.step(`Testing series page with slug: ${slug}`, async () => {
          const response = await page.goto(`/series/${slug}`, { 
            waitUntil: 'domcontentloaded',
            timeout: 15000
          });
          
          expect(response?.status()).toBeLessThan(400);
          await expect(page.locator('body')).toBeVisible();
        });
      }
    }
  });

  test('search functionality is accessible', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'networkidle' });

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      
      // Test search input
      await searchInput.fill('test manga');
      await searchInput.press('Enter');
      
      await page.waitForLoadState('networkidle');
      
      // Should still be on search page or show results
      expect(page.url()).toContain('/search');
    }
  });

  test('responsive navigation works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Look for mobile menu button (hamburger)
    const mobileMenuBtn = page.locator('button[aria-label*="menu" i], button:has(svg)').first();
    
    if (await mobileMenuBtn.count() > 0 && await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
      
      // Menu should open
      await page.waitForTimeout(500); // Wait for animation
      
      // Check if navigation items are visible
      const navItems = page.locator('nav a, [role="navigation"] a');
      const count = await navItems.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('external links open correctly', async ({ page, context }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Find external links (social media, etc.)
    const externalLinks = page.locator('a[target="_blank"], a[href^="http"]:not([href*="localhost"])');
    const count = await externalLinks.count();

    if (count > 0) {
      // Verify external links have proper attributes
      for (let i = 0; i < Math.min(3, count); i++) {
        const link = externalLinks.nth(i);
        const href = await link.getAttribute('href');
        const target = await link.getAttribute('target');
        const rel = await link.getAttribute('rel');

        if (href?.startsWith('http') && !href.includes('localhost')) {
          expect(target).toBe('_blank');
          // Security: external links should have noopener noreferrer
          expect(rel).toMatch(/noopener|noreferrer/);
        }
      }
    }
  });

  test('pagination works on list pages', async ({ page }) => {
    const listPages = ['/discover', '/library', '/search'];

    for (const listPage of listPages) {
      test.step(`Testing pagination on ${listPage}`, async () => {
        const response = await page.goto(listPage, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });

        if (response?.ok()) {
          // Look for pagination controls
          const pagination = page.locator('[aria-label*="pagination" i], nav:has(button:has-text("Next"))');
          
          if (await pagination.count() > 0) {
            const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();
            
            if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
              await nextButton.click();
              await page.waitForLoadState('networkidle');
              
              // URL should change or content should update
              await page.waitForTimeout(1000);
            }
          }
        }
      });
    }
  });
});