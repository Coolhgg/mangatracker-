import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isAdmin(req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const authEmail = req.headers.get("x-user-email")?.toLowerCase();
  // If ADMIN_EMAIL is not set, allow in dev
  if (!adminEmail) return true;
  return !!authEmail && authEmail === adminEmail;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}

// POST passthrough: optionally allow verifying via POST as well
export const POST = GET;