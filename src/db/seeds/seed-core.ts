import { db } from '@/db';
import { users, series, mangaChapters } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();

    // Create demo user
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

    // Create series
    const sampleSeries = [
        {
            slug: 'one-piece',
            title: 'One Piece',
            description: 'Epic pirate adventure following Monkey D. Luffy on his quest to become Pirate King',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
            sourceName: 'MangaDex',
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
            description: 'The weakest hunter becomes the strongest through a mysterious leveling system',
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

    // Create manga chapters
    const sampleChapters = [
        // One Piece chapters (seriesId: 1)
        {
            seriesId: 1,
            number: 1,
            title: 'Romance Dawn',
            language: 'en',
            publishedAt: '1997-07-22T00:00:00.000Z',
            pages: 54,
            externalId: 'op_ch_001',
            sourceId: 'mangadx_001',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 1,
            number: 2,
            title: 'They Call Him Straw Hat Luffy',
            language: 'en',
            publishedAt: '1997-07-29T00:00:00.000Z',
            pages: 19,
            externalId: 'op_ch_002',
            sourceId: 'mangadx_002',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 1,
            number: 3,
            title: 'Introduce Yourself',
            language: 'en',
            publishedAt: '1997-08-05T00:00:00.000Z',
            pages: 20,
            externalId: 'op_ch_003',
            sourceId: 'mangadx_003',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 1,
            number: 4,
            title: 'The Dawn of Adventure',
            language: 'en',
            publishedAt: '1997-08-12T00:00:00.000Z',
            pages: 19,
            externalId: 'op_ch_004',
            sourceId: 'mangadx_004',
            createdAt: currentTimestamp,
        },
        // Solo Leveling chapters (seriesId: 2)
        {
            seriesId: 2,
            number: 1,
            title: 'The Weakest Hunter',
            language: 'en',
            publishedAt: '2016-07-25T00:00:00.000Z',
            pages: 32,
            externalId: 'sl_ch_001',
            sourceId: 'mangadx_101',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 2,
            number: 2,
            title: 'If I Had Been A Little Stronger',
            language: 'en',
            publishedAt: '2016-08-01T00:00:00.000Z',
            pages: 28,
            externalId: 'sl_ch_002',
            sourceId: 'mangadx_102',
            createdAt: currentTimestamp,
        },
        {
            seriesId: 2,
            number: 3,
            title: 'The System',
            language: 'en',
            publishedAt: '2016-08-08T00:00:00.000Z',
            pages: 35,
            externalId: 'sl_ch_003',
            sourceId: 'mangadx_103',
            createdAt: currentTimestamp,
        }
    ];

    await db.insert(mangaChapters).values(sampleChapters).onConflictDoNothing();

    console.log('✅ Core manga tracker seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});