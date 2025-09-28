import { NextResponse } from "next/server";

export async function GET() {
  // In real impl, query worker health and queue sizes
  return NextResponse.json({ worker: "ok", queues: { sync: { waiting: 0, active: 0 } } });
}