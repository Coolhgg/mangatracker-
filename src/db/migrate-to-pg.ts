// Replace migration script with a secure PG pool using provided CA (strict when available)
import fs from "fs";
import path from "path";
import { Pool } from "pg";

// Prefer inline CA, then env path, then fullchain, then pooler CA, then bundled
const envCaInline = process.env.SSL_CA_CERT;
const envCaPath = process.env.SSL_CA_PATH ? path.resolve(process.cwd(), process.env.SSL_CA_PATH) : undefined;
const fullchainPath = path.resolve(process.cwd(), "src/certs/supabase-fullchain.pem");
const poolerCaPath = path.resolve(process.cwd(), "src/certs/pooler-ca.crt");
const bundleCaPath = path.resolve(process.cwd(), "src/certs/supabase-ca-bundle.crt");

let ca: string | undefined;
try {
  if (envCaInline && envCaInline.trim()) {
    ca = envCaInline;
  } else if (envCaPath && fs.existsSync(envCaPath)) {
    ca = fs.readFileSync(envCaPath, "utf8");
  } else if (fs.existsSync(fullchainPath)) {
    ca = fs.readFileSync(fullchainPath, "utf8");
  } else if (fs.existsSync(poolerCaPath)) {
    ca = fs.readFileSync(poolerCaPath, "utf8");
  } else if (fs.existsSync(bundleCaPath)) {
    ca = fs.readFileSync(bundleCaPath, "utf8");
  }
} catch {
  // ignore and fall back
}

let servername: string | undefined;
try {
  const url = process.env.DATABASE_URL;
  if (url) servername = new URL(url).hostname;
} catch {}

const ssl = ca ? { ca, rejectUnauthorized: true as const, servername } : undefined;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

export default pool;