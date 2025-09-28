import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const hdrs = new Headers(request.headers);
    // If no Authorization header, try to promote bearer_token cookie to Authorization
    const hasAuth = hdrs.has("authorization");
    if (!hasAuth) {
      const token = (await cookies()).get("bearer_token")?.value;
      if (token) {
        hdrs.set("Authorization", `Bearer ${token}`);
      }
    }

    const session = await auth.api.getSession({ headers: hdrs });
    // Standardize response shape
    return NextResponse.json(session ?? null);
  } catch (err) {
    console.error("GET /api/auth/session error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}