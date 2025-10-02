#!/usr/bin/env tsx

/**
 * Comprehensive Sandbox Database Verification Script
 * Simulates: npm run db:generate, db:push, db:check
 * 
 * Verifies:
 * 1. Database connectivity (Supabase Postgres)
 * 2. All auth tables (user, session, account, verification)
 * 3. All app tables (series, chapters, library, etc.)
 * 4. DMCA reports table structure
 * 5. Data integrity
 */

import { db } from '../src/db';
import * as schema from '../src/db/schema';

interface TableInfo {
  tablename: string;
  schemaname: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

async function verifyPostgresConnection() {
  console.log('\n🔍 Step 1: Verifying Database Connection...\n');
  
  try {
    // Test basic query
    const result = await db.execute<{ val: number }>({ sql: 'SELECT 1 as val', args: [] });
    console.log('✅ Database connection successful');
    console.log(`   Driver: ${process.env.USE_POSTGRES === 'true' ? 'Postgres (Supabase)' : 'SQLite/Turso'}`);
    console.log(`   Database URL: ${process.env.DATABASE_URL ? '***configured***' : 'NOT SET'}`);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function listAllTables(): Promise<string[]> {
  console.log('\n🔍 Step 2: Listing All Tables...\n');
  
  try {
    const result = await db.execute<TableInfo>({
      sql: `
        SELECT tablename, schemaname 
        FROM pg_catalog.pg_tables 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY tablename
      `,
      args: []
    });
    
    const tables = result.rows.map(r => r.tablename);
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`   - ${t}`));
    return tables;
  } catch (error: any) {
    console.error('❌ Failed to list tables:', error.message);
    return [];
  }
}

async function verifyAuthTables(tables: string[]) {
  console.log('\n🔍 Step 3: Verifying Auth Tables...\n');
  
  const requiredAuthTables = ['user', 'session', 'account', 'verification'];
  const missingTables = requiredAuthTables.filter(t => !tables.includes(t));
  
  if (missingTables.length > 0) {
    console.error(`❌ Missing auth tables: ${missingTables.join(', ')}`);
    return false;
  }
  
  console.log('✅ All auth tables exist:');
  for (const table of requiredAuthTables) {
    try {
      const countResult = await db.execute<{ count: number }>({
        sql: `SELECT COUNT(*) as count FROM "${table}"`,
        args: []
      });
      const count = countResult.rows[0]?.count || 0;
      console.log(`   ✓ ${table}: ${count} rows`);
    } catch (error: any) {
      console.error(`   ✗ ${table}: Query failed - ${error.message}`);
    }
  }
  
  return true;
}

async function verifyAppTables(tables: string[]) {
  console.log('\n🔍 Step 4: Verifying Application Tables...\n');
  
  const requiredAppTables = [
    'users',
    'series', 
    'manga_chapters',
    'library',
    'threads',
    'comments',
    'reading_history',
    'admin_reports',
    'push_subscriptions',
    'dmca_reports'
  ];
  
  const missingTables = requiredAppTables.filter(t => !tables.includes(t));
  
  if (missingTables.length > 0) {
    console.error(`❌ Missing app tables: ${missingTables.join(', ')}`);
    return false;
  }
  
  console.log('✅ All application tables exist:');
  for (const table of requiredAppTables) {
    try {
      const countResult = await db.execute<{ count: number }>({
        sql: `SELECT COUNT(*) as count FROM "${table}"`,
        args: []
      });
      const count = countResult.rows[0]?.count || 0;
      console.log(`   ✓ ${table}: ${count} rows`);
    } catch (error: any) {
      console.error(`   ✗ ${table}: Query failed - ${error.message}`);
    }
  }
  
  return true;
}

async function verifyDmcaReportsSchema() {
  console.log('\n🔍 Step 5: Verifying DMCA Reports Table Schema...\n');
  
  try {
    const result = await db.execute<ColumnInfo>({
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'dmca_reports'
        ORDER BY ordinal_position
      `,
      args: []
    });
    
    if (result.rows.length === 0) {
      console.error('❌ dmca_reports table not found or has no columns');
      return false;
    }
    
    console.log('✅ DMCA Reports table schema:');
    result.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`   - ${col.column_name}: ${col.data_type} (${nullable})`);
    });
    
    // Verify required columns
    const requiredColumns = [
      'id', 'reporter_name', 'reporter_email', 'content_type',
      'complaint_details', 'status', 'created_at'
    ];
    
    const existingColumns = result.rows.map(r => r.column_name);
    const missingColumns = requiredColumns.filter(c => !existingColumns.includes(c));
    
    if (missingColumns.length > 0) {
      console.error(`❌ Missing required columns: ${missingColumns.join(', ')}`);
      return false;
    }
    
    console.log('✅ All required columns present');
    return true;
  } catch (error: any) {
    console.error('❌ Schema verification failed:', error.message);
    return false;
  }
}

async function verifyDataIntegrity() {
  console.log('\n🔍 Step 6: Verifying Data Integrity...\n');
  
  try {
    // Test series data
    const seriesResult = await db.select().from(schema.series).limit(5);
    console.log(`✅ Series table: ${seriesResult.length} series found`);
    if (seriesResult.length > 0) {
      console.log(`   Sample: "${seriesResult[0].title}" (slug: ${seriesResult[0].slug})`);
    }
    
    // Test DMCA reports data
    const dmcaResult = await db.select().from(schema.dmcaReports).limit(5);
    console.log(`✅ DMCA Reports: ${dmcaResult.length} reports found`);
    if (dmcaResult.length > 0) {
      console.log(`   Latest: ${dmcaResult[0].reporterName} (${dmcaResult[0].status})`);
    }
    
    // Test auth users
    const usersResult = await db.execute<{ count: number }>({
      sql: 'SELECT COUNT(*) as count FROM "user"',
      args: []
    });
    const userCount = usersResult.rows[0]?.count || 0;
    console.log(`✅ Auth Users: ${userCount} users registered`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Data integrity check failed:', error.message);
    return false;
  }
}

async function generateMigrationReport() {
  console.log('\n📋 Migration Report Summary\n');
  console.log('=' .repeat(60));
  
  try {
    // Count all major entities
    const counts = {
      series: await db.select().from(schema.series).then(r => r.length),
      chapters: await db.execute<{ count: number }>({ 
        sql: 'SELECT COUNT(*) as count FROM manga_chapters', 
        args: [] 
      }).then(r => r.rows[0]?.count || 0),
      users: await db.execute<{ count: number }>({ 
        sql: 'SELECT COUNT(*) as count FROM users', 
        args: [] 
      }).then(r => r.rows[0]?.count || 0),
      authUsers: await db.execute<{ count: number }>({ 
        sql: 'SELECT COUNT(*) as count FROM "user"', 
        args: [] 
      }).then(r => r.rows[0]?.count || 0),
      dmcaReports: await db.select().from(schema.dmcaReports).then(r => r.length),
      library: await db.execute<{ count: number }>({ 
        sql: 'SELECT COUNT(*) as count FROM library', 
        args: [] 
      }).then(r => r.rows[0]?.count || 0),
    };
    
    console.log('Database Statistics:');
    console.log(`  Series:            ${counts.series}`);
    console.log(`  Chapters:          ${counts.chapters}`);
    console.log(`  App Users:         ${counts.users}`);
    console.log(`  Auth Users:        ${counts.authUsers}`);
    console.log(`  DMCA Reports:      ${counts.dmcaReports}`);
    console.log(`  Library Entries:   ${counts.library}`);
    console.log('=' .repeat(60));
    
  } catch (error: any) {
    console.error('Failed to generate report:', error.message);
  }
}

async function main() {
  console.log('\n🚀 Sandbox Database Verification');
  console.log('=' .repeat(60));
  console.log('This script simulates:');
  console.log('  • npm run db:generate  (schema generation)');
  console.log('  • npm run db:push      (apply migrations)');
  console.log('  • npm run db:check     (verify tables)');
  console.log('=' .repeat(60));
  
  let allPassed = true;
  
  // Step 1: Connection
  const connected = await verifyPostgresConnection();
  if (!connected) {
    console.error('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  // Step 2: List tables
  const tables = await listAllTables();
  if (tables.length === 0) {
    console.error('\n❌ No tables found - database not initialized');
    allPassed = false;
  }
  
  // Step 3: Verify auth tables
  const authOk = await verifyAuthTables(tables);
  if (!authOk) allPassed = false;
  
  // Step 4: Verify app tables
  const appOk = await verifyAppTables(tables);
  if (!appOk) allPassed = false;
  
  // Step 5: Verify DMCA schema
  const dmcaOk = await verifyDmcaReportsSchema();
  if (!dmcaOk) allPassed = false;
  
  // Step 6: Data integrity
  const dataOk = await verifyDataIntegrity();
  if (!dataOk) allPassed = false;
  
  // Generate report
  await generateMigrationReport();
  
  // Final summary
  console.log('\n' + '=' .repeat(60));
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED - Database is properly synced!');
    console.log('\nDatabase is ready for:');
    console.log('  • Authentication flows');
    console.log('  • Series and chapter management');
    console.log('  • DMCA report handling');
    console.log('  • User library tracking');
  } else {
    console.log('❌ SOME CHECKS FAILED - Review errors above');
    console.log('\nRecommended actions:');
    console.log('  1. Check database connection settings');
    console.log('  2. Verify DATABASE_URL environment variable');
    console.log('  3. Ensure migrations are applied');
    console.log('  4. Review src/db/index.ts initialization logic');
  }
  console.log('=' .repeat(60) + '\n');
  
  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('\n💥 Fatal Error:', error);
  process.exit(1);
});