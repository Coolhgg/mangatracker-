import { db } from '@/db';

async function main() {
    try {
        // Drop existing tables to start fresh
        console.log('🗑️ Dropping existing tables...');
        await db.run(`DROP TABLE IF EXISTS manga_ratings`);
        await db.run(`DROP TABLE IF EXISTS manga_notes`);
        await db.run(`DROP TABLE IF EXISTS manga_comments`);
        await db.run(`DROP TABLE IF EXISTS manga_chapters`);
        await db.run(`DROP TABLE IF EXISTS series`);
        await db.run(`DROP TABLE IF EXISTS users`);
        console.log('✅ Tables dropped successfully');

        // Create users table
        console.log('📝 Creating users table...');
        await db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                avatar_url TEXT,
                roles TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        `);
        console.log('✅ Users table created');

        // Create series table
        console.log('📝 Creating series table...');
        await db.run(`
            CREATE TABLE series (
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
        console.log('✅ Series table created');

        // Create manga_chapters table
        console.log('📝 Creating manga_chapters table...');
        await db.run(`
            CREATE TABLE manga_chapters (
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
        console.log('✅ Manga chapters table created');

        // Create manga_comments table
        console.log('📝 Creating manga_comments table...');
        await db.run(`
            CREATE TABLE manga_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                series_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Manga comments table created');

        // Create manga_notes table
        console.log('📝 Creating manga_notes table...');
        await db.run(`
            CREATE TABLE manga_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                body TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Manga notes table created');

        // Create manga_ratings table
        console.log('📝 Creating manga_ratings table...');
        await db.run(`
            CREATE TABLE manga_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                value INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
                UNIQUE (user_id, series_id)
            )
        `);
        console.log('✅ Manga ratings table created');

        // Insert demo user
        console.log('👤 Inserting demo user...');
        await db.run(`
            INSERT INTO users (email, name, avatar_url, roles, created_at, updated_at)
            VALUES (
                'demo@example.com',
                'Demo User',
                'https://avatars.githubusercontent.com/u/1?v=4',
                '["user"]',
                '${new Date('2024-01-01').toISOString()}',
                '${new Date('2024-01-01').toISOString()}'
            )
        `);
        console.log('✅ Demo user inserted');

        // Insert One Piece series
        console.log('📚 Inserting One Piece series...');
        await db.run(`
            INSERT INTO series (slug, title, description, cover_image_url, source_name, source_url, tags, rating, year, status, created_at, updated_at)
            VALUES (
                'one-piece',
                'One Piece',
                'Gol D. Roger was known as the Pirate King, the strongest and most infamous being to have sailed the Grand Line. The capture and death of Roger by the World Government brought a change throughout the world.',
                'https://img.mangakakalot.com/m/md918437/onepiece_1.jpg',
                'MangaReader',
                'https://mangareader.to/one-piece-3',
                '["adventure", "comedy", "shounen", "pirates"]',
                9.5,
                1997,
                'ongoing',
                '${new Date('2024-01-15').toISOString()}',
                '${new Date('2024-01-15').toISOString()}'
            )
        `);
        console.log('✅ One Piece series inserted');

        // Insert Solo Leveling series
        console.log('📚 Inserting Solo Leveling series...');
        await db.run(`
            INSERT INTO series (slug, title, description, cover_image_url, source_name, source_url, tags, rating, year, status, created_at, updated_at)
            VALUES (
                'solo-leveling',
                'Solo Leveling',
                '10 years ago, after "the Gate" that connected the real world with the monster world opened, some of the ordinary, everyday people received the power to hunt monsters within the Gate.',
                'https://img.mangakakalot.com/m/solo_leveling/solo_leveling_1.jpg',
                'MangaReader',
                'https://mangareader.to/solo-leveling-1',
                '["action", "fantasy", "supernatural", "webtoon"]',
                9.7,
                2018,
                'completed',
                '${new Date('2024-01-20').toISOString()}',
                '${new Date('2024-01-20').toISOString()}'
            )
        `);
        console.log('✅ Solo Leveling series inserted');

        // Insert One Piece chapters
        console.log('📖 Inserting One Piece chapters...');
        const onePieceChapters = [
            { number: 1, title: 'Romance Dawn', publishedAt: '1997-07-22', pages: 54 },
            { number: 2, title: 'They Call Him "Straw Hat Luffy"', publishedAt: '1997-08-04', pages: 20 },
            { number: 3, title: 'Introducing "Pirate Hunter" Zoro', publishedAt: '1997-08-11', pages: 20 },
            { number: 4, title: 'The Captain: Captain Morgan', publishedAt: '1997-08-18', pages: 20 },
            { number: 5, title: 'The King of the Pirates and the Master Swordsman', publishedAt: '1997-08-25', pages: 20 }
        ];

        for (const chapter of onePieceChapters) {
            await db.run(`
                INSERT INTO manga_chapters (series_id, number, title, language, published_at, pages, external_id, source_id, created_at)
                VALUES (
                    1,
                    ${chapter.number},
                    '${chapter.title}',
                    'en',
                    '${chapter.publishedAt}',
                    ${chapter.pages},
                    'op_ch_${chapter.number}',
                    'mangareader_op_${chapter.number}',
                    '${new Date(`2024-01-${15 + chapter.number}`).toISOString()}'
                )
            `);
        }
        console.log('✅ One Piece chapters inserted');

        // Insert Solo Leveling chapters
        console.log('📖 Inserting Solo Leveling chapters...');
        const soloLevelingChapters = [
            { number: 1, title: 'The Weakest Hunter', publishedAt: '2018-03-04', pages: 45 },
            { number: 2, title: 'If I Had Been A Little Stronger', publishedAt: '2018-03-11', pages: 42 },
            { number: 3, title: 'It\'s Still Too Early to Give Up', publishedAt: '2018-03-18', pages: 38 },
            { number: 4, title: 'I Want to Become Strong', publishedAt: '2018-03-25', pages: 40 },
            { number: 5, title: 'World\'s Weakest', publishedAt: '2018-04-01', pages: 44 }
        ];

        for (const chapter of soloLevelingChapters) {
            await db.run(`
                INSERT INTO manga_chapters (series_id, number, title, language, published_at, pages, external_id, source_id, created_at)
                VALUES (
                    2,
                    ${chapter.number},
                    '${chapter.title.replace(/'/g, "''")}',
                    'en',
                    '${chapter.publishedAt}',
                    ${chapter.pages},
                    'sl_ch_${chapter.number}',
                    'mangareader_sl_${chapter.number}',
                    '${new Date(`2024-01-${20 + chapter.number}`).toISOString()}'
                )
            `);
        }
        console.log('✅ Solo Leveling chapters inserted');

        // Insert comments for One Piece
        console.log('💬 Inserting One Piece comments...');
        await db.run(`
            INSERT INTO manga_comments (series_id, user_id, content, created_at)
            VALUES (
                1,
                1,
                'One Piece is absolutely incredible! The world-building is phenomenal and Oda is a master storyteller. Every arc keeps getting better!',
                '${new Date('2024-02-01').toISOString()}'
            )
        `);

        await db.run(`
            INSERT INTO manga_comments (series_id, user_id, content, created_at)
            VALUES (
                1,
                1,
                'Just finished the Marineford arc and I am emotionally destroyed. This series knows how to hit you right in the feels.',
                '${new Date('2024-02-15').toISOString()}'
            )
        `);
        console.log('✅ One Piece comments inserted');

        // Insert comments for Solo Leveling
        console.log('💬 Inserting Solo Leveling comments...');
        await db.run(`
            INSERT INTO manga_comments (series_id, user_id, content, created_at)
            VALUES (
                2,
                1,
                'Solo Leveling has some of the best artwork I have ever seen in a manhwa. The progression system is so satisfying to follow!',
                '${new Date('2024-02-10').toISOString()}'
            )
        `);

        await db.run(`
            INSERT INTO manga_comments (series_id, user_id, content, created_at)
            VALUES (
                2,
                1,
                'Sung Jin-Woo character development is amazing. From the weakest to the strongest - what a journey! The art style perfectly captures his growth.',
                '${new Date('2024-02-20').toISOString()}'
            )
        `);
        console.log('✅ Solo Leveling comments inserted');

        console.log('✅ Quick setup seeder completed successfully');
        
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});