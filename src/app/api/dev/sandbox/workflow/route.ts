import { NextRequest } from "next/server";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getEnv(name: string, fallback?: string) {
  return process.env[name] ?? fallback ?? "";
}

async function withPool<T>(fn: (client: any) => Promise<T>) {
  const DATABASE_URL = getEnv("DATABASE_URL");
  const SSL_CA_PATH = getEnv("SSL_CA_PATH", "src/certs/supabase-fullchain.pem");
  const SUPABASE_POOLER_SNI = "aws-1-ap-southeast-1.pooler.supabase.com";

  // Read custom CA certificate
  let ca: string;
  try {
    const caPath = path.resolve(SSL_CA_PATH);
    ca = fs.readFileSync(caPath, "utf8");
  } catch (err: any) {
    throw new Error(`Failed to load CA certificate from ${SSL_CA_PATH}: ${err.message}`);
  }

  const ssl: any = {
    ca,
    rejectUnauthorized: true,
    servername: SUPABASE_POOLER_SNI,
  };

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl,
    max: Number(getEnv("PG_POOL_MAX", "10")),
    idleTimeoutMillis: Number(getEnv("PG_IDLE_TIMEOUT_MS", "30000")),
    connectionTimeoutMillis: Number(getEnv("PG_CONNECTION_TIMEOUT_MS", "15000")),
  });

  try {
    const client = await pool.connect();
    try {
      await client.query(`SET statement_timeout TO '60000ms'`);
      await client.query(`SET lock_timeout TO '15000ms'`);
      await client.query(`SET idle_in_transaction_session_timeout TO '30000ms'`);
      const result = await fn(client);
      return { result };
    } finally {
      // @ts-ignore
      client.release();
    }
  } finally {
    await pool.end();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const action = (body?.action as string) || "connect";

  const envs = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    SSL_CA_PATH: process.env.SSL_CA_PATH || "src/certs/supabase-fullchain.pem",
  };

  try {
    if (action === "connect") {
      const { result } = await withPool(async (client) => {
        const { rows } = await client.query(
          "SELECT now() AS ts, inet_server_addr() AS server_ip, version() AS version"
        );
        return rows[0];
      });

      return new Response(
        JSON.stringify({
          ok: true,
          step: "connect",
          message: "Connection OK",
          tlsVerification: "Custom CA (supabase-fullchain.pem)",
          envs,
          output: {
            connectionStatus: "OK",
            currentTimestamp: result.ts,
            serverIp: result.server_ip,
            postgresVersion: String(result.version).split("\n")[0],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (action === "setup") {
      const { result } = await withPool(async (client) => {
        await client.query(
          `CREATE TABLE IF NOT EXISTS test_table (
            id SERIAL PRIMARY KEY,
            name TEXT,
            created_at TIMESTAMP DEFAULT now()
          )`
        );
        await client.query(`INSERT INTO test_table(name) VALUES($1)`, ["Orchids production test"]);
        const { rows } = await client.query("SELECT id, name, created_at FROM test_table ORDER BY id ASC");
        const { rows: meta } = await client.query(
          "SELECT now() AS ts, inet_server_addr() AS server_ip, version() AS version"
        );
        return { rows, meta: meta[0] };
      });

      return new Response(
        JSON.stringify({
          ok: true,
          step: "setup",
          message: "Table verified, row inserted, results fetched",
          tlsVerification: "Custom CA (supabase-fullchain.pem)",
          envs,
          output: {
            connectionStatus: "OK",
            currentTimestamp: result.meta.ts,
            serverIp: result.meta.server_ip,
            postgresVersion: String(result.meta.version).split("\n")[0],
            rows: result.rows,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: false, error: `Unknown action: ${action}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    const detail = {
      message: err?.message || String(err),
      code: err?.code,
      severity: err?.severity,
      routine: err?.routine,
      where: err?.where,
      hint: err?.hint,
      position: err?.position,
    };

    return new Response(
      JSON.stringify({
        ok: false,
        step: action,
        tlsVerification: "Custom CA (supabase-fullchain.pem)",
        envs,
        error: detail,
        suggestions: [
          "Verify DATABASE_URL has the correct user, password, host, port, and database",
          "Ensure SSL_CA_PATH points to valid supabase-fullchain.pem certificate",
          "Confirm your IP is allowed in Supabase Network Restrictions (if enabled)",
          "SNI servername is set to aws-1-ap-southeast-1.pooler.supabase.com",
          "Try port 6543 for transaction pooler or 5432 for direct connection",
        ],
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      usage: {
        POST: {
          action: "connect | setup",
        },
        notes:
          "connect: tests TLS + returns timestamp, IP, version; setup: creates test_table, inserts a row, selects all. Uses custom CA (supabase-fullchain.pem).",
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}