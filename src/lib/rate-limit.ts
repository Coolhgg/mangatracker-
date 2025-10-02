import { NextResponse } from "next/server";

// In-memory rate limiting (edge-safe)
const buckets = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  ok: boolean;
  response: NextResponse;
}

interface RateLimitFromRequestOptions {
  windowMs: number;
  max: number;
}

interface RateLimitFromRequestResult {
  ok: boolean;
}

/**
 * Rate limit a request by key (e.g., IP + route) - Async version
 * Returns { ok: true, response } if allowed, or { ok: false, response } with 429 if denied
 */
export async function rateLimitRequest(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { key, limit, windowMs } = options;
  
  // Get IP address
  const ip = (request as any).ip || 
    (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()) || 
    "unknown";
  
  const bucketKey = `${ip}:${key}`;
  const now = Date.now();
  
  const bucket = buckets.get(bucketKey);
  
  if (!bucket || now > bucket.resetAt) {
    // Create new bucket
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { ok: true, response: NextResponse.next() };
  }
  
  bucket.count += 1;
  
  if (bucket.count > limit) {
    return {
      ok: false,
      response: new NextResponse(
        JSON.stringify({ error: "Too many requests" }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      ),
    };
  }
  
  return { ok: true, response: NextResponse.next() };
}

/**
 * Rate limit a request by IP - Synchronous version
 * Returns { ok: true } if allowed, or { ok: false } if denied
 */
export function rateLimitFromRequest(
  request: Request,
  options: RateLimitFromRequestOptions
): RateLimitFromRequestResult {
  const { windowMs, max } = options;
  
  // Get IP address
  const ip = (request as any).ip || 
    (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()) || 
    "unknown";
  
  const bucketKey = `${ip}:default`;
  const now = Date.now();
  
  const bucket = buckets.get(bucketKey);
  
  if (!bucket || now > bucket.resetAt) {
    // Create new bucket
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  
  bucket.count += 1;
  
  if (bucket.count > max) {
    return { ok: false };
  }
  
  return { ok: true };
}

// Cleanup old buckets periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (now > bucket.resetAt + 60_000) {
        buckets.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}