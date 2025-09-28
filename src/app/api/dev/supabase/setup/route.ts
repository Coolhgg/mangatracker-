import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";

// OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({ ok: true }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// POST /api/dev/supabase/setup
// Dev-only: ensure required Supabase Storage buckets exist and are public
export async function POST(_req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_SUPABASE_SETUP !== "true") {
      return NextResponse.json({ ok: false, error: "Forbidden in production" }, { status: 403 });
    }

    // Gracefully succeed when env is not configured in local/dev CI runs
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          ok: true,
          message: "Skipped Supabase setup: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (dev-only no-op)",
          ensured: {},
        },
        { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const supabase = getSupabaseAdmin();

    // Buckets we rely on in this project
    const bucketsToEnsure: { name: string; public: boolean }[] = [
      { name: "public", public: true },
      { name: "test-clones", public: true },
    ];

    const ensured: Record<string, { created: boolean; updated: boolean; public: boolean }> = {};

    // List existing buckets once
    const { data: existingBuckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) throw listErr;

    for (const b of bucketsToEnsure) {
      const existing = existingBuckets?.find((eb) => eb.name === b.name);
      if (!existing) {
        const { error: createErr } = await supabase.storage.createBucket(b.name, {
          public: b.public,
          fileSizeLimit: null,
        });
        if (createErr) throw createErr;
        ensured[b.name] = { created: true, updated: false, public: b.public };
      } else {
        // Ensure public setting matches desired state
        let updated = false;
        if ((existing as any).public !== b.public) {
          const { error: updateErr } = await supabase.storage.updateBucket(b.name, { public: b.public });
          if (updateErr) throw updateErr;
          updated = true;
        }
        ensured[b.name] = { created: false, updated, public: b.public };
      }
    }

    return NextResponse.json(
      { ok: true, message: "Supabase setup completed (dev-only)", ensured },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    const message = err?.message || String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}