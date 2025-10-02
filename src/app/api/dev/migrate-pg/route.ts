import { NextResponse } from "next/server";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  // Proxy GET to POST with query param support and safe defaults for sandbox
  const url = new URL(request.url);
  const qp = url.searchParams;
  const usePoolerHost = qp.get("usePoolerHost") !== "false"; // default true
  const poolerHost = qp.get("poolerHost") || "aws-1-ap-southeast-1.pooler.supabase.com";
  const poolerPort = Number(qp.get("poolerPort") || 6543);
  const insecureSkipTlsVerify = qp.get("insecure") !== "false"; // default true
  const servername = qp.get("servername") || poolerHost;
  const hostIp = qp.get("ip") || undefined;
  const port = qp.get("port") || undefined;

  const body = {
    usePoolerHost,
    poolerHost,
    poolerPort,
    insecureSkipTlsVerify,
    servername,
    hostIp,
    port,
  };

  const proxyReq = new Request(request.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return POST(proxyReq);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      hostIp?: string;
      port?: string | number;
      // NEW: allow passing a full pooler/connection URL and optional SNI
      poolerUrl?: string; // e.g. postgresql://...@aws-1-...pooler.supabase.com:5432/postgres?sslmode=require
      connectionString?: string; // alias
      servername?: string; // force TLS SNI (e.g. aws-1-...pooler.supabase.com)
      insecureSkipTlsVerify?: boolean; // if true, do not verify TLS (sandbox only)
      caInline?: string | string[]; // optional inline CA(s)
      // NEW: instruct the API to swap hostname/port to Supabase pooler while keeping creds/db
      usePoolerHost?: boolean;
      poolerHost?: string; // default: aws-1-ap-southeast-1.pooler.supabase.com
      poolerPort?: string | number; // default: 6543
    };

    // Determine base connection string (prefer provided pooler/connection override)
    const originalEnv = process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL || "";
    const provided = body.poolerUrl || body.connectionString;
    if (!originalEnv && !provided) {
      return NextResponse.json({ ok: false, error: "No connection string provided and no DRIZZLE_DATABASE_URL/DATABASE_URL set" }, { status: 500 });
    }

    let base = provided || originalEnv;
    let connectionString = base;
    let originalHostname: string | undefined;
    let parsedUrl: URL | undefined;
    try {
      const u = new URL(base);
      parsedUrl = u;
      originalHostname = u.hostname;
      const hostIp = body.hostIp || process.env.DRIZZLE_DB_HOST_IP; // optional IPv4/IPv6 override for DNS-less connect
      const portOverride = body.port || process.env.DRIZZLE_DB_PORT;

      // Prefer explicit host IP override when provided
      if (hostIp) {
        u.hostname = String(hostIp);
        if (portOverride) u.port = String(portOverride);
        connectionString = u.toString();
      } else if (body.usePoolerHost) {
        // Swap to pooler hostname/port while retaining credentials and database
        const poolerHost = body.poolerHost || "aws-1-ap-southeast-1.pooler.supabase.com";
        const poolerPort = String(body.poolerPort || 6543);
        u.hostname = poolerHost;
        u.port = poolerPort;
        connectionString = u.toString();
        // Also default SNI to pooler host if not explicitly provided later
        originalHostname = poolerHost;
      } else {
        connectionString = u.toString();
      }
    } catch {
      // fall through; invalid URL will error when Pool initializes
    }

    // Load Supabase CA chain (strict SSL) if available, unless insecure flag is set
    const envCaPath = process.env.SSL_CA_PATH;
    // Default to a bundled RDS global bundle if present
    const defaultRdsBundle = path.join(process.cwd(), "src", "certs", "rds-global-bundle.pem");
    const explicitCaPath = envCaPath && fs.existsSync(envCaPath) ? envCaPath : fs.existsSync(defaultRdsBundle) ? defaultRdsBundle : undefined;

    const bundledCaPath = path.join(process.cwd(), "src", "certs", "supabase-ca-bundle.crt");
    const fullchainPath = path.join(process.cwd(), "src", "certs", "supabase-fullchain.pem");
    const extraPoolerCaPath = path.join(process.cwd(), "src", "certs", "pooler-ca.crt");

    const splitPemBlocks = (pem: string) =>
      pem
        .split(/(?=-----BEGIN CERTIFICATE-----)/g)
        .map((b) => b.trim())
        .filter(Boolean);

    let cas: string[] = [];
    try {
      if (!body.insecureSkipTlsVerify) {
        if (typeof body.caInline === "string") cas.push(body.caInline);
        if (Array.isArray(body.caInline)) cas.push(...body.caInline);
        if (explicitCaPath) {
          // Allow fullchain.pem: drop the first (leaf) and keep intermediates + roots (incl. cross-signs)
          const pem = fs.readFileSync(explicitCaPath, "utf8");
          const blocks = splitPemBlocks(pem);
          cas.push(...(blocks.length > 1 ? blocks.slice(1) : blocks));
        }
        if (fs.existsSync(bundledCaPath)) {
          cas.push(fs.readFileSync(bundledCaPath, "utf8"));
        }
        if (fs.existsSync(fullchainPath)) {
          cas.push(fs.readFileSync(fullchainPath, "utf8"));
        }
        if (fs.existsSync(extraPoolerCaPath)) {
          // Treat pooler-ca as a potential fullchain; include non-leaf blocks to permit strict path building
          const fullchain = fs.readFileSync(extraPoolerCaPath, "utf8");
          const blocks = splitPemBlocks(fullchain);
          const nonLeaf = blocks.length > 1 ? blocks.slice(1) : blocks;
          if (nonLeaf.length > 0) {
            cas.push(...nonLeaf);
          }
        }
      }
    } catch {}

    // Deduplicate and sanitize empty entries
    cas = Array.from(new Set(cas.filter(Boolean)));

    // Decide desired SNI/servername strictly
    const poolerHostDefault = body.poolerHost || "aws-1-ap-southeast-1.pooler.supabase.com";
    let desiredServername = body.servername || (body.usePoolerHost ? poolerHostDefault : originalHostname) || poolerHostDefault;

    const hostIpProvided = Boolean(body.hostIp || process.env.DRIZZLE_DB_HOST_IP);
    // If connecting by IP and no explicit servername, force SNI to pooler host to match certificate CN
    const looksLikeIp = (h?: string) => !!h && /^(\d+\.){3}\d+$/.test(h);
    if (hostIpProvided && !body.servername && (looksLikeIp(desiredServername) || !/pooler\.supabase\.com$/i.test(desiredServername))) {
      desiredServername = poolerHostDefault;
    }

    // If target is Supabase pooler, prefer ONLY non-leaf blocks from the bundle (intermediate + root, include cross-signs if present)
    const isPooler = /pooler\.supabase\.com$/i.test(desiredServername);
    if (isPooler) {
      try {
        const poolerCaPath = explicitCaPath || extraPoolerCaPath;
        if (poolerCaPath && fs.existsSync(poolerCaPath)) {
          const pem = fs.readFileSync(poolerCaPath, "utf8").trim();
          if (pem) {
            const blocks = splitPemBlocks(pem);
            const nonLeaf = blocks.length > 1 ? blocks.slice(1) : blocks;
            cas = nonLeaf.length > 0 ? nonLeaf : cas;
          }
        }
      } catch {}
    }

    // Prefer strict TLS always; include CA(s) when available, otherwise rely on system CAs with SNI
    const ssl = body.insecureSkipTlsVerify
      ? { rejectUnauthorized: false as const }
      : cas.length > 0
      ? { ca: cas, rejectUnauthorized: true as const, servername: desiredServername }
      : { rejectUnauthorized: true as const, servername: desiredServername };

    // Build Pool config. If an IP override was provided, avoid DNS entirely by supplying explicit host/user/pass/db.
    // This also supports IPv6 literals (no brackets needed when using the "host" field).
    const hostIpProvidedAgain = hostIpProvided; // keep semantic meaning clear below
    let pool: Pool;
    if (hostIpProvidedAgain && parsedUrl) {
      const user = decodeURIComponent(parsedUrl.username || "");
      const password = decodeURIComponent(parsedUrl.password || "");
      const database = (parsedUrl.pathname || "/").replace(/^\//, "");
      const host = String(body.hostIp || process.env.DRIZZLE_DB_HOST_IP);
      const port = Number(body.port || process.env.DRIZZLE_DB_PORT || parsedUrl.port || 5432);

      pool = new Pool({
        host,
        port,
        user,
        password,
        database,
        ssl,
        max: 1,
        connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 15_000),
      });
    } else {
      // Fallback: let pg parse the connection string
      pool = new Pool({
        connectionString,
        ssl,
        max: 1,
        connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 15_000),
      });
    }

    const client = await pool.connect();
    try {
      // Collect and run ALL .sql migrations in drizzle/ alphabetically
      const migrationsDir = path.join(process.cwd(), "drizzle");
      if (!fs.existsSync(migrationsDir)) {
        return NextResponse.json({ ok: false, error: "drizzle/ directory not found" }, { status: 500 });
      }

      const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort((a, b) => a.localeCompare(b));

      if (files.length === 0) {
        return NextResponse.json({ ok: true, message: "No SQL migrations to run" });
      }

      let executed = 0;
      for (const file of files) {
        const full = path.join(process.cwd(), "drizzle", file);
        const sqlContent = fs.readFileSync(full, "utf8");
        const statements = sqlContent
          .split("--> statement-breakpoint")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith("--"));

        for (const statement of statements) {
          try {
            await client.query(statement);
            executed++;
          } catch (err: any) {
            // Skip idempotent errors
            if (err?.code === "42P07" || err?.message?.includes("already exists")) {
              continue;
            }
            // Surface the failing statement for debugging (truncate to avoid logs bloat)
            const snippet = statement.replace(/\s+/g, " ").slice(0, 240);
            throw new Error(`Failed executing: ${snippet} ... — ${err?.message || err}`);
          }
        }
      }

      return NextResponse.json({ ok: true, message: "Migration completed successfully", statementsExecuted: executed });
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || String(error),
        code: error?.code,
        detail: error?.detail,
        hint: error?.hint,
      },
      { status: 500 }
    );
  }
}