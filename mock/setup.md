# Mock Layer Setup (PHASE-1)

This app is wired for a mock-only, static UI build. No real network calls are required in Phase-1. The mock layer provides fixtures and fetch-like helpers you can swap out later with a real API adapter.

Contents:
- src/lib/mock/api.ts (fixtures + helpers)
- src/app/discovery/page.tsx (example – uses mock getDiscoveryResults)
- src/app/components/page.tsx (interactive gallery using mock data)

## Why a mock layer?
- Deterministic UI: stable, fast demos without backend flakiness
- Visual regression: consistent snapshots across runs
- DX: quick iteration on components/UX without backend blockers

## How it works
The mock module exports in-memory data and helpers:

```ts
// src/lib/mock/api.ts
export type DiscoveryFilters = { /* ... */ };
export type Chapter = { id: string; number: number; title: string; url?: string };
export type Series = { id: string; slug: string; title: string; /* ... */ };

export async function getDiscoveryResults({ filters, page, limit }) { /* ... */ }
export async function getSeriesBySlug(slug: string) { /* ... */ }
```

In pages, import and call the helpers directly (no fetch):

```ts
// Example: src/app/discovery/page.tsx
import { DiscoverySection } from "@/components/discovery/discovery-section";
import { getDiscoveryResults } from "@/lib/mock/api";

export default async function DiscoveryPage() {
  const { items, page, limit, hasNextPage } = await getDiscoveryResults({
    filters: {},
    page: 1,
    limit: 20,
  });

  return (
    <DiscoverySection
      initialItems={items}
      initialPage={page}
      pageSize={limit}
      initialHasMore={hasNextPage}
    />
  );
}
```

## Swapping to a real API later
Create a real adapter that matches the mock function signatures. Then switch imports via a single alias.

1) Implement a real adapter:
```ts
// src/lib/api/index.ts
export async function getDiscoveryResults({ filters, page = 1, limit = 20 }) {
  const res = await fetch(`/api/discovery?page=${page}&limit=${limit}`);
  const data = await res.json();
  return {
    items: data.items,
    page: data.page,
    limit: data.limit,
    hasNextPage: data.hasNextPage,
  };
}

export async function getSeriesBySlug(slug: string) {
  const res = await fetch(`/api/series/${slug}`);
  return res.ok ? await res.json() : null;
}
```

2) Centralize an alias:
- Option A: change import paths where used from `@/lib/mock/api` → `@/lib/api`
- Option B: use a tsconfig path alias `@/lib/data` that points to either file (mock or real) depending on build target

Example tsconfig paths toggle:
```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/lib/data": [
        // For mock-only builds
        "src/lib/mock/api"
      ]
    }
  }
}
```

Then replace imports to:
```ts
import { getDiscoveryResults, getSeriesBySlug } from "@/lib/data";
```

In a real backend build, switch the alias to `src/lib/api`.

## Component development and demos
- Visit /components to see a live gallery of all core components with multiple states (default, hover, active)
- The gallery uses mock series covers and sample comments to emulate Discord-like threads/reactions/mentions UX

## Accessibility & visual regression
- Use axe-core in your browser devtools or Playwright to verify pages have no critical violations
- For visual regression, wire Chromatic or jest-image-snapshot to crawl `/components` and key routes. The deterministic mock data ensures stable snapshots

## Guidelines
- Do not import server-only modules (DB, secrets) in client components
- Keep mock data small, typed, and deterministic
- All images should be public/optimized URLs
- Avoid fetch in Phase-1 pages; call mock helpers instead

## Checklist when replacing mock with real API
- [ ] Replace `@/lib/mock/api` imports with `@/lib/api` or `@/lib/data` alias
- [ ] Ensure API endpoints match the expected data shapes
- [ ] Add error/loading states where necessary
- [ ] Remove or disable mock-only UI toggles flags if any
- [ ] Re-run accessibility and visual regression tests