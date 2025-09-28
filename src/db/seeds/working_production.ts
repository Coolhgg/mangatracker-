import { db } from '@/db';
import { users, series, mangaSources, mangaChapters, libraries, readingProgress, comments, reactions } from '@/db/schema';

async function main() {
    // 1. Create test users
    const sampleUsers = [
        {
            email: 'admin@test.com',
            name: 'Admin',
            roles: ['admin'],
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            email: 'user1@test.com',
            name: 'Test User 1',
            roles: [],
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        {
            email: 'user2@test.com',
            name: 'Test User 2',
            roles: [],
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);

    // 2. Create manga sources first
    const sampleSources = [
        {
            name: 'MangaDex',
            baseUrl: 'https://mangadex.org',
        },
        {
            name: 'MangaPlus',
            baseUrl: 'https://mangaplus.shueisha.co.jp',
        },
        {
            name: 'Viz Media',
            baseUrl: 'https://viz.com',
        }
    ];

    await db.insert(mangaSources).values(sampleSources);

    // 3. Create series
    const sampleSeries = [
        {
            slug: 'one-piece',
            title: 'One Piece',
            altTitles: ['ワンピース', 'OP'],
            description: 'Follow Monkey D. Luffy on his quest to become the Pirate King.',
            year: 1997,
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['Adventure', 'Comedy', 'Drama', 'Shounen'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/one-piece-cover.jpg',
            popularityScore: 9500,
            ratingAvg: 9.2,
            ratingCount: 15420,
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'attack-on-titan',
            title: 'Attack on Titan',
            altTitles: ['進撃の巨人', 'Shingeki no Kyojin'],
            description: 'Humanity fights for survival against giant humanoid Titans.',
            year: 2009,
            status: 'completed',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['Action', 'Drama', 'Fantasy', 'Military'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/aot-cover.jpg',
            popularityScore: 9200,
            ratingAvg: 9.0,
            ratingCount: 18750,
            createdAt: new Date('2024-01-02').toISOString(),
            updatedAt: new Date('2024-01-02').toISOString(),
        },
        {
            slug: 'demon-slayer',
            title: 'Demon Slayer',
            altTitles: ['鬼滅の刃', 'Kimetsu no Yaiba'],
            description: 'A young boy becomes a demon slayer to save his sister.',
            year: 2016,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['Action', 'Supernatural', 'Historical', 'Shounen'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/demon-slayer-cover.jpg',
            popularityScore: 8800,
            ratingAvg: 8.7,
            ratingCount: 12340,
            createdAt: new Date('2024-01-03').toISOString(),
            updatedAt: new Date('2024-01-03').toISOString(),
        },
        {
            slug: 'my-hero-academia',
            title: 'My Hero Academia',
            altTitles: ['僕のヒーローアカデミア', 'Boku no Hero Academia'],
            description: 'In a world of superheroes, a quirkless boy aims to become the greatest hero.',
            year: 2014,
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['Action', 'School', 'Super Power', 'Shounen'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/mha-cover.jpg',
            popularityScore: 8500,
            ratingAvg: 8.4,
            ratingCount: 9870,
            createdAt: new Date('2024-01-04').toISOString(),
            updatedAt: new Date('2024-01-04').toISOString(),
        },
        {
            slug: 'jujutsu-kaisen',
            title: 'Jujutsu Kaisen',
            altTitles: ['呪術廻戦'],
            description: 'High school students battle cursed spirits in modern Japan.',
            year: 2018,
            status: 'ongoing',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['Action', 'School', 'Supernatural', 'Shounen'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/jjk-cover.jpg',
            popularityScore: 8900,
            ratingAvg: 8.8,
            ratingCount: 11250,
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        {
            slug: 'chainsaw-man',
            title: 'Chainsaw Man',
            altTitles: ['チェンソーマン'],
            description: 'A devil hunter with chainsaw powers fights supernatural threats.',
            year: 2018,
            status: 'ongoing',
            contentRating: 'erotica',
            originalLanguage: 'ja',
            tags: ['Action', 'Comedy', 'Supernatural', 'Seinen'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/chainsaw-man-cover.jpg',
            popularityScore: 8300,
            ratingAvg: 8.6,
            ratingCount: 7890,
            createdAt: new Date('2024-01-06').toISOString(),
            updatedAt: new Date('2024-01-06').toISOString(),
        },
        {
            slug: 'spy-x-family',
            title: 'Spy x Family',
            altTitles: ['スパイファミリー'],
            description: 'A spy, an assassin, and a telepath form an unlikely family.',
            year: 2019,
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['Action', 'Comedy', 'Family', 'Shounen'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/spy-family-cover.jpg',
            popularityScore: 8700,
            ratingAvg: 8.9,
            ratingCount: 10450,
            createdAt: new Date('2024-01-07').toISOString(),
            updatedAt: new Date('2024-01-07').toISOString(),
        },
        {
            slug: 'tokyo-ghoul',
            title: 'Tokyo Ghoul',
            altTitles: ['東京喰種'],
            description: 'A college student becomes a half-ghoul in modern Tokyo.',
            year: 2011,
            status: 'completed',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['Action', 'Horror', 'Supernatural', 'Seinen'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/tokyo-ghoul-cover.jpg',
            popularityScore: 7800,
            ratingAvg: 8.1,
            ratingCount: 13670,
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-08').toISOString(),
        },
        {
            slug: 'mob-psycho-100',
            title: 'Mob Psycho 100',
            altTitles: ['モブサイコ100'],
            description: 'A psychic middle schooler tries to live a normal life.',
            year: 2012,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['Action', 'Comedy', 'School', 'Supernatural'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/mob-psycho-cover.jpg',
            popularityScore: 7500,
            ratingAvg: 8.5,
            ratingCount: 6780,
            createdAt: new Date('2024-01-09').toISOString(),
            updatedAt: new Date('2024-01-09').toISOString(),
        },
        {
            slug: 'death-note',
            title: 'Death Note',
            altTitles: ['デスノート'],
            description: 'A high school student finds a supernatural notebook that kills.',
            year: 2003,
            status: 'completed',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['Drama', 'Psychological', 'Supernatural', 'Thriller'],
            coverImageUrl: '/api/image-proxy?url=https://example.com/death-note-cover.jpg',
            popularityScore: 9000,
            ratingAvg: 9.1,
            ratingCount: 20150,
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        }
    ];

    await db.insert(series).values(sampleSeries);

    // 4. Create chapters (3 per series)
    const sampleChapters = [
        // One Piece chapters
        { seriesId: 1, sourceId: 1, externalId: 'op-1', number: 1, title: 'Romance Dawn', language: 'en', publishedAt: new Date('2024-01-01').toISOString(), pages: 20 },
        { seriesId: 1, sourceId: 1, externalId: 'op-2', number: 2, title: 'They Call Him Straw Hat Luffy', language: 'en', publishedAt: new Date('2024-01-02').toISOString(), pages: 18 },
        { seriesId: 1, sourceId: 1, externalId: 'op-3', number: 3, title: 'Introduce Yourself', language: 'en', publishedAt: new Date('2024-01-03').toISOString(), pages: 19 },
        
        // Attack on Titan chapters
        { seriesId: 2, sourceId: 2, externalId: 'aot-1', number: 1, title: 'To You, 2000 Years From Now', language: 'en', publishedAt: new Date('2024-01-04').toISOString(), pages: 45 },
        { seriesId: 2, sourceId: 2, externalId: 'aot-2', number: 2, title: 'That Day', language: 'en', publishedAt: new Date('2024-01-05').toISOString(), pages: 43 },
        { seriesId: 2, sourceId: 2, externalId: 'aot-3', number: 3, title: 'A Dim Light in the Darkness of Despair', language: 'en', publishedAt: new Date('2024-01-06').toISOString(), pages: 44 },
        
        // Demon Slayer chapters
        { seriesId: 3, sourceId: 1, externalId: 'ds-1', number: 1, title: 'Cruelty', language: 'ja', publishedAt: new Date('2024-01-07').toISOString(), pages: 22 },
        { seriesId: 3, sourceId: 1, externalId: 'ds-2', number: 2, title: 'Stranger', language: 'ja', publishedAt: new Date('2024-01-08').toISOString(), pages: 21 },
        { seriesId: 3, sourceId: 1, externalId: 'ds-3', number: 3, title: 'Sabito and Makomo', language: 'ja', publishedAt: new Date('2024-01-09').toISOString(), pages: 23 },
        
        // My Hero Academia chapters
        { seriesId: 4, sourceId: 3, externalId: 'mha-1', number: 1, title: 'Izuku Midoriya: Origin', language: 'en', publishedAt: new Date('2024-01-10').toISOString(), pages: 55 },
        { seriesId: 4, sourceId: 3, externalId: 'mha-2', number: 2, title: 'What It Takes to Be a Hero', language: 'en', publishedAt: new Date('2024-01-11').toISOString(), pages: 20 },
        { seriesId: 4, sourceId: 3, externalId: 'mha-3', number: 3, title: 'Roaring Muscles', language: 'en', publishedAt: new Date('2024-01-12').toISOString(), pages: 19 },
        
        // Jujutsu Kaisen chapters
        { seriesId: 5, sourceId: 2, externalId: 'jjk-1', number: 1, title: 'Ryomen Sukuna', language: 'es', publishedAt: new Date('2024-01-13').toISOString(), pages: 24 },
        { seriesId: 5, sourceId: 2, externalId: 'jjk-2', number: 2, title: 'For Myself', language: 'es', publishedAt: new Date('2024-01-14').toISOString(), pages: 22 },
        { seriesId: 5, sourceId: 2, externalId: 'jjk-3', number: 3, title: 'Girl of Steel', language: 'es', publishedAt: new Date('2024-01-15').toISOString(), pages: 20 },
        
        // Chainsaw Man chapters
        { seriesId: 6, sourceId: 1, externalId: 'csm-1', number: 1, title: 'Dog and Chainsaw', language: 'en', publishedAt: new Date('2024-01-16').toISOString(), pages: 18 },
        { seriesId: 6, sourceId: 1, externalId: 'csm-2', number: 2, title: 'The Place Where Pochita Is', language: 'en', publishedAt: new Date('2024-01-17').toISOString(), pages: 17 },
        { seriesId: 6, sourceId: 1, externalId: 'csm-3', number: 3, title: 'Arrival in Tokyo', language: 'en', publishedAt: new Date('2024-01-18').toISOString(), pages: 19 },
        
        // Spy x Family chapters
        { seriesId: 7, sourceId: 3, externalId: 'sxf-1', number: 1, title: 'Operation Strix', language: 'ja', publishedAt: new Date('2024-01-19').toISOString(), pages: 26 },
        { seriesId: 7, sourceId: 3, externalId: 'sxf-2', number: 2, title: 'Secure a Wife', language: 'ja', publishedAt: new Date('2024-01-20').toISOString(), pages: 25 },
        { seriesId: 7, sourceId: 3, externalId: 'sxf-3', number: 3, title: 'Prepare for the Interview', language: 'ja', publishedAt: new Date('2024-01-21').toISOString(), pages: 24 },
        
        // Tokyo Ghoul chapters
        { seriesId: 8, sourceId: 2, externalId: 'tg-1', number: 1, title: 'Tragedy', language: 'en', publishedAt: new Date('2024-01-22').toISOString(), pages: 28 },
        { seriesId: 8, sourceId: 2, externalId: 'tg-2', number: 2, title: 'Incubation', language: 'en', publishedAt: new Date('2024-01-23').toISOString(), pages: 27 },
        { seriesId: 8, sourceId: 2, externalId: 'tg-3', number: 3, title: 'Dove', language: 'en', publishedAt: new Date('2024-01-24').toISOString(), pages: 26 },
        
        // Mob Psycho 100 chapters
        { seriesId: 9, sourceId: 1, externalId: 'mp-1', number: 1, title: 'Self-Proclaimed Psychic', language: 'es', publishedAt: new Date('2024-01-25').toISOString(), pages: 32 },
        { seriesId: 9, sourceId: 1, externalId: 'mp-2', number: 2, title: 'Doubts About Youth', language: 'es', publishedAt: new Date('2024-01-26').toISOString(), pages: 30 },
        { seriesId: 9, sourceId: 1, externalId: 'mp-3', number: 3, title: 'An Invitation to a Guilty Pleasure', language: 'es', publishedAt: new Date('2024-01-27').toISOString(), pages: 31 },
        
        // Death Note chapters
        { seriesId: 10, sourceId: 3, externalId: 'dn-1', number: 1, title: 'Boredom', language: 'ja', publishedAt: new Date('2024-01-28').toISOString(), pages: 58 },
        { seriesId: 10, sourceId: 3, externalId: 'dn-2', number: 2, title: 'L', language: 'ja', publishedAt: new Date('2024-01-29').toISOString(), pages: 20 },
        { seriesId: 10, sourceId: 3, externalId: 'dn-3', number: 3, title: 'Family', language: 'ja', publishedAt: new Date('2024-01-30').toISOString(), pages: 19 }
    ];

    await db.insert(mangaChapters).values(sampleChapters);

    // 5. Create library entries
    const sampleLibraries = [
        { userId: 1, seriesId: 1, status: 'reading', rating: 9, notes: 'Amazing adventure story!', updatedAt: new Date('2024-02-01').toISOString() },
        { userId: 1, seriesId: 2, status: 'completed', rating: 10, notes: 'Masterpiece of storytelling', updatedAt: new Date('2024-02-02').toISOString() },
        { userId: 1, seriesId: 3, status: 'reading', rating: 8, notes: 'Great animation potential', updatedAt: new Date('2024-02-03').toISOString() },
        { userId: 1, seriesId: 4, status: 'on_hold', rating: 0, notes: 'Will continue later', updatedAt: new Date('2024-02-04').toISOString() },
        { userId: 1, seriesId: 5, status: 'plan_to_read', rating: 0, notes: '', updatedAt: new Date('2024-02-05').toISOString() },
        
        { userId: 2, seriesId: 1, status: 'reading', rating: 8, notes: 'Long but worth it', updatedAt: new Date('2024-02-06').toISOString() },
        { userId: 2, seriesId: 6, status: 'completed', rating: 9, notes: 'Unique and intense', updatedAt: new Date('2024-02-07').toISOString() },
        { userId: 2, seriesId: 7, status: 'reading', rating: 9, notes: 'Wholesome family comedy', updatedAt: new Date('2024-02-08').toISOString() },
        { userId: 2, seriesId: 8, status: 'dropped', rating: 6, notes: 'Too dark for me', updatedAt: new Date('2024-02-09').toISOString() },
        { userId: 2, seriesId: 10, status: 'completed', rating: 10, notes: 'Psychological thriller at its best', updatedAt: new Date('2024-02-10').toISOString() },
        
        { userId: 3, seriesId: 3, status: 'completed', rating: 9, notes: 'Loved the character development', updatedAt: new Date('2024-02-11').toISOString() },
        { userId: 3, seriesId: 4, status: 'reading', rating: 7, notes: 'Good superhero story', updatedAt: new Date('2024-02-12').toISOString() },
        { userId: 3, seriesId: 5, status: 'reading', rating: 8, notes: 'Great action scenes', updatedAt: new Date('2024-02-13').toISOString() },
        { userId: 3, seriesId: 9, status: 'completed', rating: 8, notes: 'Underrated gem', updatedAt: new Date('2024-02-14').toISOString() },
        { userId: 3, seriesId: 2, status: 'plan_to_read', rating: 0, notes: 'Heard great things about it', updatedAt: new Date('2024-02-15').toISOString() }
    ];

    await db.insert(libraries).values(sampleLibraries);

    // 6. Create reading progress entries
    const sampleReadingProgress = [
        { userId: 1, seriesId: 1, chapterId: 1, progressPages: 20, readAt: new Date('2024-02-01').toISOString() },
        { userId: 1, seriesId: 1, chapterId: 2, progressPages: 18, readAt: new Date('2024-02-02').toISOString() },
        { userId: 1, seriesId: 2, chapterId: 4, progressPages: 45, readAt: new Date('2024-02-03').toISOString() },
        { userId: 1, seriesId: 2, chapterId: 5, progressPages: 43, readAt: new Date('2024-02-04').toISOString() },
        { userId: 1, seriesId: 3, chapterId: 7, progressPages: 15, readAt: new Date('2024-02-05').toISOString() },
        
        { userId: 2, seriesId: 1, chapterId: 1, progressPages: 20, readAt: new Date('2024-02-06').toISOString() },
        { userId: 2, seriesId: 6, chapterId: 16, progressPages: 18, readAt: new Date('2024-02-07').toISOString() },
        { userId: 2, seriesId: 7, chapterId: 19, progressPages: 26, readAt: new Date('2024-02-08').toISOString() },
        { userId: 2, seriesId: 10, chapterId: 28, progressPages: 58, readAt: new Date('2024-02-09').toISOString() },
        
        { userId: 3, seriesId: 3, chapterId: 7, progressPages: 22, readAt: new Date('2024-02-10').toISOString() }
    ];

    await db.insert(readingProgress).values(sampleReadingProgress);

    // 7. Create comments
    const sampleComments = [
        { userId: 1, seriesId: 1, content: 'This manga never gets old! The world building is incredible.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-01').toISOString() },
        { userId: 2, seriesId: 1, content: 'Agreed! Oda is a master storyteller.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-02').toISOString() },
        { userId: 3, seriesId: 2, content: 'The ending was perfect. Everything came full circle.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-03').toISOString() },
        { userId: 1, seriesId: 2, content: 'Isayama really planned this from the beginning. Genius!', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-04').toISOString() },
        { userId: 2, seriesId: 3, content: 'The animation adaptation was stunning.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-05').toISOString() },
        { userId: 3, seriesId: 4, content: 'Deku is such an inspiring protagonist.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-06').toISOString() },
        { userId: 1, seriesId: 5, content: 'The fight scenes in this manga are incredible.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-07').toISOString() },
        { userId: 2, seriesId: 6, content: 'Fujimoto has such a unique art style.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-08').toISOString() },
        { userId: 3, seriesId: 7, content: 'This family is so wholesome, I love it!', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-09').toISOString() },
        { userId: 1, seriesId: 8, content: 'The psychological horror is really well done.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-10').toISOString() },
        { userId: 2, seriesId: 9, content: 'Mob is such a relatable character.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-11').toISOString() },
        { userId: 3, seriesId: 10, content: 'Light vs L was the best mind game in manga.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-12').toISOString() },
        { userId: 1, seriesId: 1, content: 'The latest chapter was amazing!', edited: true, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-13').toISOString() },
        { userId: 2, seriesId: 4, content: 'All Might is the best mentor character.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-14').toISOString() },
        { userId: 3, seriesId: 5, content: 'Gojo is overpowered but in a good way.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-15').toISOString() },
        { userId: 1, seriesId: 6, content: 'Power is the best character, fight me!', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-16').toISOString() },
        { userId: 2, seriesId: 7, content: 'Anya mind reading scenes are hilarious.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-17').toISOString() },
        { userId: 3, seriesId: 8, content: 'Kaneki character development was intense.', edited: false, deleted: false, flagsCount: 1, createdAt: new Date('2024-02-18').toISOString() },
        { userId: 1, seriesId: 9, content: 'ONE is a master of both comedy and action.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-19').toISOString() },
        { userId: 2, seriesId: 10, content: 'Ryuk was such an interesting character.', edited: false, deleted: false, flagsCount: 0, createdAt: new Date('2024-02-20').toISOString() }
    ];

    await db.insert(comments).values(sampleComments);

    // 8. Create reactions
    const sampleReactions = [
        { commentId: 1, userId: 2, type: 'like' },
        { commentId: 1, userId: 3, type: 'love' },
        { commentId: 2, userId: 1, type: 'like' },
        { commentId: 3, userId: 1, type: 'love' },
        { commentId: 3, userId: 2, type: 'like' },
        { commentId: 4, userId: 3, type: 'like' },
        { commentId: 5, userId: 1, type: 'like' },
        { commentId: 6, userId: 2, type: 'love' },
        { commentId: 7, userId: 3, type: 'fire' },
        { commentId: 8, userId: 1, type: 'like' },
        { commentId: 9, userId: 2, type: 'love' },
        { commentId: 10, userId: 3, type: 'like' },
        { commentId: 11, userId: 1, type: 'like' },
        { commentId: 12, userId: 2, type: 'fire' },
        { commentId: 13, userId: 3, type: 'love' }
    ];

    await db.insert(reactions).values(sampleReactions);

    console.log('✅ Production seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});