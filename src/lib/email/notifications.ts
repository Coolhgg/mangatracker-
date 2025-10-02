/**
 * Email notification helper using Resend
 * Falls back to console logging in development
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'notifications@kenmei.co';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!IS_PRODUCTION || !RESEND_API_KEY) {
    console.log('[DEV] Email would be sent:', options);
    return true;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Email] Send failed:', error);
      return false;
    }

    console.log('[Email] Sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('[Email] Error:', error);
    return false;
  }
}

export async function sendChapterNotification(params: {
  userEmail: string;
  seriesTitle: string;
  chapterNumber: number;
  chapterTitle?: string;
  seriesSlug: string;
}) {
  const { userEmail, seriesTitle, chapterNumber, chapterTitle, seriesSlug } = params;
  
  const subject = `New Chapter: ${seriesTitle} - Chapter ${chapterNumber}`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const seriesUrl = `${baseUrl}/series/${seriesSlug}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px;">
                  <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">
                    📚 New Chapter Available!
                  </h1>
                  <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                    A new chapter of <strong>${seriesTitle}</strong> is now available.
                  </p>
                  <div style="background-color: #f9f9f9; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                      Chapter ${chapterNumber}${chapterTitle ? `: ${chapterTitle}` : ''}
                    </p>
                  </div>
                  <table role="presentation" style="margin: 32px 0;">
                    <tr>
                      <td>
                        <a href="${seriesUrl}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          Read Now
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 32px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                    You're receiving this email because you enabled notifications for ${seriesTitle}. 
                    You can manage your notification preferences in your account settings.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    © ${new Date().getFullYear()} Kenmei. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject,
    html,
  });
}

export async function sendCommentReplyNotification(params: {
  userEmail: string;
  seriesTitle: string;
  commenterName: string;
  commentPreview: string;
  seriesSlug: string;
}) {
  const { userEmail, seriesTitle, commenterName, commentPreview, seriesSlug } = params;
  
  const subject = `New Reply: ${commenterName} replied to your comment`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const seriesUrl = `${baseUrl}/series/${seriesSlug}#comments`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px;">
                  <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">
                    💬 New Comment Reply
                  </h1>
                  <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a4a4a; line-height: 1.5;">
                    <strong>${commenterName}</strong> replied to your comment on <strong>${seriesTitle}</strong>.
                  </p>
                  <div style="background-color: #f9f9f9; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      "${commentPreview.substring(0, 200)}${commentPreview.length > 200 ? '...' : ''}"
                    </p>
                  </div>
                  <table role="presentation" style="margin: 32px 0;">
                    <tr>
                      <td>
                        <a href="${seriesUrl}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                          View Reply
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 32px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                    You're receiving this email because you have comment notifications enabled. 
                    You can manage your notification preferences in your account settings.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    © ${new Date().getFullYear()} Kenmei. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    subject,
    html,
  });
}