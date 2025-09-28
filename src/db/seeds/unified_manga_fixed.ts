import { db } from '@/db';
import { mangaSources, authors, series, seriesAuthors, seriesSourceMap, mangaChapters } from '@/db/schema';

async function main() {
    const currentTime = new Date().toISOString();

    try {
        // 1. Insert MangaDx source
        await db.insert(mangaSources).values([
            {
                id: 1,
                name: 'MangaDx',
                baseUrl: 'https://mangadx.org'
            }
        ]).onConflictDoNothing();

        // 2. Create 3 authors
        const sampleAuthors = [
            { id: 1, name: 'Eiichiro Oda' },
            { id: 2, name: 'Hajime Isayama' },
            { id: 3, name: 'Kentaro Miura' }
        ];

        await db.insert(authors).values(sampleAuthors).onConflictDoNothing();

        // 3. Seed 20 diverse series
        const sampleSeries = [
            {
                id: 1,
                slug: 'one-piece',
                title: 'One Piece',
                altTitles: ['ワンピース'],
                description: 'The story follows Monkey D. Luffy, a young pirate who gains rubber powers after eating a Devil Fruit.',
                year: 1997,
                status: 'ongoing',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['action', 'adventure', 'comedy'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FF6B35/FFFFFF?text=One+Piece',
                popularityScore: 95,
                ratingAvg: 9.2,
                ratingCount: 4500,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 2,
                slug: 'attack-on-titan',
                title: 'Attack on Titan',
                altTitles: ['進撃の巨人', 'Shingeki no Kyojin'],
                description: 'Humanity fights for survival against giant humanoid Titans behind three concentric walls.',
                year: 2009,
                status: 'completed',
                contentRating: 'suggestive',
                originalLanguage: 'ja',
                tags: ['action', 'drama', 'fantasy', 'horror'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/8B4513/FFFFFF?text=Attack+on+Titan',
                popularityScore: 92,
                ratingAvg: 9.0,
                ratingCount: 3800,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 3,
                slug: 'berserk',
                title: 'Berserk',
                altTitles: ['ベルセルク'],
                description: 'The dark medieval world of Guts, a lone swordsman seeking revenge against his former friend Griffith.',
                year: 1989,
                status: 'hiatus',
                contentRating: 'suggestive',
                originalLanguage: 'ja',
                tags: ['action', 'adventure', 'drama', 'fantasy', 'horror', 'supernatural'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/000000/FFFFFF?text=Berserk',
                popularityScore: 89,
                ratingAvg: 9.5,
                ratingCount: 2900,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 4,
                slug: 'demon-slayer',
                title: 'Demon Slayer',
                altTitles: ['鬼滅の刃', 'Kimetsu no Yaiba'],
                description: 'Tanjiro Kamado becomes a demon slayer to save his sister and avenge his family.',
                year: 2016,
                status: 'completed',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['action', 'supernatural', 'drama'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FF1744/FFFFFF?text=Demon+Slayer',
                popularityScore: 88,
                ratingAvg: 8.7,
                ratingCount: 4200,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 5,
                slug: 'naruto',
                title: 'Naruto',
                altTitles: ['ナルト'],
                description: 'A young ninja seeks recognition from his peers and dreams of becoming the Hokage.',
                year: 1999,
                status: 'completed',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['action', 'adventure', 'comedy', 'drama'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FF9800/FFFFFF?text=Naruto',
                popularityScore: 90,
                ratingAvg: 8.5,
                ratingCount: 5000,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 6,
                slug: 'death-note',
                title: 'Death Note',
                altTitles: ['デスノート'],
                description: 'A high school student discovers a supernatural notebook that kills anyone whose name is written in it.',
                year: 2003,
                status: 'completed',
                contentRating: 'suggestive',
                originalLanguage: 'ja',
                tags: ['thriller', 'mystery', 'supernatural', 'drama'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/424242/FFFFFF?text=Death+Note',
                popularityScore: 85,
                ratingAvg: 9.1,
                ratingCount: 3500,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 7,
                slug: 'my-hero-academia',
                title: 'My Hero Academia',
                altTitles: ['僕のヒーローアカデミア', 'Boku no Hero Academia'],
                description: 'In a world where superpowers are common, a powerless boy enrolls in a prestigious hero academy.',
                year: 2014,
                status: 'ongoing',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['action', 'adventure', 'comedy', 'sci-fi'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/4CAF50/FFFFFF?text=My+Hero+Academia',
                popularityScore: 82,
                ratingAvg: 8.3,
                ratingCount: 3200,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 8,
                slug: 'tower-of-god',
                title: 'Tower of God',
                altTitles: ['신의 탑'],
                description: 'A boy enters a mysterious tower to find his friend, facing challenges on each floor.',
                year: 2010,
                status: 'ongoing',
                contentRating: 'safe',
                originalLanguage: 'ko',
                tags: ['action', 'adventure', 'fantasy', 'mystery'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/2196F3/FFFFFF?text=Tower+of+God',
                popularityScore: 75,
                ratingAvg: 8.6,
                ratingCount: 2100,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 9,
                slug: 'solo-leveling',
                title: 'Solo Leveling',
                altTitles: ['나 혼자만 레벨업'],
                description: 'The weakest hunter becomes the strongest through a mysterious system.',
                year: 2018,
                status: 'completed',
                contentRating: 'safe',
                originalLanguage: 'ko',
                tags: ['action', 'adventure', 'fantasy'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/9C27B0/FFFFFF?text=Solo+Leveling',
                popularityScore: 87,
                ratingAvg: 8.9,
                ratingCount: 4800,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 10,
                slug: 'chainsaw-man',
                title: 'Chainsaw Man',
                altTitles: ['チェンソーマン'],
                description: 'Denji merges with his pet devil Pochita to become Chainsaw Man.',
                year: 2018,
                status: 'ongoing',
                contentRating: 'suggestive',
                originalLanguage: 'ja',
                tags: ['action', 'horror', 'supernatural'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Chainsaw+Man',
                popularityScore: 80,
                ratingAvg: 8.4,
                ratingCount: 2800,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 11,
                slug: 'jujutsu-kaisen',
                title: 'Jujutsu Kaisen',
                altTitles: ['呪術廻戦'],
                description: 'Students at Tokyo Jujutsu High fight against cursed spirits.',
                year: 2018,
                status: 'ongoing',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['action', 'supernatural', 'drama'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/3F51B5/FFFFFF?text=Jujutsu+Kaisen',
                popularityScore: 83,
                ratingAvg: 8.6,
                ratingCount: 3600,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 12,
                slug: 'spirited-away',
                title: 'Spirited Away',
                altTitles: ['千と千尋の神隠し'],
                description: 'A young girl must work in a spirit bathhouse to save her parents.',
                year: 2001,
                status: 'completed',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['adventure', 'fantasy', 'slice-of-life'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/00BCD4/FFFFFF?text=Spirited+Away',
                popularityScore: 70,
                ratingAvg: 9.3,
                ratingCount: 1500,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 13,
                slug: 'the-god-of-high-school',
                title: 'The God of High School',
                altTitles: ['갓 오브 하이스쿨'],
                description: 'High school students compete in a martial arts tournament with hidden supernatural elements.',
                year: 2011,
                status: 'completed',
                contentRating: 'safe',
                originalLanguage: 'ko',
                tags: ['action', 'adventure', 'comedy', 'supernatural'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FF5722/FFFFFF?text=God+of+High+School',
                popularityScore: 72,
                ratingAvg: 8.1,
                ratingCount: 1800,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 14,
                slug: 'romance-101',
                title: 'Romance 101',
                altTitles: ['Romance 101'],
                description: 'A college student learns about love and relationships through various encounters.',
                year: 2019,
                status: 'ongoing',
                contentRating: 'suggestive',
                originalLanguage: 'en',
                tags: ['romance', 'comedy', 'slice-of-life'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/E91E63/FFFFFF?text=Romance+101',
                popularityScore: 45,
                ratingAvg: 7.8,
                ratingCount: 800,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 15,
                slug: 'battle-through-heavens',
                title: 'Battle Through the Heavens',
                altTitles: ['斗破苍穹'],
                description: 'A young man seeks to reclaim his lost powers in a world of cultivation.',
                year: 2018,
                status: 'ongoing',
                contentRating: 'safe',
                originalLanguage: 'zh',
                tags: ['action', 'adventure', 'fantasy'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/795548/FFFFFF?text=Battle+Through+Heavens',
                popularityScore: 68,
                ratingAvg: 7.9,
                ratingCount: 2200,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 16,
                slug: 'monster',
                title: 'Monster',
                altTitles: ['モンスター'],
                description: 'A neurosurgeon hunts down a former patient who has become a serial killer.',
                year: 1994,
                status: 'completed',
                contentRating: 'suggestive',
                originalLanguage: 'ja',
                tags: ['thriller', 'mystery', 'drama'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/607D8B/FFFFFF?text=Monster',
                popularityScore: 65,
                ratingAvg: 9.4,
                ratingCount: 1200,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 17,
                slug: 'horimiya',
                title: 'Horimiya',
                altTitles: ['ホリミヤ'],
                description: 'A popular girl and a gloomy boy discover each others hidden sides.',
                year: 2011,
                status: 'completed',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['romance', 'comedy', 'slice-of-life'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/FFC107/FFFFFF?text=Horimiya',
                popularityScore: 58,
                ratingAvg: 8.2,
                ratingCount: 1600,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 18,
                slug: 'mob-psycho-100',
                title: 'Mob Psycho 100',
                altTitles: ['モブサイコ100'],
                description: 'A middle schooler with psychic powers tries to live a normal life.',
                year: 2012,
                status: 'completed',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['action', 'comedy', 'supernatural', 'slice-of-life'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/4CAF50/FFFFFF?text=Mob+Psycho+100',
                popularityScore: 62,
                ratingAvg: 8.8,
                ratingCount: 1400,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 19,
                slug: 'promised-neverland',
                title: 'The Promised Neverland',
                altTitles: ['約束のネバーランド', 'Yakusoku no Neverland'],
                description: 'Children at an orphanage discover a dark secret and plan their escape.',
                year: 2016,
                status: 'completed',
                contentRating: 'safe',
                originalLanguage: 'ja',
                tags: ['thriller', 'mystery', 'drama', 'supernatural'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/009688/FFFFFF?text=Promised+Neverland',
                popularityScore: 78,
                ratingAvg: 8.7,
                ratingCount: 2600,
                createdAt: currentTime,
                updatedAt: currentTime
            },
            {
                id: 20,
                slug: 'lore-olympus',
                title: 'Lore Olympus',
                altTitles: ['Lore Olympus'],
                description: 'A modern retelling of the Greek myth of Hades and Persephone.',
                year: 2018,
                status: 'cancelled',
                contentRating: 'suggestive',
                originalLanguage: 'en',
                tags: ['romance', 'fantasy', 'drama'],
                coverImageUrl: '/api/image-proxy?src=https://via.placeholder.com/300x400/673AB7/FFFFFF?text=Lore+Olympus',
                popularityScore: 55,
                ratingAvg: 6.5,
                ratingCount: 900,
                createdAt: currentTime,
                updatedAt: currentTime
            }
        ];

        await db.insert(series).values(sampleSeries).onConflictDoNothing();

        // 4. Map 10 series to MangaDx external IDs
        const seriesSourceMapping = [
            { seriesId: 1, sourceId: 1, externalId: 'a96676e5-8ae2-425e-b549-7f15dd34a6d8', externalUrl: 'https://mangadx.org/title/a96676e5-8ae2-425e-b549-7f15dd34a6d8' },
            { seriesId: 2, sourceId: 1, externalId: 'b86b20d1-0b5a-4e6c-9f7e-8a3b4c5d6e7f', externalUrl: 'https://mangadx.org/title/b86b20d1-0b5a-4e6c-9f7e-8a3b4c5d6e7f' },
            { seriesId: 3, sourceId: 1, externalId: 'c97c30e2-1c6b-5f7d-af8f-9b4c5d6e7f8g', externalUrl: 'https://mangadx.org/title/c97c30e2-1c6b-5f7d-af8f-9b4c5d6e7f8g' },
            { seriesId: 4, sourceId: 1, externalId: 'd08d40f3-2d7c-6g8e-bg9g-ac5d6e7f8g9h', externalUrl: 'https://mangadx.org/title/d08d40f3-2d7c-6g8e-bg9g-ac5d6e7f8g9h' },
            { seriesId: 5, sourceId: 1, externalId: 'e19e51g4-3e8d-7h9f-ch0h-bd6e7f8g9h0i', externalUrl: 'https://mangadx.org/title/e19e51g4-3e8d-7h9f-ch0h-bd6e7f8g9h0i' },
            { seriesId: 6, sourceId: 1, externalId: 'f20f62h5-4f9e-8i0g-di1i-ce7f8g9h0i1j', externalUrl: 'https://mangadx.org/title/f20f62h5-4f9e-8i0g-di1i-ce7f8g9h0i1j' },
            { seriesId: 7, sourceId: 1, externalId: 'g31g73i6-5g0f-9j1h-ej2j-df8g9h0i1j2k', externalUrl: 'https://mangadx.org/title/g31g73i6-5g0f-9j1h-ej2j-df8g9h0i1j2k' },
            { seriesId: 11, sourceId: 1, externalId: 'h42h84j7-6h1g-ak2i-fk3k-eg9h0i1j2k3l', externalUrl: 'https://mangadx.org/title/h42h84j7-6h1g-ak2i-fk3k-eg9h0i1j2k3l' },
            { seriesId: 16, sourceId: 1, externalId: 'i53i95k8-7i2h-bl3j-gl4l-fh0i1j2k3l4m', externalUrl: 'https://mangadx.org/title/i53i95k8-7i2h-bl3j-gl4l-fh0i1j2k3l4m' },
            { seriesId: 19, sourceId: 1, externalId: 'j64ja6l9-8j3i-cm4k-hm5m-gi1j2k3l4m5n', externalUrl: 'https://mangadx.org/title/j64ja6l9-8j3i-cm4k-hm5m-gi1j2k3l4m5n' }
        ];

        await db.insert(seriesSourceMap).values(seriesSourceMapping).onConflictDoNothing();

        // 5. Create series_authors relationships
        const seriesAuthorsRelations = [
            { seriesId: 1, authorId: 1, role: 'both' }, // One Piece - Eiichiro Oda
            { seriesId: 2, authorId: 2, role: 'both' }, // Attack on Titan - Hajime Isayama
            { seriesId: 3, authorId: 3, role: 'both' }, // Berserk - Kentaro Miura
            { seriesId: 4, authorId: 1, role: 'author' }, // Demon Slayer - Eiichiro Oda (fictional)
            { seriesId: 5, authorId: 2, role: 'author' }, // Naruto - Hajime Isayama (fictional)
            { seriesId: 6, authorId: 3, role: 'author' }, // Death Note - Kentaro Miura (fictional)
            { seriesId: 7, authorId: 1, role: 'artist' }, // My Hero Academia - Eiichiro Oda (fictional)
            { seriesId: 11, authorId: 2, role: 'artist' }, // Jujutsu Kaisen - Hajime Isayama (fictional)
            { seriesId: 16, authorId: 3, role: 'artist' }, // Monster - Kentaro Miura (fictional)
            { seriesId: 19, authorId: 1, role: 'both' } // Promised Neverland - Eiichiro Oda (fictional)
        ];

        await db.insert(seriesAuthors).values(seriesAuthorsRelations).onConflictDoNothing();

        // 6. Generate 50 chapters across multiple series
        const sampleChapters = [
            // One Piece chapters (seriesId: 1)
            { seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-1', number: 1, title: 'Chapter 1: Romance Dawn', language: 'en', publishedAt: '2020-01-15T10:00:00Z', pages: 20 },
            { seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-2', number: 2, title: 'Chapter 2: The Man with the Straw Hat', language: 'en', publishedAt: '2020-01-22T10:00:00Z', pages: 18 },
            { seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-3', number: 3, title: 'Chapter 3: Introducing Captain Morgan!', language: 'en', publishedAt: '2020-01-29T10:00:00Z', pages: 19 },
            { seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-4', number: 4, title: 'Chapter 4: The Passing of the Hat', language: 'ja', publishedAt: '2020-02-05T10:00:00Z', pages: 21 },
            { seriesId: 1, sourceId: 1, externalId: 'ch-one-piece-5', number: 5, title: 'Chapter 5: The Pirate King and the Master Swordsman', language: 'en', publishedAt: '2020-02-12T10:00:00Z', pages: 22 },

            // Attack on Titan chapters (seriesId: 2)
            { seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-1', number: 1, title: 'Chapter 1: To You, 2,000 Years From Now', language: 'en', publishedAt: '2020-03-01T10:00:00Z', pages: 24 },
            { seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-2', number: 2, title: 'Chapter 2: That Day', language: 'en', publishedAt: '2020-03-08T10:00:00Z', pages: 23 },
            { seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-3', number: 3, title: 'Chapter 3: A Dim Light Amid Despair', language: 'ja', publishedAt: '2020-03-15T10:00:00Z', pages: 25 },
            { seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-4', number: 4, title: 'Chapter 4: First Battle', language: 'en', publishedAt: '2020-03-22T10:00:00Z', pages: 22 },
            { seriesId: 2, sourceId: 1, externalId: 'ch-attack-on-titan-5', number: 5, title: 'Chapter 5: The Struggle for Trost', language: 'es', publishedAt: '2020-03-29T10:00:00Z', pages: 21 },

            // Berserk chapters (seriesId: 3)
            { seriesId: 3, sourceId: 1, externalId: 'ch-berserk-1', number: 1, title: 'Chapter 1: The Black Swordsman', language: 'en', publishedAt: '2020-04-05T10:00:00Z', pages: 18 },
            { seriesId: 3, sourceId: 1, externalId: 'ch-berserk-2', number: 2, title: 'Chapter 2: The Brand', language: 'ja', publishedAt: '2020-04-12T10:00:00Z', pages: 17 },
            { seriesId: 3, sourceId: 1, externalId: 'ch-berserk-3', number: 3, title: 'Chapter 3: The Guardian Angels of Desire', language: 'en', publishedAt: '2020-04-19T10:00:00Z', pages: 19 },
            { seriesId: 3, sourceId: 1, externalId: 'ch-berserk-4', number: 4, title: 'Chapter 4: The Golden Age', language: 'en', publishedAt: '2020-04-26T10:00:00Z', pages: 20 },

            // Demon Slayer chapters (seriesId: 4)
            { seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-1', number: 1, title: 'Chapter 1: Cruelty', language: 'en', publishedAt: '2020-05-03T10:00:00Z', pages: 16 },
            { seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-2', number: 2, title: 'Chapter 2: Stranger', language: 'ja', publishedAt: '2020-05-10T10:00:00Z', pages: 15 },
            { seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-3', number: 3, title: 'Chapter 3: Sabito and Makomo', language: 'en', publishedAt: '2020-05-17T10:00:00Z', pages: 17 },
            { seriesId: 4, sourceId: 1, externalId: 'ch-demon-slayer-4', number: 4, title: 'Chapter 4: Final Selection', language: 'es', publishedAt: '2020-05-24T10:00:00Z', pages: 18 },

            // Naruto chapters (seriesId: 5)
            { seriesId: 5, sourceId: 1, externalId: 'ch-naruto-1', number: 1, title: 'Chapter 1: Uzumaki Naruto!', language: 'en', publishedAt: '2020-06-01T10:00:00Z', pages: 19 },
            { seriesId: 5, sourceId: 1, externalId: 'ch-naruto-2', number: 2, title: 'Chapter 2: Konohamaru!!', language: 'ja', publishedAt: '2020-06-08T10:00:00Z', pages: 18 },
            { seriesId: 5, sourceId: 1, externalId: 'ch-naruto-3', number: 3, title: 'Chapter 3: Sasuke and Sakura, Friends?!', language: 'en', publishedAt: '2020-06-15T10:00:00Z', pages: 20 },
            { seriesId: 5, sourceId: 1, externalId: 'ch-naruto-4', number: 4, title: 'Chapter 4: Hatake Kakashi', language: 'en', publishedAt: '2020-06-22T10:00:00Z', pages: 21 },

            // Death Note chapters (seriesId: 6)
            { seriesId: 6, sourceId: 1, externalId: 'ch-death-note-1', number: 1, title: 'Chapter 1: Boredom', language: 'en', publishedAt: '2020-07-01T10:00:00Z', pages: 22 },
            { seriesId: 6, sourceId: 1, externalId: 'ch-death-note-2', number: 2, title: 'Chapter 2: L', language: 'ja', publishedAt: '2020-07-08T10:00:00Z', pages: 21 },
            { seriesId: 6, sourceId: 1, externalId: 'ch-death-note-3', number: 3, title: 'Chapter 3: Family', language: 'en', publishedAt: '2020-07-15T10:00:00Z', pages: 23 },

            // My Hero Academia chapters (seriesId: 7)
            { seriesId: 7, sourceId: 1, externalId: 'ch-my-hero-academia-1', number: 1, title: 'Chapter 1: Izuku Midoriya: Origin', language: 'en', publishedAt: '2020-08-01T10:00:00Z', pages: 17 },
            { seriesId: 7, sourceId: 1, externalId: 'ch-my-hero-academia-2', number: 2, title: 'Chapter 2: What It Takes to Be a Hero', language: 'es', publishedAt: '2020-08-08T10:00:00Z', pages: 16 },
            { seriesId: 7, sourceId: 1, externalId: 'ch-my-hero-academia-3', number: 3, title: 'Chapter 3: Roaring Muscles', language: 'en', publishedAt: '2020-08-15T10:00:00Z', pages: 18 },

            // Tower of God chapters (seriesId: 8)
            { seriesId: 8, sourceId: 1, externalId: 'ch-tower-of-god-1', number: 1, title: 'Chapter 1: Headons Floor', language: 'en', publishedAt: '2021-01-10T10:00:00Z', pages: 25 },
            { seriesId: 8, sourceId: 1, externalId: 'ch-tower-of-god-2', number: 2, title: 'Chapter 2: 3F - Ball', language: 'en', publishedAt: '2021-01-17T10:00:00Z', pages: 24 },
            { seriesId: 8, sourceId: 1, externalId: 'ch-tower-of-god-3', number: 3, title: 'Chapter 3: The Correct Door', language: 'ja', publishedAt: '2021-01-24T10:00:00Z', pages: 23 },

            // Solo Leveling chapters (seriesId: 9)
            { seriesId: 9, sourceId: 1, externalId: 'ch-solo-leveling-1', number: 1, title: 'Chapter 1: The Weakest Hunter', language: 'en', publishedAt: '2021-02-01T10:00:00Z', pages: 22 },
            { seriesId: 9, sourceId: 1, externalId: 'ch-solo-leveling-2', number: 2, title: 'Chapter 2: The Double Dungeon', language: 'en', publishedAt: '2021-02-08T10:00:00Z', pages: 21 },
            { seriesId: 9, sourceId: 1, externalId: 'ch-solo-leveling-3', number: 3, title: 'Chapter 3: The System', language: 'es', publishedAt: '2021-02-15T10:00:00Z', pages: 20 },

            // Chainsaw Man chapters (seriesId: 10)
            { seriesId: 10, sourceId: 1, externalId: 'ch-chainsaw-man-1', number: 1, title: 'Chapter 1: Dog & Chainsaw', language: 'en', publishedAt: '2021-03-01T10:00:00Z', pages: 19 },
            { seriesId: 10, sourceId: 1, externalId: 'ch-chainsaw-man-2', number: 2, title: 'Chapter 2: The Place Where Pochita Is', language: 'ja', publishedAt: '2021-03-08T10:00:00Z', pages: 18 },

            // Jujutsu Kaisen chapters (seriesId: 11)
            { seriesId: 11, sourceId: 1, externalId: 'ch-jujutsu-kaisen-1', number: 1, title: 'Chapter 1: Ryomen Sukuna', language: 'en', publishedAt: '2021-04-01T10:00:00Z', pages: 20 },
            { seriesId: 11, sourceId: 1, externalId: 'ch-jujutsu-kaisen-2', number: 2, title: 'Chapter 2: For Myself', language: 'en', publishedAt: '2021-04-08T10:00:00Z', pages: 19 },

            // Spirited Away chapters (seriesId: 12)
            { seriesId: 12, sourceId: 1, externalId: 'ch-spirited-away-1', number: 1, title: 'Chapter 1: Into the Spirit World', language: 'en', publishedAt: '2021-05-01T10:00:00Z', pages: 24 },
            { seriesId: 12, sourceId: 1, externalId: 'ch-spirited-away-2', number: 2, title: 'Chapter 2: The Bathhouse', language: 'ja', publishedAt: '2021-05-08T10:00:00Z', pages: 23 },

            // The God of High School chapters (seriesId: 13)
            { seriesId: 13, sourceId: 1, externalId: 'ch-god-of-high-school-1', number: 1, title: 'Chapter 1: Set Up', language: 'en', publishedAt: '2022-01-10T10:00:00Z', pages: 21 },
            { seriesId: 13, sourceId: 1, externalId: 'ch-god-of-high-school-2', number: 2, title: 'Chapter 2: Preliminary', language: 'en', publishedAt: '2022-01-17T10:00:00Z', pages: 20 },

            // Romance 101 chapters (seriesId: 14)
            { seriesId: 14, sourceId: 1, externalId: 'ch-romance-101-1', number: 1, title: 'Chapter 1: First Meeting', language: 'en', publishedAt: '2022-02-01T10:00:00Z', pages: 15 },
            { seriesId: 14, sourceId: 1, externalId: 'ch-romance-101-2', number: 2, title: 'Chapter 2: Coffee Date', language: 'en', publishedAt: '2022-02-08T10:00:00Z', pages: 16 },

            // Battle Through the Heavens chapters (seriesId: 15)
            { seriesId: 15, sourceId: 1, externalId: 'ch-battle-through-heavens-1', number: 1, title: 'Chapter 1: The Fallen Genius', language: 'en', publishedAt: '2022-03-01T10:00:00Z', pages: 18 },

            // Monster chapters (seriesId: 16)
            { seriesId: 16, sourceId: 1, externalId: 'ch-monster-1', number: 1, title: 'Chapter 1: Herr Dr. Tenma', language: 'en', publishedAt: '2022-04-01T10:00:00Z', pages: 22 },

            // Horimiya chapters (seriesId: 17)
            { seriesId: 17, sourceId: 1, externalId: 'ch-horimiya-1', number: 1, title: 'Chapter 1: A Secret Youll Never Tell', language: 'en', publishedAt: '2023-01-01T10:00:00Z', pages: 17 },

            // Mob Psycho 100 chapters (seriesId: 18)
            { seriesId: 18, sourceId: 1, externalId: 'ch-mob-psycho-100-1', number: 1, title: 'Chapter 1: Self-Proclaimed Psychic', language: 'en', publishedAt: '2023-02-01T10:00:00Z', pages: 19 },

            // The Promised Neverland chapters (seriesId: 19)
            { seriesId: 19, sourceId: 1, externalId: 'ch-promised-neverland-1', number: 1, title: 'Chapter 1: Grace Field House', language: 'en', publishedAt: '2023-03-01T10:00:00Z', pages: 20 },

            // Lore Olympus chapters (seriesId: 20)
            { seriesId: 20, sourceId: 1, externalId: 'ch-lore-olympus-1', number: 1, title: 'Chapter 1: The Meeting', language: 'en', publishedAt: '2024-01-01T10:00:00Z', pages: 25 }
        ];

        await db.insert(mangaChapters).values(sampleChapters).onConflictDoNothing();

        console.log('✅ Unified manga database seeder completed successfully');
        
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});