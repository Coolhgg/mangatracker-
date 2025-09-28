import { db } from '@/db';
import { users, sources, seriesTable, seriesSourcesTable, chaptersTable, userLibrary } from '@/db/schema';

async function main() {
    try {
        // 1. Create admin user
        const adminUser = {
            email: 'admin@example.com',
            name: 'Admin',
            roles: ['admin'],
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        };

        await db.insert(users).values(adminUser).onConflictDoNothing();

        // 2. Create sources
        const sampleSources = [
            {
                name: 'MangaDx',
                domain: 'mangadx.org',
                apiType: 'api' as const,
                verified: true,
                legalRisk: 'low' as const,
                trustScore: 95,
                enabled: true,
                robotsAllowed: true,
                tosSummary: 'Community-driven platform with fair use policies',
                createdAt: new Date('2024-01-01').toISOString(),
                updatedAt: new Date('2024-01-01').toISOString(),
            },
            {
                name: 'AniList',
                domain: 'anilist.co',
                apiType: 'api' as const,
                verified: true,
                legalRisk: 'low' as const,
                trustScore: 98,
                enabled: true,
                robotsAllowed: true,
                tosSummary: 'Official database with proper licensing agreements',
                createdAt: new Date('2024-01-02').toISOString(),
                updatedAt: new Date('2024-01-02').toISOString(),
            },
            {
                name: 'Example Scrape',
                domain: 'example-manga.com',
                apiType: 'scrape' as const,
                verified: false,
                legalRisk: 'medium' as const,
                trustScore: 60,
                enabled: true,
                robotsAllowed: false,
                tosSummary: 'Third-party aggregator with unclear licensing',
                createdAt: new Date('2024-01-03').toISOString(),
                updatedAt: new Date('2024-01-03').toISOString(),
            },
        ];

        await db.insert(sources).values(sampleSources).onConflictDoNothing();

        // 3. Create series
        const sampleSeries = [
            {
                title: 'One Piece',
                altTitles: ['ワンピース', 'Wan Pīsu'],
                slug: 'one-piece',
                description: 'The story follows Monkey D. Luffy, a young pirate whose body gained the properties of rubber after unintentionally eating a Devil Fruit.',
                tags: ['adventure', 'comedy', 'drama', 'shounen'],
                canonicalSourceId: 1,
                coverUrl: 'https://example.com/covers/one-piece.jpg',
                createdAt: new Date('2024-01-05').toISOString(),
            },
            {
                title: 'Attack on Titan',
                altTitles: ['進撃の巨人', 'Shingeki no Kyojin'],
                slug: 'attack-on-titan',
                description: 'Humanity fights for survival against giant humanoid Titans that have brought them to the brink of extinction.',
                tags: ['action', 'drama', 'fantasy', 'shounen'],
                canonicalSourceId: 1,
                coverUrl: 'https://example.com/covers/attack-on-titan.jpg',
                createdAt: new Date('2024-01-06').toISOString(),
            },
            {
                title: 'Demon Slayer',
                altTitles: ['鬼滅の刃', 'Kimetsu no Yaiba'],
                slug: 'demon-slayer',
                description: 'A young boy becomes a demon slayer to avenge his family and cure his demon-turned sister.',
                tags: ['action', 'supernatural', 'historical', 'shounen'],
                canonicalSourceId: 1,
                coverUrl: 'https://example.com/covers/demon-slayer.jpg',
                createdAt: new Date('2024-01-07').toISOString(),
            },
        ];

        await db.insert(seriesTable).values(sampleSeries).onConflictDoNothing();

        // 4. Create series-source links
        const seriesSourceLinks = [
            {
                seriesId: 1,
                sourceId: 1,
                sourceSeriesId: 'one-piece-md',
                url: 'https://mangadx.org/series/one-piece',
                language: 'en',
                lastChecked: new Date('2024-01-10').toISOString(),
            },
            {
                seriesId: 1,
                sourceId: 2,
                sourceSeriesId: 'one-piece-al',
                url: 'https://anilist.co/manga/one-piece',
                language: 'en',
                lastChecked: new Date('2024-01-10').toISOString(),
            },
            {
                seriesId: 2,
                sourceId: 1,
                sourceSeriesId: 'attack-on-titan-md',
                url: 'https://mangadx.org/series/attack-on-titan',
                language: 'en',
                lastChecked: new Date('2024-01-11').toISOString(),
            },
            {
                seriesId: 2,
                sourceId: 2,
                sourceSeriesId: 'attack-on-titan-al',
                url: 'https://anilist.co/manga/attack-on-titan',
                language: 'en',
                lastChecked: new Date('2024-01-11').toISOString(),
            },
            {
                seriesId: 3,
                sourceId: 1,
                sourceSeriesId: 'demon-slayer-md',
                url: 'https://mangadx.org/series/demon-slayer',
                language: 'en',
                lastChecked: new Date('2024-01-12').toISOString(),
            },
            {
                seriesId: 3,
                sourceId: 3,
                sourceSeriesId: 'demon-slayer-es',
                url: 'https://example-manga.com/series/demon-slayer',
                language: 'en',
                lastChecked: new Date('2024-01-12').toISOString(),
            },
        ];

        await db.insert(seriesSourcesTable).values(seriesSourceLinks).onConflictDoNothing();

        // 5. Create sample chapters (3 per series)
        const sampleChapters = [
            // One Piece chapters
            {
                seriesId: 1,
                sourceId: 1,
                sourceChapterId: 'op-ch-1',
                title: 'Romance Dawn',
                number: 1,
                publishedAt: new Date('2024-01-15').toISOString(),
                url: 'https://mangadx.org/chapter/one-piece-1',
            },
            {
                seriesId: 1,
                sourceId: 1,
                sourceChapterId: 'op-ch-2',
                title: 'That Man "Straw Hat Luffy"',
                number: 2,
                publishedAt: new Date('2024-01-16').toISOString(),
                url: 'https://mangadx.org/chapter/one-piece-2',
            },
            {
                seriesId: 1,
                sourceId: 1,
                sourceChapterId: 'op-ch-3',
                title: 'Introduce Yourself',
                number: 3,
                publishedAt: new Date('2024-01-17').toISOString(),
                url: 'https://mangadx.org/chapter/one-piece-3',
            },
            // Attack on Titan chapters
            {
                seriesId: 2,
                sourceId: 1,
                sourceChapterId: 'aot-ch-1',
                title: 'To You, 2,000 Years From Now',
                number: 1,
                publishedAt: new Date('2024-01-18').toISOString(),
                url: 'https://mangadx.org/chapter/attack-on-titan-1',
            },
            {
                seriesId: 2,
                sourceId: 1,
                sourceChapterId: 'aot-ch-2',
                title: 'That Day',
                number: 2,
                publishedAt: new Date('2024-01-19').toISOString(),
                url: 'https://mangadx.org/chapter/attack-on-titan-2',
            },
            {
                seriesId: 2,
                sourceId: 1,
                sourceChapterId: 'aot-ch-3',
                title: 'A Dim Light Amid Despair',
                number: 3,
                publishedAt: new Date('2024-01-20').toISOString(),
                url: 'https://mangadx.org/chapter/attack-on-titan-3',
            },
            // Demon Slayer chapters
            {
                seriesId: 3,
                sourceId: 1,
                sourceChapterId: 'ds-ch-1',
                title: 'Cruelty',
                number: 1,
                publishedAt: new Date('2024-01-21').toISOString(),
                url: 'https://mangadx.org/chapter/demon-slayer-1',
            },
            {
                seriesId: 3,
                sourceId: 1,
                sourceChapterId: 'ds-ch-2',
                title: 'Stranger',
                number: 2,
                publishedAt: new Date('2024-01-22').toISOString(),
                url: 'https://mangadx.org/chapter/demon-slayer-2',
            },
            {
                seriesId: 3,
                sourceId: 1,
                sourceChapterId: 'ds-ch-3',
                title: 'Sabito and Makomo',
                number: 3,
                publishedAt: new Date('2024-01-23').toISOString(),
                url: 'https://mangadx.org/chapter/demon-slayer-3',
            },
        ];

        await db.insert(chaptersTable).values(sampleChapters).onConflictDoNothing();

        // 6. Create library entry for admin user
        const adminLibraryEntries = [
            {
                userId: 1,
                seriesId: 1,
                status: 'reading' as const,
                rating: 5,
                notes: 'Amazing adventure series, love the world building',
                lastReadChapterId: 3,
            },
            {
                userId: 1,
                seriesId: 2,
                status: 'completed' as const,
                rating: 5,
                notes: 'Incredible story with amazing plot twists',
                lastReadChapterId: 6,
            },
            {
                userId: 1,
                seriesId: 3,
                status: 'reading' as const,
                rating: 4,
                notes: 'Great action and character development',
                lastReadChapterId: 8,
            },
        ];

        await db.insert(userLibrary).values(adminLibraryEntries).onConflictDoNothing();

        console.log('✅ Phase 1 seeder completed successfully');
    } catch (error) {
        console.error('❌ Phase 1 seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});