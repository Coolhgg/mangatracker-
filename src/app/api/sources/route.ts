/**
 * GET /api/sources - List sources with legal guardrails
 * 
 * Query parameters:
 * - includeUnverified: boolean (default: false) - Include unverified sources  
 * - enabled: boolean - Filter by enabled status
 * 
 * Returns array of sources with legal compliance fields.
 * Default behavior: Only returns verified sources unless includeUnverified=true.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sources } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeUnverified = searchParams.get('includeUnverified') === 'true';
    const enabledFilter = searchParams.get('enabled');

    let query = db.select().from(sources);

    const results = await query;
    
    let filtered = results;
    
    if (!includeUnverified) {
      filtered = filtered.filter(source => source.verified);
    }
    
    if (enabledFilter !== null) {
      const isEnabled = enabledFilter === 'true';
      filtered = filtered.filter(source => source.enabled === isEnabled);
    }

    filtered.sort((a, b) => {
      if (a.trustScore !== b.trustScore) {
        return b.trustScore - a.trustScore;
      }
      return a.name.localeCompare(b.name);
    });

    // Map to camelCase for API consistency
    const items = filtered.map(s => ({
      id: s.id,
      name: s.name,
      domain: s.domain,
      apiType: s.apiType,
      verified: s.verified,
      legalRisk: s.legalRisk,
      trustScore: s.trustScore,
      enabled: s.enabled,
      robotsAllowed: s.robotsAllowed,
      tosSummary: s.tosSummary,
      metadata: s.metadata,
      lastChecked: s.lastChecked,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('GET /api/sources error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    
    const [newSource] = await db.insert(sources).values({
      name: body.name,
      domain: body.domain,
      apiType: body.apiType || 'api',
      verified: body.verified ?? false,
      legalRisk: body.legalRisk || 'low',
      trustScore: body.trustScore ?? 50,
      enabled: body.enabled ?? true,
      robotsAllowed: body.robotsAllowed ?? true,
      tosSummary: body.tosSummary,
      metadata: body.metadata || {},
      lastChecked: body.lastChecked || now,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return NextResponse.json(newSource, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/sources error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}