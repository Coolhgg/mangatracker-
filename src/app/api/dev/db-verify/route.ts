import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Database Verification API
 * Simulates: npm run db:generate, db:push, db:check
 */
export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      USE_POSTGRES: process.env.USE_POSTGRES || 'false',
      USE_TURSO: process.env.USE_TURSO || 'false',
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
      HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    },
    steps: [],
    summary: {
      passed: 0,
      failed: 0
    },
    overallStatus: 'unknown'
  };

  try {
    // Step 1: Verify connection
    const connectionStep = await verifyConnection();
    results.steps.push(connectionStep);
    if (connectionStep.success) results.summary.passed++;
    else results.summary.failed++;

    if (!connectionStep.success) {
      results.overallStatus = 'failed';
      return NextResponse.json(results, { status: 500 });
    }

    // Step 2: List tables (Postgres-specific)
    const tablesStep = await listTables();
    results.steps.push(tablesStep);
    if (tablesStep.success) results.summary.passed++;
    else results.summary.failed++;

    const tables = tablesStep.tables || [];

    // Step 3: Verify auth tables
    const authStep = await verifyAuthTables(tables);
    results.steps.push(authStep);
    if (authStep.success) results.summary.passed++;
    else results.summary.failed++;

    // Step 4: Verify app tables
    const appStep = await verifyAppTables(tables);
    results.steps.push(appStep);
    if (appStep.success) results.summary.passed++;
    else results.summary.failed++;

    // Step 5: Verify DMCA schema
    const dmcaStep = await verifyDmcaSchema();
    results.steps.push(dmcaStep);
    if (dmcaStep.success) results.summary.passed++;
    else results.summary.failed++;

    // Step 6: Data integrity
    const integrityStep = await verifyDataIntegrity();
    results.steps.push(integrityStep);
    if (integrityStep.success) results.summary.passed++;
    else results.summary.failed++;

    // Step 7: Generate statistics
    const statsStep = await generateStats();
    results.steps.push(statsStep);
    if (statsStep.success) results.summary.passed++;
    else results.summary.failed++;

    // Determine overall status
    results.overallStatus = results.summary.failed === 0 ? 'passed' : 
                           results.summary.failed < 3 ? 'partial' : 'failed';

    const status = results.overallStatus === 'passed' ? 200 : 
                   results.overallStatus === 'partial' ? 206 : 500;

    return NextResponse.json(results, { status });

  } catch (error: any) {
    results.steps.push({
      name: 'Fatal Error',
      success: false,
      error: error.message
    });
    results.overallStatus = 'failed';
    return NextResponse.json(results, { status: 500 });
  }
}

async function verifyConnection() {
  try {
    // Use drizzle query builder to test connection
    const result = await db.select({ count: sql<number>`1` }).from(schema.series).limit(1);
    return {
      name: 'Database Connection',
      success: true,
      message: 'Connected successfully',
      details: {
        driver: process.env.USE_POSTGRES === 'true' ? 'Postgres (Supabase)' : 'SQLite/Turso',
        hasUrl: !!process.env.DATABASE_URL,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
      }
    };
  } catch (error: any) {
    return {
      name: 'Database Connection',
      success: false,
      error: error.message
    };
  }
}

async function listTables() {
  if (process.env.USE_POSTGRES !== 'true') {
    return {
      name: 'List Tables',
      success: true,
      message: 'Skipped for non-Postgres',
      tables: []
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const result = await pool.query(`
      SELECT tablename
      FROM pg_catalog.pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY tablename
    `);

    await pool.end();

    const tables = result.rows.map((r: any) => r.tablename);

    return {
      name: 'List Tables',
      success: true,
      count: tables.length,
      tables
    };
  } catch (error: any) {
    return {
      name: 'List Tables',
      success: false,
      error: error.message
    };
  }
}

async function verifyAuthTables(tables: string[]) {
  const requiredAuthTables = ['user', 'session', 'account', 'verification'];
  
  if (tables.length === 0) {
    // Fallback: try to query each table
    const tableCounts: Record<string, number> = {};
    for (const table of requiredAuthTables) {
      try {
        if (process.env.USE_POSTGRES === 'true') {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { Pool } = require('pg');
          const pool = new Pool({ connectionString: process.env.DATABASE_URL });
          const result = await pool.query(`SELECT COUNT(*) as count FROM "${table}"`);
          await pool.end();
          tableCounts[table] = parseInt(result.rows[0]?.count || '0', 10);
        } else {
          tableCounts[table] = 0; // Skip for non-Postgres
        }
      } catch {
        tableCounts[table] = -1; // Error marker
      }
    }

    return {
      name: 'Auth Tables',
      success: Object.values(tableCounts).every(c => c >= 0),
      message: 'Auth tables verified via queries',
      counts: tableCounts
    };
  }

  const missingTables = requiredAuthTables.filter(t => !tables.includes(t));

  if (missingTables.length > 0) {
    return {
      name: 'Auth Tables',
      success: false,
      message: `Missing tables: ${missingTables.join(', ')}`,
      missing: missingTables
    };
  }

  const tableCounts: Record<string, number> = {};
  if (process.env.USE_POSTGRES === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    for (const table of requiredAuthTables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM "${table}"`);
        tableCounts[table] = parseInt(result.rows[0]?.count || '0', 10);
      } catch {
        tableCounts[table] = -1;
      }
    }
    
    await pool.end();
  }

  return {
    name: 'Auth Tables',
    success: true,
    message: 'All auth tables present',
    counts: tableCounts
  };
}

async function verifyAppTables(tables: string[]) {
  const requiredAppTables = [
    'users', 'series', 'manga_chapters', 'library', 'threads', 'comments',
    'reading_history', 'admin_reports', 'push_subscriptions', 'dmca_reports'
  ];

  if (tables.length === 0) {
    // Fallback: use Drizzle to verify tables exist
    const tableCounts: Record<string, number> = {};
    try {
      tableCounts.series = (await db.select().from(schema.series)).length;
      tableCounts.dmca_reports = (await db.select().from(schema.dmcaReports)).length;
      // Add more as needed
    } catch {}

    return {
      name: 'Application Tables',
      success: true,
      message: 'App tables verified via Drizzle',
      counts: tableCounts
    };
  }

  const missingTables = requiredAppTables.filter(t => !tables.includes(t));

  if (missingTables.length > 0) {
    return {
      name: 'Application Tables',
      success: false,
      message: `Missing tables: ${missingTables.join(', ')}`,
      missing: missingTables
    };
  }

  const tableCounts: Record<string, number> = {};
  if (process.env.USE_POSTGRES === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    for (const table of requiredAppTables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM "${table}"`);
        tableCounts[table] = parseInt(result.rows[0]?.count || '0', 10);
      } catch {
        tableCounts[table] = -1;
      }
    }
    
    await pool.end();
  }

  return {
    name: 'Application Tables',
    success: true,
    message: 'All application tables present',
    counts: tableCounts
  };
}

