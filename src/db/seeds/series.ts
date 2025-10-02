import { db } from '@/db';
import { series } from '@/db/schema';

async function main() {
    try {
        const currentTime = new Date();

        const sampleSeries = [
            {
                slug: 'one-piece',
                title: 'One Piece',
                description: 'Follow Monkey D. Luffy, a young pirate with rubber powers, as he explores the Grand Line with his diverse crew of pirates, named the Straw Hat Pirates, in search of the world\'s ultimate treasure known as "One Piece" in order to become the next Pirate King.',
                coverImageUrl: '/covers/one-piece.jpg',
                sourceName: 'Viz Media',
                sourceUrl: 'https://www.viz.com/one-piece',
                tags: ["Adventure", "Shounen", "Pirates", "Comedy"],
                rating: 9.2,
                year: 1997,
                status: 'ongoing',
                createdAt: currentTime,
                updatedAt: currentTime,
            },
            {
                slug: 'solo-leveling',
                title: 'Solo Leveling',
                description: 'In a world where hunters with various magical powers battle monsters from invading the defenceless humanity, Sung Jin-Woo was the weakest of all the hunters, barely able to make a living. However, a mysterious System grants him the power of the \'Player\', setting him on a course for an incredible and often times perilous Journey.',
                coverImageUrl: '/covers/solo-leveling.jpg',
                sourceName: 'Tappytoon',
                sourceUrl: 'https://www.tappytoon.com/en/comics/solo-leveling',
                tags: ["Action", "Fantasy", "Supernatural", "Webtoon"],
                rating: 8.9,
                year: 2018,
                status: 'completed',
                createdAt: currentTime,
                updatedAt: currentTime,
            },
            {
                slug: 'berserk',
                title: 'Berserk',
                description: 'Guts, a former mercenary now known as the "Black Swordsman," is out for revenge. After a tumultuous childhood, he finally finds someone he respects and believes he can trust, only to have everything fall apart when this person takes away everything important to Guts for the purpose of fulfilling his own desires.',
                coverImageUrl: '/covers/berserk.jpg',
                sourceName: 'Dark Horse Comics',
                sourceUrl: 'https://www.darkhorse.com/Books/16-072/Berserk-Volume-1-TPB',
                tags: ["Dark Fantasy", "Seinen", "Horror", "Medieval"],
                rating: 9.4,
                year: 1989,
                status: 'hiatus',
                createdAt: currentTime,
                updatedAt: currentTime,
            },
        ];

        for (const s of sampleSeries) {
            await db
                .insert(series)
                .values(s)
                .onConflictDoUpdate({
                    target: series.slug,
                    set: {
                        title: s.title,
                        description: s.description,
                        coverImageUrl: s.coverImageUrl,
                        sourceName: s.sourceName,
                        sourceUrl: s.sourceUrl,
                        tags: s.tags,
                        rating: s.rating,
                        year: s.year,
                        status: s.status,
                        updatedAt: currentTime,
                    },
                });
        }

        const count = await db.select().from(series);
        console.log(`✅ Series seeder completed: ${count.length} records`);
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});