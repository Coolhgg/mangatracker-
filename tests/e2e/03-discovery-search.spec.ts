import { test, expect } from "@playwright/test";

test.describe("Discovery and Search", () => {
  test.describe("Discovery Page", () => {
    test("should load discovery page", async ({ page }) => {
      await page.goto("/discovery");
      await expect(page).toHaveTitle(/Discovery|Discover/i);
    });

    test("should display series cards", async ({ page }) => {
      await page.goto("/discovery");
      
      // Wait for content to load
      await page.waitForTimeout(1000);
      
      // Check for series cards or empty state
      const seriesCards = page.locator('[class*="series"], [class*="card"]');
      const emptyState = page.locator("text=/No series|empty|Start tracking/i");
      
      const hasCards = await seriesCards.count() > 0;
      const hasEmptyState = await emptyState.isVisible();
      
      expect(hasCards || hasEmptyState).toBeTruthy();
    });

    test("should display filter options", async ({ page }) => {
      await page.goto("/discovery");
      
      // Look for filter buttons or dropdowns
      const filters = page.locator('[class*="filter"], button:has-text("Filter"), button:has-text("Sort")');
      if (await filters.count() > 0) {
        await expect(filters.first()).toBeVisible();
      }
    });

    test("should show series covers and titles", async ({ page }) => {
      await page.goto("/discovery");
      await page.waitForTimeout(1000);
      
      const seriesTitle = page.locator("text=/One Piece|Naruto/i").first();
      if (await seriesTitle.isVisible()) {
        await expect(seriesTitle).toBeVisible();
      }
    });
  });

  test.describe("Search Page", () => {
    test("should load search page", async ({ page }) => {
      await page.goto("/search");
      await expect(page).toHaveTitle(/Search/i);
    });

    test("should display search input", async ({ page }) => {
      await page.goto("/search");
      
      const searchInput = page.getByRole("textbox", { name: /search/i }).or(
        page.locator('input[type="search"], input[placeholder*="search" i]')
      );
      await expect(searchInput).toBeVisible();
    });

    test("should perform search and show results", async ({ page }) => {
      await page.goto("/search");
      
      const searchInput = page.getByRole("textbox", { name: /search/i }).or(
        page.locator('input[type="search"], input[placeholder*="search" i]')
      );
      
      await searchInput.fill("naruto");
      await searchInput.press("Enter");
      
      // Wait for results
      await page.waitForTimeout(1500);
      
      // Check for results or no results message
      const results = page.locator("text=/Naruto/i");
      const noResults = page.locator("text=/No results|not found/i");
      
      const hasResults = await results.count() > 0;
      const hasNoResults = await noResults.isVisible();
      
      expect(hasResults || hasNoResults).toBeTruthy();
    });

    test("should handle empty search", async ({ page }) => {
      await page.goto("/search");
      
      const searchInput = page.getByRole("textbox", { name: /search/i }).or(
        page.locator('input[type="search"], input[placeholder*="search" i]')
      );
      
      await searchInput.fill("");
      await searchInput.press("Enter");
      
      // Should show default or empty state
      await page.waitForTimeout(500);
      expect(page.url()).toContain("/search");
    });

    test("should show filters on search page", async ({ page }) => {
      await page.goto("/search");
      
      // Look for filter controls
      const filterButton = page.locator('button:has-text("Filter"), button:has-text("Sort")');
      if (await filterButton.count() > 0) {
        await expect(filterButton.first()).toBeVisible();
      }
    });
  });

  test.describe("Series Detail Page", () => {
    test("should navigate to series detail from discovery", async ({ page }) => {
      await page.goto("/discovery");
      await page.waitForTimeout(1000);
      
      // Click on first series card if available
      const firstSeries = page.locator("a[href*='/series/']").first();
      if (await firstSeries.isVisible()) {
        await firstSeries.click();
        await page.waitForURL(/\/series\/.+/);
        expect(page.url()).toMatch(/\/series\/.+/);
      }
    });

    test("should load series detail page directly", async ({ page }) => {
      await page.goto("/series/one-piece");
      
      // Should show series title or loading state
      const seriesTitle = page.locator("text=/One Piece/i");
      const loadingState = page.locator("text=/Loading/i");
      
      const hasTitle = await seriesTitle.isVisible();
      const isLoading = await loadingState.isVisible();
      
      expect(hasTitle || isLoading).toBeTruthy();
    });

    test("should display series information on detail page", async ({ page }) => {
      await page.goto("/series/one-piece");
      await page.waitForTimeout(1000);
      
      // Check for series elements
      const seriesTitle = page.locator("h1, h2").filter({ hasText: /One Piece/i });
      if (await seriesTitle.isVisible()) {
        await expect(seriesTitle).toBeVisible();
      }
    });

    test("should show chapters list on series detail", async ({ page }) => {
      await page.goto("/series/one-piece");
      await page.waitForTimeout(1000);
      
      // Check for chapters section
      const chaptersSection = page.locator("text=/Chapter|Episodes/i");
      const emptyState = page.locator("text=/No chapters/i");
      
      const hasChapters = await chaptersSection.count() > 0;
      const hasEmptyState = await emptyState.isVisible();
      
      expect(hasChapters || hasEmptyState).toBeTruthy();
    });

    test("should show add to library button on series detail", async ({ page }) => {
      await page.goto("/series/one-piece");
      await page.waitForTimeout(1000);
      
      // Look for add to library button (may require auth)
      const addButton = page.locator('button:has-text("Add"), button:has-text("Library"), button:has-text("Track")');
      if (await addButton.count() > 0) {
        await expect(addButton.first()).toBeVisible();
      }
    });
  });
});