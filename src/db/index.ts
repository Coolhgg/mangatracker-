import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { schema } from './schema';

// Fallback to local SQLite when Turso is not explicitly enabled
let db: any;

// Helper: ensure auth tables exist (works for both libsql and better-sqlite3)
const ensureAuthTablesSQL = `
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "email_verified" integer NOT NULL DEFAULT 0,
  "image" text,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL
);
CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expires_at" integer NOT NULL,
  "token" text NOT NULL UNIQUE,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL,
  FOREIGN KEY("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" integer,
  "refresh_token_expires_at" integer,
  "scope" text,
  "password" text,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL,
  FOREIGN KEY("user_id") REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" integer NOT NULL,
  "created_at" integer,
  "updated_at" integer
);
`;

// Helper: ensure core app tables used by seeds exist
// Minimal set to avoid migration drift: users, series, manga_chapters, library, reading_history
const ensureAppTablesSQL = `
CREATE TABLE IF NOT EXISTS "users" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "avatar_url" text,
  "roles" text DEFAULT '[]',
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
CREATE TABLE IF NOT EXISTS "series" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "description" text,
  "cover_image_url" text,
  "source_name" text,
  "source_url" text,
  "tags" text DEFAULT '[]',
  "rating" real,
  "year" integer,
  "status" text,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
CREATE TABLE IF NOT EXISTS "manga_chapters" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "series_id" integer NOT NULL,
  "number" real NOT NULL,
  "title" text,
  "language" text DEFAULT 'en',
  "published_at" text,
  "pages" integer,
  "external_id" text,
  "source_id" text,
  "created_at" text NOT NULL,
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE
);
-- Ensure idempotent chapter inserts by enforcing uniqueness per (series, number)
CREATE UNIQUE INDEX IF NOT EXISTS "manga_chapters_series_number_idx" ON "manga_chapters" ("series_id","number");
CREATE TABLE IF NOT EXISTS "library" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "series_id" integer NOT NULL,
  "status" text DEFAULT 'reading',
  "rating" integer,
  "notes" text,
  "notifications" integer DEFAULT 1,
  "last_read_chapter_id" integer,
  "last_read_at" text,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  UNIQUE("user_id","series_id"),
  FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE,
  FOREIGN KEY("last_read_chapter_id") REFERENCES "manga_chapters"("id")
);
-- Threads table used by /api/threads (moved before comments to satisfy FKs)
CREATE TABLE IF NOT EXISTS "threads" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "series_id" integer NOT NULL,
  "title" text NOT NULL,
  "pinned" integer NOT NULL DEFAULT 0,
  "created_by" integer NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE,
  FOREIGN KEY("created_by") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "threads_series_idx" ON "threads" ("series_id");
CREATE INDEX IF NOT EXISTS "threads_pinned_idx" ON "threads" ("pinned");
-- Comments table (after threads to avoid FK creation mismatch)
CREATE TABLE IF NOT EXISTS "comments" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "series_id" integer NOT NULL,
  "parent_id" integer,
  "thread_id" integer,
  "content" text NOT NULL,
  "edited" integer NOT NULL DEFAULT 0,
  "deleted" integer NOT NULL DEFAULT 0,
  "flags_count" integer NOT NULL DEFAULT 0,
  "created_at" text NOT NULL,
  FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE,
  FOREIGN KEY("parent_id") REFERENCES "comments"("id"),
  FOREIGN KEY("thread_id") REFERENCES "threads"("id")
);
CREATE TABLE IF NOT EXISTS "reading_history" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "series_id" integer NOT NULL,
  "chapter_id" integer NOT NULL,
  "read_at" integer NOT NULL,
  FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE,
  FOREIGN KEY("chapter_id") REFERENCES "manga_chapters"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "reading_history_user_idx" ON "reading_history" ("user_id");
CREATE INDEX IF NOT EXISTS "reading_history_series_idx" ON "reading_history" ("series_id");
CREATE INDEX IF NOT EXISTS "reading_history_chapter_idx" ON "reading_history" ("chapter_id");
CREATE INDEX IF NOT EXISTS "reading_history_read_at_idx" ON "reading_history" ("read_at");
CREATE INDEX IF NOT EXISTS "reading_history_user_read_at_idx" ON "reading_history" ("user_id","read_at");
-- Admin reports with relational links
CREATE TABLE IF NOT EXISTS "admin_reports" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "status" text NOT NULL DEFAULT 'open',
  "reason" text,
  "user_id" integer NOT NULL,
  "series_id" integer,
  "comment_id" integer,
  "thread_id" integer,
  "created_at" text NOT NULL,
  FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY("series_id") REFERENCES "series"("id"),
  FOREIGN KEY("comment_id") REFERENCES "comments"("id"),
  FOREIGN KEY("thread_id") REFERENCES "threads"("id")
);
-- Additional tables to match Drizzle schema to avoid runtime mismatches
CREATE TABLE IF NOT EXISTS "reactions" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "comment_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "type" text NOT NULL,
  FOREIGN KEY("comment_id") REFERENCES "comments"("id"),
  FOREIGN KEY("user_id") REFERENCES "users"("id")
);
CREATE TABLE IF NOT EXISTS "manga_comments" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "series_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "content" text NOT NULL,
  "created_at" text NOT NULL,
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "manga_library" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "series_id" integer NOT NULL,
  "status" text DEFAULT 'reading',
  "created_at" text NOT NULL,
  UNIQUE("user_id","series_id"),
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "reading_progress" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "series_id" integer NOT NULL,
  "chapter_id" integer NOT NULL,
  "read_at" text NOT NULL,
  UNIQUE("user_id","chapter_id"),
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE,
  FOREIGN KEY("chapter_id") REFERENCES "manga_chapters"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "manga_notes" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "series_id" integer NOT NULL,
  "body" text NOT NULL,
  "created_at" text NOT NULL,
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "manga_ratings" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "series_id" integer NOT NULL,
  "value" integer NOT NULL,
  "created_at" text NOT NULL,
  UNIQUE("user_id","series_id"),
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "progress" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "series_id" integer NOT NULL,
  "chapter_id" integer NOT NULL,
  "current_page" integer DEFAULT 0,
  "completed" integer DEFAULT 0,
  "updated_at" text NOT NULL,
  UNIQUE("user_id","series_id","chapter_id"),
  FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY("series_id") REFERENCES "series"("id") ON DELETE CASCADE,
  FOREIGN KEY("chapter_id") REFERENCES "manga_chapters"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer NOT NULL,
  "status" text DEFAULT 'active',
  "product_id" text,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Web Push subscriptions (SQLite)
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "user_id" integer,
  "endpoint" text NOT NULL UNIQUE,
  "p256dh" text,
  "auth" text,
  "user_agent" text,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "push_subscriptions_user_idx" ON "push_subscriptions" ("user_id");
`;

