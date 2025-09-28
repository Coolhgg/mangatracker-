import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { series, mangaChapters } from "@/db/schema";
import { sql } from "drizzle-orm";

// Lazy Typesense client init (same pattern as /api/search)
let typesenseClient: any = null;
try {
  const adminKey = process.env.TYPESENSE_ADMIN_API_KEY;
  const apiKey = adminKey || process.env.TYPESENSE_API_KEY;
  const hasTypesense = !!process.env.TYPESENSE_HOST && !!apiKey;
  if (hasTypesense) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Typesense = require("typesense");
    typesenseClient = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST,
          port: process.env.TYPESENSE_PORT ? Number(process.env.TYPESENSE_PORT) : 443,
          protocol: process.env.TYPESENSE_PROTOCOL || "https",
        },
      ],
      apiKey,
      connectionTimeoutSeconds: 3,
    });
  }
} catch {
  typesenseClient = null;
}

export async function POST(req: NextRequest) {
  try {
    if (!typesenseClient) {
      return NextResponse.json(
        { ok: false, error: "Typesense is not configured", code: "TYPESENSE_NOT_CONFIGURED" },
        { status: 400 }
      );
    }

    // Probe DB to see if optional fields exist in data (be defensive if tables/columns are missing)
    let sourceCount = 0;
    let langCount = 0;
    try {
      const rows: any = (await db.execute(sql`SELECT COUNT(1) AS sourceCount FROM series WHERE COALESCE(TRIM(source_name), '') <> ''`)) as any;
      sourceCount = Number(rows?.[0]?.sourceCount ?? 0);
    } catch {}
    try {
      const rows: any = (await db.execute(sql`SELECT COUNT(1) AS langCount FROM manga_chapters WHERE COALESCE(TRIM(language), '') <> ''`)) as any;
      langCount = Number(rows?.[0]?.langCount ?? 0);
    } catch {}
    const wantSourceField = Number(sourceCount || 0) > 0;
    const wantLanguageField = Number(langCount || 0) > 0;

    // Ensure we can reach Typesense (return helpful error if unreachable)
    const collectionName = "series";
    let collections: any[] = [];
    try {
      collections = await typesenseClient.collections().retrieve();
    } catch (e: any) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unable to connect to Typesense",
          code: "TYPESENSE_CONNECTION_FAILED",
          details: e?.message || String(e),
        },
        { status: 502 }
      );
    }

    const baseFields: any[] = [
      { name: "id", type: "string" },
      { name: "slug", type: "string", facet: true },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "coverImageUrl", type: "string" },
      { name: "tags", type: "string[]", facet: true },
      { name: "rating", type: "float" },
      { name: "year", type: "int32", facet: true },
      { name: "status", type: "string", facet: true },
    ];
    if (wantSourceField) baseFields.push({ name: "source", type: "string", facet: true });
    if (wantLanguageField) baseFields.push({ name: "language", type: "string", facet: true });

    const exists = Array.isArray(collections) && collections.some((c: any) => c.name === collectionName);
    if (!exists) {
      try {
        await typesenseClient.collections().create({
          name: collectionName,
          fields: baseFields,
          default_sorting_field: "year",
        });
      } catch (e) {
        // If creation races/exists, ignore
      }
    } else {
      // If exists, ensure new fields are present – add them if missing
      try {
        const current = await typesenseClient.collections(collectionName).retrieve();
        const currentFieldNames = new Set((current?.fields || []).map((f: any) => f.name));
        const missing = baseFields.filter((f) => !currentFieldNames.has(f.name));
        if (missing.length > 0) {
          await typesenseClient.collections(collectionName).update({
            fields: [...(current.fields || []), ...missing],
          });
        }
      } catch {
        // ignore if update not supported on older versions
      }
    }

    // Pull all series from DB
    const rows = await db
      .select({
        id: series.id,
        slug: series.slug,
        title: series.title,
        description: series.description,
        coverImageUrl: series.coverImageUrl,
        tags: series.tags,
        rating: series.rating,
        year: series.year,
        status: series.status,
        sourceName: series.sourceName,
      })
      .from(series);

    // Build per-series language map if needed
    let seriesLangMap = new Map<number, string | null>();
    if (wantLanguageField) {
      const langs = await db
        .select({ sId: mangaChapters.seriesId, lang: mangaChapters.language })
        .from(mangaChapters);
      for (const r of langs) {
        const key = (r as any).sId as number;
        if (!seriesLangMap.has(key) && (r as any).lang) {
          seriesLangMap.set(key, (r as any).lang);
        }
      }
    }

    const docs = rows.map((r) => {
      const tags = Array.isArray(r.tags)
        ? (r.tags as unknown as string[])
        : typeof r.tags === "string"
        ? (() => {
            try {
              return JSON.parse(r.tags as unknown as string);
            } catch {
              return [] as string[];
            }
          })()
        : [];
      const doc: any = {
        id: String(r.id),
        slug: r.slug,
        title: r.title,
        description: r.description || "",
        coverImageUrl: r.coverImageUrl || "",
        tags,
        rating: (r as any).rating ?? 0,
        year: (r as any).year ?? undefined,
        status: r.status || "",
      };
      if (wantSourceField) {
        const src = (r as any).sourceName || null;
        if (src) doc.source = src;
      }
      if (wantLanguageField) {
        const lang = seriesLangMap.get((r as any).id as number) || null;
        if (lang) doc.language = lang;
      }
      return doc;
    });

    // Upsert in batches to Typesense
    const batchSize = 100;
    let indexed = 0;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      try {
        await typesenseClient
          .collections(collectionName)
          .documents()
          .import(batch, { action: "upsert" });
      } catch (e: any) {
        return NextResponse.json(
          {
            ok: false,
            error: "Typesense import failed",
            code: "TYPESENSE_IMPORT_FAILED",
            details: e?.message || String(e),
            importResults: e?.importResults ?? null,
            batchStart: i,
            batchSize: batch.length,
          },
          { status: 502 }
        );
      }
      indexed += batch.length;
    }

    return NextResponse.json({ ok: true, indexed, fields: baseFields.map((f) => f.name) });
  } catch (error) {
    console.error("POST /api/search/reindex error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";