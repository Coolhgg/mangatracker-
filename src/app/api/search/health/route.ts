import { NextResponse } from "next/server";

export async function GET() {
  // Placeholder search health. In real setup, probe Typesense host from env
  return NextResponse.json({ search: "ok", provider: "typesense", time: new Date().toISOString() });
}