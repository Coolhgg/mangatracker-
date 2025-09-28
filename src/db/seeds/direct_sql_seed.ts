import { db } from '@/db';

async function main() {
    try {
        // Drop existing tables if they exist
        await db.run(`DROP TABLE IF EXISTS reactions`);
        await db.run(`DROP TABLE IF EXISTS comments`);
        await db.run(`DROP TABLE IF EXISTS progress`);
        await db.run(`DROP TABLE IF EXISTS library`);
        await db.run(`DROP TABLE IF EXISTS manga_chapters`);
        await db.run(`DROP TABLE IF EXISTS series`);
        await db.run(`DROP TABLE IF EXISTS users`);

        // Create users table
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

        // Create series table
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
            )
        `);

        // Create library table
        await db.run(`
            CREATE TABLE library (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                status TEXT DEFAULT 'reading',
                rating INTEGER,
                notes TEXT,
                notifications INTEGER DEFAULT 1,
                last_read_chapter_id INTEGER,
                last_read_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
                FOREIGN KEY (last_read_chapter_id) REFERENCES manga_chapters(id),
                UNIQUE(user_id, series_id)
            )
        `);

        // Create progress table
        await db.run(`
            CREATE TABLE progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                chapter_id INTEGER NOT NULL,
                current_page INTEGER DEFAULT 0,
                completed INTEGER DEFAULT 0,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
                FOREIGN KEY (chapter_id) REFERENCES manga_chapters(id) ON DELETE CASCADE,
                UNIQUE(user_id, series_id, chapter_id)
            )
        `);

        // Create comments table
        await db.run(`
            CREATE TABLE comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                parent_id INTEGER,
                content TEXT NOT NULL,
                edited INTEGER DEFAULT 0,
                deleted INTEGER DEFAULT 0,
                flags_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (series_id) REFERENCES series(id),
                FOREIGN KEY (parent_id) REFERENCES comments(id)
            )
        `);

        // Insert sample users
        await db.run(`
            INSERT INTO users (email, name, avatar_url, roles, created_at, updated_at) VALUES
            ('john.doe@example.com', 'John Doe', 'https://avatars.example.com/john.jpg', '["user"]', '2024-01-15T10:00:00.000Z', '2024-01-15T10:00:00.000Z'),
            ('jane.smith@example.com', 'Jane Smith', 'https://avatars.example.com/jane.jpg', '["user", "moderator"]', '2024-01-20T14:30:00.000Z', '2024-01-20T14:30:00.000Z'),
            ('mike.wilson@example.com', 'Mike Wilson', 'https://avatars.example.com/mike.jpg', '["user"]', '2024-02-01T09:15:00.000Z', '2024-02-01T09:15:00.000Z'),
            ('sarah.jones@example.com', 'Sarah Jones', 'https://avatars.example.com/sarah.jpg', '["user"]', '2024-02-05T16:45:00.000Z', '2024-02-05T16:45:00.000Z'),
            ('admin@example.com', 'Admin User', 'https://avatars.example.com/admin.jpg', '["user", "admin"]', '2024-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')
        `);

        // Insert sample series
        await db.run(`
            INSERT INTO series (slug, title, description, cover_image_url, source_name, source_url, tags, rating, year, status, created_at, updated_at) VALUES
            ('one-piece', 'One Piece', 'Follow Monkey D. Luffy on his quest to become the Pirate King in this epic adventure manga.', 'https://covers.example.com/one-piece.jpg', 'MangaPlus', 'https://mangaplus.shueisha.co.jp/titles/100020', '["adventure", "shounen", "pirates"]', 9.2, 1997, 'ongoing', '2024-01-10T08:00:00.000Z', '2024-01-10T08:00:00.000Z'),
            ('demon-slayer', 'Demon Slayer: Kimetsu no Yaiba', 'Tanjiro Kamado becomes a demon slayer to save his sister Nezuko and avenge his family.', 'https://covers.example.com/demon-slayer.jpg', 'VIZ Media', 'https://www.viz.com/shonenjump/demon-slayer', '["supernatural", "shounen", "demons"]', 8.9, 2016, 'completed', '2024-01-12T10:30:00.000Z', '2024-01-12T10:30:00.000Z'),
            ('my-hero-academia', 'My Hero Academia', 'In a world where most people have superpowers, Izuku Midoriya dreams of becoming a hero despite being born without quirks.', 'https://covers.example.com/mha.jpg', 'VIZ Media', 'https://www.viz.com/shonenjump/my-hero-academia', '["superhero", "shounen", "school"]', 8.7, 2014, 'ongoing', '2024-01-14T12:15:00.000Z', '2024-01-14T12:15:00.000Z'),
            ('attack-on-titan', 'Attack on Titan', 'Humanity fights for survival against giant humanoid Titans behind massive walls.', 'https://covers.example.com/aot.jpg', 'Kodansha', 'https://kodansha.us/series/attack-on-titan/', '["action", "drama", "titans"]', 9.0, 2009, 'completed', '2024-01-16T14:00:00.000Z', '2024-01-16T14:00:00.000Z'),
            ('jujutsu-kaisen', 'Jujutsu Kaisen', 'Yuji Itadori joins a secret organization of Jujutsu Sorcerers to eliminate deadly Curses.', 'https://covers.example.com/jjk.jpg', 'VIZ Media', 'https://www.viz.com/shonenjump/jujutsu-kaisen', '["supernatural", "shounen", "curses"]', 8.8, 2018, 'ongoing', '2024-01-18T16:30:00.000Z', '2024-01-18T16:30:00.000Z')
        `);

        // Insert manga chapters (5 per series)
        await db.run(`
            INSERT INTO manga_chapters (series_id, number, title, language, published_at, pages, external_id, source_id, created_at) VALUES
            (1, 1, 'Romance Dawn', 'en', '2024-01-10T00:00:00.000Z', 54, 'op_001', 'mangaplus_001', '2024-01-10T08:00:00.000Z'),
            (1, 2, 'They Call Him "Straw Hat Luffy"', 'en', '2024-01-17T00:00:00.000Z', 20, 'op_002', 'mangaplus_002', '2024-01-17T08:00:00.000Z'),
            (1, 3, 'Introduce Yourself', 'en', '2024-01-24T00:00:00.000Z', 20, 'op_003', 'mangaplus_003', '2024-01-24T08:00:00.000Z'),
            (1, 4, 'The Dawn of an Adventure', 'en', '2024-01-31T00:00:00.000Z', 20, 'op_004', 'mangaplus_004', '2024-01-31T08:00:00.000Z'),
            (1, 5, 'The King of the Pirates and the Master Swordsman', 'en', '2024-02-07T00:00:00.000Z', 20, 'op_005', 'mangaplus_005', '2024-02-07T08:00:00.000Z'),
            (2, 1, 'Cruelty', 'en', '2024-01-12T00:00:00.000Z', 20, 'ds_001', 'viz_001', '2024-01-12T10:30:00.000Z'),
            (2, 2, 'Stranger', 'en', '2024-01-19T00:00:00.000Z', 20, 'ds_002', 'viz_002', '2024-01-19T10:30:00.000Z'),
            (2, 3, 'Sabito and Makomo', 'en', '2024-01-26T00:00:00.000Z', 20, 'ds_003', 'viz_003', '2024-01-26T10:30:00.000Z'),
            (2, 4, 'Final Selection', 'en', '2024-02-02T00:00:00.000Z', 20, 'ds_004', 'viz_004', '2024-02-02T10:30:00.000Z'),
            (2, 5, 'My Own Steel', 'en', '2024-02-09T00:00:00.000Z', 20, 'ds_005', 'viz_005', '2024-02-09T10:30:00.000Z'),
            (3, 1, 'Izuku Midoriya: Origin', 'en', '2024-01-14T00:00:00.000Z', 55, 'mha_001', 'viz_006', '2024-01-14T12:15:00.000Z'),
            (3, 2, 'What It Takes to Be a Hero', 'en', '2024-01-21T00:00:00.000Z', 20, 'mha_002', 'viz_007', '2024-01-21T12:15:00.000Z'),
            (3, 3, 'Roaring Muscles', 'en', '2024-01-28T00:00:00.000Z', 20, 'mha_003', 'viz_008', '2024-01-28T12:15:00.000Z'),
            (3, 4, 'Start Line', 'en', '2024-02-04T00:00:00.000Z', 20, 'mha_004', 'viz_009', '2024-02-04T12:15:00.000Z'),
            (3, 5, 'What I Can Do for Now', 'en', '2024-02-11T00:00:00.000Z', 20, 'mha_005', 'viz_010', '2024-02-11T12:15:00.000Z'),
            (4, 1, 'To You, in 2000 Years', 'en', '2024-01-16T00:00:00.000Z', 45, 'aot_001', 'kodansha_001', '2024-01-16T14:00:00.000Z'),
            (4, 2, 'That Day', 'en', '2024-01-23T00:00:00.000Z', 20, 'aot_002', 'kodansha_002', '2024-01-23T14:00:00.000Z'),
            (4, 3, 'A Dim Light Amid Despair', 'en', '2024-01-30T00:00:00.000Z', 20, 'aot_003', 'kodansha_003', '2024-01-30T14:00:00.000Z'),
            (4, 4, 'The Night of the Closing Ceremony', 'en', '2024-02-06T00:00:00.000Z', 20, 'aot_004', 'kodansha_004', '2024-02-06T14:00:00.000Z'),
            (4, 5, 'First Battle', 'en', '2024-02-13T00:00:00.000Z', 20, 'aot_005', 'kodansha_005', '2024-02-13T14:00:00.000Z'),
            (5, 1, 'Ryomen Sukuna', 'en', '2024-01-18T00:00:00.000Z', 20, 'jjk_001', 'viz_011', '2024-01-18T16:30:00.000Z'),
            (5, 2, 'For Myself', 'en', '2024-01-25T00:00:00.000Z', 20, 'jjk_002', 'viz_012', '2024-01-25T16:30:00.000Z'),
            (5, 3, 'Girl of Steel', 'en', '2024-02-01T00:00:00.000Z', 20, 'jjk_003', 'viz_013', '2024-02-01T16:30:00.000Z'),
            (5, 4, 'Curse Womb Must Die', 'en', '2024-02-08T00:00:00.000Z', 20, 'jjk_004', 'viz_014', '2024-02-08T16:30:00.000Z'),
            (5, 5, 'Curse Womb Must Die -2-', 'en', '2024-02-15T00:00:00.000Z', 20, 'jjk_005', 'viz_015', '2024-02-15T16:30:00.000Z')
        `);

        // Insert library entries
        await db.run(`
            INSERT INTO library (user_id, series_id, status, rating, notes, notifications, last_read_chapter_id, last_read_at, created_at, updated_at) VALUES
            (1, 1, 'reading', 9, 'Amazing adventure story! Love the world building.', 1, 3, '2024-02-10T20:30:00.000Z', '2024-01-15T10:00:00.000Z', '2024-02-10T20:30:00.000Z'),
            (2, 2, 'completed', 10, 'Perfect ending to an incredible series.', 0, 5, '2024-02-15T18:45:00.000Z', '2024-01-22T14:30:00.000Z', '2024-02-15T18:45:00.000Z'),
            (1, 3, 'plan_to_read', null, 'Heard great things about this one.', 1, null, null, '2024-02-01T16:00:00.000Z', '2024-02-01T16:00:00.000Z')
        `);

        // Insert progress entries
        await db.run(`
            INSERT INTO progress (user_id, series_id, chapter_id, current_page, completed, updated_at) VALUES
            (1, 1, 3, 15, 0, '2024-02-10T20:30:00.000Z'),
            (2, 2, 5, 20, 1, '2024-02-15T18:45:00.000Z')
        `);

        // Insert comments
        await db.run(`
            INSERT INTO comments (user_id, series_id, parent_id, content, edited, deleted, flags_count, created_at) VALUES
            (1, 1, null, 'This series just keeps getting better! The latest chapter was incredible.', 0, 0, 0, '2024-02-12T14:30:00.000Z'),
            (2, 1, 1, 'I totally agree! The character development has been amazing.', 0, 0, 0, '2024-02-12T15:45:00.000Z'),
            (3, 2, null, 'Just finished reading this masterpiece. What an emotional journey!', 0, 0, 0, '2024-02-16T10:20:00.000Z'),
            (1, 3, null, 'Planning to start this one next. The art style looks fantastic!', 0, 0, 0, '2024-02-18T12:15:00.000Z'),
            (4, 1, null, 'Been following this series for years. Still my favorite manga of all time!', 0, 0, 0, '2024-02-20T19:00:00.000Z')
        `);

        console.log('✅ Direct SQL seeder completed successfully');
        
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});