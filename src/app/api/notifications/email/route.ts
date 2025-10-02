import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/notifications/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    if (!type) {
      return NextResponse.json({ error: 'Missing notification type' }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'chapter':
        if (!params.userEmail || !params.seriesTitle || !params.chapterNumber || !params.seriesSlug) {
          return NextResponse.json({ error: 'Missing required chapter notification params' }, { status: 400 });
        }
        result = await emailService.sendChapterNotification(params);
        break;

      case 'comment_reply':
        if (!params.userEmail || !params.replierName || !params.seriesTitle || !params.seriesSlug) {
          return NextResponse.json({ error: 'Missing required comment reply params' }, { status: 400 });
        }
        result = await emailService.sendCommentReplyNotification(params);
        break;

      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/notifications/email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}