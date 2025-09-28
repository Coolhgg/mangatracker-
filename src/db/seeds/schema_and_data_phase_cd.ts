import { db } from '@/db';
import { users, series, mangaChapters, library, progress, comments } from '@/db/schema';

async function main() {
    try {
        // First create tables if they don't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
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
                slug TEXT UNIQUE NOT NULL,
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
                series_id INTEGER NOT NULL REFERENCES series(id),
                number REAL NOT NULL,
                title TEXT,
                language TEXT DEFAULT 'en',
                published_at TEXT,
                pages INTEGER,
                external_id TEXT,
                source_id TEXT,
                created_at TEXT NOT NULL
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS library (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                series_id INTEGER NOT NULL REFERENCES series(id),
                status TEXT DEFAULT 'reading',
                rating INTEGER,
                notes TEXT,
                notifications INTEGER DEFAULT 1,
                last_read_chapter_id INTEGER REFERENCES manga_chapters(id),
                last_read_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id, series_id)
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                series_id INTEGER NOT NULL REFERENCES series(id),
                chapter_id INTEGER NOT NULL REFERENCES manga_chapters(id),
                current_page INTEGER DEFAULT 0,
                completed INTEGER DEFAULT 0,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id, series_id, chapter_id)
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                series_id INTEGER NOT NULL REFERENCES series(id),
                parent_id INTEGER REFERENCES comments(id),
                content TEXT NOT NULL,
                edited INTEGER DEFAULT 0,
                deleted INTEGER DEFAULT 0,
                flags_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
        `);

        // Seed users data
        const sampleUsers = [
            {
                email: 'alice.chen@example.com',
                name: 'Alice Chen',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
                roles: JSON.stringify(['reader']),
                createdAt: new Date('2024-01-15').toISOString(),
                updatedAt: new Date('2024-01-15').toISOString(),
            },
            {
                email: 'bob.martinez@example.com',
                name: 'Bob Martinez',
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                roles: JSON.stringify(['reader', 'moderator']),
                createdAt: new Date('2024-01-20').toISOString(),
                updatedAt: new Date('2024-01-20').toISOString(),
            },
            {
                email: 'catherine.wong@example.com',
                name: 'Catherine Wong',
                avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
                roles: JSON.stringify(['reader']),
                createdAt: new Date('2024-01-25').toISOString(),
                updatedAt: new Date('2024-01-25').toISOString(),
            },
            {
                email: 'david.kim@example.com',
                name: 'David Kim',
                avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
                roles: JSON.stringify(['reader', 'admin']),
                createdAt: new Date('2024-02-01').toISOString(),
                updatedAt: new Date('2024-02-01').toISOString(),
            },
            {
                email: 'emma.rodriguez@example.com',
                name: 'Emma Rodriguez',
                avatarUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200',
                roles: JSON.stringify(['reader']),
                createdAt: new Date('2024-02-05').toISOString(),
                updatedAt: new Date('2024-02-05').toISOString(),
            },
            {
                email: 'frank.johnson@example.com',
                name: 'Frank Johnson',
                avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
                roles: JSON.stringify(['reader']),
                createdAt: new Date('2024-02-10').toISOString(),
                updatedAt: new Date('2024-02-10').toISOString(),
            },
            {
                email: 'grace.taylor@example.com',
                name: 'Grace Taylor',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                roles: JSON.stringify(['reader', 'translator']),
                createdAt: new Date('2024-02-15').toISOString(),
                updatedAt: new Date('2024-02-15').toISOString(),
            },
            {
                email: 'henry.lee@example.com',
                name: 'Henry Lee',
                avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
                roles: JSON.stringify(['reader']),
                createdAt: new Date('2024-02-20').toISOString(),
                updatedAt: new Date('2024-02-20').toISOString(),
            },
            {
                email: 'isabella.brown@example.com',
                name: 'Isabella Brown',
                avatarUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200',
                roles: JSON.stringify(['reader']),
                createdAt: new Date('2024-02-25').toISOString(),
                updatedAt: new Date('2024-02-25').toISOString(),
            },
            {
                email: 'jack.wilson@example.com',
                name: 'Jack Wilson',
                avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200',
                roles: JSON.stringify(['reader', 'uploader']),
                createdAt: new Date('2024-03-01').toISOString(),
                updatedAt: new Date('2024-03-01').toISOString(),
            }
        ];

        await db.insert(users).values(sampleUsers);

        // Seed series data
        const sampleSeries = [
            {
                slug: 'demon-slayer',
                title: 'Demon Slayer: Kimetsu no Yaiba',
                description: 'A young boy whose family was slaughtered by demons joins the Demon Slayer Corps to become a demon slayer and turn his demon sister back into a human.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'MangaPlus',
                sourceUrl: 'https://mangaplus.shueisha.co.jp',
                tags: JSON.stringify(['action', 'supernatural', 'shounen', 'historical']),
                rating: 9.2,
                year: 2016,
                status: 'completed',
                createdAt: new Date('2024-01-10').toISOString(),
                updatedAt: new Date('2024-01-10').toISOString(),
            },
            {
                slug: 'attack-on-titan',
                title: 'Attack on Titan',
                description: 'Humanity fights for survival against giant humanoid Titans behind enormous walls.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'Crunchyroll',
                sourceUrl: 'https://crunchyroll.com',
                tags: JSON.stringify(['action', 'drama', 'military', 'shounen']),
                rating: 9.0,
                year: 2009,
                status: 'completed',
                createdAt: new Date('2024-01-11').toISOString(),
                updatedAt: new Date('2024-01-11').toISOString(),
            },
            {
                slug: 'my-hero-academia',
                title: 'My Hero Academia',
                description: 'In a world where most people have superpowers, a boy without them dreams of becoming a hero.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'Viz Media',
                sourceUrl: 'https://viz.com',
                tags: JSON.stringify(['action', 'school', 'superhero', 'shounen']),
                rating: 8.7,
                year: 2014,
                status: 'ongoing',
                createdAt: new Date('2024-01-12').toISOString(),
                updatedAt: new Date('2024-01-12').toISOString(),
            },
            {
                slug: 'one-piece',
                title: 'One Piece',
                description: 'A young pirate with rubber powers searches for the ultimate treasure known as "One Piece".',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'Viz Media',
                sourceUrl: 'https://viz.com',
                tags: JSON.stringify(['action', 'adventure', 'comedy', 'shounen']),
                rating: 9.1,
                year: 1997,
                status: 'ongoing',
                createdAt: new Date('2024-01-13').toISOString(),
                updatedAt: new Date('2024-01-13').toISOString(),
            },
            {
                slug: 'chainsaw-man',
                title: 'Chainsaw Man',
                description: 'A young man with chainsaw powers works as a devil hunter to pay off his debts.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'MangaPlus',
                sourceUrl: 'https://mangaplus.shueisha.co.jp',
                tags: JSON.stringify(['action', 'supernatural', 'gore', 'shounen']),
                rating: 8.9,
                year: 2018,
                status: 'ongoing',
                createdAt: new Date('2024-01-14').toISOString(),
                updatedAt: new Date('2024-01-14').toISOString(),
            },
            {
                slug: 'jujutsu-kaisen',
                title: 'Jujutsu Kaisen',
                description: 'A high school student joins a secret organization of Jujutsu Sorcerers to kill cursed beings.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'Viz Media',
                sourceUrl: 'https://viz.com',
                tags: JSON.stringify(['action', 'supernatural', 'school', 'shounen']),
                rating: 8.8,
                year: 2018,
                status: 'ongoing',
                createdAt: new Date('2024-01-15').toISOString(),
                updatedAt: new Date('2024-01-15').toISOString(),
            },
            {
                slug: 'spy-x-family',
                title: 'SPY x FAMILY',
                description: 'A spy must create a fake family to complete his mission, unaware that his wife is an assassin and daughter is a telepath.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'MangaPlus',
                sourceUrl: 'https://mangaplus.shueisha.co.jp',
                tags: JSON.stringify(['comedy', 'family', 'action', 'slice-of-life']),
                rating: 9.0,
                year: 2019,
                status: 'ongoing',
                createdAt: new Date('2024-01-16').toISOString(),
                updatedAt: new Date('2024-01-16').toISOString(),
            },
            {
                slug: 'tokyo-ghoul',
                title: 'Tokyo Ghoul',
                description: 'A college student becomes a half-ghoul after a deadly encounter and struggles to live between two worlds.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'Viz Media',
                sourceUrl: 'https://viz.com',
                tags: JSON.stringify(['action', 'supernatural', 'dark', 'seinen']),
                rating: 8.5,
                year: 2011,
                status: 'completed',
                createdAt: new Date('2024-01-17').toISOString(),
                updatedAt: new Date('2024-01-17').toISOString(),
            },
            {
                slug: 'death-note',
                title: 'Death Note',
                description: 'A high school student discovers a supernatural notebook that kills anyone whose name is written in it.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'Viz Media',
                sourceUrl: 'https://viz.com',
                tags: JSON.stringify(['psychological', 'supernatural', 'thriller', 'shounen']),
                rating: 9.0,
                year: 2003,
                status: 'completed',
                createdAt: new Date('2024-01-18').toISOString(),
                updatedAt: new Date('2024-01-18').toISOString(),
            },
            {
                slug: 'fullmetal-alchemist',
                title: 'Fullmetal Alchemist',
                description: 'Two brothers use alchemy in their quest to find the Philosophers Stone to restore their bodies.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'Viz Media',
                sourceUrl: 'https://viz.com',
                tags: JSON.stringify(['action', 'adventure', 'drama', 'shounen']),
                rating: 9.3,
                year: 2001,
                status: 'completed',
                createdAt: new Date('2024-01-19').toISOString(),
                updatedAt: new Date('2024-01-19').toISOString(),
            },
            {
                slug: 'mob-psycho-100',
                title: 'Mob Psycho 100',
                description: 'A middle school boy with psychic powers tries to live a normal life while working for a fake psychic.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'MangaOne',
                sourceUrl: 'https://mangaone.com',
                tags: JSON.stringify(['comedy', 'supernatural', 'slice-of-life', 'seinen']),
                rating: 8.7,
                year: 2012,
                status: 'completed',
                createdAt: new Date('2024-01-20').toISOString(),
                updatedAt: new Date('2024-01-20').toISOString(),
            },
            {
                slug: 'vinland-saga',
                title: 'Vinland Saga',
                description: 'A young Viking seeks revenge against the man who killed his father in medieval Europe.',
                coverImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                sourceName: 'Kodansha',
                sourceUrl: 'https://kodansha.com',
                tags: JSON.stringify(['action', 'historical', 'drama', 'seinen']),
                rating: 9.1,
                year: 2005,
                status: 'ongoing',
                createdAt: new Date('2024-01-21').toISOString(),
                updatedAt: new Date('2024-01-21').toISOString(),
            }
        ];

        await db.insert(series).values(sampleSeries);

        // Seed chapters for each series (5 chapters per series for brevity)
        const sampleChapters = [];
        
        // Generate 5 chapters for each of the 12 series
        for (let seriesId = 1; seriesId <= 12; seriesId++) {
            for (let chapterNum = 1; chapterNum <= 5; chapterNum++) {
                sampleChapters.push({
                    seriesId: seriesId,
                    number: chapterNum,
                    title: `Chapter ${chapterNum}`,
                    language: 'en',
                    publishedAt: new Date(`2024-0${Math.min(chapterNum, 9)}-${10 + chapterNum}`).toISOString(),
                    pages: Math.floor(Math.random() * 10) + 15,
                    externalId: `ext_${seriesId}_${chapterNum}`,
                    sourceId: `src_${seriesId}_${chapterNum}`,
                    createdAt: new Date(`2024-0${Math.min(chapterNum, 9)}-${10 + chapterNum}`).toISOString(),
                });
            }
        }

        await db.insert(mangaChapters).values(sampleChapters);

        // Seed library entries for users
        const sampleLibraryEntries = [
            {
                userId: 1,
                seriesId: 1,
                status: 'completed',
                rating: 9,
                notes: 'Amazing story and art. Highly recommend!',
                notifications: 1,
                lastReadChapterId: 5,
                lastReadAt: new Date('2024-03-15').toISOString(),
                createdAt: new Date('2024-02-01').toISOString(),
                updatedAt: new Date('2024-03-15').toISOString(),
            },
            {
                userId: 1,
                seriesId: 3,
                status: 'reading',
                rating: null,
                notes: 'Really enjoying the character development.',
                notifications: 1,
                lastReadChapterId: 13,
                lastReadAt: new Date('2024-03-20').toISOString(),
                createdAt: new Date('2024-02-10').toISOString(),
                updatedAt: new Date('2024-03-20').toISOString(),
            },
            {
                userId: 2,
                seriesId: 2,
                status: 'reading',
                rating: null,
                notes: 'Intense and gripping storyline.',
                notifications: 1,
                lastReadChapterId: 8,
                lastReadAt: new Date('2024-03-18').toISOString(),
                createdAt: new Date('2024-02-05').toISOString(),
                updatedAt: new Date('2024-03-18').toISOString(),
            },
            {
                userId: 2,
                seriesId: 4,
                status: 'plan_to_read',
                rating: null,
                notes: 'Heard great things about this series.',
                notifications: 0,
                lastReadChapterId: null,
                lastReadAt: null,
                createdAt: new Date('2024-02-20').toISOString(),
                updatedAt: new Date('2024-02-20').toISOString(),
            },
            {
                userId: 3,
                seriesId: 5,
                status: 'reading',
                rating: null,
                notes: 'Dark but compelling narrative.',
                notifications: 1,
                lastReadChapterId: 21,
                lastReadAt: new Date('2024-03-22').toISOString(),
                createdAt: new Date('2024-02-15').toISOString(),
                updatedAt: new Date('2024-03-22').toISOString(),
            },
            {
                userId: 4,
                seriesId: 7,
                status: 'completed',
                rating: 10,
                notes: 'Perfect blend of comedy and action. Family dynamics are hilarious.',
                notifications: 1,
                lastReadChapterId: 32,
                lastReadAt: new Date('2024-03-10').toISOString(),
                createdAt: new Date('2024-01-25').toISOString(),
                updatedAt: new Date('2024-03-10').toISOString(),
            }
        ];

        await db.insert(library).values(sampleLibraryEntries);

        // Seed progress entries
        const sampleProgress = [
            {
                userId: 1,
                seriesId: 1,
                chapterId: 1,
                currentPage: 20,
                completed: 1,
                updatedAt: new Date('2024-03-15').toISOString(),
            },
            {
                userId: 1,
                seriesId: 3,
                chapterId: 13,
                currentPage: 12,
                completed: 0,
                updatedAt: new Date('2024-03-20').toISOString(),
            },
            {
                userId: 2,
                seriesId: 2,
                chapterId: 8,
                currentPage: 8,
                completed: 0,
                updatedAt: new Date('2024-03-18').toISOString(),
            },
            {
                userId: 3,
                seriesId: 5,
                chapterId: 21,
                currentPage: 15,
                completed: 0,
                updatedAt: new Date('2024-03-22').toISOString(),
            },
            {
                userId: 4,
                seriesId: 7,
                chapterId: 32,
                currentPage: 18,
                completed: 1,
                updatedAt: new Date('2024-03-10').toISOString(),
            }
        ];

        await db.insert(progress).values(sampleProgress);

        // Seed comments
        const sampleComments = [
            {
                userId: 1,
                seriesId: 1,
                parentId: null,
                content: 'This series completely exceeded my expectations! The character development is phenomenal.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-15').toISOString(),
            },
            {
                userId: 2,
                seriesId: 1,
                parentId: 1,
                content: 'I agree! The way they handled the family dynamics was really touching.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-16').toISOString(),
            },
            {
                userId: 3,
                seriesId: 2,
                parentId: null,
                content: 'The political intrigue in this series is incredible. Every chapter leaves me wanting more.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-17').toISOString(),
            },
            {
                userId: 4,
                seriesId: 3,
                parentId: null,
                content: 'Best superhero manga I have ever read. The school setting adds such a unique dynamic.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-18').toISOString(),
            },
            {
                userId: 5,
                seriesId: 4,
                parentId: null,
                content: 'After 1000+ chapters, this series still manages to surprise me every week.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-19').toISOString(),
            },
            {
                userId: 6,
                seriesId: 5,
                parentId: null,
                content: 'The horror elements are perfectly balanced with the action. Not for the faint of heart!',
                edited: 1,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-20').toISOString(),
            },
            {
                userId: 7,
                seriesId: 6,
                parentId: null,
                content: 'The fight choreography in this series is absolutely insane. Every battle is a masterpiece.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-21').toISOString(),
            },
            {
                userId: 8,
                seriesId: 7,
                parentId: null,
                content: 'This series proves that slice-of-life can be just as engaging as action series.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-22').toISOString(),
            },
            {
                userId: 9,
                seriesId: 8,
                parentId: null,
                content: 'The psychological aspects are what make this series truly special. Dark but brilliant.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-23').toISOString(),
            },
            {
                userId: 10,
                seriesId: 9,
                parentId: null,
                content: 'A masterclass in psychological thriller storytelling. The mind games are incredible.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-24').toISOString(),
            },
            {
                userId: 1,
                seriesId: 10,
                parentId: null,
                content: 'The alchemy system is so well thought out. Every detail has meaning and purpose.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-25').toISOString(),
            },
            {
                userId: 2,
                seriesId: 11,
                parentId: null,
                content: 'The comedy timing is perfect, and the character growth is surprisingly deep.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-26').toISOString(),
            },
            {
                userId: 3,
                seriesId: 12,
                parentId: null,
                content: 'Historical accuracy combined with compelling character development. A true epic.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-27').toISOString(),
            },
            {
                userId: 4,
                seriesId: 7,
                parentId: 8,
                content: 'Absolutely! The family interactions never get old, even after multiple re-reads.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-28').toISOString(),
            },
            {
                userId: 5,
                seriesId: 1,
                parentId: 1,
                content: 'The animation adaptation was also fantastic, but the manga has so much more depth.',
                edited: 0,
                deleted: 0,
                flagsCount: 0,
                createdAt: new Date('2024-03-29').toISOString(),
            }
        ];

        await db.insert(comments).values(sampleComments);

        console.log('✅ Schema and Data Phase C-D seeder completed successfully');

    } catch (error) {
        console.error('❌ Schema and Data Phase C-D seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});