// New: Postgres-compatible DDL (subset sufficient for runtime)
const ensureAuthTablesPG = `
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "created_at" BIGINT NOT NULL,
  "updated_at" BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "expires_at" BIGINT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "created_at" BIGINT NOT NULL,
  "updated_at" BIGINT NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "access_token_expires_at" BIGINT,
  "refresh_token_expires_at" BIGINT,
  "scope" TEXT,
  "password" TEXT,
  "created_at" BIGINT NOT NULL,
  "updated_at" BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" BIGINT NOT NULL,
  "created_at" BIGINT,
  "updated_at" BIGINT
);
`;

const ensureAppTablesPG = `
CREATE TABLE IF NOT EXISTS "users" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "avatar_url" TEXT,
  "roles" TEXT DEFAULT '[]',
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "series" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "cover_image_url" TEXT,
  "source_name" TEXT,
  "source_url" TEXT,
  "tags" TEXT DEFAULT '[]',
  "rating" REAL,
  "year" INTEGER,
  "status" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "manga_chapters" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "series_id" INTEGER NOT NULL REFERENCES "series"("id") ON DELETE CASCADE,
  "number" REAL NOT NULL,
  "title" TEXT,
  "language" TEXT DEFAULT 'en',
  "published_at" TIMESTAMPTZ,
  "pages" INTEGER,
  "external_id" TEXT,
  "source_id" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "manga_chapters_series_number_idx" ON "manga_chapters" ("series_id","number");
CREATE TABLE IF NOT EXISTS "threads" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "series_id" INTEGER NOT NULL REFERENCES "series"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "pinned" INTEGER NOT NULL DEFAULT 0,
  "created_by" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS "threads_series_idx" ON "threads" ("series_id");
CREATE INDEX IF NOT EXISTS "threads_pinned_idx" ON "threads" ("pinned");
CREATE TABLE IF NOT EXISTS "comments" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "series_id" INTEGER NOT NULL REFERENCES "series"("id") ON DELETE CASCADE,
  "parent_id" INTEGER REFERENCES "comments"("id"),
  "thread_id" INTEGER REFERENCES "threads"("id"),
  "content" TEXT NOT NULL,
  "edited" INTEGER NOT NULL DEFAULT 0,
  "deleted" INTEGER NOT NULL DEFAULT 0,
  "flags_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS "library" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "series_id" INTEGER NOT NULL REFERENCES "series"("id") ON DELETE CASCADE,
  "status" TEXT DEFAULT 'reading',
  "rating" INTEGER,
  "notes" TEXT,
  "notifications" INTEGER DEFAULT 1,
  "last_read_chapter_id" INTEGER REFERENCES "manga_chapters"("id"),
  "last_read_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL,
  UNIQUE("user_id","series_id")
);
CREATE TABLE IF NOT EXISTS "reading_history" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "series_id" INTEGER NOT NULL REFERENCES "series"("id") ON DELETE CASCADE,
  "chapter_id" INTEGER NOT NULL REFERENCES "manga_chapters"("id") ON DELETE CASCADE,
  "read_at" BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS "reading_history_user_idx" ON "reading_history" ("user_id");
CREATE INDEX IF NOT EXISTS "reading_history_series_idx" ON "reading_history" ("series_id");
CREATE INDEX IF NOT EXISTS "reading_history_chapter_idx" ON "reading_history" ("chapter_id");
CREATE INDEX IF NOT EXISTS "reading_history_read_at_idx" ON "reading_history" ("read_at");
CREATE INDEX IF NOT EXISTS "reading_history_user_read_at_idx" ON "reading_history" ("user_id","read_at");
CREATE TABLE IF NOT EXISTS "admin_reports" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "status" TEXT NOT NULL DEFAULT 'open',
  "reason" TEXT,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "series_id" INTEGER REFERENCES "series"("id"),
  "comment_id" INTEGER REFERENCES "comments"("id"),
  "thread_id" INTEGER REFERENCES "threads"("id"),
  "created_at" TIMESTAMPTZ NOT NULL
);

-- Web Push subscriptions
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "endpoint" TEXT NOT NULL UNIQUE,
  "p256dh" TEXT,
  "auth" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS "push_subscriptions_user_idx" ON "push_subscriptions" ("user_id");
`;

