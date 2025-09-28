import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { rateLimitFromRequest } from "@/lib/rate-limit";
import { db } from "@/db";
import { threads } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const ParamsSchema = z.object({ id: z.coerce.number().int().positive() });
const BodySchema = z.object({ pinned: z.boolean() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // basic rate limit per ip
  const rl = rateLimitFromRequest(req, { windowMs: 10_000, max: 30 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const idParsed = ParamsSchema.safeParse({ id: params.id });
  if (!idParsed.success) {
    return NextResponse.json({ error: idParsed.error.flatten() }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const bodyParsed = BodySchema.safeParse(body);
  if (!bodyParsed.success) {
    return NextResponse.json({ error: bodyParsed.error.flatten() }, { status: 400 });
  }

  const tRows = await db
    .select({ id: threads.id, createdBy: threads.createdBy, seriesId: threads.seriesId })
    .from(threads)
    .where(eq(threads.id, idParsed.data.id))
    .limit(1);
  const thread = tRows[0];
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  // Authorization: creator can pin their own thread; or roles moderator/admin (if present on session)
  const sessionUserIdNum = Number(session.user.id);
  const role = (session.user as any).role as string | undefined;
  const isOwner = !Number.isNaN(sessionUserIdNum) && thread.createdBy === sessionUserIdNum;
  const isMod = role === "moderator" || role === "admin";
  if (!isOwner && !isMod) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedAt = new Date().toISOString();
  const updated = await db
    .update(threads)
    .set({ pinned: bodyParsed.data.pinned, updatedAt })
    .where(eq(threads.id, thread.id))
    .returning({ id: threads.id, seriesId: threads.seriesId, pinned: threads.pinned });

  return NextResponse.json(updated[0]);
}