import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments as commentsTable } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

// POST /api/admin/maintenance/dedupe-comments
// One-off cleanup: remove duplicate comments (same userId, seriesId, content), keep the earliest createdAt
export async function POST(_req: NextRequest) {
  try {
    // 1) Find potential duplicate keys
    // We do this in two passes to stay SQLite-compatible without window functions
    // a) Pull all comments with essential fields
    const rows = await db
      .select({
        id: commentsTable.id,
        userId: commentsTable.userId,
        seriesId: commentsTable.seriesId,
        content: commentsTable.content,
        createdAt: commentsTable.createdAt,
      })
      .from(commentsTable)
      .orderBy(asc(commentsTable.userId), asc(commentsTable.seriesId), asc(commentsTable.content), asc(commentsTable.createdAt));

    // b) Group in-memory and determine which IDs to delete (keep first by createdAt)
    const key = (r: typeof rows[number]) => `${r.userId}|${r.seriesId}|${r.content}`;
    const seen = new Map<string, number>(); // key -> first id
    const toDelete: number[] = [];

    for (const r of rows) {
      const k = key(r);
      if (!seen.has(k)) {
        seen.set(k, r.id);
      } else {
        toDelete.push(r.id);
      }
    }

    // c) Delete duplicates
    let deleted = 0;
    if (toDelete.length) {
      // Delete in small batches to avoid SQL length issues
      const batchSize = 200;
      for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = toDelete.slice(i, i + batchSize);
        // Drizzle doesn't have inArray for primary key delete here; iterate
        for (const id of batch) {
          await db.delete(commentsTable).where(eq(commentsTable.id, id));
          deleted++;
        }
      }
    }

    return NextResponse.json({ ok: true, deleted }, { status: 200 });
  } catch (err) {
    console.error("/api/admin/maintenance/dedupe-comments error", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}