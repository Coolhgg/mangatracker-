import { NextResponse } from "next/server";
import { Pool } from "pg";
import fs from "fs";

export async function POST() {
  try {
    const connectionString = process.env.DATABASE_URL || "";

    // Strict TLS using CA from SSL_CA_PATH (if provided); otherwise rely on system trust + sslmode in URL
    let ca: string | undefined;
    try {
      const caPath = process.env.SSL_CA_PATH;
      if (caPath && fs.existsSync(caPath)) {
        ca = fs.readFileSync(caPath, "utf8");
      }
    } catch {}

    let servername: string | undefined;
    try {
      if (connectionString) {
        servername = new URL(connectionString).hostname;
      }
    } catch {}

    const ssl = ca ? { ca, rejectUnauthorized: true as const, servername } : undefined;

    const tempPool = new Pool({
      connectionString,
      ssl,
      max: 1,
    });
    
    const client = await tempPool.connect();
    
    try {
      // Drop all tables in public schema
      await client.query(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO postgres;
        GRANT ALL ON SCHEMA public TO public;
      `);
      
      return NextResponse.json({
        ok: true,
        message: "All tables dropped successfully"
      });
      
    } finally {
      client.release();
      await tempPool.end();
    }
  } catch (error: any) {
    console.error("Drop error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}