import { db } from '@/db';
import { sources } from '@/db/schema';

async function main() {
    const sampleSources = [
        {
            id: 1,
            key: "mangadx",
            name: "MangaDx",
            enabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(sources).values(sampleSources);
    
    console.log('✅ Sources seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});