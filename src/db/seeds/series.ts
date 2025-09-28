import { db } from '@/db';

async function main() {
    try {
        // Step 1: Drop existing table
        await db.run('DROP TABLE IF EXISTS series;');
        console.log('✅ Dropped existing series table');

        // Step 2: Create table with exact column names
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
        console.log('✅ Created series table');

        // Step 3: Insert the 3 required records
        const currentTime = new Date().toISOString();

        await db.run(`
            INSERT INTO series (
                slug, title, description, cover_image_url, source_name, source_url, 
                tags, rating, year, status, created_at, updated_at
            ) VALUES 
            (
                'one-piece',
                'One Piece',
                'Follow Monkey D. Luffy, a young pirate with rubber powers, as he explores the Grand Line with his diverse crew of pirates, named the Straw Hat Pirates, in search of the world''s ultimate treasure known as "One Piece" in order to become the next Pirate King.',
                '/covers/one-piece.jpg',
                'Viz Media',
                'https://www.viz.com/one-piece',
                '["Adventure", "Shounen", "Pirates", "Comedy"]',
                9.2,
                1997,
                'ongoing',
                '${currentTime}',
                '${currentTime}'
            ),
            (
                'solo-leveling',
                'Solo Leveling',
                'In a world where hunters with various magical powers battle monsters from invading the defenceless humanity, Sung Jin-Woo was the weakest of all the hunters, barely able to make a living. However, a mysterious System grants him the power of the ''Player'', setting him on a course for an incredible and often times perilous Journey.',
                '/covers/solo-leveling.jpg',
                'Tappytoon',
                'https://www.tappytoon.com/en/comics/solo-leveling',
                '["Action", "Fantasy", "Supernatural", "Webtoon"]',
                8.9,
                2018,
                'completed',
                '${currentTime}',
                '${currentTime}'
            ),
            (
                'berserk',
                'Berserk',
                'Guts, a former mercenary now known as the "Black Swordsman," is out for revenge. After a tumultuous childhood, he finally finds someone he respects and believes he can trust, only to have everything fall apart when this person takes away everything important to Guts for the purpose of fulfilling his own desires.',
                '/covers/berserk.jpg',
                'Dark Horse Comics',
                'https://www.darkhorse.com/Books/16-072/Berserk-Volume-1-TPB',
                '["Dark Fantasy", "Seinen", "Horror", "Medieval"]',
                9.4,
                1989,
                'hiatus',
                '${currentTime}',
                '${currentTime}'
            );
        `);
        console.log('✅ Inserted 3 series records');

        // Step 4: Verify data insertion
        const result = await db.get('SELECT COUNT(*) as count FROM series;');
        console.log(`✅ Verification: ${result.count} records inserted successfully`);

        console.log('✅ Series seeder completed successfully');
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});