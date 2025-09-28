import { db } from '@/db';
import { users, series, mangaChapters, mangaComments } from '@/db/schema';

async function main() {
    const currentDate = new Date().toISOString();
    
    // Insert demo user
    const sampleUsers = [
        {
            email: 'demo@example.com',
            name: 'Demo User',
            roles: ['user'],
            createdAt: currentDate,
            updatedAt: currentDate,
        }
    ];

    await db.insert(users).values(sampleUsers);

    // Insert series
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
            createdAt: currentDate,
            updatedAt: currentDate,
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
            createdAt: currentDate,
            updatedAt: currentDate,
        }
    ];

    await db.insert(series).values(sampleSeries);

    // Insert manga chapters
    const sampleChapters = [
        // One Piece chapters (seriesId: 1)
        {
            seriesId: 1,
            number: 1.0,
            title: 'Chapter 1: Romance Dawn',
            language: 'en',
            pages: 22,
            publishedAt: new Date('2024-01-01').toISOString(),
            externalId: 'op-ch-001',
            createdAt: currentDate,
        },
        {
            seriesId: 1,
            number: 2.0,
            title: 'Chapter 2: They Call Him Straw Hat Luffy',
            language: 'en',
            pages: 25,
            publishedAt: new Date('2024-01-08').toISOString(),
            externalId: 'op-ch-002',
            createdAt: currentDate,
        },
        {
            seriesId: 1,
            number: 3.0,
            title: 'Chapter 3: Introduce Yourself',
            language: 'en',
            pages: 28,
            publishedAt: new Date('2024-01-15').toISOString(),
            externalId: 'op-ch-003',
            createdAt: currentDate,
        },
        {
            seriesId: 1,
            number: 4.0,
            title: 'Chapter 4: The Dawn of Adventure',
            language: 'en',
            pages: 24,
            publishedAt: new Date('2024-01-22').toISOString(),
            externalId: 'op-ch-004',
            createdAt: currentDate,
        },
        {
            seriesId: 1,
            number: 5.0,
            title: 'Chapter 5: The King of the Pirates',
            language: 'en',
            pages: 30,
            publishedAt: new Date('2024-01-29').toISOString(),
            externalId: 'op-ch-005',
            createdAt: currentDate,
        },
        // Solo Leveling chapters (seriesId: 2)
        {
            seriesId: 2,
            number: 1.0,
            title: 'Chapter 1: The Weakest Hunter',
            language: 'en',
            pages: 26,
            publishedAt: new Date('2024-01-01').toISOString(),
            externalId: 'sl-ch-001',
            createdAt: currentDate,
        },
        {
            seriesId: 2,
            number: 2.0,
            title: 'Chapter 2: If I Had Been A Little Stronger',
            language: 'en',
            pages: 23,
            publishedAt: new Date('2024-01-08').toISOString(),
            externalId: 'sl-ch-002',
            createdAt: currentDate,
        },
        {
            seriesId: 2,
            number: 3.0,
            title: 'Chapter 3: The System',
            language: 'en',
            pages: 29,
            publishedAt: new Date('2024-01-15').toISOString(),
            externalId: 'sl-ch-003',
            createdAt: currentDate,
        },
        {
            seriesId: 2,
            number: 4.0,
            title: 'Chapter 4: Second Awakening',
            language: 'en',
            pages: 27,
            publishedAt: new Date('2024-01-22').toISOString(),
            externalId: 'sl-ch-004',
            createdAt: currentDate,
        },
        {
            seriesId: 2,
            number: 5.0,
            title: 'Chapter 5: The Real Hunt Begins',
            language: 'en',
            pages: 25,
            publishedAt: new Date('2024-01-29').toISOString(),
            externalId: 'sl-ch-005',
            createdAt: currentDate,
        }
    ];

    await db.insert(mangaChapters).values(sampleChapters);

    // Insert comments
    const sampleComments = [
        // One Piece comments
        {
            userId: 1,
            seriesId: 1,
            content: 'This manga is absolutely incredible! The world building is phenomenal.',
            createdAt: new Date('2024-02-01').toISOString(),
        },
        {
            userId: 1,
            seriesId: 1,
            content: 'Luffy\'s journey never gets old. Each arc keeps getting better!',
            createdAt: new Date('2024-02-05').toISOString(),
        },
        // Solo Leveling comments
        {
            userId: 1,
            seriesId: 2,
            content: 'The power progression in this series is so satisfying to read.',
            createdAt: new Date('2024-02-02').toISOString(),
        },
        {
            userId: 1,
            seriesId: 2,
            content: 'Jin-Woo\'s character development is amazing throughout the story.',
            createdAt: new Date('2024-02-06').toISOString(),
        }
    ];

    await db.insert(mangaComments).values(sampleComments);

    console.log('✅ Comprehensive seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});