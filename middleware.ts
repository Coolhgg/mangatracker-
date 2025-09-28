import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// In-memory minimal limiter buckets (Edge/node safe per-instance)
const ipBuckets = new Map<string, { count: number; resetAt: number }>();
const userBuckets = new Map<string, { count: number; resetAt: number }>();

// Configurable via env with sensible defaults
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000); // default 1 min
const MAX_REQS_IP = Number(process.env.RATE_LIMIT_MAX_REQS ?? 60); // per IP per window
const MAX_REQS_USER = Number(process.env.RATE_LIMIT_USER_MAX_REQS ?? MAX_REQS_IP); // per user per window

// Methods and API prefixes to include/exclude
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const EXCLUDED_API_PREFIXES = [
  "/api/auth", // auth flows manage their own limits
  "/api/health",
  "/api/docs",
  "/api/autumn",
  "/api/webhooks", // e.g. Stripe
  "/api/worker/status", // read-only or internal
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Global API mutation rate limiter (IP + optional per-user)
  if (pathname.startsWith("/api/") && MUTATION_METHODS.has(request.method)) {
    // Skip excluded API groups
    if (!EXCLUDED_API_PREFIXES.some((p) => pathname.startsWith(p))) {
      const ip =
        request.ip ||
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown";
      const now = Date.now();

      // Try get user session WITHOUT redirecting; fall back to bearer cookie
      let session = await auth.api.getSession({ headers: request.headers });
      if (!session) {
        const token = request.cookies.get("bearer_token")?.value;
        if (token) {
          const headers = new Headers(request.headers);
          headers.set("Authorization", `Bearer ${token}`);
          session = await auth.api.getSession({ headers });
        }
      }

      // Per-IP bucket
      const ipBucket = ipBuckets.get(ip);
      if (!ipBucket || now > ipBucket.resetAt) {
        ipBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      } else {
        ipBucket.count += 1;
        if (ipBucket.count > MAX_REQS_IP) {
          return new NextResponse(JSON.stringify({ error: "Too many requests (IP)" }), {
            status: 429,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Per-user bucket (if logged in)
      const userId = session?.user?.id as string | undefined;
      if (userId) {
        const uBucket = userBuckets.get(userId);
        if (!uBucket || now > uBucket.resetAt) {
          userBuckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
        } else {
          uBucket.count += 1;
          if (uBucket.count > MAX_REQS_USER) {
            return new NextResponse(JSON.stringify({ error: "Too many requests (user)" }), {
              status: 429,
              headers: { "Content-Type": "application/json" },
            });
          }
        }
      }
    }

    // Let API routes handle their own auth/logic
    return NextResponse.next();
  }

  // Do not enforce app auth on API routes (let routes handle their own auth)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Auth gate for app pages (keep existing behavior)
  let session = await auth.api.getSession({ headers: request.headers });

  // Fallback: if no session, try using bearer token mirrored in cookies
  if (!session) {
    const token = request.cookies.get("bearer_token")?.value;
    if (token) {
      const headers = new Headers(request.headers);
      headers.set("Authorization", `Bearer ${token}`);
      session = await auth.api.getSession({ headers });
    }
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard",
    "/library",
    "/series",
    "/chapter",
    "/account",
    "/settings",
    "/admin",
    "/billing",
    // Apply limiter to ALL API endpoints (internally excludes some)
    "/api/:path*",
  ],
};