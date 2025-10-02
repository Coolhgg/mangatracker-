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
import { and, eq, sql } from "drizzle-orm";

export const runtime = "nodejs";

// POST /api/dev/seed
// Idempotent development seeding for Drizzle (PostgreSQL)
export async function POST(_req: NextRequest) {
  try {
    // Dev-only guard
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_SEED !== "true") {
      return NextResponse.json({ ok: false, error: "Forbidden in production" }, { status: 403 });
    }

    const now = new Date();
    const nowISO = now.toISOString();

    // 1) Demo user - check if exists first
    const demoEmail = "demo@kenmei.local";
    const demoUserName = "Demo User";

    const existing = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);
    
    if (existing.length === 0) {
      // Insert new user
      await db.execute(sql`
        INSERT INTO users (email, name, avatar_url, roles, created_at, updated_at)
        VALUES (${demoEmail}, ${demoUserName}, NULL, ARRAY[]::text[], ${nowISO}::timestamp, ${nowISO}::timestamp)
      `);
    } else {
      // Update existing
      await db.execute(sql`
        UPDATE users SET name = ${demoUserName}, updated_at = ${nowISO}::timestamp
        WHERE email = ${demoEmail}
      `);
    }

    const [demoUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, demoEmail))
      .limit(1);

    // 2) Series - use proper upsert
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
        .onConflictDoUpdate({
          target: series.slug,
          set: {
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
          },
        });
    }

    const seriesRows = await db.select().from(series);
    const onePiece = seriesRows.find((r) => r.slug === "one-piece");
    const naruto = seriesRows.find((r) => r.slug === "naruto");

    // 3) Chapters - use proper upsert
    for (const sr of [onePiece, naruto].filter(Boolean) as typeof seriesRows) {
      const ch = {
        number: 1,
        title: `${sr.title} - Chapter 1`,
        language: "en",
        publishedAt: now,
        pages: 32,
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
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: [mangaChapters.seriesId, mangaChapters.number],
          set: {
            title: ch.title,
            language: ch.language,
            publishedAt: ch.publishedAt,
            pages: ch.pages,
          },
        });
    }

    // 4) Library linking - use proper upsert
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
        .onConflictDoUpdate({
          target: [library.userId, library.seriesId],
          set: {
            status: "reading",
            rating: 9,
            notes: "Great start!",
            updatedAt: now,
          },
        });
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