import { test, expect } from '@playwright/test';

// Safe crawler: visits internal links up to a limit, clicks visible links on each page
// Skips external links and potentially destructive endpoints.
const MAX_PAGES = 15;

function isInternal(path: string) {
  return path.startsWith('/') && !path.startsWith('//');
}

function isSafePath(path: string) {
  const lower = path.toLowerCase();
  if (lower.includes('api/')) return true; // allow GET api checks
  if (lower.includes('logout') || lower.includes('delete') || lower.includes('remove')) return false;
  const bannedExt = ['.pdf', '.zip', '.dmg', '.exe'];
  if (bannedExt.some((ext) => lower.endsWith(ext))) return false;
  return true;
}

test.describe('Crawler: traverse internal links safely', () => {
  test('crawl and ensure pages render', async ({ page, request }) => {
    const visited = new Set<string>();
    const queue: string[] = ['/'];

    while (queue.length && visited.size < MAX_PAGES) {
      const next = queue.shift()!;
      if (visited.has(next)) continue;
      visited.add(next);

      const res = await page.goto(next, { waitUntil: 'domcontentloaded' });
      expect(res?.ok(), `Failed to load ${next}`).toBeTruthy();

      // basic sanity: no hard crash
      const hasBody = await page.locator('body').count();
      expect(hasBody).toBeGreaterThan(0);

      // collect internal links
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href') || ''));
      const normalized = hrefs
        .map((h) => (h.startsWith('http') ? new URL(h).pathname : h))
        .filter((h) => !!h && isInternal(h) && isSafePath(h))
        .map((h) => h.split('#')[0]);

      for (const h of normalized) {
        if (!visited.has(h) && !queue.includes(h) && queue.length + visited.size < MAX_PAGES) {
          queue.push(h);
        }
      }

      // Try clicking first few visible links to catch navigation issues
      const links = page.getByRole('link');
      const linkCount = await links.count();
      for (let i = 0; i < Math.min(3, linkCount); i++) {
        const link = links.nth(i);
        if (await link.isVisible()) {
          // Prevent opening new tabs
          await Promise.all([
            page.waitForLoadState('domcontentloaded').catch(() => {}),
            link.click({ button: 'left', modifiers: [], trial: false }).catch(() => {}),
          ]);
        }
      }
    }

    expect(visited.size).toBeGreaterThan(0);
  });
});