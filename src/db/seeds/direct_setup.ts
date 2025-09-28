import { db } from '@/db';

async function main() {
    const currentTimestamp = Date.now();
    
    try {
        console.log('🗑️ Dropping existing tables...');
        
        // Drop tables in dependency order to avoid foreign key constraints
        await db.run('DROP TABLE IF EXISTS ratings');
        await db.run('DROP TABLE IF EXISTS notes');
        await db.run('DROP TABLE IF EXISTS reading_progress');
        await db.run('DROP TABLE IF EXISTS library');
        await db.run('DROP TABLE IF EXISTS comments');
        await db.run('DROP TABLE IF EXISTS chapters');
        await db.run('DROP TABLE IF EXISTS series');
        await db.run('DROP TABLE IF EXISTS users');
        
        console.log('✅ Existing tables dropped successfully');
        
        console.log('🏗️ Creating tables...');
        
        // Create users table
        await db.run(`
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                avatar_url TEXT,
                roles TEXT DEFAULT '[]',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `);
        
        // Create series table
        await db.run(`
            CREATE TABLE series (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                cover_image_url TEXT,
                tags TEXT DEFAULT '[]',
                source_name TEXT,
                source_url TEXT,
                rating_avg REAL DEFAULT 0,
                year INTEGER,
                status TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `);
        
        // Create chapters table
        await db.run(`
            CREATE TABLE chapters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                series_id INTEGER NOT NULL,
                number REAL NOT NULL,
                title TEXT,
                language TEXT DEFAULT 'en',
                published_at INTEGER,
                pages INTEGER,
                url TEXT NOT NULL,
                external_id TEXT,
                created_at INTEGER NOT NULL,
                FOREIGN KEY(series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);
        
        // Create comments table
        await db.run(`
            CREATE TABLE comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                series_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY(series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);
        
        // Create library table
        await db.run(`
            CREATE TABLE library (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                status TEXT DEFAULT 'reading',
                created_at INTEGER NOT NULL,
                UNIQUE(user_id, series_id),
                FOREIGN KEY(series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);
        
        // Create reading_progress table
        await db.run(`
            CREATE TABLE reading_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                chapter_id INTEGER NOT NULL,
                progress REAL DEFAULT 1.0,
                created_at INTEGER NOT NULL,
                UNIQUE(user_id, chapter_id),
                FOREIGN KEY(series_id) REFERENCES series(id) ON DELETE CASCADE,
                FOREIGN KEY(chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
            )
        `);
        
        // Create notes table
        await db.run(`
            CREATE TABLE notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                body TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY(series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);
        
        // Create ratings table
        await db.run(`
            CREATE TABLE ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL,
                value INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                UNIQUE(user_id, series_id),
                FOREIGN KEY(series_id) REFERENCES series(id) ON DELETE CASCADE
            )
        `);
        
        console.log('✅ All tables created successfully');
        
        console.log('📝 Inserting sample data...');
        
        // Insert users
        await db.run(`
            INSERT INTO users (email, name, avatar_url, roles, created_at, updated_at) VALUES
            ('john.doe@example.com', 'John Doe', 'https://avatars.githubusercontent.com/u/1?v=4', '["user"]', ${currentTimestamp - 86400000}, ${currentTimestamp - 86400000}),
            ('jane.smith@example.com', 'Jane Smith', 'https://avatars.githubusercontent.com/u/2?v=4', '["user", "moderator"]', ${currentTimestamp - 172800000}, ${currentTimestamp - 172800000}),
            ('mike.wilson@example.com', 'Mike Wilson', 'https://avatars.githubusercontent.com/u/3?v=4', '["user"]', ${currentTimestamp - 259200000}, ${currentTimestamp - 259200000}),
            ('sarah.jones@example.com', 'Sarah Jones', null, '["user"]', ${currentTimestamp - 345600000}, ${currentTimestamp - 345600000}),
            ('admin@example.com', 'Admin User', 'https://avatars.githubusercontent.com/u/5?v=4', '["admin", "moderator", "user"]', ${currentTimestamp - 432000000}, ${currentTimestamp - 432000000})
        `);
        
        // Insert series
        await db.run(`
            INSERT INTO series (slug, title, description, cover_image_url, tags, source_name, source_url, rating_avg, year, status, created_at, updated_at) VALUES
            ('one-piece', 'One Piece', 'Follow Monkey D. Luffy and his crew in their epic adventure to find the legendary treasure known as One Piece.', 'https://example.com/covers/one-piece.jpg', '["adventure", "shounen", "pirates"]', 'MangaPlus', 'https://mangaplus.shueisha.co.jp/titles/100020', 4.8, 1997, 'ongoing', ${currentTimestamp - 86400000}, ${currentTimestamp - 86400000}),
            ('attack-on-titan', 'Attack on Titan', 'Humanity fights for survival against giant humanoid Titans behind massive walls.', 'https://example.com/covers/aot.jpg', '["action", "drama", "supernatural"]', 'Crunchyroll', 'https://www.crunchyroll.com/comics/manga/attack-on-titan/volumes', 4.9, 2009, 'completed', ${currentTimestamp - 172800000}, ${currentTimestamp - 172800000}),
            ('demon-slayer', 'Demon Slayer', 'A young boy becomes a demon slayer to save his sister and avenge his family.', 'https://example.com/covers/demon-slayer.jpg', '["action", "supernatural", "historical"]', 'VIZ Media', 'https://www.viz.com/demon-slayer-kimetsu-no-yaiba', 4.7, 2016, 'completed', ${currentTimestamp - 259200000}, ${currentTimestamp - 259200000}),
            ('my-hero-academia', 'My Hero Academia', 'In a world where superpowers are common, a powerless boy dreams of becoming a hero.', 'https://example.com/covers/mha.jpg', '["superhero", "shounen", "school"]', 'MangaPlus', 'https://mangaplus.shueisha.co.jp/titles/100017', 4.6, 2014, 'ongoing', ${currentTimestamp - 345600000}, ${currentTimestamp - 345600000}),
            ('jujutsu-kaisen', 'Jujutsu Kaisen', 'Students battle cursed spirits using supernatural abilities in modern Japan.', 'https://example.com/covers/jjk.jpg', '["supernatural", "school", "action"]', 'MangaPlus', 'https://mangaplus.shueisha.co.jp/titles/100034', 4.5, 2018, 'ongoing', ${currentTimestamp - 432000000}, ${currentTimestamp - 432000000})
        `);
        
        // Insert chapters
        await db.run(`
            INSERT INTO chapters (series_id, number, title, language, published_at, pages, url, external_id, created_at) VALUES
            (1, 1, 'Romance Dawn', 'en', ${currentTimestamp - 86400000}, 52, 'https://mangaplus.shueisha.co.jp/viewer/1000001', 'op_001', ${currentTimestamp - 86400000}),
            (1, 2, 'They Call Him "Straw Hat Luffy"', 'en', ${currentTimestamp - 82800000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000002', 'op_002', ${currentTimestamp - 82800000}),
            (1, 3, 'Introduce Yourself', 'en', ${currentTimestamp - 79200000}, 20, 'https://mangaplus.shueisha.co.jp/viewer/1000003', 'op_003', ${currentTimestamp - 79200000}),
            (2, 1, 'To You, in 2000 Years', 'en', ${currentTimestamp - 172800000}, 45, 'https://crunchyroll.com/read/aot/chapter/1', 'aot_001', ${currentTimestamp - 172800000}),
            (2, 2, 'That Day', 'en', ${currentTimestamp - 169200000}, 41, 'https://crunchyroll.com/read/aot/chapter/2', 'aot_002', ${currentTimestamp - 169200000}),
            (3, 1, 'Cruelty', 'en', ${currentTimestamp - 259200000}, 53, 'https://viz.com/read/demon-slayer/chapter/1', 'ds_001', ${currentTimestamp - 259200000}),
            (3, 2, 'Stranger', 'en', ${currentTimestamp - 255600000}, 20, 'https://viz.com/read/demon-slayer/chapter/2', 'ds_002', ${currentTimestamp - 255600000}),
            (4, 1, 'Izuku Midoriya: Origin', 'en', ${currentTimestamp - 345600000}, 55, 'https://mangaplus.shueisha.co.jp/viewer/1002277', 'mha_001', ${currentTimestamp - 345600000}),
            (5, 1, 'Ryomen Sukuna', 'en', ${currentTimestamp - 432000000}, 46, 'https://mangaplus.shueisha.co.jp/viewer/1006371', 'jjk_001', ${currentTimestamp - 432000000}),
            (5, 2, 'For Myself', 'en', ${currentTimestamp - 428400000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1006372', 'jjk_002', ${currentTimestamp - 428400000})
        `);
        
        // Insert comments
        await db.run(`
            INSERT INTO comments (series_id, user_id, content, created_at) VALUES
            (1, 1, 'One Piece is absolutely amazing! The world-building is incredible and Oda is a master storyteller.', ${currentTimestamp - 43200000}),
            (1, 2, 'Been reading this for over 20 years and it never gets old. Each arc is better than the last!', ${currentTimestamp - 39600000}),
            (2, 3, 'Attack on Titan has one of the best plot twists in manga history. The ending was controversial but I loved it.', ${currentTimestamp - 36000000}),
            (2, 1, 'The art style really evolved throughout the series. Incredible character development.', ${currentTimestamp - 32400000}),
            (3, 4, 'Demon Slayer has beautiful art and great action scenes. The animation adaptation was phenomenal.', ${currentTimestamp - 28800000}),
            (4, 2, 'My Hero Academia does a great job exploring what it means to be a hero in modern society.', ${currentTimestamp - 25200000}),
            (5, 5, 'Jujutsu Kaisen has some of the best fight choreography in modern manga. Gojo is incredible!', ${currentTimestamp - 21600000})
        `);
        
        // Insert library entries
        await db.run(`
            INSERT INTO library (user_id, series_id, status, created_at) VALUES
            (1, 1, 'reading', ${currentTimestamp - 86400000}),
            (1, 2, 'completed', ${currentTimestamp - 82800000}),
            (1, 3, 'completed', ${currentTimestamp - 79200000}),
            (2, 1, 'reading', ${currentTimestamp - 75600000}),
            (2, 4, 'reading', ${currentTimestamp - 72000000}),
            (3, 2, 'completed', ${currentTimestamp - 68400000}),
            (3, 5, 'reading', ${currentTimestamp - 64800000}),
            (4, 1, 'plan_to_read', ${currentTimestamp - 61200000}),
            (4, 3, 'reading', ${currentTimestamp - 57600000}),
            (5, 1, 'reading', ${currentTimestamp - 54000000})
        `);
        
        // Insert reading progress
        await db.run(`
            INSERT INTO reading_progress (user_id, series_id, chapter_id, progress, created_at) VALUES
            (1, 1, 1, 1.0, ${currentTimestamp - 50400000}),
            (1, 1, 2, 1.0, ${currentTimestamp - 46800000}),
            (1, 1, 3, 0.75, ${currentTimestamp - 43200000}),
            (1, 2, 4, 1.0, ${currentTimestamp - 39600000}),
            (1, 2, 5, 1.0, ${currentTimestamp - 36000000}),
            (2, 1, 1, 1.0, ${currentTimestamp - 32400000}),
            (2, 1, 2, 0.5, ${currentTimestamp - 28800000}),
            (3, 2, 4, 1.0, ${currentTimestamp - 25200000}),
            (4, 3, 6, 1.0, ${currentTimestamp - 21600000}),
            (5, 5, 9, 1.0, ${currentTimestamp - 18000000})
        `);
        
        // Insert notes
        await db.run(`
            INSERT INTO notes (user_id, series_id, body, created_at) VALUES
            (1, 1, 'Love the character development in the Arlong Park arc. Nami backstory was heartbreaking.', ${currentTimestamp - 14400000}),
            (1, 2, 'The basement reveal completely changed everything I thought I knew about this series.', ${currentTimestamp - 10800000}),
            (2, 1, 'Oda foreshadowing is incredible. Need to reread from the beginning to catch all the hints.', ${currentTimestamp - 7200000}),
            (3, 5, 'The Shibuya Incident arc is peak Jujutsu Kaisen. So much character growth and amazing fights.', ${currentTimestamp - 3600000}),
            (4, 3, 'The Water Breathing techniques are so beautifully illustrated. Tanjiro development is great.', ${currentTimestamp - 1800000})
        `);
        
        // Insert ratings
        await db.run(`
            INSERT INTO ratings (user_id, series_id, value, created_at) VALUES
            (1, 1, 10, ${currentTimestamp - 86400000}),
            (1, 2, 9, ${currentTimestamp - 82800000}),
            (1, 3, 8, ${currentTimestamp - 79200000}),
            (2, 1, 9, ${currentTimestamp - 75600000}),
            (2, 4, 8, ${currentTimestamp - 72000000}),
            (3, 2, 10, ${currentTimestamp - 68400000}),
            (3, 5, 9, ${currentTimestamp - 64800000}),
            (4, 3, 9, ${currentTimestamp - 57600000}),
            (5, 1, 8, ${currentTimestamp - 54000000}),
            (5, 5, 10, ${currentTimestamp - 50400000})
        `);
        
        console.log('✅ Sample data inserted successfully');
        console.log('✅ Direct SQL seeder completed successfully');
        
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});