// New: lightweight migration helper for local SQLite to add missing columns
function migrateSqliteIfNeeded(sqlite: any) {
  try {
    const hasCol = (table: string, col: string) => {
      try {
        const rows = sqlite.prepare(`PRAGMA table_info(${table})`).all();
        return Array.isArray(rows) && rows.some((r: any) => r.name === col);
      } catch {
        return false;
      }
    };
    // comments.thread_id
    if (!hasCol('comments', 'thread_id')) {
      sqlite.prepare('ALTER TABLE comments ADD COLUMN thread_id integer').run();
    }
    // admin_reports columns
    const adminCols = ['status','reason','user_id','series_id','comment_id','thread_id','created_at'];
    for (const c of adminCols) {
      if (!hasCol('admin_reports', c)) {
        const type = c === 'user_id' || c.endsWith('_id') ? 'integer' : 'text';
        const sql = `ALTER TABLE admin_reports ADD COLUMN ${c} ${type}`;
        try { sqlite.prepare(sql).run(); } catch {}
      }
    }
    // push_subscriptions columns migration (handle older key_* columns)
    try {
      // If table exists but new cols missing, add them
      if (sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='push_subscriptions'").get()) {
        if (!hasCol('push_subscriptions', 'p256dh')) {
          try { sqlite.prepare('ALTER TABLE push_subscriptions ADD COLUMN p256dh text').run(); } catch {}
        }
        if (!hasCol('push_subscriptions', 'auth')) {
          try { sqlite.prepare('ALTER TABLE push_subscriptions ADD COLUMN auth text').run(); } catch {}
        }
        // Ensure user_agent exists
        if (!hasCol('push_subscriptions', 'user_agent')) {
          try { sqlite.prepare('ALTER TABLE push_subscriptions ADD COLUMN user_agent text').run(); } catch {}
        }
        // Ensure created_at/updated_at exist
        if (!hasCol('push_subscriptions', 'created_at')) {
          try { sqlite.prepare('ALTER TABLE push_subscriptions ADD COLUMN created_at text').run(); } catch {}
        }
        if (!hasCol('push_subscriptions', 'updated_at')) {
          try { sqlite.prepare('ALTER TABLE push_subscriptions ADD COLUMN updated_at text').run(); } catch {}
        }
      }
    } catch {}
  } catch {
    // ignore
  }
}

