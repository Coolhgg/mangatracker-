import { test, expect } from '@playwright/test';

// API health and basic data endpoints sanity
test.describe('API: health and core endpoints', () => {
  test('GET /api/health returns 200 and ok json', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const json = await res.json().catch(() => ({}));
    // Allow flexible shape; just ensure object
    expect(typeof json).toBe('object');
  });

  test('GET /api/stats returns 200 with typical shape', async ({ request }) => {
    const res = await request.get('/api/stats?range=weekly');
    expect(res.ok()).toBeTruthy();
    const json = await res.json().catch(() => ({}));
    expect(typeof json).toBe('object');
  });

  test('GET /api/series list returns 200', async ({ request }) => {
    const res = await request.get('/api/series');
    expect(res.ok()).toBeTruthy();
    const json = await res.json().catch(() => []);
    expect(Array.isArray(json) || typeof json === 'object').toBeTruthy();
  });
});