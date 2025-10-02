// Node.js + pg Pool secure connection to Supabase Postgres (pooler)
// - Uses CUSTOM CA file (supabase-fullchain.pem) for TLS verification
// - Enforces rejectUnauthorized: true
// - Forces SNI servername to "aws-1-ap-southeast-1.pooler.supabase.com"
// - Runs a test query to print the current timestamp

/*
 How to run (locally or in sandbox shells):
   node scripts/connect-supabase.js
 Ensure .env contains DATABASE_URL and SSL_CA_PATH.
*/

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load env if dotenv is available; ignore if not
try { require("dotenv").config(); } catch {}

const connectionString = process.env.DATABASE_URL ||
  "postgresql://YOUR_USER:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

const SSL_CA_PATH = process.env.SSL_CA_PATH || "src/certs/supabase-fullchain.pem";
const SUPABASE_POOLER_SNI = "aws-1-ap-southeast-1.pooler.supabase.com";

// Read custom CA certificate
let ca;
try {
  const caPath = path.resolve(SSL_CA_PATH);
  ca = fs.readFileSync(caPath, "utf8");
  console.log(`✅ Loaded CA certificate from: ${SSL_CA_PATH}`);
} catch (err) {
  console.error(`❌ Failed to load CA certificate from ${SSL_CA_PATH}:`, err.message);
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    ca,
    rejectUnauthorized: true,
    servername: SUPABASE_POOLER_SNI,
  },
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 15_000),
});

async function main() {
  try {
    console.log("Connecting with custom CA certificate...");
    const client = await pool.connect();
    try {
      await client.query(`SET statement_timeout TO '60000ms'`);
      await client.query(`SET lock_timeout TO '15000ms'`);
      await client.query(`SET idle_in_transaction_session_timeout TO '30000ms'`);

      const { rows } = await client.query(
        "SELECT now() AS ts, inet_server_addr() AS server_ip, version() AS version"
      );

      const row = rows[0];
      console.log("✅ TLS verified via supabase-fullchain.pem");
      console.log("✅ Connection OK");
      console.log("Current timestamp:", row.ts);
      console.log("Server IP:", row.server_ip);
      console.log("Postgres version:", String(row.version).split("\n")[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ TLS/Connection failed:", err?.message || err);
    if (err?.code) console.error("Error code:", err.code);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();