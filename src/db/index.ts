import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

// Prefer explicit CA file or inline CA from env; fall back to bundled path if present
const bundledCaPath = path.resolve(process.cwd(), "src/certs/supabase-ca-bundle.crt");
const fullchainPath = path.resolve(process.cwd(), "src/certs/supabase-fullchain.pem");
const envCaPath = process.env.SSL_CA_PATH;
const envCaInline = process.env.SSL_CA_CERT;
const poolerCaPath = path.resolve(process.cwd(), "src/certs/pooler-ca.crt");
const supabaseRoot2021Path = path.resolve(process.cwd(), "src/certs/cert03.pem"); // Supabase Root 2021

// Build connection metadata
const originalConnectionString = process.env.DATABASE_URL || "";
const dnsBypassIp = process.env.DRIZZLE_DB_HOST_IP;
const dnsBypassPort = process.env.DRIZZLE_DB_PORT;
let connectionString = originalConnectionString;
let originalHostname: string | undefined;
let effectiveHostname: string | undefined;
let maskedConnectionInfo = "";

// Check if this is a Supabase pooler connection
const isPoolerConnection = /pooler\.supabase\.com/i.test(originalConnectionString) || 
                          originalConnectionString.includes(":6543");

try {
  const u = new URL(originalConnectionString);
  originalHostname = u.hostname;
  const masked = new URL(u.toString());
  if (masked.username) masked.username = "****";
  if (masked.password) masked.password = "****";
  masked.search = "";
  maskedConnectionInfo = `${masked.protocol}//${masked.username ? masked.username + ":" : ""}${masked.password ? "****@" : ""}${masked.hostname}${masked.port ? ":" + masked.port : ""}${masked.pathname}`;

  if (dnsBypassIp) {
    u.hostname = dnsBypassIp;
    if (dnsBypassPort) u.port = dnsBypassPort;
    connectionString = u.toString();
    effectiveHostname = dnsBypassIp;
  } else {
    effectiveHostname = originalHostname;
  }
} catch {
  // ignore URL parse errors
}

const isSupabase = /supabase\.(co|com)/i.test(originalConnectionString);
const isProd = process.env.NODE_ENV === "production";
const isDev = process.env.NODE_ENV === "development";

// Helper to split PEM into blocks and drop the leaf when a fullchain is supplied
const splitPemBlocks = (pem: string) =>
  pem
    .split(/(?=-----BEGIN CERTIFICATE-----)/g)
    .map((b) => b.trim())
    .filter(Boolean);

// Resolve CA content if available
let ca: string | string[] | undefined;
try {
  // Enforce Supabase Root 2021 as the ONLY trust anchor for all Supabase connections
  if (isSupabase && fs.existsSync(supabaseRoot2021Path)) {
    const pem = fs.readFileSync(supabaseRoot2021Path, "utf8");
    ca = splitPemBlocks(pem); // root-only
  } else if (envCaInline) {
    const blocks = splitPemBlocks(envCaInline);
    ca = blocks.length > 1 ? blocks.slice(1) : blocks; // drop leaf if present
  } else if (envCaPath && fs.existsSync(envCaPath)) {
    const pem = fs.readFileSync(envCaPath, "utf8");
    const blocks = splitPemBlocks(pem);
    ca = blocks.length > 1 ? blocks.slice(1) : blocks; // support fullchain.pem
  } else if (fs.existsSync(fullchainPath)) {
    ca = fs.readFileSync(fullchainPath, "utf8");
  } else if (fs.existsSync(bundledCaPath)) {
    ca = fs.readFileSync(bundledCaPath, "utf8");
  }
} catch {
  // Ignore read errors
}

// Decide desired SNI/servername strictly
const poolerHostDefault = "aws-1-ap-southeast-1.pooler.supabase.com";
let desiredServername = originalHostname || poolerHostDefault;
const looksLikeIp = (h?: string) => !!h && /^(\d+\.){3}\d+$/.test(h);
// If connecting by IP and the original target was the pooler, force SNI to pooler host
if (dnsBypassIp && isPoolerConnection && (looksLikeIp(desiredServername) || !/pooler\.supabase\.com$/i.test(desiredServername))) {
  desiredServername = poolerHostDefault;
}

// Build SSL options with environment-appropriate security
const sslOption = (() => {
  // PRODUCTION: Strict TLS with CA validation if available, otherwise system trust
  if (isProd) {
    if (ca && desiredServername) {
      return {
        ca,
        rejectUnauthorized: true,
        servername: desiredServername,
      };
    }
    // Production without custom CA - use system trust with SSL required
    return { rejectUnauthorized: true, servername: desiredServername };
  }
  
  // DEVELOPMENT/SANDBOX: Prefer strict when CA provided, otherwise relaxed
  if (isDev) {
    if (ca && desiredServername) {
      return {
        ca,
        rejectUnauthorized: true, // keep strict when we have the bundle
        servername: desiredServername,
      };
    }
    // Dev without CA - use SSL but don't verify (sandbox compatible)
    return { rejectUnauthorized: false, servername: desiredServername };
  }
  
  // Fallback: minimal SSL
  return { rejectUnauthorized: true, servername: desiredServername };
})();

// Debug log
try {
  console.info(
    "[DB] Initializing Pool",
    JSON.stringify({
      host: originalHostname,
      effectiveHost: effectiveHostname,
      isPooler: isPoolerConnection,
      hasCA: Array.isArray(ca) ? ca.length > 0 : !!ca,
      sslMode:
        typeof sslOption === "object" && (sslOption as any).rejectUnauthorized === false
          ? "relaxed-dev"
          : "strict",
      env: process.env.NODE_ENV,
      url: maskedConnectionInfo,
      enforcedSupabaseRoot2021: isSupabase,
    })
  );
} catch {}

const pool = new Pool({
  connectionString,
  ssl: sslOption,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 15_000),
});

// Apply session timeouts
pool.on("connect", async (client) => {
  try {
    const statementTimeoutMs = Number(process.env.PG_STATEMENT_TIMEOUT_MS || 60_000);
    const lockTimeoutMs = Number(process.env.PG_LOCK_TIMEOUT_MS || 15_000);
    const idleInTxTimeoutMs = Number(process.env.PG_IDLE_IN_TX_TIMEOUT_MS || 30_000);
    await client.query(`SET statement_timeout TO '${statementTimeoutMs}ms'`);
    await client.query(`SET lock_timeout TO '${lockTimeoutMs}ms'`);
    await client.query(`SET idle_in_transaction_session_timeout TO '${idleInTxTimeoutMs}ms'`);
  } catch {
    // Non-fatal
  }
});

export const db = drizzle(pool, { schema });
export default pool;