import { db } from '@/db';

async function main() {
    const now = Date.now();
    
    try {
        // Create tables if they don't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                avatar_url TEXT,
                roles TEXT DEFAULT '[]',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS series (
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

        await db.run(`
            CREATE TABLE IF NOT EXISTS chapters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                series_id INTEGER NOT NULL REFERENCES series(id),
                number REAL NOT NULL,
                title TEXT,
                language TEXT DEFAULT 'en',
                published_at INTEGER,
                pages INTEGER,
                url TEXT NOT NULL,
                external_id TEXT,
                created_at INTEGER NOT NULL
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                series_id INTEGER NOT NULL REFERENCES series(id),
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS library (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL REFERENCES series(id),
                status TEXT DEFAULT 'reading',
                created_at INTEGER NOT NULL,
                UNIQUE(user_id, series_id)
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS reading_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL REFERENCES series(id),
                chapter_id INTEGER NOT NULL REFERENCES chapters(id),
                progress REAL DEFAULT 1.0,
                created_at INTEGER NOT NULL,
                UNIQUE(user_id, chapter_id)
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL REFERENCES series(id),
                body TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
        `);

        await db.run(`
            CREATE TABLE IF NOT EXISTS ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                series_id INTEGER NOT NULL REFERENCES series(id),
                value INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                UNIQUE(user_id, series_id)
            )
        `);

        // Insert users
        await db.run(`
            INSERT INTO users (id, email, name, avatar_url, roles, created_at, updated_at) VALUES
            (1, 'john.doe@manga.com', 'John Doe', 'https://avatars.githubusercontent.com/u/1?v=4', '["user"]', ${now - 86400000 * 30}, ${now - 86400000 * 30}),
            (2, 'jane.smith@manga.com', 'Jane Smith', 'https://avatars.githubusercontent.com/u/2?v=4', '["user", "moderator"]', ${now - 86400000 * 20}, ${now - 86400000 * 20}),
            (3, 'mike.wilson@manga.com', 'Mike Wilson', 'https://avatars.githubusercontent.com/u/3?v=4', '["user", "admin"]', ${now - 86400000 * 10}, ${now - 86400000 * 10})
        `);

        // Insert series
        await db.run(`
            INSERT INTO series (id, slug, title, description, cover_image_url, tags, source_name, source_url, rating_avg, year, status, created_at, updated_at) VALUES
            (1, 'one-piece', 'One Piece', 'Follow Monkey D. Luffy and his Straw Hat Pirates as they search for the legendary treasure known as the One Piece in order to become the next Pirate King.', 'https://cdn.myanimelist.net/images/manga/2/253146.jpg', '["adventure", "comedy", "shounen", "pirates"]', 'MangaPlus', 'https://mangaplus.shueisha.co.jp/titles/100020', 4.8, 1997, 'ongoing', ${now - 86400000 * 25}, ${now - 86400000 * 1}),
            (2, 'solo-leveling', 'Solo Leveling', 'In a world where hunters fight dangerous monsters, the weakest hunter Sung Jin-Woo gains the ability to level up and become incredibly powerful.', 'https://cdn.myanimelist.net/images/manga/3/222295.jpg', '["action", "fantasy", "webtoon", "leveling"]', 'Webtoon', 'https://www.webtoons.com/en/action/solo-leveling/list?title_no=1477', 4.9, 2018, 'completed', ${now - 86400000 * 15}, ${now - 86400000 * 5}),
            (3, 'berserk', 'Berserk', 'The dark fantasy tale of Guts, a lone warrior cursed to hunt demons, seeking revenge against his former friend Griffith who betrayed him.', 'https://cdn.myanimelist.net/images/manga/1/157897.jpg', '["dark fantasy", "horror", "seinen", "demons"]', 'MangaSee', 'https://mangasee123.com/manga/Berserk', 4.9, 1989, 'ongoing', ${now - 86400000 * 35}, ${now - 86400000 * 7})
        `);

        // Insert chapters for One Piece
        await db.run(`
            INSERT INTO chapters (series_id, number, title, language, published_at, pages, url, external_id, created_at) VALUES
            (1, 1.0, 'Romance Dawn', 'en', ${now - 86400000 * 365 * 25}, 54, 'https://mangaplus.shueisha.co.jp/viewer/1000001', 'op_001', ${now - 86400000 * 25}),
            (1, 2.0, 'They Call Him "Straw Hat Luffy"', 'en', ${now - 86400000 * 365 * 25 + 604800000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000002', 'op_002', ${now - 86400000 * 24}),
            (1, 3.0, 'Introduce Yourself', 'en', ${now - 86400000 * 365 * 25 + 1209600000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000003', 'op_003', ${now - 86400000 * 23}),
            (1, 4.0, 'The Dawn of Adventure', 'en', ${now - 86400000 * 365 * 25 + 1814400000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000004', 'op_004', ${now - 86400000 * 22}),
            (1, 5.0, 'The King of the Pirates and the Master Swordsman', 'en', ${now - 86400000 * 365 * 25 + 2419200000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000005', 'op_005', ${now - 86400000 * 21}),
            (1, 6.0, 'The First', 'en', ${now - 86400000 * 365 * 25 + 3024000000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000006', 'op_006', ${now - 86400000 * 20}),
            (1, 7.0, 'Friends', 'en', ${now - 86400000 * 365 * 25 + 3628800000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000007', 'op_007', ${now - 86400000 * 19}),
            (1, 8.0, 'Nami', 'en', ${now - 86400000 * 365 * 25 + 4233600000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000008', 'op_008', ${now - 86400000 * 18}),
            (1, 9.0, 'The Honorable Liar', 'en', ${now - 86400000 * 365 * 25 + 4838400000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000009', 'op_009', ${now - 86400000 * 17}),
            (1, 10.0, 'The Weirdest Guy in the World', 'en', ${now - 86400000 * 365 * 25 + 5443200000}, 19, 'https://mangaplus.shueisha.co.jp/viewer/1000010', 'op_010', ${now - 86400000 * 16})
        `);

        // Insert chapters for Solo Leveling
        await db.run(`
            INSERT INTO chapters (series_id, number, title, language, published_at, pages, url, external_id, created_at) VALUES
            (2, 1.0, 'I''m the Weakest Hunter of All Mankind', 'en', ${now - 86400000 * 365 * 5}, 45, 'https://www.webtoons.com/en/action/solo-leveling/chapter-1/viewer?title_no=1477&episode_no=1', 'sl_001', ${now - 86400000 * 15}),
            (2, 2.0, 'If I Don''t Get Stronger, I''ll Die', 'en', ${now - 86400000 * 365 * 5 + 604800000}, 38, 'https://www.webtoons.com/en/action/solo-leveling/chapter-2/viewer?title_no=1477&episode_no=2', 'sl_002', ${now - 86400000 * 14}),
            (2, 3.0, 'It''s Like a Game', 'en', ${now - 86400000 * 365 * 5 + 1209600000}, 42, 'https://www.webtoons.com/en/action/solo-leveling/chapter-3/viewer?title_no=1477&episode_no=3', 'sl_003', ${now - 86400000 * 13}),
            (2, 4.0, 'I Want to Become Strong', 'en', ${now - 86400000 * 365 * 5 + 1814400000}, 40, 'https://www.webtoons.com/en/action/solo-leveling/chapter-4/viewer?title_no=1477&episode_no=4', 'sl_004', ${now - 86400000 * 12}),
            (2, 5.0, 'The Real Hunt Begins Now', 'en', ${now - 86400000 * 365 * 5 + 2419200000}, 39, 'https://www.webtoons.com/en/action/solo-leveling/chapter-5/viewer?title_no=1477&episode_no=5', 'sl_005', ${now - 86400000 * 11}),
            (2, 6.0, 'The Weakest Hunter''s Tag-along', 'en', ${now - 86400000 * 365 * 5 + 3024000000}, 41, 'https://www.webtoons.com/en/action/solo-leveling/chapter-6/viewer?title_no=1477&episode_no=6', 'sl_006', ${now - 86400000 * 10}),
            (2, 7.0, 'The Stronger the Monster, the Better the Reward', 'en', ${now - 86400000 * 365 * 5 + 3628800000}, 43, 'https://www.webtoons.com/en/action/solo-leveling/chapter-7/viewer?title_no=1477&episode_no=7', 'sl_007', ${now - 86400000 * 9}),
            (2, 8.0, 'This is Frustrating', 'en', ${now - 86400000 * 365 * 5 + 4233600000}, 37, 'https://www.webtoons.com/en/action/solo-leveling/chapter-8/viewer?title_no=1477&episode_no=8', 'sl_008', ${now - 86400000 * 8}),
            (2, 9.0, 'You''ve Gotta be Kidding Me', 'en', ${now - 86400000 * 365 * 5 + 4838400000}, 44, 'https://www.webtoons.com/en/action/solo-leveling/chapter-9/viewer?title_no=1477&episode_no=9', 'sl_009', ${now - 86400000 * 7}),
            (2, 10.0, 'What Am I Supposed to Do with This?', 'en', ${now - 86400000 * 365 * 5 + 5443200000}, 40, 'https://www.webtoons.com/en/action/solo-leveling/chapter-10/viewer?title_no=1477&episode_no=10', 'sl_010', ${now - 86400000 * 6})
        `);

        // Insert chapters for Berserk
        await db.run(`
            INSERT INTO chapters (series_id, number, title, language, published_at, pages, url, external_id, created_at) VALUES
            (3, 1.0, 'The Black Swordsman', 'en', ${now - 86400000 * 365 * 35}, 25, 'https://mangasee123.com/read-online/Berserk-chapter-1.html', 'br_001', ${now - 86400000 * 35}),
            (3, 2.0, 'The Brand', 'en', ${now - 86400000 * 365 * 35 + 2592000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-2.html', 'br_002', ${now - 86400000 * 34}),
            (3, 3.0, 'The Guardians of Desire', 'en', ${now - 86400000 * 365 * 35 + 5184000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-3.html', 'br_003', ${now - 86400000 * 33}),
            (3, 4.0, 'The Guardian Angels of Desire', 'en', ${now - 86400000 * 365 * 35 + 7776000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-4.html', 'br_004', ${now - 86400000 * 32}),
            (3, 5.0, 'The Guardians of Desire', 'en', ${now - 86400000 * 365 * 35 + 10368000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-5.html', 'br_005', ${now - 86400000 * 31}),
            (3, 6.0, 'The Guardians of Desire', 'en', ${now - 86400000 * 365 * 35 + 12960000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-6.html', 'br_006', ${now - 86400000 * 30}),
            (3, 7.0, 'The Guardians of Desire', 'en', ${now - 86400000 * 365 * 35 + 15552000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-7.html', 'br_007', ${now - 86400000 * 29}),
            (3, 8.0, 'The Guardians of Desire', 'en', ${now - 86400000 * 365 * 35 + 18144000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-8.html', 'br_008', ${now - 86400000 * 28}),
            (3, 9.0, 'The Guardians of Desire', 'en', ${now - 86400000 * 365 * 35 + 20736000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-9.html', 'br_009', ${now - 86400000 * 27}),
            (3, 10.0, 'Nosferatu Zodd', 'en', ${now - 86400000 * 365 * 35 + 23328000000}, 20, 'https://mangasee123.com/read-online/Berserk-chapter-10.html', 'br_010', ${now - 86400000 * 26})
        `);

        // Insert comments
        await db.run(`
            INSERT INTO comments (series_id, user_id, content, created_at) VALUES
            (1, 1, 'One Piece never fails to amaze me! The world-building is incredible.', ${now - 86400000 * 5}),
            (1, 2, 'Luffy''s journey is so inspiring. Can''t wait for the next chapter!', ${now - 86400000 * 3}),
            (2, 1, 'Solo Leveling has amazing artwork and such an engaging power system.', ${now - 86400000 * 7}),
            (2, 3, 'Jin-Woo''s character development is phenomenal. Best webtoon ever!', ${now - 86400000 * 2}),
            (3, 2, 'Berserk is a masterpiece. Miura''s art is unmatched.', ${now - 86400000 * 10}),
            (3, 3, 'The Golden Age arc still gives me chills. RIP Kentaro Miura.', ${now - 86400000 * 4}),
            (1, 3, 'The Straw Hat crew dynamics are what make this series special.', ${now - 86400000 * 1}),
            (2, 2, 'The shadow soldiers are so cool! Love the strategic battles.', ${now - 86400000 * 6})
        `);

        // Insert library entries
        await db.run(`
            INSERT INTO library (user_id, series_id, status, created_at) VALUES
            (1, 1, 'reading', ${now - 86400000 * 20}),
            (1, 2, 'completed', ${now - 86400000 * 15}),
            (1, 3, 'plan_to_read', ${now - 86400000 * 10}),
            (2, 1, 'reading', ${now - 86400000 * 18}),
            (2, 2, 'reading', ${now - 86400000 * 12}),
            (2, 3, 'reading', ${now - 86400000 * 8}),
            (3, 1, 'completed', ${now - 86400000 * 25}),
            (3, 2, 'completed', ${now - 86400000 * 14}),
            (3, 3, 'reading', ${now - 86400000 * 6})
        `);

        // Insert reading progress
        await db.run(`
            INSERT INTO reading_progress (user_id, series_id, chapter_id, progress, created_at) VALUES
            (1, 1, 5, 1.0, ${now - 86400000 * 3}),
            (1, 2, 20, 1.0, ${now - 86400000 * 2}),
            (2, 1, 3, 0.6, ${now - 86400000 * 1}),
            (2, 2, 15, 1.0, ${now - 86400000 * 4}),
            (2, 3, 25, 0.8, ${now - 86400000 * 2}),
            (3, 1, 10, 1.0, ${now - 86400000 * 5}),
            (3, 2, 20, 1.0, ${now - 86400000 * 3}),
            (3, 3, 28, 1.0, ${now - 86400000 * 1})
        `);

        // Insert notes
        await db.run(`
            INSERT INTO notes (user_id, series_id, body, created_at) VALUES
            (1, 1, 'Luffy''s Gear 5 transformation is absolutely mind-blowing. The creativity in battles has reached new heights.', ${now - 86400000 * 5}),
            (1, 2, 'The way Jin-Woo evolves from the weakest to the strongest is incredibly satisfying to read.', ${now - 86400000 * 8}),
            (2, 1, 'The emotional depth in the recent arcs really shows Oda''s storytelling mastery.', ${now - 86400000 * 3}),
            (2, 3, 'Guts'' struggle against fate and his demons is both tragic and inspiring.', ${now - 86400000 * 7}),
            (3, 1, 'Need to catch up on Wano arc. Heard it''s one of the best arcs yet.', ${now - 86400000 * 12}),
            (3, 2, 'The shadow monarch powers are so well designed. Love the strategic elements.', ${now - 86400000 * 4}),
            (3, 3, 'The art style evolution throughout Berserk is remarkable to witness.', ${now - 86400000 * 6})
        `);

        // Insert ratings
        await db.run(`
            INSERT INTO ratings (user_id, series_id, value, created_at) VALUES
            (1, 1, 5, ${now - 86400000 * 10}),
            (1, 2, 5, ${now - 86400000 * 8}),
            (1, 3, 4, ${now - 86400000 * 6}),
            (2, 1, 5, ${now - 86400000 * 12}),
            (2, 2, 4, ${now - 86400000 * 9}),
            (2, 3, 5, ${now - 86400000 * 7}),
            (3, 1, 4, ${now - 86400000 * 15}),
            (3, 2, 5, ${now - 86400000 * 11}),
            (3, 3, 5, ${now - 86400000 * 8})
        `);

        console.log('✅ Manga tracker system seeder completed successfully');
        
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});