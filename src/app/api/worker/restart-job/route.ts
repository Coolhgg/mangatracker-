import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const { jobId } = body || {};
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
  // Placeholder: would signal worker to retry
  return NextResponse.json({ status: "scheduled", jobId }, { status: 202 });
}