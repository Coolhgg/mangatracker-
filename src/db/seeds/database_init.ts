import { db } from '@/db';
import { users, series, mangaChapters, mangaComments, mangaNotes, mangaRatings } from '@/db/schema';

async function main() {
    try {
        // Create tables if they don't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                avatar_url TEXT,
                roles TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS series (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                description TEXT,
                cover_image_url TEXT,
                source_name TEXT,
                source_url TEXT,
                tags TEXT DEFAULT '[]',
                rating REAL,
                year INTEGER,
                status TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS manga_chapters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                series_id INTEGER NOT NULL,
                number REAL NOT NULL,
                title TEXT,
                language TEXT DEFAULT 'en',
                published_at TEXT,
                pages INTEGER,
                external_id TEXT,
                source_id TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS manga_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                series_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS manga_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                body TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS manga_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                value INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
                UNIQUE(user_id, series_id)
            )
        `);

        console.log('✅ Tables created successfully');

        // Seed demo user
        const sampleUsers = [
            {
                email: 'demo@example.com',
                name: 'Demo User',
                avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                roles: JSON.stringify(['user']),
                createdAt: new Date('2024-01-15').toISOString(),
                updatedAt: new Date('2024-01-15').toISOString(),
            }
        ];

        await db.insert(users).values(sampleUsers);
        console.log('✅ Users seeded successfully');

        // Seed series
        const sampleSeries = [
            {
                slug: 'one-piece',
                title: 'One Piece',
                description: 'Follow Monkey D. Luffy and his Straw Hat Pirates as they explore the Grand Line to find the treasure known as "One Piece" in order to become the next Pirate King.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop',
                sourceName: 'MangaPlus',
                sourceUrl: 'https://mangaplus.shueisha.co.jp/titles/100020',
                tags: JSON.stringify(['Adventure', 'Comedy', 'Drama', 'Shounen']),
                rating: 9.2,
                year: 1997,
                status: 'ongoing',
                createdAt: new Date('2024-01-10').toISOString(),
                updatedAt: new Date('2024-01-10').toISOString(),
            },
            {
                slug: 'solo-leveling',
                title: 'Solo Leveling',
                description: 'In a world where hunters with various magical powers battle monsters from invading the defenceless humanity, Sung Jin-Woo was the weakest of all the hunters.',
                coverImageUrl: 'https://images.unsplash.com/photo-1613834761499-e2ddc7d8d5e2?w=400&h=600&fit=crop',
                sourceName: 'Webtoon',
                sourceUrl: 'https://www.webtoons.com/en/action/solo-leveling/list?title_no=1474',
                tags: JSON.stringify(['Action', 'Adventure', 'Fantasy', 'Supernatural']),
                rating: 9.7,
                year: 2018,
                status: 'completed',
                createdAt: new Date('2024-01-12').toISOString(),
                updatedAt: new Date('2024-01-12').toISOString(),
            }
        ];

        await db.insert(series).values(sampleSeries);
        console.log('✅ Series seeded successfully');

        // Seed chapters for One Piece (series ID 1)
        const onePieceChapters = [
            {
                seriesId: 1,
                number: 1,
                title: 'Romance Dawn',
                language: 'en',
                publishedAt: new Date('1997-07-22').toISOString(),
                pages: 51,
                externalId: 'op_001',
                sourceId: 'mangaplus_001',
                createdAt: new Date('2024-01-10').toISOString(),
            },
            {
                seriesId: 1,
                number: 2,
                title: 'The Man They Call "Pirate Hunter"',
                language: 'en',
                publishedAt: new Date('1997-08-04').toISOString(),
                pages: 19,
                externalId: 'op_002',
                sourceId: 'mangaplus_002',
                createdAt: new Date('2024-01-10').toISOString(),
            },
            {
                seriesId: 1,
                number: 3,
                title: 'Introduce Yourself',
                language: 'en',
                publishedAt: new Date('1997-08-11').toISOString(),
                pages: 20,
                externalId: 'op_003',
                sourceId: 'mangaplus_003',
                createdAt: new Date('2024-01-10').toISOString(),
            },
            {
                seriesId: 1,
                number: 4,
                title: 'The Dawn of Adventure',
                language: 'en',
                publishedAt: new Date('1997-08-25').toISOString(),
                pages: 20,
                externalId: 'op_004',
                sourceId: 'mangaplus_004',
                createdAt: new Date('2024-01-10').toISOString(),
            },
            {
                seriesId: 1,
                number: 5,
                title: 'The King of the Pirates and the Master Swordsman',
                language: 'en',
                publishedAt: new Date('1997-09-02').toISOString(),
                pages: 18,
                externalId: 'op_005',
                sourceId: 'mangaplus_005',
                createdAt: new Date('2024-01-10').toISOString(),
            }
        ];

        // Seed chapters for Solo Leveling (series ID 2)
        const soloLevelingChapters = [
            {
                seriesId: 2,
                number: 1,
                title: 'The World\'s Weakest Hunter',
                language: 'en',
                publishedAt: new Date('2018-03-04').toISOString(),
                pages: 45,
                externalId: 'sl_001',
                sourceId: 'webtoon_001',
                createdAt: new Date('2024-01-12').toISOString(),
            },
            {
                seriesId: 2,
                number: 2,
                title: 'The Double Dungeon',
                language: 'en',
                publishedAt: new Date('2018-03-11').toISOString(),
                pages: 42,
                externalId: 'sl_002',
                sourceId: 'webtoon_002',
                createdAt: new Date('2024-01-12').toISOString(),
            },
            {
                seriesId: 2,
                number: 3,
                title: 'The System',
                language: 'en',
                publishedAt: new Date('2018-03-18').toISOString(),
                pages: 48,
                externalId: 'sl_003',
                sourceId: 'webtoon_003',
                createdAt: new Date('2024-01-12').toISOString(),
            },
            {
                seriesId: 2,
                number: 4,
                title: 'Level Up',
                language: 'en',
                publishedAt: new Date('2018-03-25').toISOString(),
                pages: 43,
                externalId: 'sl_004',
                sourceId: 'webtoon_004',
                createdAt: new Date('2024-01-12').toISOString(),
            },
            {
                seriesId: 2,
                number: 5,
                title: 'The First Real Battle',
                language: 'en',
                publishedAt: new Date('2018-04-01').toISOString(),
                pages: 46,
                externalId: 'sl_005',
                sourceId: 'webtoon_005',
                createdAt: new Date('2024-01-12').toISOString(),
            }
        ];

        await db.insert(mangaChapters).values([...onePieceChapters, ...soloLevelingChapters]);
        console.log('✅ Chapters seeded successfully');

        // Seed comments
        const sampleComments = [
            {
                seriesId: 1,
                userId: 1,
                content: 'One Piece is absolutely amazing! The world-building and character development are incredible. Been following this series for years and it never disappoints.',
                createdAt: new Date('2024-01-20').toISOString(),
            },
            {
                seriesId: 1,
                userId: 1,
                content: 'The latest arc has been phenomenal. Oda really knows how to craft an emotional story that keeps you hooked chapter after chapter.',
                createdAt: new Date('2024-01-25').toISOString(),
            },
            {
                seriesId: 2,
                userId: 1,
                content: 'Solo Leveling has some of the best art I\'ve ever seen in a manhwa. The action sequences are absolutely stunning and the power progression is so satisfying.',
                createdAt: new Date('2024-01-22').toISOString(),
            },
            {
                seriesId: 2,
                userId: 1,
                content: 'Jin-Woo\'s character development from the weakest hunter to the strongest is incredibly well done. The pacing and story beats are perfect.',
                createdAt: new Date('2024-01-28').toISOString(),
            }
        ];

        await db.insert(mangaComments).values(sampleComments);
        console.log('✅ Comments seeded successfully');

        // Seed notes
        const sampleNotes = [
            {
                userId: 1,
                seriesId: 1,
                body: 'Need to re-read the Marineford arc again. The emotional impact of Ace\'s death still hits hard every time. The way Oda built up to that moment over hundreds of chapters is masterful storytelling.',
                createdAt: new Date('2024-01-26').toISOString(),
            },
            {
                userId: 1,
                seriesId: 2,
                body: 'The shadow extraction ability is so cool! Need to keep track of all the different shadow soldiers Jin-Woo collects. The hierarchy system is fascinating.',
                createdAt: new Date('2024-01-27').toISOString(),
            }
        ];

        await db.insert(mangaNotes).values(sampleNotes);
        console.log('✅ Notes seeded successfully');

        // Seed ratings
        const sampleRatings = [
            {
                userId: 1,
                seriesId: 1,
                value: 10,
                createdAt: new Date('2024-01-20').toISOString(),
            },
            {
                userId: 1,
                seriesId: 2,
                value: 9,
                createdAt: new Date('2024-01-22').toISOString(),
            }
        ];

        await db.insert(mangaRatings).values(sampleRatings);
        console.log('✅ Ratings seeded successfully');

        console.log('✅ Database initialization seeder completed successfully');
    } catch (error) {
        console.error('❌ Database initialization seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});