// Simple in-memory IP rate limiter. Suitable for single-node/dev. Replace with Redis in prod.
export type RateLimitOptions = {
  windowMs: number; // time window in ms
  max: number; // max requests per window
};

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, opts: RateLimitOptions) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.max - 1, resetAt: now + opts.windowMs };
  }
  if (bucket.count >= opts.max) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { ok: true, remaining: opts.max - bucket.count, resetAt: bucket.resetAt };
}

export function rateLimitFromRequest(req: Request, opts: RateLimitOptions) {
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
  return rateLimit(`ip:${ip}`, opts);
}

// Overload used by API route helpers expecting NextRequest signature
// Accepts NextRequest/Request and returns shape with optional Response to short-circuit
export async function rateLimitRequest(
  req: Request,
  opts: { key: string; limit?: number; windowMs?: number }
): Promise<{ ok: true } | { ok: false; response: Response }> {
  const { key, limit = 60, windowMs = 60_000 } = opts;
  // Combine ip + key to make route-specific bucket per IP
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").split(",")[0].trim();
  const bucketKey = `ip:${ip}:${key}`;
  const res = rateLimit(bucketKey, { max: limit, windowMs });
  if (!res.ok) {
    const retryAfter = Math.max(0, Math.ceil((res.resetAt - Date.now()) / 1000));
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }),
    };
  }
  return { ok: true };
}