import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  series,
  mangaChapters,
  library,
  threads,
  comments,
  adminReports,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

// POST /api/dev/seed
// Idempotent development seeding for Drizzle (SQLite/Turso/Postgres)
export async function POST(_req: NextRequest) {
  try {
    // Dev-only guard (override with ALLOW_DEV_SEED=true if absolutely necessary)
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_SEED !== "true") {
      return NextResponse.json({ ok: false, error: "Forbidden in production" }, { status: 403 });
    }

    const now = new Date().toISOString();

    // 1) Demo user
    const demoEmail = "demo@kenmei.local";
    const demoUserName = "Demo User";

    await db
      .insert(users)
      .values({
        email: demoEmail,
        name: demoUserName,
        avatarUrl: null,
        roles: [],
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: users.email });

    // Ensure name stays updated idempotently (works across drivers)
    await db
      .update(users)
      .set({ name: demoUserName, updatedAt: now })
      .where(eq(users.email, demoEmail));

    const [demoUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, demoEmail))
      .limit(1);

    // 2) Series (only requested two)
    const demoSeries = [
      {
        slug: "one-piece",
        title: "One Piece",
        description:
          "Follow Luffy and the Straw Hat Pirates on a grand adventure for the One Piece.",
        coverImageUrl: "/covers/one-piece.jpg",
        sourceName: "Viz Media",
        sourceUrl: "https://www.viz.com/one-piece",
        tags: ["Adventure", "Shounen", "Pirates", "Comedy"],
        rating: 9.2,
        year: 1997,
        status: "ongoing",
      },
      {
        slug: "naruto",
        title: "Naruto",
        description: "A young ninja seeks recognition and dreams of becoming Hokage.",
        coverImageUrl: "/covers/naruto.jpg",
        sourceName: "Viz Media",
        sourceUrl: "https://www.viz.com/naruto",
        tags: ["Action", "Shounen", "Ninja"],
        rating: 8.7,
        year: 1999,
        status: "completed",
      },
    ];

    for (const s of demoSeries) {
      // Insert if missing
      await db
        .insert(series)
        .values({
          slug: s.slug,
          title: s.title,
          description: s.description,
          coverImageUrl: s.coverImageUrl,
          sourceName: s.sourceName,
          sourceUrl: s.sourceUrl,
          tags: s.tags as any,
          rating: s.rating,
          year: s.year,
          status: s.status,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing({ target: series.slug });

      // Update to keep data fresh (idempotent)
      await db
        .update(series)
        .set({
          title: s.title,
          description: s.description,
          coverImageUrl: s.coverImageUrl,
          sourceName: s.sourceName,
          sourceUrl: s.sourceUrl,
          tags: s.tags as any,
          rating: s.rating,
          year: s.year,
          status: s.status,
          updatedAt: now,
        })
        .where(eq(series.slug, s.slug));
    }

    const seriesRows = await db.select().from(series);
    const onePiece = seriesRows.find((r) => r.slug === "one-piece");
    const naruto = seriesRows.find((r) => r.slug === "naruto");

    // 3) First chapter only for each requested series
    for (const sr of [onePiece, naruto].filter(Boolean) as typeof seriesRows) {
      const ch = {
        number: 1,
        title: `${sr.title} - Chapter 1`,
        language: "en",
        publishedAt: now,
        pages: 32,
        createdAt: now,
      };

      await db
        .insert(mangaChapters)
        .values({
          seriesId: sr.id,
          number: ch.number,
          title: ch.title,
          language: ch.language,
          publishedAt: ch.publishedAt,
          pages: ch.pages,
          externalId: null,
          sourceId: null,
          createdAt: ch.createdAt,
        })
        .onConflictDoNothing({
          target: [mangaChapters.seriesId, mangaChapters.number],
        });
    }

    // 4) Library linking (demo user + one-piece)
    if (onePiece && demoUser) {
      await db
        .insert(library)
        .values({
          userId: demoUser.id,
          seriesId: onePiece.id,
          status: "reading",
          rating: 9,
          notes: "Great start!",
          notifications: true,
          lastReadChapterId: null,
          lastReadAt: null,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing({ target: [library.userId, library.seriesId] });
    }

    // 5) One pinned "General Discussion" thread and linked comments
    let seededThreadId: number | undefined;
    if (onePiece && demoUser) {
      try {
        const [existingThread] = await db
          .select({ id: threads.id })
          .from(threads)
          .where(and(eq(threads.seriesId, onePiece.id), eq(threads.title, "General Discussion")))
          .limit(1);

        let threadId = existingThread?.id as number | undefined;
        if (!existingThread) {
          // Insert thread (avoid .returning() for better SQLite compatibility)
          await db.insert(threads).values({
            seriesId: onePiece.id,
            title: "General Discussion",
            pinned: true,
            createdBy: demoUser.id,
            createdAt: now,
            updatedAt: now,
          });
          const [reloaded] = await db
            .select({ id: threads.id })
            .from(threads)
            .where(and(eq(threads.seriesId, onePiece.id), eq(threads.title, "General Discussion")))
            .limit(1);
          threadId = reloaded?.id;
        }

        if (threadId) {
          seededThreadId = threadId;
          // Seed a top-level comment
          const existingComment = await db
            .select({ id: comments.id })
            .from(comments)
            .where(and(eq(comments.seriesId, onePiece.id), eq(comments.threadId, threadId)))
            .limit(1);
          if (!existingComment?.length) {
            await db.insert(comments).values({
              userId: demoUser.id,
              seriesId: onePiece.id,
              threadId,
              parentId: null,
              content: "Excited to start this series!",
              edited: false,
              deleted: false,
              flagsCount: 0,
              createdAt: now,
            });
          }

          // Determine parent (top-level) comment id for reply
          const [parent] = await db
            .select({ id: comments.id })
            .from(comments)
            .where(and(eq(comments.seriesId, onePiece.id), eq(comments.threadId, threadId), eq(comments.content, "Excited to start this series!")))
            .limit(1);

          // Seed a reply attached to the top-level comment
          const existingReply = await db
            .select({ id: comments.id })
            .from(comments)
            .where(and(eq(comments.seriesId, onePiece.id), eq(comments.content, "Same here! Can't wait.")))
            .limit(1);
          if (!existingReply?.length) {
            await db.insert(comments).values({
              userId: demoUser.id,
              seriesId: onePiece.id,
              threadId,
              parentId: parent?.id ?? null,
              content: "Same here! Can't wait.",
              edited: false,
              deleted: false,
              flagsCount: 0,
              createdAt: now,
            });
          }
        }
      } catch (e: any) {
        // If running against Postgres without threads/comments table, ignore gracefully (dev-only seed)
        const code = e?.code || e?.original?.code;
        if (code !== "42P01") throw e;
      }
    }

    // 6) Demo admin reports (idempotent)
    if (demoUser && onePiece) {
      // A series report
      const existingSeriesReport = await db
        .select({ id: adminReports.id })
        .from(adminReports)
        .where(and(eq(adminReports.userId, demoUser.id), eq(adminReports.seriesId, onePiece.id)))
        .limit(1);
      if (!existingSeriesReport?.length) {
        await db.insert(adminReports).values({
          status: "open",
          reason: "Incorrect tag on series",
          userId: demoUser.id,
          seriesId: onePiece.id,
          commentId: null,
          threadId: null,
          createdAt: now,
        });
      }

      // A thread report (if thread seeded)
      if (seededThreadId) {
        const existingThreadReport = await db
          .select({ id: adminReports.id })
          .from(adminReports)
          .where(and(eq(adminReports.userId, demoUser.id), eq(adminReports.threadId, seededThreadId)))
          .limit(1);
        if (!existingThreadReport?.length) {
          await db.insert(adminReports).values({
            status: "reviewing",
            reason: "Off-topic discussion",
            userId: demoUser.id,
            seriesId: null,
            commentId: null,
            threadId: seededThreadId,
            createdAt: now,
          });
        }
      }
    }

    const counts = {
      usersCount: (await db.select().from(users)).length,
      seriesCount: (await db.select().from(series)).length,
      chaptersCount: (await db.select().from(mangaChapters)).length,
    };

    return NextResponse.json(
      {
        ok: true,
        message: "Seed completed (dev-only)",
        demoUser: demoUser ? { id: demoUser.id, email: demoUser.email } : null,
        series: [onePiece, naruto].filter(Boolean).map((s) => ({ id: s!.id, slug: s!.slug, title: s!.title })),
        counts,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/dev/seed error:", err);
    const message = (err as any)?.message || (err as any)?.toString?.() || "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}