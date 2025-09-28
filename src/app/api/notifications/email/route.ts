import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface EmailBody {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

async function sendViaResend(payload: Required<Pick<EmailBody, "to" | "subject">> & Partial<Pick<EmailBody, "text" | "html" | "from">>) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, status: 501, body: { error: "RESEND_API_KEY not configured" } };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from || "Kenmei <no-reply@kenmei.app>",
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function sendViaSendGrid(payload: Required<Pick<EmailBody, "to" | "subject">> & Partial<Pick<EmailBody, "text" | "html" | "from">>) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return { ok: false as const, status: 501, body: { error: "SENDGRID_API_KEY not configured" } };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: (payload.from || "no-reply@kenmei.app") },
      subject: payload.subject,
      content: [
        payload.html ? { type: "text/html", value: payload.html } : { type: "text/plain", value: payload.text || "" }
      ],
    }),
  });
  let body: any = null;
  try { body = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, body };
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json().catch(() => ({}))) as EmailBody;
    if (!data.to || !data.subject) {
      return NextResponse.json({ error: "Missing 'to' or 'subject'" }, { status: 400 });
    }

    // Prefer Resend if available, fall back to SendGrid; if both missing, mock success
    if (process.env.RESEND_API_KEY) {
      const res = await sendViaResend({ to: data.to, subject: data.subject, text: data.text, html: data.html, from: data.from });
      return NextResponse.json({ provider: "resend", ...res.body }, { status: res.status });
    }
    if (process.env.SENDGRID_API_KEY) {
      const res = await sendViaSendGrid({ to: data.to, subject: data.subject, text: data.text, html: data.html, from: data.from });
      return NextResponse.json({ provider: "sendgrid", ...res.body }, { status: res.status });
    }

    // Mock mode
    return NextResponse.json({ provider: "mock", id: `mock_${Date.now()}`, to: data.to, subject: data.subject }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}