import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { series } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();
  const result: Record<string, any> = {
    ok: false,
    // driver: detect based on env flags
    driver: process.env.USE_POSTGRES === 'true' ? 'postgres' : (process.env.USE_TURSO === 'true' ? 'libsql' : 'sqlite'),
    env: {
      USE_TURSO: process.env.USE_TURSO || "",
      HAS_DATABASE_URL: Boolean(process.env.DATABASE_URL),
      HAS_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      HAS_SERVICE_ROLE: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
    },
    errors: [] as string[],
    hints: [] as string[],
  };

  // Helper: derive Supabase project ref from NEXT_PUBLIC_SUPABASE_URL
  const projectRef = (() => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!url) return undefined;
      const host = new URL(url).host; // ptkz...supabase.co
      const [sub] = host.split(".");
      return sub; // ptkzcykhaqpgodgqticd
    } catch {
      return undefined;
    }
  })();

  // Helper: normalize Supabase pooler connection string
  const normalizeConnStr = (raw?: string) => {
    if (!raw) return { normalized: raw, isSupabase: false, isPooler: false };
    let normalized = raw;
    const isSupabase = /supabase\.co|supabase\.com/.test(raw);
    const isPooler = /pooler\.supabase\.com/.test(raw);

    // Ensure sslmode=require for query string if not already present
    if (!/sslmode=/.test(normalized)) {
      normalized += (normalized.includes("?") ? "&" : "?") + "sslmode=require";
    }

    // Ensure ?options=project=<ref> for Pooler
    if (isPooler && !/options=/.test(normalized)) {
      const ref = projectRef;
      if (ref) {
        const param = `options=project%3D${encodeURIComponent(ref)}`; // URL-encoded
        normalized += (normalized.includes("?") ? "&" : "?") + param;
      }
    }

    return { normalized, isSupabase, isPooler };
  };

  // Helper: redact password for output
  const redact = (s?: string) => (s ? s.replace(/:(.*?)@/, ":***@") : s);

  let status = 500;
  try {
    const raw = process.env.DATABASE_URL;
    const { normalized, isSupabase, isPooler } = normalizeConnStr(raw);
    result.normalizedConnectionString = redact(normalized);
    result.poolerDetection = { isSupabase, isPooler, projectRef: projectRef || null };

    // Prefer a direct Postgres probe when USE_POSTGRES is enabled
    if (process.env.USE_POSTGRES === 'true' && normalized) {
      // Lazy require to avoid bundling in edge
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: normalized,
        ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
      });
      try {
        const r = await pool.query('SELECT 1');
        result.postgres = { select1: r?.rows?.[0] ?? null };
        result.ok = true;
        status = 200;
      } catch (e: any) {
        const msg = e?.message || String(e);
        result.ok = false;
        result.errors.push(msg);
        if (e?.code) result.errors.push(`code=${e.code}`);
        if (e?.detail) result.errors.push(`detail=${e.detail}`);
        if (e?.hint) result.errors.push(`hint=${e.hint}`);
        if (/getaddrinfo ENOTFOUND/i.test(msg) || e?.code === "ENOTFOUND") {
          status = 503;
          result.hints.push(
            "DNS could not resolve your Supabase host from this environment. Run this health check locally or on your hosting (with outbound DNS) to verify."
          );
        } else if (/Tenant or user not found/i.test(msg)) {
          status = 422;
          result.hints.push(
            "Supabase pooler requires options=project=<project-ref> and a valid database password. Ensure your DATABASE_URL includes ?sslmode=require&options=project%3D<ref>."
          );
          if (!/options=/.test(String(process.env.DATABASE_URL))) {
            result.hints.push(
              "Tip: We auto-append options=project on pooler hosts when NEXT_PUBLIC_SUPABASE_URL is set. Double-check NEXT_PUBLIC_SUPABASE_URL is present and correct."
            );
          }
        } else {
          status = 500;
        }
      } finally {
        try { await pool.end(); } catch {}
      }
    }

    // Fallback probe via app DB if Postgres not enabled
    if (!result.ok) {
      // Cross-driver-safe: count rows from a known table (series)
      const rows = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(series)
        .limit(1);
      const n = Number(rows?.[0]?.count ?? 0);
      result.ok = Number.isFinite(n) && n >= 0;
      status = result.ok ? 200 : 500;
    }
  } catch (e: any) {
    const msg = e?.message || String(e);
    result.ok = false;
    result.errors.push(msg);

    // Friendly diagnostics
    if (/getaddrinfo ENOTFOUND/i.test(msg) || e?.code === "ENOTFOUND") {
      status = 503;
      result.hints.push(
        "DNS could not resolve your Supabase host from this environment. Run this health check locally or on your hosting (with outbound DNS) to verify."
      );
    }
    if (/Tenant or user not found/i.test(msg)) {
      status = 422; // configuration issue
      result.hints.push(
        "Supabase pooler requires options=project=<project-ref> and a valid database password. Ensure your DATABASE_URL includes ?sslmode=require&options=project%3D<ref>."
      );
      if (!/options=/.test(String(process.env.DATABASE_URL))) {
        result.hints.push(
          "Tip: We auto-append options=project on pooler hosts when NEXT_PUBLIC_SUPABASE_URL is set. Double-check NEXT_PUBLIC_SUPABASE_URL is present and correct."
        );
      }
    }
  }

  result.tookMs = Date.now() - startedAt;
  return NextResponse.json(result, { status });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}