import { runMinimalSeed } from "./minimal_test_data";

export async function runCorrectedSeed() {
  // Run the minimal seed first (idempotent)
  const base = await runMinimalSeed();
  return { ok: true, ...base };
}

// Allow running via: pnpm tsx src/db/seeds/corrected_minimal.ts
if (require.main === module) {
  runCorrectedSeed()
    .then((res) => {
      // eslint-disable-next-line no-console
      console.log("🌱 Corrected minimal seed complete:", res);
      process.exit(0);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Seed failed:", err);
      process.exit(1);
    });
}