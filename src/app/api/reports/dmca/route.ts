/**
 * POST /api/reports/dmca - Submit DMCA takedown report
 * 
 * Body:
 * - url: string (required) - URL of infringing content
 * - reporter_email: string (required) - Email of reporter  
 * - message: string (required) - Description of infringement
 * - reporter_name: string (optional) - Name of reporter
 * - work_title: string (optional) - Title of copyrighted work
 * 
 * Creates audit log entry and may auto-disable sources/series based on URL.
 * No email notification in Phase 1.
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory IP rate limiter (best-effort; single instance only)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 10; // max requests per window per IP
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string | null) {
  const key = ip || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetAt: entry.resetAt };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP (best-effort from x-forwarded-for)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || null;
    const rl = checkRateLimit(ip);
    if (!rl.allowed) {
      return new NextResponse(JSON.stringify({
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMITED'
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000)).toString(),
        },
      });
    }

    // Enforce JSON content-type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json', code: 'INVALID_CONTENT_TYPE' }, { status: 415 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      url, 
      reporter_email, 
      message, 
      reporter_name, 
      work_title 
    } = body || {};

    // Validate required fields
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        error: 'URL is required and must be a string',
        code: 'MISSING_URL' 
      }, { status: 400 });
    }

    if (!reporter_email || typeof reporter_email !== 'string') {
      return NextResponse.json({ 
        error: 'Reporter email is required',
        code: 'MISSING_REPORTER_EMAIL' 
      }, { status: 400 });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ 
        error: 'Message describing the infringement is required',
        code: 'MISSING_MESSAGE' 
      }, { status: 400 });
    }

    // Length and basic sanitation limits
    if (url.length > 2048) {
      return NextResponse.json({ error: 'URL is too long', code: 'URL_TOO_LONG' }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: 'Message too long (max 4000 chars)', code: 'MESSAGE_TOO_LONG' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reporter_email)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL' 
      }, { status: 400 });
    }

    // Validate URL format and protocol (http/https only)
    let parsedUrl: URL | null = null;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'URL must use http or https', code: 'INVALID_URL_PROTOCOL' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format', code: 'INVALID_URL' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const reportId = `dmca_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Mock audit log entry for the DMCA report
    const auditPayload = {
      reportId,
      url: parsedUrl.toString(),
      reporter_email,
      reporter_name: reporter_name || null,
      work_title: work_title || null,
      message: message.trim(),
      ip_address: ip || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    };

    // Mock auto-disable logic: check if URL belongs to any tracked sources
    let disabledSources: Array<{ id: number; name: string; domain: string }> = [];
    let disabledSeries: Array<{ id: number; title: string; slug: string; action: string }> = [];

    try {
      const domain = parsedUrl.hostname.toLowerCase();

      // Mock sources that would be affected
      if (domain.includes('example-scrape.site')) {
        disabledSources.push({
          id: 3,
          name: 'Example Scrape',
          domain: 'example-scrape.site'
        });
      }

      // Mock series that might be flagged
      const urlPath = parsedUrl.pathname.toLowerCase();
      if (urlPath.includes('one-piece')) {
        disabledSeries.push({
          id: 1,
          title: 'One Piece',
          slug: 'one-piece',
          action: 'flagged_for_review'
        });
      }

    } catch (urlError) {
      // Should not happen since we validated URL above
      console.warn('URL processing error in DMCA report:', urlError);
    }

    // Log to console for legal team monitoring (in production, this would go to audit logs table)
    console.log('DMCA_REPORT_RECEIVED', {
      reportId,
      timestamp: now,
      reporter_email,
      work_title,
      url: parsedUrl.toString(),
      disabledSourcesCount: disabledSources.length,
      flaggedSeriesCount: disabledSeries.length,
      auditPayload
    });

    // Return success response with tracking info
    return NextResponse.json({
      success: true,
      reportId,
      message: 'DMCA report submitted successfully',
      timestamp: now,
      actions: {
        sourcesDisabled: disabledSources.length,
        seriesFlagged: disabledSeries.length,
      },
      details: {
        disabledSources,
        flaggedSeries: disabledSeries,
      }
    }, { status: 201, headers: {
      'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
      'X-RateLimit-Remaining': Math.max(0, rl.remaining).toString(),
      'X-RateLimit-Reset': Math.ceil(rl.resetAt / 1000).toString(),
    }});

  } catch (error) {
    console.error('POST /api/reports/dmca error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}