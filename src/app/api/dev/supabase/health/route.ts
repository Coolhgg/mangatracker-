import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server-admin";

// GET /api/dev/supabase/health
// Verifies Supabase connectivity using the Service Role key and basic table access
export async function GET() {
  const startedAt = Date.now();
  const result: Record<string, any> = {
    ok: false,
    driver: "supabase-js",
    env: {
      HAS_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      HAS_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      HAS_SERVICE_ROLE: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    checks: {
      listTables: false,
      selectSeriesCount: false,
    },
    errors: [] as string[],
    hints: [] as string[],
  };

  let status = 500;

  try {
    const supabase = getSupabaseAdmin();

    // Basic access check against a known table created by /api/dev/supabase/setup
    {
      const { count, error } = await supabase
        .from("series")
        .select("id", { count: "exact", head: true });

      if (error) {
        result.errors.push(`series count error: ${error.message}`);
      } else {
        result.checks.selectSeriesCount = true;
        result.seriesCount = count ?? null;
      }
    }

    // Attempt to list tables via pg_catalog as a lightweight sanity check using a SQL RPC
    // Note: This requires the service role to have access; will fail gracefully otherwise
    try {
      const { data, error } = await supabase.rpc("pg_catalog_tables_list" as any);
      if (error) {
        // Not all projects have a helper RPC; ignore but provide hint
        result.hints.push(
          "Optional: create a helper RPC if you want to list tables (e.g., CREATE FUNCTION pg_catalog_tables_list() RETURNS TABLE(tablename text) LANGUAGE sql STABLE AS $$ SELECT tablename FROM pg_tables WHERE schemaname='public' $$);"
        );
      } else {
        result.checks.listTables = Array.isArray(data);
        if (Array.isArray(data)) {
          result.tables = data;
        }
      }
    } catch (e: any) {
      result.hints.push(
        "Skipping tables list RPC; it's optional and not required for connectivity."
      );
    }

    result.ok = result.checks.selectSeriesCount || result.checks.listTables;
    status = result.ok ? 200 : 500;
  } catch (e: any) {
    const msg = e?.message || String(e);
    result.errors.push(msg);

    if (/Missing Supabase env/i.test(msg)) {
      status = 422;
      result.hints.push(
        "Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
      );
    }
  }

  result.tookMs = Date.now() - startedAt;
  return NextResponse.json(result, { status });
}