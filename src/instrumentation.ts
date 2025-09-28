// Runs once when the Next.js server process starts
// Next.js will call this register() during server startup
// Ref: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export function register() {
  // Dev-only auto seeding. Never run in production.
  if (process.env.NODE_ENV !== "development") return;

  // Ensure it runs only once per server process (even across HMR reloads)
  // Using a global flag stored on globalThis
  const flagKey = "__KENMEI_DEV_AUTO_SEEDED__" as const;
  if ((globalThis as any)[flagKey]) return;
  (globalThis as any)[flagKey] = true;

  // Compute base URL. Prefer NEXT_PUBLIC_SITE_URL when available; fallback to localhost
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${baseUrl.replace(/\/$/, "")}/api/dev/seed`;

  // Retry with backoff in case the server is not fully ready when register() runs
  const maxAttempts = 10;
  const startDelayMs = 500;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const trySeed = async () => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          // Seeded successfully (idempotent)
          return;
        }
      } catch (_) {
        // ignore network errors and retry
      }

      const delay = startDelayMs * attempt; // linear backoff
      await sleep(delay);
    }
  };

  // Fire and forget
  void trySeed();
}