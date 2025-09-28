import { NextRequest, NextResponse } from "next/server";

// Proxy endpoint: forwards DMCA submissions to existing /api/reports/dmca
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json", code: "INVALID_CONTENT_TYPE" }, { status: 415 });
    }

    const body = await req.json();

    // Forward to internal reports route
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/reports/dmca`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward UA for audit context
        "User-Agent": req.headers.get("user-agent") || "",
        "x-forwarded-for": req.headers.get("x-forwarded-for") || "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("POST /api/dmca proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}