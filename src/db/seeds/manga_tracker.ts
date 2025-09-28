import { db } from '@/db';
import { users, series, chapters, comments, library, readingProgress, notes, ratings } from '@/db/schema';

async function main() {
    // Create 3 test users
    const sampleUsers = [
        {
            id: 1,
            email: 'reader@test.com',
            name: 'Test Reader',
            avatarUrl: null,
            roles: ['user'],
            createdAt: new Date('2024-01-10').getTime(),
            updatedAt: new Date('2024-01-10').getTime(),
        },
        {
            id: 2,
            email: 'fan@test.com',
            name: 'Manga Fan',
            avatarUrl: null,
            roles: ['user'],
            createdAt: new Date('2024-01-15').getTime(),
            updatedAt: new Date('2024-01-15').getTime(),
        },
        {
            id: 3,
            email: 'admin@test.com',
            name: 'Admin User',
            avatarUrl: null,
            roles: ['admin', 'user'],
            createdAt: new Date('2024-01-20').getTime(),
            updatedAt: new Date('2024-01-20').getTime(),
        }
    ];

    await db.insert(users).values(sampleUsers);

    // Create 3 series
    const sampleSeries = [
        {
            id: 1,
            slug: 'one-piece',
            title: 'One Piece',
            description: 'Epic pirate adventure manga following Monkey D. Luffy',
            coverImageUrl: null,
            tags: ['action', 'adventure', 'shounen'],
            sourceName: null,
            sourceUrl: null,
            ratingAvg: 4.8,
            year: 1997,
            status: 'ongoing',
            createdAt: new Date('2024-01-05').getTime(),
            updatedAt: new Date('2024-01-05').getTime(),
        },
        {
            id: 2,
            slug: 'solo-leveling',
            title: 'Solo Leveling',
            description: 'Weak hunter becomes strongest through mysterious system',
            coverImageUrl: null,
            tags: ['action', 'fantasy', 'manhwa'],
            sourceName: null,
            sourceUrl: null,
            ratingAvg: 4.6,
            year: 2018,
            status: 'completed',
            createdAt: new Date('2024-01-06').getTime(),
            updatedAt: new Date('2024-01-06').getTime(),
        },
        {
            id: 3,
            slug: 'berserk',
            title: 'Berserk',
            description: 'Dark fantasy manga following Guts the Black Swordsman',
            coverImageUrl: null,
            tags: ['dark fantasy', 'seinen', 'horror'],
            sourceName: null,
            sourceUrl: null,
            ratingAvg: 4.9,
            year: 1989,
            status: 'ongoing',
            createdAt: new Date('2024-01-07').getTime(),
            updatedAt: new Date('2024-01-07').getTime(),
        }
    ];

    await db.insert(series).values(sampleSeries);

    // Create 10 chapters for each series (30 total)
    const sampleChapters = [
        // One Piece chapters
        { id: 1, seriesId: 1, number: 1, title: 'Romance Dawn', language: 'en', publishedAt: new Date('2024-01-01').getTime(), pages: 20, url: 'https://example.com/read/one-piece/1', externalId: null, createdAt: new Date('2024-01-01').getTime() },
        { id: 2, seriesId: 1, number: 2, title: 'They Call Him Straw Hat Luffy', language: 'en', publishedAt: new Date('2024-01-02').getTime(), pages: 18, url: 'https://example.com/read/one-piece/2', externalId: null, createdAt: new Date('2024-01-02').getTime() },
        { id: 3, seriesId: 1, number: 3, title: 'Introduce Yourself', language: 'en', publishedAt: new Date('2024-01-03').getTime(), pages: 19, url: 'https://example.com/read/one-piece/3', externalId: null, createdAt: new Date('2024-01-03').getTime() },
        { id: 4, seriesId: 1, number: 4, title: 'The Dawn of Adventure', language: 'en', publishedAt: new Date('2024-01-04').getTime(), pages: 22, url: 'https://example.com/read/one-piece/4', externalId: null, createdAt: new Date('2024-01-04').getTime() },
        { id: 5, seriesId: 1, number: 5, title: 'King of the Pirates', language: 'en', publishedAt: new Date('2024-01-05').getTime(), pages: 17, url: 'https://example.com/read/one-piece/5', externalId: null, createdAt: new Date('2024-01-05').getTime() },
        { id: 6, seriesId: 1, number: 6, title: 'The First', language: 'en', publishedAt: new Date('2024-01-06').getTime(), pages: 21, url: 'https://example.com/read/one-piece/6', externalId: null, createdAt: new Date('2024-01-06').getTime() },
        { id: 7, seriesId: 1, number: 7, title: 'Friends', language: 'en', publishedAt: new Date('2024-01-07').getTime(), pages: 16, url: 'https://example.com/read/one-piece/7', externalId: null, createdAt: new Date('2024-01-07').getTime() },
        { id: 8, seriesId: 1, number: 8, title: 'Nami', language: 'en', publishedAt: new Date('2024-01-08').getTime(), pages: 23, url: 'https://example.com/read/one-piece/8', externalId: null, createdAt: new Date('2024-01-08').getTime() },
        { id: 9, seriesId: 1, number: 9, title: 'The Honorable Liar', language: 'en', publishedAt: new Date('2024-01-09').getTime(), pages: 15, url: 'https://example.com/read/one-piece/9', externalId: null, createdAt: new Date('2024-01-09').getTime() },
        { id: 10, seriesId: 1, number: 10, title: 'The Weirdest Guy in the World', language: 'en', publishedAt: new Date('2024-01-10').getTime(), pages: 24, url: 'https://example.com/read/one-piece/10', externalId: null, createdAt: new Date('2024-01-10').getTime() },

        // Solo Leveling chapters
        { id: 11, seriesId: 2, number: 1, title: 'Im The Weakest Hunter of All Mankind', language: 'en', publishedAt: new Date('2024-02-01').getTime(), pages: 25, url: 'https://example.com/read/solo-leveling/1', externalId: null, createdAt: new Date('2024-02-01').getTime() },
        { id: 12, seriesId: 2, number: 2, title: 'If I dont get out, Ill die here', language: 'en', publishedAt: new Date('2024-02-02').getTime(), pages: 22, url: 'https://example.com/read/solo-leveling/2', externalId: null, createdAt: new Date('2024-02-02').getTime() },
        { id: 13, seriesId: 2, number: 3, title: 'Its different from anything before', language: 'en', publishedAt: new Date('2024-02-03').getTime(), pages: 20, url: 'https://example.com/read/solo-leveling/3', externalId: null, createdAt: new Date('2024-02-03').getTime() },
        { id: 14, seriesId: 2, number: 4, title: 'This is insane', language: 'en', publishedAt: new Date('2024-02-04').getTime(), pages: 18, url: 'https://example.com/read/solo-leveling/4', externalId: null, createdAt: new Date('2024-02-04').getTime() },
        { id: 15, seriesId: 2, number: 5, title: 'I get it now', language: 'en', publishedAt: new Date('2024-02-05').getTime(), pages: 21, url: 'https://example.com/read/solo-leveling/5', externalId: null, createdAt: new Date('2024-02-05').getTime() },
        { id: 16, seriesId: 2, number: 6, title: 'You have become a Player', language: 'en', publishedAt: new Date('2024-02-06').getTime(), pages: 19, url: 'https://example.com/read/solo-leveling/6', externalId: null, createdAt: new Date('2024-02-06').getTime() },
        { id: 17, seriesId: 2, number: 7, title: 'What should I call you?', language: 'en', publishedAt: new Date('2024-02-07').getTime(), pages: 17, url: 'https://example.com/read/solo-leveling/7', externalId: null, createdAt: new Date('2024-02-07').getTime() },
        { id: 18, seriesId: 2, number: 8, title: 'This is how you fight', language: 'en', publishedAt: new Date('2024-02-08').getTime(), pages: 23, url: 'https://example.com/read/solo-leveling/8', externalId: null, createdAt: new Date('2024-02-08').getTime() },
        { id: 19, seriesId: 2, number: 9, title: 'How many years has it been?', language: 'en', publishedAt: new Date('2024-02-09').getTime(), pages: 16, url: 'https://example.com/read/solo-leveling/9', externalId: null, createdAt: new Date('2024-02-09').getTime() },
        { id: 20, seriesId: 2, number: 10, title: 'What exactly happened?', language: 'en', publishedAt: new Date('2024-02-10').getTime(), pages: 24, url: 'https://example.com/read/solo-leveling/10', externalId: null, createdAt: new Date('2024-02-10').getTime() },

        // Berserk chapters
        { id: 21, seriesId: 3, number: 1, title: 'The Black Swordsman', language: 'en', publishedAt: new Date('2024-03-01').getTime(), pages: 20, url: 'https://example.com/read/berserk/1', externalId: null, createdAt: new Date('2024-03-01').getTime() },
        { id: 22, seriesId: 3, number: 2, title: 'The Brand', language: 'en', publishedAt: new Date('2024-03-02').getTime(), pages: 18, url: 'https://example.com/read/berserk/2', externalId: null, createdAt: new Date('2024-03-02').getTime() },
        { id: 23, seriesId: 3, number: 3, title: 'The Guardian Angels of Desire', language: 'en', publishedAt: new Date('2024-03-03').getTime(), pages: 22, url: 'https://example.com/read/berserk/3', externalId: null, createdAt: new Date('2024-03-03').getTime() },
        { id: 24, seriesId: 3, number: 4, title: 'The Golden Age', language: 'en', publishedAt: new Date('2024-03-04').getTime(), pages: 19, url: 'https://example.com/read/berserk/4', externalId: null, createdAt: new Date('2024-03-04').getTime() },
        { id: 25, seriesId: 3, number: 5, title: 'A Wind of Swords', language: 'en', publishedAt: new Date('2024-03-05').getTime(), pages: 21, url: 'https://example.com/read/berserk/5', externalId: null, createdAt: new Date('2024-03-05').getTime() },
        { id: 26, seriesId: 3, number: 6, title: 'Zodd the Immortal', language: 'en', publishedAt: new Date('2024-03-06').getTime(), pages: 17, url: 'https://example.com/read/berserk/6', externalId: null, createdAt: new Date('2024-03-06').getTime() },
        { id: 27, seriesId: 3, number: 7, title: 'The Sword of Berserk', language: 'en', publishedAt: new Date('2024-03-07').getTime(), pages: 25, url: 'https://example.com/read/berserk/7', externalId: null, createdAt: new Date('2024-03-07').getTime() },
        { id: 28, seriesId: 3, number: 8, title: 'The Raid', language: 'en', publishedAt: new Date('2024-03-08').getTime(), pages: 15, url: 'https://example.com/read/berserk/8', externalId: null, createdAt: new Date('2024-03-08').getTime() },
        { id: 29, seriesId: 3, number: 9, title: 'Assassin', language: 'en', publishedAt: new Date('2024-03-09').getTime(), pages: 23, url: 'https://example.com/read/berserk/9', externalId: null, createdAt: new Date('2024-03-09').getTime() },
        { id: 30, seriesId: 3, number: 10, title: 'Nobleman', language: 'en', publishedAt: new Date('2024-03-10').getTime(), pages: 16, url: 'https://example.com/read/berserk/10', externalId: null, createdAt: new Date('2024-03-10').getTime() }
    ];

    await db.insert(chapters).values(sampleChapters);

    // Create 2-3 comments per series
    const sampleComments = [
        // One Piece comments
        { id: 1, seriesId: 1, userId: 2, content: 'One Piece never gets old! Luffys journey is incredible and each arc keeps getting better.', createdAt: new Date('2024-03-15').getTime() },
        { id: 2, seriesId: 1, userId: 3, content: 'The world building in One Piece is absolutely phenomenal. Oda is a master storyteller.', createdAt: new Date('2024-03-16').getTime() },
        { id: 3, seriesId: 1, userId: 1, content: 'Im still catching up but loving every chapter. The emotional moments hit so hard!', createdAt: new Date('2024-03-17').getTime() },

        // Solo Leveling comments
        { id: 4, seriesId: 2, userId: 1, content: 'Solo Leveling had such a satisfying power progression. Sung Jin-Woo is one of the coolest MCs.', createdAt: new Date('2024-03-18').getTime() },
        { id: 5, seriesId: 2, userId: 3, content: 'The art in Solo Leveling is stunning. Every fight scene is beautifully drawn.', createdAt: new Date('2024-03-19').getTime() },

        // Berserk comments
        { id: 6, seriesId: 3, userId: 2, content: 'Berserk is a masterpiece. The artwork is unparalleled and the story is deeply moving.', createdAt: new Date('2024-03-20').getTime() },
        { id: 7, seriesId: 3, userId: 1, content: 'Heavy and dark but absolutely brilliant. Guts character development is incredible.', createdAt: new Date('2024-03-21').getTime() },
        { id: 8, seriesId: 3, userId: 3, content: 'RIP Miura. This manga will forever be legendary in the manga community.', createdAt: new Date('2024-03-22').getTime() }
    ];

    await db.insert(comments).values(sampleComments);

    // Create library entries
    const sampleLibraryEntries = [
        // User 1: one-piece status "reading"
        { id: 1, userId: 1, seriesId: 1, status: 'reading', createdAt: new Date('2024-01-25').getTime() },
        
        // User 2: solo-leveling status "completed", berserk status "reading"
        { id: 2, userId: 2, seriesId: 2, status: 'completed', createdAt: new Date('2024-02-15').getTime() },
        { id: 3, userId: 2, seriesId: 3, status: 'reading', createdAt: new Date('2024-03-01').getTime() },
        
        // User 3: all three series status "plan_to_read"
        { id: 4, userId: 3, seriesId: 1, status: 'plan_to_read', createdAt: new Date('2024-01-30').getTime() },
        { id: 5, userId: 3, seriesId: 2, status: 'plan_to_read', createdAt: new Date('2024-02-01').getTime() },
        { id: 6, userId: 3, seriesId: 3, status: 'plan_to_read', createdAt: new Date('2024-02-05').getTime() }
    ];

    await db.insert(library).values(sampleLibraryEntries);

    // Create reading progress
    const sampleReadingProgress = [
        // User 1: read chapters 1-3 of one-piece
        { id: 1, userId: 1, seriesId: 1, chapterId: 1, progress: 1.0, createdAt: new Date('2024-01-26').getTime() },
        { id: 2, userId: 1, seriesId: 1, chapterId: 2, progress: 1.0, createdAt: new Date('2024-01-27').getTime() },
        { id: 3, userId: 1, seriesId: 1, chapterId: 3, progress: 1.0, createdAt: new Date('2024-01-28').getTime() },
        
        // User 2: read all solo-leveling chapters, chapters 1-5 of berserk
        { id: 4, userId: 2, seriesId: 2, chapterId: 11, progress: 1.0, createdAt: new Date('2024-02-11').getTime() },
        { id: 5, userId: 2, seriesId: 2, chapterId: 12, progress: 1.0, createdAt: new Date('2024-02-12').getTime() },
        { id: 6, userId: 2, seriesId: 2, chapterId: 13, progress: 1.0, createdAt: new Date('2024-02-13').getTime() },
        { id: 7, userId: 2, seriesId: 2, chapterId: 14, progress: 1.0, createdAt: new Date('2024-02-14').getTime() },
        { id: 8, userId: 2, seriesId: 2, chapterId: 15, progress: 1.0, createdAt: new Date('2024-02-15').getTime() },
        { id: 9, userId: 2, seriesId: 2, chapterId: 16, progress: 1.0, createdAt: new Date('2024-02-16').getTime() },
        { id: 10, userId: 2, seriesId: 2, chapterId: 17, progress: 1.0, createdAt: new Date('2024-02-17').getTime() },
        { id: 11, userId: 2, seriesId: 2, chapterId: 18, progress: 1.0, createdAt: new Date('2024-02-18').getTime() },
        { id: 12, userId: 2, seriesId: 2, chapterId: 19, progress: 1.0, createdAt: new Date('2024-02-19').getTime() },
        { id: 13, userId: 2, seriesId: 2, chapterId: 20, progress: 1.0, createdAt: new Date('2024-02-20').getTime() },
        { id: 14, userId: 2, seriesId: 3, chapterId: 21, progress: 1.0, createdAt: new Date('2024-03-02').getTime() },
        { id: 15, userId: 2, seriesId: 3, chapterId: 22, progress: 1.0, createdAt: new Date('2024-03-03').getTime() },
        { id: 16, userId: 2, seriesId: 3, chapterId: 23, progress: 1.0, createdAt: new Date('2024-03-04').getTime() },
        { id: 17, userId: 2, seriesId: 3, chapterId: 24, progress: 1.0, createdAt: new Date('2024-03-05').getTime() },
        { id: 18, userId: 2, seriesId: 3, chapterId: 25, progress: 1.0, createdAt: new Date('2024-03-06').getTime() }
    ];

    await db.insert(readingProgress).values(sampleReadingProgress);

    // Create ratings
    const sampleRatings = [
        // User 1: one-piece rating 5
        { id: 1, userId: 1, seriesId: 1, value: 5, createdAt: new Date('2024-01-29').getTime() },
        
        // User 2: solo-leveling rating 4, berserk rating 5
        { id: 2, userId: 2, seriesId: 2, value: 4, createdAt: new Date('2024-02-21').getTime() },
        { id: 3, userId: 2, seriesId: 3, value: 5, createdAt: new Date('2024-03-07').getTime() },
        
        // User 3: one-piece rating 5
        { id: 4, userId: 3, seriesId: 1, value: 5, createdAt: new Date('2024-02-10').getTime() }
    ];

    await db.insert(ratings).values(sampleRatings);

    // Create 1-2 notes per active reader for their series
    const sampleNotes = [
        // User 1 notes for One Piece
        { id: 1, userId: 1, seriesId: 1, body: 'Love how Luffy never gives up on his dreams. His determination is inspiring and the crew dynamics are perfect.', createdAt: new Date('2024-01-30').getTime() },
        { id: 2, userId: 1, seriesId: 1, body: 'The world building is incredible. Each island has such unique cultures and stories.', createdAt: new Date('2024-02-05').getTime() },
        
        // User 2 notes for Solo Leveling and Berserk
        { id: 3, userId: 2, seriesId: 2, body: 'Solo Leveling had the most satisfying power progression Ive ever read. The system mechanics were well thought out.', createdAt: new Date('2024-02-22').getTime() },
        { id: 4, userId: 2, seriesId: 3, body: 'Berserk is emotionally heavy but incredibly well written. The art is absolutely stunning in every panel.', createdAt: new Date('2024-03-08').getTime() }
    ];

    await db.insert(notes).values(sampleNotes);

    console.log('✅ Manga tracker seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});