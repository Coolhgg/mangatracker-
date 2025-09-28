import { db } from '@/db';
import { users, series, mangaChapters, mangaComments } from '@/db/schema';

async function main() {
    try {
        // Seed users table
        const sampleUsers = [
            {
                email: 'demo.user@mangatrack.com',
                name: 'Demo User',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
                roles: ['user'],
                createdAt: new Date('2024-01-15').toISOString(),
                updatedAt: new Date('2024-01-15').toISOString(),
            }
        ];

        await db.insert(users).values(sampleUsers).onConflictDoNothing();

        // Seed series table
        const sampleSeries = [
            {
                slug: 'one-piece',
                title: 'One Piece',
                description: 'Follow Monkey D. Luffy and his crew of Straw Hat Pirates as they explore the Grand Line to find the ultimate treasure known as One Piece.',
                coverImageUrl: 'https://example.com/covers/one-piece.jpg',
                sourceName: 'MangaPlus',
                sourceUrl: 'https://mangaplus.shueisha.co.jp/titles/100020',
                tags: ['adventure', 'comedy', 'drama', 'shounen'],
                rating: 9.2,
                year: 1997,
                status: 'ongoing',
                createdAt: new Date('2024-01-10').toISOString(),
                updatedAt: new Date('2024-01-10').toISOString(),
            },
            {
                slug: 'attack-on-titan',
                title: 'Attack on Titan',
                description: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.',
                coverImageUrl: 'https://example.com/covers/attack-on-titan.jpg',
                sourceName: 'Kodansha',
                sourceUrl: 'https://kodansha.us/series/attack-on-titan/',
                tags: ['action', 'drama', 'horror', 'shounen'],
                rating: 9.0,
                year: 2009,
                status: 'completed',
                createdAt: new Date('2024-01-12').toISOString(),
                updatedAt: new Date('2024-01-12').toISOString(),
            }
        ];

        await db.insert(series).values(sampleSeries).onConflictDoNothing();

        // Seed mangaChapters table
        const sampleChapters = [
            {
                seriesId: 1,
                number: 1102.0,
                title: 'The Legendary Hero',
                language: 'en',
                publishedAt: new Date('2024-01-20').toISOString(),
                pages: 17,
                externalId: 'op_1102',
                sourceId: 'mangaplus_1102',
                createdAt: new Date('2024-01-20').toISOString(),
            },
            {
                seriesId: 1,
                number: 1103.0,
                title: 'Battle of the Century',
                language: 'en',
                publishedAt: new Date('2024-01-27').toISOString(),
                pages: 19,
                externalId: 'op_1103',
                sourceId: 'mangaplus_1103',
                createdAt: new Date('2024-01-27').toISOString(),
            },
            {
                seriesId: 1,
                number: 1104.0,
                title: 'New Allies',
                language: 'en',
                publishedAt: new Date('2024-02-03').toISOString(),
                pages: 15,
                externalId: 'op_1104',
                sourceId: 'mangaplus_1104',
                createdAt: new Date('2024-02-03').toISOString(),
            },
            {
                seriesId: 1,
                number: 1105.0,
                title: 'The Final Stand',
                language: 'en',
                publishedAt: new Date('2024-02-10').toISOString(),
                pages: 20,
                externalId: 'op_1105',
                sourceId: 'mangaplus_1105',
                createdAt: new Date('2024-02-10').toISOString(),
            },
            {
                seriesId: 1,
                number: 1106.0,
                title: 'Victory at Last',
                language: 'en',
                publishedAt: new Date('2024-02-17').toISOString(),
                pages: 18,
                externalId: 'op_1106',
                sourceId: 'mangaplus_1106',
                createdAt: new Date('2024-02-17').toISOString(),
            },
            {
                seriesId: 2,
                number: 137.0,
                title: 'Titans',
                language: 'en',
                publishedAt: new Date('2021-03-09').toISOString(),
                pages: 45,
                externalId: 'aot_137',
                sourceId: 'kodansha_137',
                createdAt: new Date('2021-03-09').toISOString(),
            },
            {
                seriesId: 2,
                number: 138.0,
                title: 'A Long Dream',
                language: 'en',
                publishedAt: new Date('2021-03-09').toISOString(),
                pages: 45,
                externalId: 'aot_138',
                sourceId: 'kodansha_138',
                createdAt: new Date('2021-03-09').toISOString(),
            },
            {
                seriesId: 2,
                number: 139.0,
                title: 'Toward the Tree on That Hill',
                language: 'en',
                publishedAt: new Date('2021-04-09').toISOString(),
                pages: 45,
                externalId: 'aot_139',
                sourceId: 'kodansha_139',
                createdAt: new Date('2021-04-09').toISOString(),
            },
            {
                seriesId: 2,
                number: 139.5,
                title: 'Extra Pages',
                language: 'en',
                publishedAt: new Date('2021-05-17').toISOString(),
                pages: 8,
                externalId: 'aot_139_5',
                sourceId: 'kodansha_139_5',
                createdAt: new Date('2021-05-17').toISOString(),
            },
            {
                seriesId: 1,
                number: 1107.0,
                title: 'New Journey Begins',
                language: 'en',
                publishedAt: new Date('2024-02-24').toISOString(),
                pages: 16,
                externalId: 'op_1107',
                sourceId: 'mangaplus_1107',
                createdAt: new Date('2024-02-24').toISOString(),
            }
        ];

        await db.insert(mangaChapters).values(sampleChapters).onConflictDoNothing();

        // Seed mangaComments table
        const sampleComments = [
            {
                seriesId: 1,
                userId: 1,
                content: 'One Piece never fails to amaze me! The latest chapter was absolutely incredible.',
                createdAt: new Date('2024-02-20').toISOString(),
            },
            {
                seriesId: 1,
                userId: 1,
                content: 'Oda-sensei\'s world-building continues to be unmatched. Every detail matters!',
                createdAt: new Date('2024-02-21').toISOString(),
            },
            {
                seriesId: 2,
                userId: 1,
                content: 'Attack on Titan\'s ending was controversial but I think it was perfect for the story.',
                createdAt: new Date('2024-02-22').toISOString(),
            },
            {
                seriesId: 2,
                userId: 1,
                content: 'The final battle sequences were some of the best manga panels I\'ve ever seen.',
                createdAt: new Date('2024-02-23').toISOString(),
            }
        ];

        await db.insert(mangaComments).values(sampleComments).onConflictDoNothing();

        console.log('✅ Manga tracker seeder completed successfully');
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});