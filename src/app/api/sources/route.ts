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

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return mock data if database tables don't exist yet
    // In production, this would query the actual sources table
    
    const { searchParams } = new URL(request.url);
    const includeUnverified = searchParams.get('includeUnverified') === 'true';
    const enabledFilter = searchParams.get('enabled');

    // Mock sources data that matches the schema
    const mockSources = [
      {
        id: 1,
        name: 'MangaDx',
        domain: 'mangadx.org',
        apiType: 'api',
        verified: true,
        legalRisk: 'low',
        trustScore: 95,
        enabled: true,
        robotsAllowed: true,
        tosSummary: 'Community-driven platform with fair use policies',
        metadata: { apiVersion: '5.0', rateLimit: '40/min' },
        lastChecked: '2024-01-20T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: 2,
        name: 'AniList',
        domain: 'anilist.co',
        apiType: 'api',
        verified: true,
        legalRisk: 'low',
        trustScore: 98,
        enabled: true,
        robotsAllowed: true,
        tosSummary: 'Official database with proper licensing agreements',
        metadata: { apiVersion: '2.0', authentication: 'required' },
        lastChecked: '2024-01-19T00:00:00.000Z',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-19T00:00:00.000Z'
      },
      {
        id: 3,
        name: 'Example Scrape',
        domain: 'example-scrape.site',
        apiType: 'scrape',
        verified: false,
        legalRisk: 'high',
        trustScore: 10,
        enabled: true,
        robotsAllowed: false,
        tosSummary: 'Unverified aggregator site. Legal status unknown.',
        metadata: { scrapeMethod: 'dom', userAgent: 'custom' },
        lastChecked: '2024-01-18T00:00:00.000Z',
        createdAt: '2024-01-05T00:00:00.000Z',
        updatedAt: '2024-01-18T00:00:00.000Z'
      }
    ];

    // Apply legal guardrails
    let filteredSources = mockSources;
    
    if (!includeUnverified) {
      filteredSources = filteredSources.filter(source => source.verified);
    }
    
    if (enabledFilter !== null) {
      const isEnabled = enabledFilter === 'true';
      filteredSources = filteredSources.filter(source => source.enabled === isEnabled);
    }

    // Sort by trust score (high to low), then by name
    filteredSources.sort((a, b) => {
      if (a.trustScore !== b.trustScore) {
        return b.trustScore - a.trustScore;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(filteredSources);
  } catch (error: any) {
    console.error('GET /api/sources error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}