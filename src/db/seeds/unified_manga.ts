import { db } from '@/db';
import { mangaSources, authors, series, seriesAuthors, seriesSourceMap, mangaChapters } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();

    // 1. Insert MangaDx source
    const sampleSources = [
        {
            id: 1,
            name: 'MangaDx',
            baseUrl: 'https://mangadx.org',
        }
    ];

    await db.insert(mangaSources).values(sampleSources);

    // 2. Create 3 authors
    const sampleAuthors = [
        {
            id: 1,
            name: 'Eiichiro Oda',
        },
        {
            id: 2,
            name: 'Hajime Isayama',
        },
        {
            id: 3,
            name: 'Kentaro Miura',
        }
    ];

    await db.insert(authors).values(sampleAuthors);

    // 3. Seed 20 diverse series
    const sampleSeries = [
        {
            id: 1,
            slug: 'one-piece',
            title: 'One Piece',
            altTitles: ['ワンピース'],
            description: 'The story follows Monkey D. Luffy, a boy whose body gained rubber properties after eating a Devil Fruit.',
            year: 1997,
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['action', 'adventure', 'comedy', 'drama'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=One+Piece',
            popularityScore: 98,
            ratingAvg: 9.2,
            ratingCount: 4500,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 2,
            slug: 'attack-on-titan',
            title: 'Attack on Titan',
            altTitles: ['進撃の巨人', 'Shingeki no Kyojin'],
            description: 'Humanity fights for survival against giant humanoid Titans.',
            year: 2009,
            status: 'completed',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['action', 'drama', 'horror', 'thriller'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=Attack+on+Titan',
            popularityScore: 95,
            ratingAvg: 9.5,
            ratingCount: 5000,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 3,
            slug: 'berserk',
            title: 'Berserk',
            altTitles: ['ベルセルク'],
            description: 'Dark fantasy manga following Guts, a lone swordsman.',
            year: 1989,
            status: 'hiatus',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['action', 'drama', 'fantasy', 'horror'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Berserk',
            popularityScore: 92,
            ratingAvg: 9.3,
            ratingCount: 3200,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 4,
            slug: 'demon-slayer',
            title: 'Demon Slayer',
            altTitles: ['鬼滅の刃', 'Kimetsu no Yaiba'],
            description: 'A young boy becomes a demon slayer to save his sister.',
            year: 2016,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['action', 'supernatural', 'drama'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/96CEB4/FFFFFF?text=Demon+Slayer',
            popularityScore: 89,
            ratingAvg: 8.8,
            ratingCount: 2800,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 5,
            slug: 'my-hero-academia',
            title: 'My Hero Academia',
            altTitles: ['僕のヒーローアカデミア', 'Boku no Hero Academia'],
            description: 'A world where superpowers called Quirks are commonplace.',
            year: 2014,
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['action', 'adventure', 'sci-fi'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FFEAA7/FFFFFF?text=My+Hero+Academia',
            popularityScore: 87,
            ratingAvg: 8.5,
            ratingCount: 2100,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 6,
            slug: 'tokyo-ghoul',
            title: 'Tokyo Ghoul',
            altTitles: ['東京喰種'],
            description: 'A college student becomes a half-ghoul after an encounter.',
            year: 2011,
            status: 'completed',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['action', 'horror', 'supernatural'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/DDA0DD/FFFFFF?text=Tokyo+Ghoul',
            popularityScore: 85,
            ratingAvg: 8.2,
            ratingCount: 1900,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 7,
            slug: 'solo-leveling',
            title: 'Solo Leveling',
            altTitles: ['나 혼자만 레벨업'],
            description: 'The weakest hunter becomes the strongest through a mysterious system.',
            year: 2018,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ko',
            tags: ['action', 'fantasy', 'adventure'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/74B9FF/FFFFFF?text=Solo+Leveling',
            popularityScore: 93,
            ratingAvg: 9.1,
            ratingCount: 3800,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 8,
            slug: 'chainsaw-man',
            title: 'Chainsaw Man',
            altTitles: ['チェンソーマン'],
            description: 'A young devil hunter with chainsaw powers fights devils.',
            year: 2018,
            status: 'ongoing',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['action', 'horror', 'supernatural'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FD79A8/FFFFFF?text=Chainsaw+Man',
            popularityScore: 90,
            ratingAvg: 8.9,
            ratingCount: 2600,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 9,
            slug: 'jujutsu-kaisen',
            title: 'Jujutsu Kaisen',
            altTitles: ['呪術廻戦'],
            description: 'Students fight cursed spirits in modern Japan.',
            year: 2018,
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['action', 'supernatural', 'drama'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/00B894/FFFFFF?text=Jujutsu+Kaisen',
            popularityScore: 88,
            ratingAvg: 8.7,
            ratingCount: 2400,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 10,
            slug: 'tower-of-god',
            title: 'Tower of God',
            altTitles: ['신의 탑'],
            description: 'A boy climbs a mysterious tower to find his friend.',
            year: 2010,
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ko',
            tags: ['action', 'adventure', 'fantasy', 'mystery'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/E17055/FFFFFF?text=Tower+of+God',
            popularityScore: 82,
            ratingAvg: 8.4,
            ratingCount: 1700,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 11,
            slug: 'the-god-of-high-school',
            title: 'The God of High School',
            altTitles: ['갓 오브 하이스쿨'],
            description: 'High school students compete in a martial arts tournament.',
            year: 2011,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ko',
            tags: ['action', 'adventure', 'comedy'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/A29BFE/FFFFFF?text=God+of+High+School',
            popularityScore: 78,
            ratingAvg: 8.0,
            ratingCount: 1400,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 12,
            slug: 'spy-x-family',
            title: 'Spy x Family',
            altTitles: ['スパイファミリー'],
            description: 'A spy creates a fake family for his mission.',
            year: 2019,
            status: 'ongoing',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['comedy', 'slice-of-life', 'action'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FDCB6E/FFFFFF?text=Spy+x+Family',
            popularityScore: 86,
            ratingAvg: 8.6,
            ratingCount: 2200,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 13,
            slug: 'death-note',
            title: 'Death Note',
            altTitles: ['デスノート'],
            description: 'A student gains the power to kill with a supernatural notebook.',
            year: 2003,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['thriller', 'supernatural', 'mystery', 'drama'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/2D3436/FFFFFF?text=Death+Note',
            popularityScore: 94,
            ratingAvg: 9.0,
            ratingCount: 4200,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 14,
            slug: 'fullmetal-alchemist',
            title: 'Fullmetal Alchemist',
            altTitles: ['鋼の錬金術師', 'Hagane no Renkinjutsushi'],
            description: 'Two brothers use alchemy in their quest to restore their bodies.',
            year: 2001,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['action', 'adventure', 'drama', 'fantasy'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/636E72/FFFFFF?text=Fullmetal+Alchemist',
            popularityScore: 91,
            ratingAvg: 9.4,
            ratingCount: 3900,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 15,
            slug: 'naruto',
            title: 'Naruto',
            altTitles: ['ナルト'],
            description: 'A young ninja seeks recognition and dreams of becoming Hokage.',
            year: 1999,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['action', 'adventure', 'drama'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/F39C12/FFFFFF?text=Naruto',
            popularityScore: 96,
            ratingAvg: 8.3,
            ratingCount: 4800,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 16,
            slug: 'dragon-ball',
            title: 'Dragon Ball',
            altTitles: ['ドラゴンボール'],
            description: 'Goku embarks on adventures to collect the seven Dragon Balls.',
            year: 1984,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['action', 'adventure', 'comedy'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/E67E22/FFFFFF?text=Dragon+Ball',
            popularityScore: 97,
            ratingAvg: 8.9,
            ratingCount: 4100,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 17,
            slug: 'hunter-x-hunter',
            title: 'Hunter x Hunter',
            altTitles: ['ハンター×ハンター'],
            description: 'A boy searches for his father who is a legendary Hunter.',
            year: 1998,
            status: 'hiatus',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['action', 'adventure', 'fantasy'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/00CEC9/FFFFFF?text=Hunter+x+Hunter',
            popularityScore: 89,
            ratingAvg: 9.1,
            ratingCount: 3500,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 18,
            slug: 'mob-psycho-100',
            title: 'Mob Psycho 100',
            altTitles: ['モブサイコ100'],
            description: 'A psychic middle schooler tries to live a normal life.',
            year: 2012,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['comedy', 'supernatural', 'slice-of-life'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/6C5CE7/FFFFFF?text=Mob+Psycho+100',
            popularityScore: 83,
            ratingAvg: 8.8,
            ratingCount: 1800,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 19,
            slug: 'vinland-saga',
            title: 'Vinland Saga',
            altTitles: ['ヴィンランド・サガ'],
            description: 'A young Viking warrior seeks revenge and eventually peace.',
            year: 2005,
            status: 'ongoing',
            contentRating: 'suggestive',
            originalLanguage: 'ja',
            tags: ['action', 'drama', 'adventure'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/8E44AD/FFFFFF?text=Vinland+Saga',
            popularityScore: 84,
            ratingAvg: 9.2,
            ratingCount: 2300,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            id: 20,
            slug: 'the-promised-neverland',
            title: 'The Promised Neverland',
            altTitles: ['約束のネバーランド', 'Yakusoku no Neverland'],
            description: 'Children discover the dark truth about their orphanage.',
            year: 2016,
            status: 'completed',
            contentRating: 'safe',
            originalLanguage: 'ja',
            tags: ['thriller', 'mystery', 'drama'],
            coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/55A3FF/FFFFFF?text=The+Promised+Neverland',
            popularityScore: 81,
            ratingAvg: 8.1,
            ratingCount: 1600,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }
    ];

    await db.insert(series).values(sampleSeries);

    // 4. Map 10 series to MangaDx external IDs
    const sampleSeriesSourceMap = [
        { id: 1, seriesId: 1, sourceId: 1, externalId: 'a96676e5-8ae2-425e-b549-7f15dd34a6d8', externalUrl: 'https://mangadx.org/title/a96676e5-8ae2-425e-b549-7f15dd34a6d8' },
        { id: 2, seriesId: 2, sourceId: 1, externalId: 'c52b2ce3-7f95-469c-96b0-479524fb7a1a', externalUrl: 'https://mangadx.org/title/c52b2ce3-7f95-469c-96b0-479524fb7a1a' },
        { id: 3, seriesId: 3, sourceId: 1, externalId: '801513ba-a712-498c-8f57-cae55b38cc92', externalUrl: 'https://mangadx.org/title/801513ba-a712-498c-8f57-cae55b38cc92' },
        { id: 4, seriesId: 4, sourceId: 1, externalId: 'b0b721ff-c388-4486-aa0f-c2b0bb321512', externalUrl: 'https://mangadx.org/title/b0b721ff-c388-4486-aa0f-c2b0bb321512' },
        { id: 5, seriesId: 5, sourceId: 1, externalId: 'd1c0d3f9-f359-467c-8474-0b2ea8e06f3d', externalUrl: 'https://mangadx.org/title/d1c0d3f9-f359-467c-8474-0b2ea8e06f3d' },
        { id: 6, seriesId: 7, sourceId: 1, externalId: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0', externalUrl: 'https://mangadx.org/title/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0' },
        { id: 7, seriesId: 8, sourceId: 1, externalId: 'a3219a4f-73c0-4213-8730-05985130539a', externalUrl: 'https://mangadx.org/title/a3219a4f-73c0-4213-8730-05985130539a' },
        { id: 8, seriesId: 13, sourceId: 1, externalId: 'f5f3c93c-d49c-4553-b0c0-2f5b7c0c9f3c', externalUrl: 'https://mangadx.org/title/f5f3c93c-d49c-4553-b0c0-2f5b7c0c9f3c' },
        { id: 9, seriesId: 15, sourceId: 1, externalId: 'bb14a5ab-5a74-44be-81b5-dd3b4c98c525', externalUrl: 'https://mangadx.org/title/bb14a5ab-5a74-44be-81b5-dd3b4c98c525' },
        { id: 10, seriesId: 17, sourceId: 1, externalId: 'f4f51775-7cc6-4fa9-8e9a-2f5c5d5c8e2a', externalUrl: 'https://mangadx.org/title/f4f51775-7cc6-4fa9-8e9a-2f5c5d5c8e2a' }
    ];

    await db.insert(seriesSourceMap).values(sampleSeriesSourceMap);

    // 5. Create series_authors relationships
    const sampleSeriesAuthors = [
        { seriesId: 1, authorId: 1, role: 'both' }, // One Piece - Eiichiro Oda
        { seriesId: 2, authorId: 2, role: 'both' }, // Attack on Titan - Hajime Isayama
        { seriesId: 3, authorId: 3, role: 'both' }, // Berserk - Kentaro Miura
        { seriesId: 15, authorId: 1, role: 'author' }, // Naruto - Eiichiro Oda (example)
        { seriesId: 16, authorId: 2, role: 'artist' }, // Dragon Ball - Hajime Isayama (example)
        { seriesId: 17, authorId: 3, role: 'author' }, // Hunter x Hunter - Kentaro Miura (example)
        { seriesId: 4, authorId: 1, role: 'artist' }, // Demon Slayer - Eiichiro Oda (example)
        { seriesId: 9, authorId: 2, role: 'both' }, // Jujutsu Kaisen - Hajime Isayama (example)
        { seriesId: 13, authorId: 3, role: 'author' }, // Death Note - Kentaro Miura (example)
        { seriesId: 19, authorId: 1, role: 'both' } // Vinland Saga - Eiichiro Oda (example)
    ];

    await db.insert(seriesAuthors).values(sampleSeriesAuthors);

    // 6. Generate 50 chapters across multiple series
    const sampleChapters = [
        // One Piece chapters
        { id: 1, seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-1', number: 1, title: 'Chapter 1: Romance Dawn', language: 'en', publishedAt: new Date('2020-01-15').toISOString(), pages: 20 },
        { id: 2, seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-2', number: 2, title: 'Chapter 2: That Guy is Rubber', language: 'en', publishedAt: new Date('2020-01-22').toISOString(), pages: 18 },
        { id: 3, seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-3', number: 3, title: 'Chapter 3: Introducing Pirate Hunter Zoro', language: 'en', publishedAt: new Date('2020-01-29').toISOString(), pages: 19 },
        { id: 4, seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-4', number: 4, title: 'Chapter 4: The Sea Devil', language: 'ja', publishedAt: new Date('2020-02-05').toISOString(), pages: 21 },
        { id: 5, seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-5', number: 5, title: 'Chapter 5: King of the Pirates', language: 'en', publishedAt: new Date('2020-02-12').toISOString(), pages: 17 },
        
        // Attack on Titan chapters
        { id: 6, seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-1', number: 1, title: 'Chapter 1: To You, 2000 Years From Now', language: 'en', publishedAt: new Date('2020-03-01').toISOString(), pages: 45 },
        { id: 7, seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-2', number: 2, title: 'Chapter 2: That Day', language: 'en', publishedAt: new Date('2020-03-08').toISOString(), pages: 44 },
        { id: 8, seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-3', number: 3, title: 'Chapter 3: Night of the Disbanding Ceremony', language: 'ja', publishedAt: new Date('2020-03-15').toISOString(), pages: 43 },
        { id: 9, seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-4', number: 4, title: 'Chapter 4: First Battle', language: 'en', publishedAt: new Date('2020-03-22').toISOString(), pages: 46 },
        { id: 10, seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-5', number: 5, title: 'Chapter 5: A Dull Glow in the Midst of Despair', language: 'es', publishedAt: new Date('2020-03-29').toISOString(), pages: 42 },
        
        // Berserk chapters
        { id: 11, seriesId: 3, sourceId: 1, externalId: 'ch-berserk-1', number: 1, title: 'Chapter 1: The Black Swordsman', language: 'en', publishedAt: new Date('2021-01-10').toISOString(), pages: 22 },
        { id: 12, seriesId: 3, sourceId: 1, externalId: 'ch-berserk-2', number: 2, title: 'Chapter 2: The Brand', language: 'en', publishedAt: new Date('2021-01-17').toISOString(), pages: 23 },
        { id: 13, seriesId: 3, sourceId: 1, externalId: 'ch-berserk-3', number: 3, title: 'Chapter 3: The Guardian Angels of Desire', language: 'ja', publishedAt: new Date('2021-01-24').toISOString(), pages: 24 },
        { id: 14, seriesId: 3, sourceId: 1, externalId: 'ch-berserk-4', number: 4, title: 'Chapter 4: The Golden Age (1)', language: 'en', publishedAt: new Date('2021-01-31').toISOString(), pages: 25 },
        { id: 15, seriesId: 3, sourceId: 1, externalId: 'ch-berserk-5', number: 5, title: 'Chapter 5: The Golden Age (2)', language: 'en', publishedAt: new Date('2021-02-07').toISOString(), pages: 21 },
        
        // Demon Slayer chapters
        { id: 16, seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-1', number: 1, title: 'Chapter 1: Cruelty', language: 'en', publishedAt: new Date('2021-05-01').toISOString(), pages: 19 },
        { id: 17, seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-2', number: 2, title: 'Chapter 2: Stranger', language: 'en', publishedAt: new Date('2021-05-08').toISOString(), pages: 18 },
        { id: 18, seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-3', number: 3, title: 'Chapter 3: Sabito and Makomo', language: 'ja', publishedAt: new Date('2021-05-15').toISOString(), pages: 20 },
        { id: 19, seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-4', number: 4, title: 'Chapter 4: Final Selection', language: 'es', publishedAt: new Date('2021-05-22').toISOString(), pages: 17 },
        { id: 20, seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-5', number: 5, title: 'Chapter 5: My Own Steel', language: 'en', publishedAt: new Date('2021-05-29').toISOString(), pages: 21 },
        
        // Solo Leveling chapters
        { id: 21, seriesId: 7, sourceId: 1, externalId: 'ch-solo-leveling-1', number: 1, title: 'Chapter 1: I\'m Used to It', language: 'en', publishedAt: new Date('2022-01-05').toISOString(), pages: 15 },
        { id: 22, seriesId: 7, sourceId: 1, externalId: 'ch-solo-leveling-2', number: 2, title: 'Chapter 2: If I Had Been A Little Stronger', language: 'en', publishedAt: new Date('2022-01-12').toISOString(), pages: 16 },
        { id: 23, seriesId: 7, sourceId: 1, externalId: 'ch-solo-leveling-3', number: 3, title: 'Chapter 3: It\'s Different Now', language: 'en', publishedAt: new Date('2022-01-19').toISOString(), pages: 18 },
        { id: 24, seriesId: 7, sourceId: 1, externalId: 'ch-solo-leveling-4', number: 4, title: 'Chapter 4: I Want to Become Strong', language: 'ja', publishedAt: new Date('2022-01-26').toISOString(), pages: 17 },
        { id: 25, seriesId: 7, sourceId: 1, externalId: 'ch-solo-leveling-5', number: 5, title: 'Chapter 5: The Penalty Zone', language: 'en', publishedAt: new Date('2022-02-02').toISOString(), pages: 19 },
        
        // Chainsaw Man chapters
        { id: 26, seriesId: 8, sourceId: 1, externalId: 'ch-chainsaw-man-1', number: 1, title: 'Chapter 1: Dog & Chainsaw', language: 'en', publishedAt: new Date('2022-06-01').toISOString(), pages: 20 },
        { id: 27, seriesId: 8, sourceId: 1, externalId: 'ch-chainsaw-man-2', number: 2, title: 'Chapter 2: The Place Where Pochita Is', language: 'en', publishedAt: new Date('2022-06-08').toISOString(), pages: 18 },
        { id: 28, seriesId: 8, sourceId: 1, externalId: 'ch-chainsaw-man-3', number: 3, title: 'Chapter 3: Arrival in Tokyo', language: 'ja', publishedAt: new Date('2022-06-15').toISOString(), pages: 19 },
        { id: 29, seriesId: 8, sourceId: 1, externalId: 'ch-chainsaw-man-4', number: 4, title: 'Chapter 4: Power', language: 'en', publishedAt: new Date('2022-06-22').toISOString(), pages: 21 },
        { id: 30, seriesId: 8, sourceId: 1, externalId: 'ch-chainsaw-man-5', number: 5, title: 'Chapter 5: A Way to Touch Some Boobs', language: 'es', publishedAt: new Date('2022-06-29').toISOString(), pages: 17 },
        
        // Death Note chapters
        { id: 31, seriesId: 13, sourceId: 1, externalId: 'ch-death-note-1', number: 1, title: 'Chapter 1: Boredom', language: 'en', publishedAt: new Date('2023-01-01').toISOString(), pages: 24 },
        { id: 32, seriesId: 13, sourceId: 1, externalId: 'ch-death-note-2', number: 2, title: 'Chapter 2: L', language: 'en', publishedAt: new Date('2023-01-08').toISOString(), pages: 22 },
        { id: 33, seriesId: 13, sourceId: 1, externalId: 'ch-death-note-3', number: 3, title: 'Chapter 3: Family', language: 'ja', publishedAt: new Date('2023-01-15').toISOString(), pages: 23 },
        { id: 34, seriesId: 13, sourceId: 1, externalId: 'ch-death-note-4', number: 4, title: 'Chapter 4: Pursuit', language: 'en', publishedAt: new Date('2023-01-22').toISOString(), pages: 25 },
        { id: 35, seriesId: 13, sourceId: 1, externalId: 'ch-death-note-5', number: 5, title: 'Chapter 5: Tactics', language: 'en', publishedAt: new Date('2023-01-29').toISOString(), pages: 21 },
        
        // Naruto chapters
        { id: 36, seriesId: 15, sourceId: 1, externalId: 'ch-naruto-1', number: 1, title: 'Chapter 1: Uzumaki Naruto', language: 'en', publishedAt: new Date('2023-05-01').toISOString(), pages: 19 },
        { id: 37, seriesId: 15, sourceId: 1, externalId: 'ch-naruto-2', number: 2, title: 'Chapter 2: Konohamaru', language: 'en', publishedAt: new Date('2023-05-08').toISOString(), pages: 18 },
        { id: 38, seriesId: 15, sourceId: 1, externalId: 'ch-naruto-3', number: 3, title: 'Chapter 3: Sasuke and Sakura', language: 'ja', publishedAt: new Date('2023-05-15').toISOString(), pages: 20 },
        { id: 39, seriesId: 15, sourceId: 1, externalId: 'ch-naruto-4', number: 4, title: 'Chapter 4: Kakashi\'s Conclusion', language: 'es', publishedAt: new Date('2023-05-22').toISOString(), pages: 17 },
        { id: 40, seriesId: 15, sourceId: 1, externalId: 'ch-naruto-5', number: 5, title: 'Chapter 5: The Challengers', language: 'en', publishedAt: new Date('2023-05-29').toISOString(), pages: 22 },
        
        // Hunter x Hunter chapters
        { id: 41, seriesId: 17, sourceId: 1, externalId: 'ch-hunter-x-hunter-1', number: 1, title: 'Chapter 1: The Day of Departure', language: 'en', publishedAt: new Date('2023-09-01').toISOString(), pages: 16 },
        { id: 42, seriesId: 17, sourceId: 1, externalId: 'ch-hunter-x-hunter-2', number: 2, title: 'Chapter 2: Test of Tests', language: 'en', publishedAt: new Date('2023-09-08').toISOString(), pages: 15 },
        { id: 43, seriesId: 17, sourceId: 1, externalId: 'ch-hunter-x-hunter-3', number: 3, title: 'Chapter 3: Rivals for Survival', language: 'ja', publishedAt: new Date('2023-09-15').toISOString(), pages: 18 },
        { id: 44, seriesId: 17, sourceId: 1, externalId: 'ch-hunter-x-hunter-4', number: 4, title: 'Chapter 4: Hope and Ambition', language: 'en', publishedAt: new Date('2023-09-22').toISOString(), pages: 17 },
        { id: 45, seriesId: 17, sourceId: 1, externalId: 'ch-hunter-x-hunter-5', number: 5, title: 'Chapter 5: Hisoka\'s Magic', language: 'en', publishedAt: new Date('2023-09-29').toISOString(), pages: 19 },
        
        // My Hero Academia chapters
        { id: 46, seriesId: 5, sourceId: 1, externalId: 'ch-my-hero-academia-1', number: 1, title: 'Chapter 1: Izuku Midoriya: Origin', language: 'en', publishedAt: new Date('2024-01-01').toISOString(), pages: 22 },
        { id: 47, seriesId: 5, sourceId: 1, externalId: 'ch-my-hero-academia-2', number: 2, title: 'Chapter 2: What It Takes to Be a Hero', language: 'en', publishedAt: new Date('2024-01-08').toISOString(), pages: 21 },
        { id: 48, seriesId: 5, sourceId: 1, externalId: 'ch-my-hero-academia-3', number: 3, title: 'Chapter 3: Roaring Muscles', language: 'ja', publishedAt: new Date('2024-01-15').toISOString(), pages: 20 },
        { id: 49, seriesId: 5, sourceId: 1, externalId: 'ch-my-hero-academia-4', number: 4, title: 'Chapter 4: Start Line', language: 'es', publishedAt: new Date('2024-01-22').toISOString(), pages: 23 },
        { id: 50, seriesId: 5, sourceId: 1, externalId: 'ch-my-hero-academia-5', number: 5, title: 'Chapter 5: What I Can Do for Now', language: 'en', publishedAt: new Date('2024-01-29').toISOString(), pages: 18 }
    ];

    await db.insert(mangaChapters).values(sampleChapters);
    
    console.log('✅ Unified manga database seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});