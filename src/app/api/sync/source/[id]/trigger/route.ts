import { NextRequest, NextResponse } from "next/server";

// Placeholder: would enqueue background job via Redis/BullMQ
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing source id" }, { status: 400 });
  // TODO: validate admin using auth + roles once available
  return NextResponse.json({ status: "enqueued", sourceId: id }, { status: 202 });
}