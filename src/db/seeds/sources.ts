import { db } from '@/db';
import { sources } from '@/db/schema';

async function main() {
    const currentTime = new Date();
    
    const sampleSources = [
        {
            name: "MangaDex",
            domain: "mangadex.org",
            apiType: "rest",
            verified: true,
            legalRisk: "low",
            trustScore: 95,
            enabled: true,
            robotsAllowed: true,
            tosSummary: "Community-driven manga platform",
            metadata: { rateLimit: "5/second", apiVersion: "v5" },
            lastChecked: currentTime,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
        {
            name: "Viz Media",
            domain: "viz.com",
            apiType: null,
            verified: true,
            legalRisk: "none",
            trustScore: 100,
            enabled: true,
            robotsAllowed: false,
            tosSummary: "Official manga publisher",
            metadata: { official: true },
            lastChecked: currentTime,
            createdAt: currentTime,
            updatedAt: currentTime,
        },
    ];

    for (const source of sampleSources) {
        await db
            .insert(sources)
            .values(source)
            .onConflictDoUpdate({
                target: sources.domain,
                set: {
                    name: source.name,
                    apiType: source.apiType,
                    verified: source.verified,
                    legalRisk: source.legalRisk,
                    trustScore: source.trustScore,
                    enabled: source.enabled,
                    robotsAllowed: source.robotsAllowed,
                    tosSummary: source.tosSummary,
                    metadata: source.metadata,
                    lastChecked: source.lastChecked,
                    updatedAt: currentTime,
                },
            });
    }
    
    const count = await db.select().from(sources);
    console.log(`✅ Sources seeder completed: ${count.length} records`);
}

main().catch((error) => {
    console.error('❌ Sources seeder failed:', error);
    process.exit(1);
});