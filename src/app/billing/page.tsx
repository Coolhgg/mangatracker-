export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Billing</h1>
      <p className="text-muted-foreground">Stripe integration coming soon. Visit Pricing to choose a plan.</p>
      <a href="/pricing" className="inline-block mt-4 rounded-md bg-primary text-primary-foreground px-4 py-2">View Pricing</a>
    </div>
  );
}