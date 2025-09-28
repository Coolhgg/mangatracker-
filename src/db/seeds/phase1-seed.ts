import { db } from '@/db';
import { users, sources, seriesTable, seriesSourcesTable, chaptersTable, userLibrary } from '@/db/schema';

async function main() {
    // 1. Create Admin User
    const adminUser = {
        email: 'admin@example.com',
        name: 'Admin',
        passwordHash: '$2b$10$placeholder.hash.for.testing',
        roles: ['admin'],
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(users).values([adminUser]);

    // 2. Create Sources
    const sampleSources = [
        {
            name: 'MangaDx',
            domain: 'mangadx.org',
            apiType: 'api' as const,
            verified: true,
            legalRisk: 'low' as const,
            trustScore: 95,
            robotsAllowed: true,
            tosSummary: 'Allows non-commercial use and fan translations. Respects DMCA requests.',
            enabled: true,
            metadata: {
                apiVersion: '5.0',
                rateLimit: '40/min',
                authentication: 'optional'
            },
            lastChecked: new Date('2024-01-20').toISOString(),
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            name: 'AniList',
            domain: 'anilist.co',
            apiType: 'api' as const,
            verified: true,
            legalRisk: 'low' as const,
            trustScore: 90,
            robotsAllowed: true,
            tosSummary: 'Metadata aggregator with community-driven content. Follows copyright guidelines.',
            enabled: true,
            metadata: {
                apiVersion: '2.0',
                rateLimit: '90/min',
                authentication: 'required'
            },
            lastChecked: new Date('2024-01-19').toISOString(),
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-19').toISOString(),
        },
        {
            name: 'Example Scrape',
            domain: 'example-scrape.site',
            apiType: 'scrape' as const,
            verified: false,
            legalRisk: 'high' as const,
            trustScore: 10,
            robotsAllowed: false,
            tosSummary: 'Unverified aggregator site. Legal status unknown.',
            enabled: true,
            metadata: {
                scrapeMethod: 'dom',
                retryDelay: '5000ms',
                userAgent: 'custom'
            },
            lastChecked: new Date('2024-01-18').toISOString(),
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        }
    ];

    await db.insert(sources).values(sampleSources);

    // 3. Create Sample Series
    const sampleSeries = [
        {
            title: 'One Piece',
            slug: 'one-piece',
            description: 'Follow Monkey D. Luffy and his Straw Hat Pirates on their epic adventure to find the legendary treasure known as One Piece and become the Pirate King.',
            tags: ['action', 'adventure', 'shounen'],
            canonicalSourceId: 1,
            coverUrl: 'https://placeholder.example.com/covers/one-piece.jpg',
            altTitles: ['ワンピース'],
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            title: 'Attack on Titan',
            slug: 'attack-on-titan',
            description: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.',
            tags: ['action', 'drama', 'shounen'],
            canonicalSourceId: 1,
            coverUrl: 'https://placeholder.example.com/covers/attack-on-titan.jpg',
            altTitles: ['進撃の巨人', 'Shingeki no Kyojin'],
            createdAt: new Date('2024-01-13').toISOString(),
        },
        {
            title: 'Demon Slayer',
            slug: 'demon-slayer',
            description: 'A young boy becomes a demon slayer to avenge his family and cure his sister who has been turned into a demon.',
            tags: ['action', 'supernatural', 'shounen'],
            canonicalSourceId: 1,
            coverUrl: 'https://placeholder.example.com/covers/demon-slayer.jpg',
            altTitles: ['鬼滅の刃', 'Kimetsu no Yaiba'],
            createdAt: new Date('2024-01-14').toISOString(),
        }
    ];

    await db.insert(seriesTable).values(sampleSeries);

    // 4. Create Series Sources (link series to sources)
    const sampleSeriesSources = [
        {
            seriesId: 1,
            sourceId: 1,
            sourceSeriesId: 'one-piece-123',
            url: 'https://mangadx.org/title/one-piece-123',
            language: 'en',
            lastChecked: new Date('2024-01-20').toISOString(),
        },
        {
            seriesId: 2,
            sourceId: 1,
            sourceSeriesId: 'aot-456',
            url: 'https://mangadx.org/title/aot-456',
            language: 'en',
            lastChecked: new Date('2024-01-20').toISOString(),
        },
        {
            seriesId: 3,
            sourceId: 1,
            sourceSeriesId: 'demon-slayer-789',
            url: 'https://mangadx.org/title/demon-slayer-789',
            language: 'en',
            lastChecked: new Date('2024-01-20').toISOString(),
        }
    ];

    await db.insert(seriesSourcesTable).values(sampleSeriesSources);

    // 5. Create Sample Chapters (3 chapters per series)
    const sampleChapters = [
        // One Piece chapters
        {
            seriesId: 1,
            sourceId: 1,
            sourceChapterId: 'one-piece-ch1',
            title: 'Chapter 1: Romance Dawn',
            number: 1,
            publishedAt: new Date('2024-01-15').toISOString(),
            url: 'https://mangadx.org/chapter/one-piece-ch1',
        },
        {
            seriesId: 1,
            sourceId: 1,
            sourceChapterId: 'one-piece-ch2',
            title: 'Chapter 2: The Man Called Pirate Hunter',
            number: 2,
            publishedAt: new Date('2024-01-16').toISOString(),
            url: 'https://mangadx.org/chapter/one-piece-ch2',
        },
        {
            seriesId: 1,
            sourceId: 1,
            sourceChapterId: 'one-piece-ch3',
            title: 'Chapter 3: Introduce Yourself',
            number: 3,
            publishedAt: new Date('2024-01-17').toISOString(),
            url: 'https://mangadx.org/chapter/one-piece-ch3',
        },
        // Attack on Titan chapters
        {
            seriesId: 2,
            sourceId: 1,
            sourceChapterId: 'aot-ch1',
            title: 'Chapter 1: To You, 2000 Years From Now',
            number: 1,
            publishedAt: new Date('2024-01-15').toISOString(),
            url: 'https://mangadx.org/chapter/aot-ch1',
        },
        {
            seriesId: 2,
            sourceId: 1,
            sourceChapterId: 'aot-ch2',
            title: 'Chapter 2: That Day',
            number: 2,
            publishedAt: new Date('2024-01-16').toISOString(),
            url: 'https://mangadx.org/chapter/aot-ch2',
        },
        {
            seriesId: 2,
            sourceId: 1,
            sourceChapterId: 'aot-ch3',
            title: 'Chapter 3: Night of the Disbanding Ceremony',
            number: 3,
            publishedAt: new Date('2024-01-17').toISOString(),
            url: 'https://mangadx.org/chapter/aot-ch3',
        },
        // Demon Slayer chapters
        {
            seriesId: 3,
            sourceId: 1,
            sourceChapterId: 'demon-slayer-ch1',
            title: 'Chapter 1: Cruelty',
            number: 1,
            publishedAt: new Date('2024-01-15').toISOString(),
            url: 'https://mangadx.org/chapter/demon-slayer-ch1',
        },
        {
            seriesId: 3,
            sourceId: 1,
            sourceChapterId: 'demon-slayer-ch2',
            title: 'Chapter 2: Stranger',
            number: 2,
            publishedAt: new Date('2024-01-16').toISOString(),
            url: 'https://mangadx.org/chapter/demon-slayer-ch2',
        },
        {
            seriesId: 3,
            sourceId: 1,
            sourceChapterId: 'demon-slayer-ch3',
            title: 'Chapter 3: Sabito and Makomo',
            number: 3,
            publishedAt: new Date('2024-01-17').toISOString(),
            url: 'https://mangadx.org/chapter/demon-slayer-ch3',
        }
    ];

    await db.insert(chaptersTable).values(sampleChapters);

    // 6. Create User Library Entry
    const libraryEntry = {
        userId: 1,
        seriesId: 1,
        status: 'reading' as const,
        rating: 5,
        notes: 'Great adventure story!',
        lastReadChapterId: 1,
    };

    await db.insert(userLibrary).values([libraryEntry]);

    console.log('✅ Phase 1 seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});