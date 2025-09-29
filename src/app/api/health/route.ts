import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ app: "ok", time: new Date().toISOString() });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}