import { db } from '@/db';
import { users, series, mangaChapters, mangaComments } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();

    // Insert one user
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

    await db.insert(users).values(sampleUsers);

    // Insert two series
    const sampleSeries = [
        {
            slug: 'one-piece',
            title: 'One Piece',
            description: 'Follow Monkey D. Luffy and his Straw Hat Pirates on their epic adventure to find the legendary treasure known as One Piece and become the Pirate King.',
            tags: ['adventure', 'shounen', 'pirates'],
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
            sourceName: 'MangaDX',
            sourceUrl: 'https://mangadx.org/title/a96676e5-8ae2-425e-b549-7f15dd34a6d8',
            year: 1997,
            status: 'ongoing',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            slug: 'solo-leveling',
            title: 'Solo Leveling',
            description: 'In a world where hunters with various magical powers battle monsters from invading the defenceless humanity, Sung Jin-Woo was the weakest of all the hunters, barely able to make a living.',
            tags: ['action', 'fantasy', 'manhwa'],
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/3/222295.jpg',
            sourceName: 'MangaDX',
            sourceUrl: 'https://mangadx.org/title/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
            year: 2018,
            status: 'completed',
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        }
    ];

    await db.insert(series).values(sampleSeries);

    // Insert 10 manga chapters (5 per series)
    const sampleChapters = [
        // One Piece chapters (seriesId: 1)
        {
            seriesId: 1,
            number: 1.0,
            title: 'Romance Dawn',
            language: 'en',
            pages: 25,
            publishedAt: new Date('1997-07-22').toISOString(),
            externalId: 'op-ch-001',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            seriesId: 1,
            number: 2.0,
            title: 'They Call Him Straw Hat Luffy',
            language: 'en',
            pages: 22,
            publishedAt: new Date('1997-07-29').toISOString(),
            externalId: 'op-ch-002',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            seriesId: 1,
            number: 3.0,
            title: 'Introduce Yourself',
            language: 'en',
            pages: 28,
            publishedAt: new Date('1997-08-05').toISOString(),
            externalId: 'op-ch-003',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            seriesId: 1,
            number: 4.0,
            title: 'The Dawn of an Adventure',
            language: 'en',
            pages: 24,
            publishedAt: new Date('1997-08-12').toISOString(),
            externalId: 'op-ch-004',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            seriesId: 1,
            number: 5.0,
            title: 'The King of the Pirates and the Master Swordsman',
            language: 'en',
            pages: 30,
            publishedAt: new Date('1997-08-19').toISOString(),
            externalId: 'op-ch-005',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        // Solo Leveling chapters (seriesId: 2)
        {
            seriesId: 2,
            number: 1.0,
            title: 'The Weakest Hunter',
            language: 'en',
            pages: 26,
            publishedAt: new Date('2018-07-25').toISOString(),
            externalId: 'sl-ch-001',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            seriesId: 2,
            number: 2.0,
            title: 'If I Had Been A Little Stronger',
            language: 'en',
            pages: 24,
            publishedAt: new Date('2018-08-01').toISOString(),
            externalId: 'sl-ch-002',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            seriesId: 2,
            number: 3.0,
            title: 'The Miracle',
            language: 'en',
            pages: 27,
            publishedAt: new Date('2018-08-08').toISOString(),
            externalId: 'sl-ch-003',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            seriesId: 2,
            number: 4.0,
            title: 'I Want to Become Stronger',
            language: 'en',
            pages: 23,
            publishedAt: new Date('2018-08-15').toISOString(),
            externalId: 'sl-ch-004',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            seriesId: 2,
            number: 5.0,
            title: 'The Entrance Exam',
            language: 'en',
            pages: 29,
            publishedAt: new Date('2018-08-22').toISOString(),
            externalId: 'sl-ch-005',
            createdAt: new Date('2024-01-15').toISOString(),
        }
    ];

    await db.insert(mangaChapters).values(sampleChapters);

    // Insert 4 manga comments (2 per series) from userId 1
    const sampleComments = [
        {
            seriesId: 1,
            userId: 1,
            content: 'This manga is absolutely incredible! The world building is phenomenal.',
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            seriesId: 1,
            userId: 1,
            content: 'Luffy\'s journey never gets old. Each arc keeps getting better!',
            createdAt: new Date('2024-01-25').toISOString(),
        },
        {
            seriesId: 2,
            userId: 1,
            content: 'The power progression in this series is so satisfying to read.',
            createdAt: new Date('2024-01-22').toISOString(),
        },
        {
            seriesId: 2,
            userId: 1,
            content: 'Jin-Woo\'s character development is amazing throughout the story.',
            createdAt: new Date('2024-01-28').toISOString(),
        }
    ];

    await db.insert(mangaComments).values(sampleComments);

    console.log('✅ Manga tracker seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});