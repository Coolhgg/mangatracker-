/**
 * Email notification service using Resend
 * Falls back to console logging if Resend is not configured
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private resendKey: string | undefined;

  constructor() {
    this.resendKey = process.env.RESEND_API_KEY;
  }

  async sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
    if (!this.resendKey) {
      console.log('[email] Resend not configured. Email would have been sent:', payload);
      return { success: true };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.resendKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'noreply@kenmei.co',
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('[email] Resend error:', error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error: any) {
      console.error('[email] Send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendChapterNotification(params: {
    userEmail: string;
    userName: string;
    seriesTitle: string;
    chapterNumber: number;
    seriesSlug: string;
  }) {
    const { userEmail, userName, seriesTitle, chapterNumber, seriesSlug } = params;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const chapterUrl = `${siteUrl}/series/${seriesSlug}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 New Chapter Available!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>A new chapter of <strong>${seriesTitle}</strong> is now available:</p>
            <p style="font-size: 18px; margin: 20px 0;"><strong>Chapter ${chapterNumber}</strong></p>
            <a href="${chapterUrl}" class="button">Read Now</a>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              You're receiving this because you have notifications enabled for this series.
              You can manage your notification preferences in your library settings.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Kenmei. All rights reserved.</p>
            <p><a href="${siteUrl}/account">Manage Preferences</a> | <a href="${siteUrl}/legal/privacy">Privacy Policy</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `New Chapter: ${seriesTitle} - Chapter ${chapterNumber}`,
      html,
    });
  }

  async sendCommentReplyNotification(params: {
    userEmail: string;
    userName: string;
    replierName: string;
    seriesTitle: string;
    commentPreview: string;
    seriesSlug: string;
  }) {
    const { userEmail, userName, replierName, seriesTitle, commentPreview, seriesSlug } = params;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const seriesUrl = `${siteUrl}/series/${seriesSlug}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .comment-box { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Reply to Your Comment</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p><strong>${replierName}</strong> replied to your comment on <strong>${seriesTitle}</strong>:</p>
            <div class="comment-box">
              <p style="margin: 0;">${commentPreview}</p>
            </div>
            <a href="${seriesUrl}" class="button">View Discussion</a>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              You're receiving this because someone replied to your comment.
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Kenmei. All rights reserved.</p>
            <p><a href="${siteUrl}/account">Manage Preferences</a> | <a href="${siteUrl}/legal/privacy">Privacy Policy</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `${replierName} replied to your comment on ${seriesTitle}`,
      html,
    });
  }
}

export const emailService = new EmailService();