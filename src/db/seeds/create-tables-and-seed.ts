import { db } from '@/db';

async function main() {
    try {
        // STEP 1: Drop and recreate all tables using raw SQL
        console.log('🗑️ Dropping existing tables...');
        
        await db.run(`DROP TABLE IF EXISTS reading_progress;`);
        await db.run(`DROP TABLE IF EXISTS manga_ratings;`);
        await db.run(`DROP TABLE IF EXISTS manga_notes;`);
        await db.run(`DROP TABLE IF EXISTS manga_chapters;`);
        await db.run(`DROP TABLE IF EXISTS series;`);
        await db.run(`DROP TABLE IF EXISTS users;`);

        console.log('🏗️ Creating tables...');

        // Create users table
        await db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                avatar_url TEXT,
                roles TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        `);

        // Create series table
        await db.run(`
            CREATE TABLE series (
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
            );
        `);

        // Create manga_chapters table
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
            );
        `);

        // Create manga_notes table
        await db.run(`
            CREATE TABLE manga_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                body TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
            );
        `);

        // Create manga_ratings table
        await db.run(`
            CREATE TABLE manga_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                value INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
                UNIQUE(user_id, series_id)
            );
        `);

        // Create reading_progress table
        await db.run(`
            CREATE TABLE reading_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                chapter_id INTEGER NOT NULL,
                read_at TEXT NOT NULL,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
                FOREIGN KEY (chapter_id) REFERENCES manga_chapters(id) ON DELETE CASCADE,
                UNIQUE(user_id, chapter_id)
            );
        `);

        // STEP 2: Insert test data using raw SQL
        console.log('📝 Inserting test data...');

        // Insert demo user
        await db.run(`
            INSERT INTO users (email, name, avatar_url, roles, created_at, updated_at) VALUES
            ('demo@example.com', 'Demo User', null, '["user"]', '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z');
        `);

        // Insert series data
        await db.run(`
            INSERT INTO series (slug, title, description, cover_image_url, source_name, source_url, tags, rating, year, status, created_at, updated_at) VALUES
            ('one-piece', 'One Piece', 'Epic pirate adventure following Monkey D. Luffy and his crew as they search for the legendary treasure known as One Piece', 'https://cdn.myanimelist.net/images/manga/2/253146.jpg', 'MangaDx', 'https://mangadx.org/title/one-piece', '["adventure","shounen","pirates"]', 9.2, 1997, 'ongoing', '2024-01-10T00:00:00.000Z', '2024-01-10T00:00:00.000Z'),
            ('solo-leveling', 'Solo Leveling', 'The weakest hunter becomes the strongest through a mysterious system that allows him to level up', 'https://cdn.myanimelist.net/images/manga/3/222295.jpg', 'MangaDx', 'https://mangadx.org/title/solo-leveling', '["action","fantasy","supernatural"]', 8.9, 2016, 'completed', '2024-01-12T00:00:00.000Z', '2024-01-12T00:00:00.000Z');
        `);

        // Insert One Piece chapters
        await db.run(`
            INSERT INTO manga_chapters (series_id, number, title, language, published_at, pages, external_id, source_id, created_at) VALUES
            (1, 1.0, 'Romance Dawn', 'en', '1997-07-22T00:00:00.000Z', 54, 'op_001', 'mdx_op_001', '2024-01-10T01:00:00.000Z'),
            (1, 2.0, 'They Call Him Straw Hat Luffy', 'en', '1997-07-29T00:00:00.000Z', 19, 'op_002', 'mdx_op_002', '2024-01-10T02:00:00.000Z'),
            (1, 3.0, 'Introduce Yourself', 'en', '1997-08-05T00:00:00.000Z', 19, 'op_003', 'mdx_op_003', '2024-01-10T03:00:00.000Z'),
            (1, 4.0, 'The Dawn of Adventure', 'en', '1997-08-12T00:00:00.000Z', 19, 'op_004', 'mdx_op_004', '2024-01-10T04:00:00.000Z');
        `);

        // Insert Solo Leveling chapters
        await db.run(`
            INSERT INTO manga_chapters (series_id, number, title, language, published_at, pages, external_id, source_id, created_at) VALUES
            (2, 1.0, 'The Weakest Hunter', 'en', '2016-03-04T00:00:00.000Z', 68, 'sl_001', 'mdx_sl_001', '2024-01-12T01:00:00.000Z'),
            (2, 2.0, 'If I Had Been A Little Stronger', 'en', '2016-03-11T00:00:00.000Z', 45, 'sl_002', 'mdx_sl_002', '2024-01-12T02:00:00.000Z'),
            (2, 3.0, 'The System', 'en', '2016-03-18T00:00:00.000Z', 52, 'sl_003', 'mdx_sl_003', '2024-01-12T03:00:00.000Z');
        `);

        // Insert sample reading progress
        await db.run(`
            INSERT INTO reading_progress (user_id, series_id, chapter_id, read_at) VALUES
            (1, 1, 1, '2024-01-15T14:30:00.000Z'),
            (1, 1, 2, '2024-01-15T15:45:00.000Z'),
            (1, 2, 1, '2024-01-16T10:20:00.000Z');
        `);

        // Insert sample notes
        await db.run(`
            INSERT INTO manga_notes (user_id, series_id, body, created_at) VALUES
            (1, 1, 'Amazing start to the series! Love Luffy''s determination and the world-building is incredible.', '2024-01-15T16:00:00.000Z'),
            (1, 2, 'The power system is really unique. The concept of leveling up in real life is fascinating.', '2024-01-16T11:00:00.000Z');
        `);

        // Insert sample ratings
        await db.run(`
            INSERT INTO manga_ratings (user_id, series_id, value, created_at) VALUES
            (1, 1, 10, '2024-01-15T16:30:00.000Z'),
            (1, 2, 9, '2024-01-16T11:30:00.000Z');
        `);

        console.log('✅ Database seeder completed successfully');
        console.log('📊 Created tables: users, series, manga_chapters, manga_notes, manga_ratings, reading_progress');
        console.log('📚 Seeded data: 1 user, 2 series, 7 chapters, 3 reading progress entries, 2 notes, 2 ratings');

    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});