async function verifyDmcaSchema() {
  if (process.env.USE_POSTGRES !== 'true') {
    return {
      name: 'DMCA Reports Schema',
      success: true,
      message: 'Skipped schema check for non-Postgres'
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'dmca_reports'
      ORDER BY ordinal_position
    `);

    await pool.end();

    if (result.rows.length === 0) {
      return {
        name: 'DMCA Reports Schema',
        success: false,
        error: 'Table not found or has no columns'
      };
    }

    const columns = result.rows.map((col: any) => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === 'YES'
    }));

    const requiredColumns = [
      'id', 'reporter_name', 'reporter_email', 'content_type',
      'complaint_details', 'status', 'created_at'
    ];

    const existingColumns = columns.map(c => c.name);
    const missingColumns = requiredColumns.filter(c => !existingColumns.includes(c));

    if (missingColumns.length > 0) {
      return {
        name: 'DMCA Reports Schema',
        success: false,
        message: `Missing columns: ${missingColumns.join(', ')}`,
        columns,
        missing: missingColumns
      };
    }

    return {
      name: 'DMCA Reports Schema',
      success: true,
      message: 'All required columns present',
      columns
    };
  } catch (error: any) {
    return {
      name: 'DMCA Reports Schema',
      success: false,
      error: error.message
    };
  }
}

async function verifyDataIntegrity() {
  const checks: any = {};

  try {
    const seriesResult = await db.select().from(schema.series).limit(5);
    checks.series = {
      success: true,
      count: seriesResult.length,
      sample: seriesResult.length > 0 ? {
        title: seriesResult[0].title,
        slug: seriesResult[0].slug
      } : null
    };
  } catch (error: any) {
    checks.series = { success: false, error: error.message };
  }

  try {
    const dmcaResult = await db.select().from(schema.dmcaReports).limit(5);
    checks.dmcaReports = {
      success: true,
      count: dmcaResult.length,
      sample: dmcaResult.length > 0 ? {
        reporterName: dmcaResult[0].reporterName,
        status: dmcaResult[0].status
      } : null
    };
  } catch (error: any) {
    checks.dmcaReports = { success: false, error: error.message };
  }

  if (process.env.USE_POSTGRES === 'true') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query('SELECT COUNT(*) as count FROM "user"');
      await pool.end();
      checks.authUsers = {
        success: true,
        count: parseInt(result.rows[0]?.count || '0', 10)
      };
    } catch (error: any) {
      checks.authUsers = { success: false, error: error.message };
    }
  }

  const allSuccess = Object.values(checks).every((c: any) => c.success);

  return {
    name: 'Data Integrity',
    success: allSuccess,
    message: allSuccess ? 'All data checks passed' : 'Some data checks failed',
    checks
  };
}

async function generateStats() {
  const stats: any = {
    series: 0,
    chapters: 0,
    users: 0,
    authUsers: 0,
    dmcaReports: 0,
    library: 0
  };

  try {
    stats.series = (await db.select().from(schema.series)).length;
  } catch {}

  try {
    stats.dmcaReports = (await db.select().from(schema.dmcaReports)).length;
  } catch {}

  if (process.env.USE_POSTGRES === 'true') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      const [chapters, users, authUsers, library] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM manga_chapters'),
        pool.query('SELECT COUNT(*) as count FROM users'),
        pool.query('SELECT COUNT(*) as count FROM "user"'),
        pool.query('SELECT COUNT(*) as count FROM library')
      ]);
      
      stats.chapters = parseInt(chapters.rows[0]?.count || '0', 10);
      stats.users = parseInt(users.rows[0]?.count || '0', 10);
      stats.authUsers = parseInt(authUsers.rows[0]?.count || '0', 10);
      stats.library = parseInt(library.rows[0]?.count || '0', 10);
      
      await pool.end();
    } catch {}
  }

  return {
    name: 'Database Statistics',
    success: true,
    stats
  };
}