// Minimal seed for SQLite fallback to enable API validation
function seedSqliteIfEmpty(sqlite: any) {
  try {
    const row = sqlite.prepare('SELECT COUNT(1) as c FROM series').get();
    if (row && row.c > 0) return; // already seeded
  } catch {
    // table might not exist yet, ignore here
  }
  try {
    const now = new Date().toISOString();
    sqlite.prepare('BEGIN').run();
    // Users
    sqlite
      .prepare('INSERT OR IGNORE INTO users(email, name, roles, created_at, updated_at) VALUES (?,?,?,?,?)')
      .run('user1@example.com', 'User 1', '[]', now, now);
    const u = sqlite.prepare('SELECT id FROM users WHERE email=?').get('user1@example.com');

    // Series
    sqlite
      .prepare('INSERT OR IGNORE INTO series(slug, title, description, tags, status, year, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)')
      .run('one-piece', 'One Piece', 'Pirates and adventure', '["action","adventure"]', 'ongoing', 1997, now, now);
    sqlite
      .prepare('INSERT OR IGNORE INTO series(slug, title, description, tags, status, year, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)')
      .run('naruto', 'Naruto', 'Ninja journey', '["action","shounen"]', 'completed', 1999, now, now);
    const s1 = sqlite.prepare("SELECT id FROM series WHERE slug='one-piece'").get();
    const s2 = sqlite.prepare("SELECT id FROM series WHERE slug='naruto'").get();

    // Chapters
    if (s1?.id) {
      sqlite
        .prepare('INSERT OR IGNORE INTO manga_chapters(series_id, number, title, language, pages, created_at) VALUES (?,?,?,?,?,?)')
        .run(s1.id, 1, 'Romance Dawn', 'en', 50, now);
    }
    if (s2?.id) {
      sqlite
        .prepare('INSERT OR IGNORE INTO manga_chapters(series_id, number, title, language, pages, created_at) VALUES (?,?,?,?,?,?)')
        .run(s2.id, 1, 'Uzumaki Naruto', 'en', 45, now);
    }

    // Library + Comment + Thread
    if (u?.id && s1?.id) {
      sqlite
        .prepare('INSERT OR IGNORE INTO library(user_id, series_id, status, created_at, updated_at) VALUES (?,?,?,?,?)')
        .run(u.id, s1.id, 'reading', now, now);
      // Seed a sample thread
      sqlite
        .prepare('INSERT OR IGNORE INTO threads(series_id, title, pinned, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?)')
        .run(s1.id, 'General Discussion', 1, u.id, now, now);
      const th = sqlite.prepare("SELECT id FROM threads WHERE series_id=? AND title='General Discussion'").get(s1.id);
      // Seed a sample comment linked to thread
      sqlite
        .prepare('INSERT OR IGNORE INTO comments(user_id, series_id, thread_id, content, edited, deleted, flags_count, created_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(u.id, s1.id, th?.id || null, 'Excited to start this series!', 0, 0, 0, now);
    }
    sqlite.prepare('COMMIT').run();
  } catch {
    try { sqlite.prepare('ROLLBACK').run(); } catch {}
  }
}

const tursoEnabled = process.env.USE_TURSO === 'true' && !!process.env.TURSO_CONNECTION_URL && !!process.env.TURSO_AUTH_TOKEN;
const postgresUrl = process.env.DATABASE_URL;
// Only use Postgres when explicitly opted-in to avoid accidental broken setups when DATABASE_URL exists without schema
const usePostgres = process.env.USE_POSTGRES === 'true' && !!postgresUrl;

if (usePostgres) {
  // Supabase Postgres via node-postgres + drizzle
  // Lazy import to avoid bundling in edge runtimes
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let Pool: any;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  let drizzlePg: any;
  try {
    ({ Pool } = require('pg'));
    ({ drizzle: drizzlePg } = require('drizzle-orm/node-postgres'));
  } catch {
    // If pg is not installed or fails to load, fall back to SQLite immediately
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - types differ between drivers
    const Database = require('better-sqlite3');
    let sqlite: any;
    try {
      const targetPath = (process.env.VERCEL === '1' || process.env.NODE_ENV === 'production') ? ':memory:' : (process.env.SQLITE_PATH || 'app.db');
      sqlite = new Database(targetPath);
    } catch {
      sqlite = new Database(':memory:');
    }
    try { sqlite.pragma('foreign_keys = ON'); } catch {}
    sqlite.exec(ensureAuthTablesSQL + ensureAppTablesSQL);
    migrateSqliteIfNeeded(sqlite);
    seedSqliteIfEmpty(sqlite);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
    // @ts-ignore
    db = drizzleSqlite(sqlite, { schema });
  }

  if (!db) {
    // Helper: normalize Supabase connection (ssl, pooler options)
    const normalizeConnStr = (raw?: string) => {
      if (!raw) return { normalized: raw, isSupabase: false };
      let normalized = raw;
      const isSupabase = /supabase\.co|supabase\.com/.test(raw);
      const isPooler = /pooler\.supabase\.com/.test(raw);
      if (!/sslmode=/.test(normalized)) {
        normalized += (normalized.includes('?') ? '&' : '?') + 'sslmode=require';
      }
      // Derive project ref from NEXT_PUBLIC_SUPABASE_URL
      const projectRef = (() => {
        try {
          const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
          if (!u) return undefined;
          const host = new URL(u).host;
          const [sub] = host.split('.');
          return sub;
        } catch {
          return undefined;
        }
      })();
      if (isPooler && !/options=/.test(normalized) && projectRef) {
        normalized += (normalized.includes('?') ? '&' : '?') + `options=project%3D${encodeURIComponent(projectRef)}`;
      }
      return { normalized, isSupabase };
    };

    // Use top-level await to probe connectivity before deciding driver
    const setupDb = async () => {
      try {
        const { normalized, isSupabase } = normalizeConnStr(postgresUrl);
        const pool = new Pool({
          connectionString: normalized,
          ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
        });
        // 1) Health check first – fail here means connectivity/config issue → fallback to SQLite
        await pool.query('SELECT 1');

        // 2) Only run DDL when a required table is missing; surface exact SQL errors if they occur
        const tableExists = async (name: string) => {
          const r = await pool.query('SELECT to_regclass($1) as reg', [name]);
          return Boolean(r.rows?.[0]?.reg);
        };
        const anyMissing = async (names: string[]) => {
          for (const n of names) {
            if (!(await tableExists(n))) return true;
          }
          return false;
        };
        const execMany = async (sql: string) => {
          const stmts = sql
            .split(';')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0 && !s.startsWith('--'));
          for (const s of stmts) {
            try {
              await pool.query(s + ';');
            } catch (e: any) {
              // Do NOT swallow – expose real Postgres error details
              // eslint-disable-next-line no-console
              console.error('[DB MIGRATION ERROR]', {
                message: e?.message,
                code: e?.code,
                detail: e?.detail,
                hint: e?.hint,
                statement: s,
              });
              throw e; // bubble up so the app shows the real error
            }
          }
        };

        const requiredAuthTables = ['user','session','account','verification'];
        const requiredAppTables = [
          'users','series','manga_chapters','threads','comments','library','reading_history','admin_reports','push_subscriptions'
        ];

        try {
          if (await anyMissing(requiredAuthTables)) {
            await execMany(ensureAuthTablesPG);
          }
          if (await anyMissing(requiredAppTables)) {
            await execMany(ensureAppTablesPG);
          }
        } catch (e) {
          // Migration failed despite healthy connection – rethrow with details already logged
          throw e;
        }

        // @ts-ignore drizzle types differ between drivers
        const dbPg = drizzlePg(pool, { schema });
        return dbPg;
      } catch (e: any) {
        // Health failed (e.g., DNS/pooler) → fall back to SQLite
        const isProdLike = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - types differ between drivers
        const Database = require('better-sqlite3');
        let sqlite: any;
        try {
          const targetPath = isProdLike ? ':memory:' : (process.env.SQLITE_PATH || 'app.db');
          sqlite = new Database(targetPath);
        } catch {
          sqlite = new Database(':memory:');
        }
        // Ensure FK constraints are enforced in SQLite
        try { sqlite.pragma('foreign_keys = ON'); } catch {}
        sqlite.exec(ensureAuthTablesSQL + ensureAppTablesSQL);
        migrateSqliteIfNeeded(sqlite);
        seedSqliteIfEmpty(sqlite);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
        return drizzleSqlite(sqlite, { schema });
      }
    };

    // Top-level await to initialize db deterministically
    // @ts-ignore allow top-level await in Node/Next server context
    db = await setupDb();
  }
} else if (tursoEnabled) {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  // Ensure tables before initializing drizzle - libsql doesn't support multiple statements in one execute
  const statements = [
    { sql: 'PRAGMA foreign_keys=ON;', args: [] as any[] },
    ...(ensureAuthTablesSQL + ensureAppTablesSQL)
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))
      .map((s) => ({ sql: s + ';', args: [] as any[] })),
  ];
  // Fire-and-forget to avoid top-level await in module scope
  client.batch(statements).catch(() => {});
  db = drizzleLibsql(client, { schema });
} else {
  // Local SQLite (better-sqlite3) fallback for dev/test
  // In production/Vercel builds, avoid touching a file-based DB which can be malformed
  const isProdLike = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - types differ between drivers
  const Database = require('better-sqlite3');
  let sqlite: any;
  try {
    const targetPath = isProdLike ? ':memory:' : (process.env.SQLITE_PATH || 'app.db');
    sqlite = new Database(targetPath);
  } catch {
    // Fallback to in-memory if anything goes wrong (e.g., malformed file)
    sqlite = new Database(':memory:');
  }
  // Enforce foreign key constraints in SQLite
  try { sqlite.pragma('foreign_keys = ON'); } catch {}
  // Create tables if they don't exist yet
  sqlite.exec(ensureAuthTablesSQL + ensureAppTablesSQL);
  migrateSqliteIfNeeded(sqlite);
  seedSqliteIfEmpty(sqlite);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
  db = drizzleSqlite(sqlite, { schema });
}

export { db };
export type Database = typeof db;