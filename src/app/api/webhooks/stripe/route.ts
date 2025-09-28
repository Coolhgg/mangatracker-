import { NextRequest, NextResponse } from "next/server";

// Minimal Stripe webhook handler (test-mode friendly)
// Validates presence of webhook secret in env; if missing, runs in simulation mode
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // We are not verifying signature here to keep dependencies minimal for MVP
  // In production, use stripe.webhooks.constructEvent with the raw body
  const json = await req.json().catch(() => ({}));

  const eventType = json?.type || "unknown";
  const simulated = !whSecret || !sig;

  // Log for audit trail
  console.log("STRIPE_WEBHOOK", {
    receivedAt: new Date().toISOString(),
    eventType,
    simulated,
  });

  // Handle a few common events
  switch (eventType) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "invoice.payment_succeeded":
      // TODO: upsert customer + product status in DB
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true, simulated, eventType });
}

export async function GET() {
  return NextResponse.json({ webhook: "stripe", ok: true });
}