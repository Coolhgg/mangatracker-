import { db } from "../../db";
import {
  users,
  series,
  mangaChapters,
  library,
  readingHistory,
} from "../../db/schema";
import { eq, and } from "drizzle-orm";

// Idempotent helpers
async function upsertUser(u: { id: number; email: string; name: string; avatarUrl?: string }) {
  const existing = await db.select().from(users).where(eq(users.id, u.id));
  if (existing.length) {
    await db
      .update(users)
      .set({
        email: u.email,
        name: u.name,
        avatarUrl: u.avatarUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, u.id));
    return existing[0].id;
  }
  const now = new Date().toISOString();
  await db.insert(users).values({
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    roles: JSON.stringify(["user"]),
    createdAt: now,
    updatedAt: now,
  });
  return u.id;
}

async function upsertSeries(s: {
  slug: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  tags?: string[];
}) {
  const existing = await db.select().from(series).where(eq(series.slug, s.slug));
  const now = new Date().toISOString();
  if (existing.length) {
    await db
      .update(series)
      .set({
        title: s.title,
        description: s.description,
        coverImageUrl: s.coverImageUrl,
        tags: JSON.stringify(s.tags || []),
        updatedAt: now,
      })
      .where(eq(series.slug, s.slug));
    return existing[0].id;
  }
  const inserted = await db
    .insert(series)
    .values({
      slug: s.slug,
      title: s.title,
      description: s.description,
      coverImageUrl: s.coverImageUrl,
      tags: JSON.stringify(s.tags || []),
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: series.id });
  return inserted[0].id;
}

async function ensureChapter(
  seriesId: number,
  c: { number: number; title?: string; language?: string; publishedAt?: string; pages?: number },
) {
  // No unique constraint for (seriesId, number), so check manually
  const existing = await db
    .select()
    .from(mangaChapters)
    .where(and(eq(mangaChapters.seriesId, seriesId), eq(mangaChapters.number, c.number)));
  if (existing.length) return existing[0].id;
  const inserted = await db
    .insert(mangaChapters)
    .values({
      seriesId,
      number: c.number,
      title: c.title,
      language: c.language || "en",
      publishedAt: c.publishedAt || new Date().toISOString(),
      pages: c.pages,
      createdAt: new Date().toISOString(),
    })
    .returning({ id: mangaChapters.id });
  return inserted[0].id;
}

async function upsertLibrary(userId: number, seriesId: number, status: string = "reading") {
  const existing = await db
    .select()
    .from(library)
    .where(and(eq(library.userId, userId), eq(library.seriesId, seriesId)));
  const now = new Date().toISOString();
  if (existing.length) {
    await db.update(library).set({ status, updatedAt: now }).where(eq(library.id, existing[0].id));
    return existing[0].id;
  }
  const inserted = await db
    .insert(library)
    .values({ userId, seriesId, status, createdAt: now, updatedAt: now })
    .returning({ id: library.id });
  return inserted[0].id;
}

async function ensureReadingHistory(
  userId: number,
  seriesId: number,
  chapterId: number,
  readAt: number,
) {
  // reading_history has only indexes, allow duplicates avoidance by checking same tuple
  const existing = await db
    .select()
    .from(readingHistory)
    .where(
      and(
        eq(readingHistory.userId, userId),
        eq(readingHistory.seriesId, seriesId),
        eq(readingHistory.chapterId, chapterId),
        eq(readingHistory.readAt, readAt),
      ),
    );
  if (existing.length) return existing[0].id;
  const inserted = await db
    .insert(readingHistory)
    .values({ userId, seriesId, chapterId, readAt })
    .returning({ id: readingHistory.id });
  return inserted[0].id;
}

export async function runMinimalSeed() {
  // 1) Core user
  const userId = await upsertUser({ id: 1, email: "demo@example.com", name: "Demo User" });

  // 2) Series
  const onePieceId = await upsertSeries({
    slug: "one-piece",
    title: "One Piece",
    description: "Pirate adventure in search of the One Piece.",
    tags: ["action", "adventure"],
    coverImageUrl: "/op.jpg",
  });
  const narutoId = await upsertSeries({
    slug: "naruto",
    title: "Naruto",
    description: "A ninja's journey to become Hokage.",
    tags: ["action", "shounen"],
    coverImageUrl: "/naruto.jpg",
  });

  // 3) Chapters
  const onePieceChapters: number[] = [1, 2, 3, 4, 5];
  const narutoChapters: number[] = [1, 2, 3, 4, 5];
  const onePieceChapterIds: number[] = [];
  const narutoChapterIds: number[] = [];

  for (const n of onePieceChapters) {
    const id = await ensureChapter(onePieceId, {
      number: n,
      title: `Chapter ${n}`,
      pages: 20 + n,
    });
    onePieceChapterIds.push(id);
  }
  for (const n of narutoChapters) {
    const id = await ensureChapter(narutoId, {
      number: n,
      title: `Chapter ${n}`,
      pages: 18 + n,
    });
    narutoChapterIds.push(id);
  }

  // 4) Library membership
  await upsertLibrary(userId, onePieceId, "reading");
  await upsertLibrary(userId, narutoId, "reading");

  // 5) Reading history across recent days to feed /api/stats buckets
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const recentTimestamps = [0, 1, 2, 3, 5, 8, 13, 21, 25, 28].map((d) => now - d * day);

  for (let i = 0; i < recentTimestamps.length && i < onePieceChapterIds.length; i++) {
    await ensureReadingHistory(userId, onePieceId, onePieceChapterIds[i], Math.floor(recentTimestamps[i] / 1000));
  }
  for (let i = 0; i < recentTimestamps.length && i < narutoChapterIds.length; i++) {
    await ensureReadingHistory(userId, narutoId, narutoChapterIds[i], Math.floor((recentTimestamps[i] - 6 * 60 * 60 * 1000) / 1000));
  }

  return {
    ok: true,
    userId,
    series: [onePieceId, narutoId],
  };
}

// Allow running via: pnpm tsx src/db/seeds/minimal_test_data.ts
if (require.main === module) {
  runMinimalSeed()
    .then((res) => {
      // eslint-disable-next-line no-console
      console.log("🌱 Minimal seed complete:", res);
      process.exit(0);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Seed failed:", err);
      process.exit(1);
    });
}