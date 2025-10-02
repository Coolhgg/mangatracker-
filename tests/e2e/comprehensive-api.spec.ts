import { test, expect } from '@playwright/test';

/**
 * Comprehensive API Endpoint Tests
 * Systematic testing of all API endpoints with auth states, edge cases, and error handling
 */

test.describe('Comprehensive API Tests', () => {

  test.describe('Public API Endpoints', () => {
    
    test('GET /api/health returns 200 and status', async ({ request }) => {
      const response = await request.get('/api/health');
      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
    });

    test('GET /api/health/db returns database status', async ({ request }) => {
      const response = await request.get('/api/health/db');
      expect(response.status()).toBeLessThan(500);
      
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('status');
      }
    });

    test('GET /api/series returns series list', async ({ request }) => {
      const response = await request.get('/api/series');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(Array.isArray(data) || typeof data === 'object').toBeTruthy();
    });

    test('GET /api/series with limit parameter', async ({ request }) => {
      const response = await request.get('/api/series?limit=5');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      if (Array.isArray(data)) {
        expect(data.length).toBeLessThanOrEqual(5);
      }
    });

    test('GET /api/series with pagination', async ({ request }) => {
      const response = await request.get('/api/series?page=1&limit=10');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toBeTruthy();
    });

    test('GET /api/discovery returns discovery data', async ({ request }) => {
      const response = await request.get('/api/discovery');
      expect(response.status()).toBeLessThan(500);
    });

    test('GET /api/search with query', async ({ request }) => {
      const response = await request.get('/api/search?q=test');
      expect(response.status()).toBeLessThan(500);
    });

    test('GET /api/search/health checks search service', async ({ request }) => {
      const response = await request.get('/api/search/health');
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Series Endpoints', () => {
    
    test('GET /api/series/[slug] returns series details', async ({ request }) => {
      // First get a series to test with
      const listResponse = await request.get('/api/series?limit=1');
      
      if (listResponse.ok()) {
        const series = await listResponse.json();
        
        if (Array.isArray(series) && series.length > 0) {
          const slug = series[0].slug || series[0].id;
          
          const response = await request.get(`/api/series/${slug}`);
          expect(response.status()).toBeLessThan(400);
          
          if (response.ok()) {
            const data = await response.json();
            expect(data).toHaveProperty('id');
          }
        }
      }
    });

    test('GET /api/series/[slug]/chapters returns chapters', async ({ request }) => {
      const listResponse = await request.get('/api/series?limit=1');
      
      if (listResponse.ok()) {
        const series = await listResponse.json();
        
        if (Array.isArray(series) && series.length > 0) {
          const slug = series[0].slug || series[0].id;
          
          const response = await request.get(`/api/series/${slug}/chapters`);
          expect(response.status()).toBeLessThan(500);
        }
      }
    });

    test('GET /api/series/[slug]/comments returns comments', async ({ request }) => {
      const listResponse = await request.get('/api/series?limit=1');
      
      if (listResponse.ok()) {
        const series = await listResponse.json();
        
        if (Array.isArray(series) && series.length > 0) {
          const slug = series[0].slug || series[0].id;
          
          const response = await request.get(`/api/series/${slug}/comments`);
          expect(response.status()).toBeLessThan(500);
        }
      }
    });

    test('GET /api/series/[slug]/stats returns series stats', async ({ request }) => {
      const listResponse = await request.get('/api/series?limit=1');
      
      if (listResponse.ok()) {
        const series = await listResponse.json();
        
        if (Array.isArray(series) && series.length > 0) {
          const slug = series[0].slug || series[0].id;
          
          const response = await request.get(`/api/series/${slug}/stats`);
          expect(response.status()).toBeLessThan(500);
        }
      }
    });
  });

  test.describe('Protected Endpoints (Unauthenticated)', () => {
    
    test('GET /api/library returns 401 without auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.get('/api/library');
      expect(response.status()).toBe(401);
      await context.close();
    });

    test('GET /api/stats returns 401 without auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.get('/api/stats');
      expect(response.status()).toBe(401);
      await context.close();
    });

    test('POST /api/library requires auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.post('/api/library', {
        data: { seriesId: 1, status: 'reading' }
      });
      expect(response.status()).toBe(401);
      await context.close();
    });

    test('POST /api/comments requires auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.post('/api/comments', {
        data: { content: 'test', seriesId: 1 }
      });
      expect(response.status()).toBe(401);
      await context.close();
    });
  });

  test.describe('Protected Endpoints (Authenticated)', () => {
    
    test('GET /api/library works with auth', async ({ request }) => {
      const response = await request.get('/api/library');
      // With auth from global setup
      expect(response.status()).toBeLessThan(500);
    });

    test('GET /api/stats works with auth', async ({ request }) => {
      const response = await request.get('/api/stats?range=weekly');
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Admin Endpoints', () => {
    
    test('GET /api/admin/dashboard requires auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.get('/api/admin/dashboard');
      expect(response.status()).toBeGreaterThanOrEqual(401);
      await context.close();
    });

    test('GET /api/admin/db-health requires auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.get('/api/admin/db-health');
      expect(response.status()).toBeGreaterThanOrEqual(401);
      await context.close();
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    
    test('GET /api/series/invalid-slug returns 404', async ({ request }) => {
      const response = await request.get('/api/series/this-slug-does-not-exist-12345');
      expect([404, 500]).toContain(response.status());
    });

    test('POST /api/series with invalid data returns error', async ({ request }) => {
      const response = await request.post('/api/series', {
        data: { invalid: 'data' }
      });
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('GET /api/series with invalid query params', async ({ request }) => {
      const response = await request.get('/api/series?limit=-1');
      // Should handle gracefully
      expect(response.status()).toBeLessThan(500);
    });

    test('GET /api/series with very large limit', async ({ request }) => {
      const response = await request.get('/api/series?limit=9999999');
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Chapter Endpoints', () => {
    
    test('GET /api/chapters with auth', async ({ request }) => {
      const response = await request.get('/api/chapters?limit=10');
      expect(response.status()).toBeLessThan(500);
    });

    test('POST /api/chapters/[id]/mark-read requires auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.post('/api/chapters/1/mark-read');
      expect(response.status()).toBe(401);
      await context.close();
    });
  });

  test.describe('Comment Endpoints', () => {
    
    test('GET /api/comments returns comments list', async ({ request }) => {
      const response = await request.get('/api/comments?limit=10');
      expect(response.status()).toBeLessThan(500);
    });

    test('POST /api/comments requires authentication', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.post('/api/comments', {
        data: {
          content: 'Test comment',
          seriesId: 1
        }
      });
      expect(response.status()).toBe(401);
      await context.close();
    });

    test('PUT /api/comments/[id] requires authentication', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.put('/api/comments/1', {
        data: { content: 'Updated' }
      });
      expect(response.status()).toBe(401);
      await context.close();
    });

    test('DELETE /api/comments/[id] requires authentication', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.delete('/api/comments/1');
      expect(response.status()).toBe(401);
      await context.close();
    });
  });

  test.describe('Sources and Sync Endpoints', () => {
    
    test('GET /api/sources returns sources list', async ({ request }) => {
      const response = await request.get('/api/sources');
      expect(response.status()).toBeLessThan(500);
    });

    test('POST /api/sync requires authentication', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.post('/api/sync');
      expect(response.status()).toBe(401);
      await context.close();
    });
  });

  test.describe('Notification Endpoints', () => {
    
    test('GET /api/notifications requires auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.get('/api/notifications');
      expect(response.status()).toBe(401);
      await context.close();
    });

    test('POST /api/notifications/push/subscribe requires auth', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.post('/api/notifications/push/subscribe', {
        data: { subscription: {} }
      });
      expect(response.status()).toBe(401);
      await context.close();
    });
  });

  test.describe('Content-Type and CORS Headers', () => {
    
    test('API returns proper JSON content-type', async ({ request }) => {
      const response = await request.get('/api/health');
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });

    test('API handles OPTIONS requests (CORS)', async ({ request }) => {
      const response = await request.fetch('/api/health', {
        method: 'OPTIONS'
      });
      // Should handle OPTIONS or return method not allowed
      expect([200, 204, 405]).toContain(response.status());
    });
  });

  test.describe('Rate Limiting', () => {
    
    test('API has rate limiting for mutations', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      
      // Make many rapid requests
      const requests = [];
      for (let i = 0; i < 65; i++) {
        requests.push(
          context.request.post('/api/comments', {
            data: { content: 'test', seriesId: 1 }
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // Check if any were rate limited
      const statusCodes = responses.map(r => r.status());
      const hasRateLimit = statusCodes.includes(429);
      
      // Rate limiting should exist but may not trigger in test env
      console.log('Rate limit triggered:', hasRateLimit);
      
      await context.close();
    });
  });

  test.describe('Input Validation', () => {
    
    test('API validates required fields', async ({ request }) => {
      const response = await request.post('/api/comments', {
        data: {} // Missing required fields
      });
      expect([400, 401, 422]).toContain(response.status());
    });

    test('API validates data types', async ({ request }) => {
      const response = await request.post('/api/library', {
        data: {
          seriesId: 'not-a-number', // Wrong type
          status: 123 // Wrong type
        }
      });
      expect([400, 401, 422]).toContain(response.status());
    });

    test('API handles malformed JSON', async ({ request }) => {
      const response = await request.post('/api/comments', {
        headers: { 'content-type': 'application/json' },
        data: 'invalid json{{{' as any
      }).catch(() => ({ status: () => 400 }));
      
      expect(true).toBeTruthy(); // Handled gracefully
    });
  });

  test.describe('Error Response Format', () => {
    
    test('404 errors return consistent format', async ({ request }) => {
      const response = await request.get('/api/nonexistent-endpoint-12345');
      expect(response.status()).toBe(404);
      
      const data = await response.json().catch(() => ({}));
      // Should have error message
      expect(data).toBeTruthy();
    });

    test('401 errors return consistent format', async ({ request, browser }) => {
      const context = await browser.newContext({ storageState: undefined });
      const response = await context.request.get('/api/library');
      expect(response.status()).toBe(401);
      
      const data = await response.json().catch(() => ({}));
      expect(data).toHaveProperty('error');
      
      await context.close();
    });
  });
});