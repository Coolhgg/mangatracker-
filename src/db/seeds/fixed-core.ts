import { db } from '@/db';
import { users, series, mangaChapters } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();

    // Insert demo user
    const sampleUsers = [
        {
            email: 'demo@example.com',
            name: 'Demo User',
            avatarUrl: null,
            roles: ['user'],
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(users).values(sampleUsers).onConflictDoNothing();

    // Insert series data
    const sampleSeries = [
        {
            slug: 'one-piece',
            title: 'One Piece',
            description: 'Epic pirate adventure following Monkey D. Luffy',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
            sourceName: 'MangaDx',
            sourceUrl: 'https://mangadx.org/title/one-piece',
            tags: ['adventure', 'shounen'],
            rating: 9.2,
            year: 1997,
            status: 'ongoing',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            slug: 'solo-leveling',
            title: 'Solo Leveling',
            description: 'The weakest hunter becomes strongest',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/3/222295.jpg',
            sourceName: 'MangaDx',
            sourceUrl: 'https://mangadx.org/title/solo-leveling',
            tags: ['action', 'fantasy'],
            rating: 8.9,
            year: 2016,
            status: 'completed',
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(series).values(sampleSeries).onConflictDoNothing();

    // Insert manga chapters
    const sampleChapters = [
        // One Piece chapters (seriesId: 1)
        {
            seriesId: 1,
            number: 1,
            title: 'Romance Dawn',
            language: 'en',
            publishedAt: new Date('1997-07-22').toISOString(),
            pages: 54,
            externalId: 'op_001',
            sourceId: 'mangadx_op_001',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 1,
            number: 2,
            title: 'They Call Him Straw Hat Luffy',
            language: 'en',
            publishedAt: new Date('1997-07-29').toISOString(),
            pages: 19,
            externalId: 'op_002',
            sourceId: 'mangadx_op_002',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 1,
            number: 3,
            title: 'Introduce Yourself',
            language: 'en',
            publishedAt: new Date('1997-08-05').toISOString(),
            pages: 20,
            externalId: 'op_003',
            sourceId: 'mangadx_op_003',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 1,
            number: 4,
            title: 'The Dawn of Adventure',
            language: 'en',
            publishedAt: new Date('1997-08-12').toISOString(),
            pages: 21,
            externalId: 'op_004',
            sourceId: 'mangadx_op_004',
            createdAt: currentTimestamp,
        },
        // Solo Leveling chapters (seriesId: 2)
        {
            seriesId: 2,
            number: 1,
            title: 'The Weakest Hunter',
            language: 'en',
            publishedAt: new Date('2016-07-25').toISOString(),
            pages: 35,
            externalId: 'sl_001',
            sourceId: 'mangadx_sl_001',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 2,
            number: 2,
            title: 'If I Had Been A Little Stronger',
            language: 'en',
            publishedAt: new Date('2016-08-01').toISOString(),
            pages: 28,
            externalId: 'sl_002',
            sourceId: 'mangadx_sl_002',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 2,
            number: 3,
            title: 'The System',
            language: 'en',
            publishedAt: new Date('2016-08-08').toISOString(),
            pages: 32,
            externalId: 'sl_003',
            sourceId: 'mangadx_sl_003',
            createdAt: currentTimestamp,
        }
    ];

    await db.insert(mangaChapters).values(sampleChapters).onConflictDoNothing();

    console.log('✅ Seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});