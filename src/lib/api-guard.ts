import { NextRequest, NextResponse } from "next/server";
import { rateLimitRequest } from "@/lib/rate-limit";

export type Handler = (req: NextRequest) => Promise<NextResponse> | NextResponse;

export function withRateLimit(handler: Handler, opts: { key: string; limit?: number; windowMs?: number }) {
  return async (req: NextRequest) => {
    const limited = await rateLimitRequest(req as unknown as Request, opts);
    if (!limited.ok) return limited.response;
    return handler(req);
  };
}