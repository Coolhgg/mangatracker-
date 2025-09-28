import { db } from '@/db';

async function main() {
    // Insert sample users
    const sampleUsers = [
        {
            email: 'demo@example.com',
            name: 'Demo User',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            roles: JSON.stringify(['user']),
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            email: 'admin@example.com',
            name: 'Admin User',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            roles: JSON.stringify(['user', 'admin']),
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            email: 'reader@example.com',
            name: 'Manga Reader',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            roles: JSON.stringify(['user']),
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        }
    ];

    // Insert sample series
    const sampleSeries = [
        {
            slug: 'one-piece',
            title: 'One Piece',
            description: 'Follow Monkey D. Luffy and his Straw Hat Pirates as they explore the Grand Line to find the ultimate treasure known as "One Piece" in order to become the next Pirate King.',
            coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
            sourceName: 'MangaDex',
            sourceUrl: 'https://mangadex.org/title/a1c7c817-4e59-43b7-9365-09675a149a6f/one-piece',
            tags: JSON.stringify(['Action', 'Adventure', 'Comedy', 'Drama', 'Shounen']),
            rating: 9.2,
            year: 1997,
            status: 'ongoing',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            slug: 'solo-leveling',
            title: 'Solo Leveling',
            description: 'In a world where hunters with various magical powers battle monsters from invading the defenceless humanity, Sung Jinwoo was the weakest of all the hunters, barely able to make a living.',
            coverImageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=600&fit=crop',
            sourceName: 'Webtoon',
            sourceUrl: 'https://www.webtoons.com/en/action/solo-leveling/list?title_no=1052',
            tags: JSON.stringify(['Action', 'Adventure', 'Fantasy', 'Supernatural']),
            rating: 9.5,
            year: 2018,
            status: 'completed',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        },
        {
            slug: 'attack-on-titan',
            title: 'Attack on Titan',
            description: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.',
            coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
            sourceName: 'Crunchyroll',
            sourceUrl: 'https://www.crunchyroll.com/manga/attack-on-titan',
            tags: JSON.stringify(['Action', 'Drama', 'Fantasy', 'Horror', 'Shounen']),
            rating: 8.9,
            year: 2009,
            status: 'completed',
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-08').toISOString(),
        }
    ];

    // Insert sample chapters
    const sampleChapters = [
        {
            seriesId: 1,
            number: 1.0,
            title: 'Romance Dawn',
            language: 'en',
            publishedAt: new Date('2024-01-10').toISOString(),
            pages: 52,
            externalId: 'onepiece_001',
            sourceId: 'md_001',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            seriesId: 1,
            number: 2.0,
            title: 'They Call Him "Straw Hat Luffy"',
            language: 'en',
            publishedAt: new Date('2024-01-11').toISOString(),
            pages: 19,
            externalId: 'onepiece_002',
            sourceId: 'md_002',
            createdAt: new Date('2024-01-11').toISOString(),
        },
        {
            seriesId: 1,
            number: 3.0,
            title: 'Introduce Yourself',
            language: 'en',
            publishedAt: new Date('2024-01-12').toISOString(),
            pages: 20,
            externalId: 'onepiece_003',
            sourceId: 'md_003',
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            seriesId: 1,
            number: 4.0,
            title: 'The Dawn of Adventure',
            language: 'en',
            publishedAt: new Date('2024-01-13').toISOString(),
            pages: 18,
            externalId: 'onepiece_004',
            sourceId: 'md_004',
            createdAt: new Date('2024-01-13').toISOString(),
        },
        {
            seriesId: 2,
            number: 1.0,
            title: 'Awakening',
            language: 'en',
            publishedAt: new Date('2024-01-15').toISOString(),
            pages: 45,
            externalId: 'solo_001',
            sourceId: 'wt_001',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            seriesId: 2,
            number: 2.0,
            title: 'The Weakest Hunter',
            language: 'en',
            publishedAt: new Date('2024-01-16').toISOString(),
            pages: 42,
            externalId: 'solo_002',
            sourceId: 'wt_002',
            createdAt: new Date('2024-01-16').toISOString(),
        },
        {
            seriesId: 3,
            number: 1.0,
            title: 'To You, 2000 Years From Now',
            language: 'en',
            publishedAt: new Date('2024-01-05').toISOString(),
            pages: 45,
            externalId: 'aot_001',
            sourceId: 'cr_001',
            createdAt: new Date('2024-01-05').toISOString(),
        }
    ];

    // Insert sample manga library entries
    const sampleLibrary = [
        {
            userId: 1,
            seriesId: 1,
            status: 'reading',
            rating: 5,
            notes: 'Amazing adventure story! Love the world-building.',
            notifications: true,
            lastReadChapterId: 2,
            lastReadAt: new Date('2024-01-20').toISOString(),
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: 1,
            seriesId: 2,
            status: 'completed',
            rating: 5,
            notes: 'Incredible art and story progression. One of the best webtoons!',
            notifications: false,
            lastReadChapterId: 6,
            lastReadAt: new Date('2024-01-18').toISOString(),
            createdAt: new Date('2024-01-16').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 2,
            seriesId: 1,
            status: 'plan_to_read',
            notifications: true,
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        }
    ];

    // Insert sample reading progress
    const sampleProgress = [
        {
            userId: 1,
            seriesId: 1,
            chapterId: 1,
            currentPage: 52,
            completed: true,
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 1,
            seriesId: 1,
            chapterId: 2,
            currentPage: 10,
            completed: false,
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: 1,
            seriesId: 2,
            chapterId: 5,
            currentPage: 45,
            completed: true,
            updatedAt: new Date('2024-01-17').toISOString(),
        },
        {
            userId: 1,
            seriesId: 2,
            chapterId: 6,
            currentPage: 42,
            completed: true,
            updatedAt: new Date('2024-01-18').toISOString(),
        }
    ];

    // Insert sample manga notes
    const sampleNotes = [
        {
            userId: 1,
            seriesId: 1,
            body: 'The character development in this series is phenomenal. Luffy\'s determination and the crew dynamics are perfectly crafted.',
            createdAt: new Date('2024-01-19').toISOString(),
        },
        {
            userId: 1,
            seriesId: 2,
            body: 'The power system and leveling mechanics are really well thought out. The art style evolution throughout the series is amazing.',
            createdAt: new Date('2024-01-18').toISOString(),
        }
    ];

    // Insert sample manga ratings
    const sampleRatings = [
        {
            userId: 1,
            seriesId: 1,
            value: 5,
            createdAt: new Date('2024-01-19').toISOString(),
        },
        {
            userId: 1,
            seriesId: 2,
            value: 5,
            createdAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 2,
            seriesId: 3,
            value: 4,
            createdAt: new Date('2024-01-15').toISOString(),
        }
    ];

    try {
        // Import tables for seeding
        const { users, series, mangaChapters, library, progress, mangaNotes, mangaRatings } = await import('@/db/schema');

        // Seed users
        await db.insert(users).values(sampleUsers);
        
        // Seed series
        await db.insert(series).values(sampleSeries);
        
        // Seed chapters
        await db.insert(mangaChapters).values(sampleChapters);
        
        // Seed library
        await db.insert(library).values(sampleLibrary);
        
        // Seed progress
        await db.insert(progress).values(sampleProgress);
        
        // Seed notes
        await db.insert(mangaNotes).values(sampleNotes);
        
        // Seed ratings
        await db.insert(mangaRatings).values(sampleRatings);
        
        console.log('✅ Database seeder completed successfully');
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});