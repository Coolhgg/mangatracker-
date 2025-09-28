// ... keep existing code ...
// replace entire script with a thin delegator to the existing Next.js seed API
// This avoids using incompatible db.run/db.get methods and unifies seeding logic.

async function main() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const url = `${base.replace(/\/$/, '')}/api/dev/seed`;
  try {
    console.log('🚀 Triggering app seed via', url);
    const res = await fetch(url, { method: 'POST' });
    const text = await res.text();
    if (!res.ok) {
      console.error('❌ Seed API responded with error', res.status, text);
      process.exit(1);
      return;
    }
    console.log('✅ Seed API completed successfully');
    console.log(text);
  } catch (error) {
    console.error('❌ Database setup failed (delegated seed):', error);
    process.exit(1);
  }
}

main();