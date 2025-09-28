import { db } from '@/db';
import { users, series, mangaChapters, library, progress, comments } from '@/db/schema';

async function main() {
    // 1. Users with professional names and avatars
    const sampleUsers = [
        {
            email: 'sarah.chen@devstudio.com',
            name: 'Sarah Chen',
            avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=3b82f6&color=fff',
            roles: ['admin'],
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            email: 'marcus.rodriguez@techcorp.io',
            name: 'Marcus Rodriguez',
            avatarUrl: 'https://ui-avatars.com/api/?name=Marcus+Rodriguez&background=ef4444&color=fff',
            roles: ['user'],
            createdAt: new Date('2024-02-10').toISOString(),
            updatedAt: new Date('2024-02-10').toISOString(),
        },
        {
            email: 'aisha.patel@designlab.co',
            name: 'Aisha Patel',
            avatarUrl: 'https://ui-avatars.com/api/?name=Aisha+Patel&background=10b981&color=fff',
            roles: ['moderator'],
            createdAt: new Date('2024-03-05').toISOString(),
            updatedAt: new Date('2024-03-05').toISOString(),
        },
        {
            email: 'james.kim@startup.dev',
            name: 'James Kim',
            avatarUrl: 'https://ui-avatars.com/api/?name=James+Kim&background=f59e0b&color=fff',
            roles: ['user'],
            createdAt: new Date('2024-04-12').toISOString(),
            updatedAt: new Date('2024-04-12').toISOString(),
        },
        {
            email: 'elena.volkov@mediainc.com',
            name: 'Elena Volkov',
            avatarUrl: 'https://ui-avatars.com/api/?name=Elena+Volkov&background=8b5cf6&color=fff',
            roles: ['user'],
            createdAt: new Date('2024-05-20').toISOString(),
            updatedAt: new Date('2024-05-20').toISOString(),
        },
        {
            email: 'david.thompson@webagency.net',
            name: 'David Thompson',
            avatarUrl: 'https://ui-avatars.com/api/?name=David+Thompson&background=06b6d4&color=fff',
            roles: ['user'],
            createdAt: new Date('2024-06-08').toISOString(),
            updatedAt: new Date('2024-06-08').toISOString(),
        },
        {
            email: 'maria.gonzalez@creativestu.com',
            name: 'Maria Gonzalez',
            avatarUrl: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=ec4899&color=fff',
            roles: ['admin'],
            createdAt: new Date('2024-07-15').toISOString(),
            updatedAt: new Date('2024-07-15').toISOString(),
        },
        {
            email: 'alex.johnson@freelance.dev',
            name: 'Alex Johnson',
            avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=84cc16&color=fff',
            roles: ['user'],
            createdAt: new Date('2024-08-22').toISOString(),
            updatedAt: new Date('2024-08-22').toISOString(),
        },
        {
            email: 'yuki.tanaka@innovations.jp',
            name: 'Yuki Tanaka',
            avatarUrl: 'https://ui-avatars.com/api/?name=Yuki+Tanaka&background=f97316&color=fff',
            roles: ['user'],
            createdAt: new Date('2024-09-10').toISOString(),
            updatedAt: new Date('2024-09-10').toISOString(),
        },
        {
            email: 'carlos.silva@globaltech.br',
            name: 'Carlos Silva',
            avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Silva&background=6366f1&color=fff',
            roles: ['user'],
            createdAt: new Date('2024-10-05').toISOString(),
            updatedAt: new Date('2024-10-05').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);

    // 2. Diverse series with comprehensive details
    const sampleSeries = [
        {
            slug: 'one-piece',
            title: 'One Piece',
            description: 'Monkey D. Luffy sets off on his adventure by himself in a small boat, searching for the legendary treasure "One Piece" to become the next Pirate King.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
            sourceName: 'Viz Media',
            sourceUrl: 'https://www.viz.com/one-piece',
            tags: ['action', 'adventure', 'comedy', 'drama', 'shounen'],
            rating: 9.2,
            year: 1997,
            status: 'ongoing',
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date('2024-01-01').toISOString(),
        },
        {
            slug: 'attack-on-titan',
            title: 'Attack on Titan',
            description: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/2/37846.jpg',
            sourceName: 'MangaDex',
            sourceUrl: 'https://mangadex.org/title/304ceac3-8cdb-4fe7-acf7-2b6ff7a60613',
            tags: ['action', 'drama', 'fantasy', 'shounen', 'military'],
            rating: 9.0,
            year: 2009,
            status: 'completed',
            createdAt: new Date('2024-01-02').toISOString(),
            updatedAt: new Date('2024-01-02').toISOString(),
        },
        {
            slug: 'death-note',
            title: 'Death Note',
            description: 'A high school student discovers a supernatural notebook that allows him to kill anyone by writing their name in it.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/1/258245.jpg',
            sourceName: 'Viz Media',
            sourceUrl: 'https://www.viz.com/death-note',
            tags: ['psychological', 'supernatural', 'thriller', 'shounen'],
            rating: 9.1,
            year: 2003,
            status: 'completed',
            createdAt: new Date('2024-01-03').toISOString(),
            updatedAt: new Date('2024-01-03').toISOString(),
        },
        {
            slug: 'solo-leveling',
            title: 'Solo Leveling',
            description: 'In a world where hunters battle monsters, the weakest hunter gains a mysterious system that allows him to level up infinitely.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/3/222295.jpg',
            sourceName: 'Webtoons',
            sourceUrl: 'https://www.webtoons.com/en/action/solo-leveling/list?title_no=1825',
            tags: ['action', 'adventure', 'fantasy', 'manhwa'],
            rating: 8.8,
            year: 2018,
            status: 'completed',
            createdAt: new Date('2024-01-04').toISOString(),
            updatedAt: new Date('2024-01-04').toISOString(),
        },
        {
            slug: 'tower-of-god',
            title: 'Tower of God',
            description: 'A boy enters a mysterious tower to chase after his best friend, facing challenges on each floor to reach the top.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/1/209143.jpg',
            sourceName: 'Webtoons',
            sourceUrl: 'https://www.webtoons.com/en/fantasy/tower-of-god/list?title_no=95',
            tags: ['action', 'adventure', 'drama', 'fantasy', 'manhwa'],
            rating: 8.6,
            year: 2010,
            status: 'ongoing',
            createdAt: new Date('2024-01-05').toISOString(),
            updatedAt: new Date('2024-01-05').toISOString(),
        },
        {
            slug: 'battle-through-heavens',
            title: 'Battle Through the Heavens',
            description: 'A young man seeks to regain his lost powers and protect his family in a world of cultivation and martial arts.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/1/176015.jpg',
            sourceName: 'MangaDex',
            sourceUrl: 'https://mangadex.org/title/5f4e7d9b-2e8a-4b9c-8f3d-1a2b3c4d5e6f',
            tags: ['action', 'adventure', 'martial arts', 'manhua', 'cultivation'],
            rating: 7.8,
            year: 2012,
            status: 'ongoing',
            createdAt: new Date('2024-01-06').toISOString(),
            updatedAt: new Date('2024-01-06').toISOString(),
        },
        {
            slug: 'horimiya',
            title: 'Horimiya',
            description: 'A sweet romantic comedy about two high school students who discover each others hidden sides and fall in love.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/2/171331.jpg',
            sourceName: 'MangaDex',
            sourceUrl: 'https://mangadex.org/title/a25e46ec-30f7-4db6-89df-cacbc1d9a900',
            tags: ['comedy', 'romance', 'school', 'slice of life', 'shounen'],
            rating: 8.4,
            year: 2011,
            status: 'completed',
            createdAt: new Date('2024-01-07').toISOString(),
            updatedAt: new Date('2024-01-07').toISOString(),
        },
        {
            slug: 'kaguya-sama-love-is-war',
            title: 'Kaguya-sama: Love is War',
            description: 'Two brilliant students engage in psychological warfare to make the other confess their love first.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/3/188896.jpg',
            sourceName: 'Viz Media',
            sourceUrl: 'https://www.viz.com/kaguya-sama-love-is-war',
            tags: ['comedy', 'psychological', 'romance', 'school', 'seinen'],
            rating: 8.9,
            year: 2015,
            status: 'completed',
            createdAt: new Date('2024-01-08').toISOString(),
            updatedAt: new Date('2024-01-08').toISOString(),
        },
        {
            slug: 'demon-slayer',
            title: 'Demon Slayer: Kimetsu no Yaiba',
            description: 'A young boy becomes a demon slayer to save his sister who has been turned into a demon.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/3/179023.jpg',
            sourceName: 'Viz Media',
            sourceUrl: 'https://www.viz.com/demon-slayer-kimetsu-no-yaiba',
            tags: ['action', 'historical', 'shounen', 'supernatural'],
            rating: 8.7,
            year: 2016,
            status: 'completed',
            createdAt: new Date('2024-01-09').toISOString(),
            updatedAt: new Date('2024-01-09').toISOString(),
        },
        {
            slug: 'chainsaw-man',
            title: 'Chainsaw Man',
            description: 'A young man with the power to transform into a chainsaw demon fights other devils in modern-day Japan.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/3/216464.jpg',
            sourceName: 'Viz Media',
            sourceUrl: 'https://www.viz.com/chainsaw-man',
            tags: ['action', 'comedy', 'horror', 'shounen', 'supernatural'],
            rating: 8.5,
            year: 2018,
            status: 'ongoing',
            createdAt: new Date('2024-01-10').toISOString(),
            updatedAt: new Date('2024-01-10').toISOString(),
        },
        {
            slug: 'my-hero-academia',
            title: 'My Hero Academia',
            description: 'In a world where superpowers are the norm, a powerless boy dreams of becoming the greatest hero.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/1/209734.jpg',
            sourceName: 'Viz Media',
            sourceUrl: 'https://www.viz.com/my-hero-academia',
            tags: ['action', 'school', 'shounen', 'superhero'],
            rating: 8.3,
            year: 2014,
            status: 'ongoing',
            createdAt: new Date('2024-01-11').toISOString(),
            updatedAt: new Date('2024-01-11').toISOString(),
        },
        {
            slug: 'jujutsu-kaisen',
            title: 'Jujutsu Kaisen',
            description: 'A high school student joins a secret organization of sorcerers to eliminate deadly curses and save his friends.',
            coverImageUrl: 'https://cdn.myanimelist.net/images/manga/3/210341.jpg',
            sourceName: 'Viz Media',
            sourceUrl: 'https://www.viz.com/jujutsu-kaisen',
            tags: ['action', 'school', 'shounen', 'supernatural'],
            rating: 8.6,
            year: 2018,
            status: 'ongoing',
            createdAt: new Date('2024-01-12').toISOString(),
            updatedAt: new Date('2024-01-12').toISOString(),
        }
    ];

    await db.insert(series).values(sampleSeries);

    // 3. Generate chapters for each series (~40 chapters each)
    const allChapters = [];
    
    // One Piece chapters (ongoing series)
    for (let i = 40; i >= 1; i--) {
        allChapters.push({
            seriesId: 1,
            number: i,
            title: `Chapter ${i}: ${i % 5 === 0 ? 'Epic Battle Begins' : i % 3 === 0 ? 'The Adventure Continues' : 'New Discoveries'}`,
            language: i % 10 === 0 ? 'ja' : i % 15 === 0 ? 'es' : 'en',
            publishedAt: new Date(2024, 0, i).toISOString(),
            pages: Math.floor(Math.random() * 20) + 15,
            externalId: `op-${i.toString().padStart(3, '0')}-${Math.random().toString(36).substr(2, 9)}`,
            sourceId: 'viz-media-op',
            createdAt: new Date(2024, 0, i).toISOString(),
        });
    }

    // Attack on Titan chapters (completed)
    for (let i = 40; i >= 1; i--) {
        allChapters.push({
            seriesId: 2,
            number: i,
            title: `Chapter ${i}: ${i % 4 === 0 ? 'Titans Attack' : i % 6 === 0 ? 'Humanity Strikes Back' : 'The Truth Revealed'}`,
            language: i % 8 === 0 ? 'ja' : 'en',
            publishedAt: new Date(2023, 11 - (i % 12), i % 28 + 1).toISOString(),
            pages: Math.floor(Math.random() * 25) + 20,
            externalId: `aot-${i.toString().padStart(3, '0')}-${Math.random().toString(36).substr(2, 9)}`,
            sourceId: 'mangadx-aot',
            createdAt: new Date(2023, 11 - (i % 12), i % 28 + 1).toISOString(),
        });
    }

    // Death Note chapters
    for (let i = 40; i >= 1; i--) {
        allChapters.push({
            seriesId: 3,
            number: i,
            title: `Chapter ${i}: ${i % 5 === 0 ? 'Mind Games' : i % 7 === 0 ? 'The Investigation' : 'Justice vs Evil'}`,
            language: 'en',
            publishedAt: new Date(2023, 10 - (i % 11), i % 28 + 1).toISOString(),
            pages: Math.floor(Math.random() * 15) + 18,
            externalId: `dn-${i.toString().padStart(3, '0')}-${Math.random().toString(36).substr(2, 9)}`,
            sourceId: 'viz-media-dn',
            createdAt: new Date(2023, 10 - (i % 11), i % 28 + 1).toISOString(),
        });
    }

    // Solo Leveling chapters
    for (let i = 40; i >= 1; i--) {
        allChapters.push({
            seriesId: 4,
            number: i,
            title: `Chapter ${i}: ${i % 3 === 0 ? 'Level Up' : i % 5 === 0 ? 'Dungeon Raid' : 'Power Awakening'}`,
            language: i % 12 === 0 ? 'ja' : 'en',
            publishedAt: new Date(2024, 1 + (i % 10), i % 28 + 1).toISOString(),
            pages: Math.floor(Math.random() * 30) + 25,
            externalId: `sl-${i.toString().padStart(3, '0')}-${Math.random().toString(36).substr(2, 9)}`,
            sourceId: 'webtoons-sl',
            createdAt: new Date(2024, 1 + (i % 10), i % 28 + 1).toISOString(),
        });
    }

    // Continue pattern for remaining 8 series with similar chapter generation
    const seriesChapterPatterns = [
        { id: 5, prefix: 'tog', source: 'webtoons-tog', themes: ['Floor Challenge', 'Tower Climb', 'Test Battle'] },
        { id: 6, prefix: 'btth', source: 'mangadx-btth', themes: ['Cultivation', 'Power Growth', 'Family Honor'] },
        { id: 7, prefix: 'hori', source: 'mangadx-hori', themes: ['School Life', 'Sweet Moments', 'Daily Adventures'] },
        { id: 8, prefix: 'kaguya', source: 'viz-kaguya', themes: ['Love War', 'Student Council', 'Confession Game'] },
        { id: 9, prefix: 'ds', source: 'viz-ds', themes: ['Demon Hunt', 'Breathing Technique', 'Final Battle'] },
        { id: 10, prefix: 'csm', source: 'viz-csm', themes: ['Devil Power', 'Chainsaw Form', 'Public Safety'] },
        { id: 11, prefix: 'mha', source: 'viz-mha', themes: ['Hero Training', 'Quirk Development', 'Villain Fight'] },
        { id: 12, prefix: 'jjk', source: 'viz-jjk', themes: ['Curse Technique', 'Domain Expansion', 'Sorcerer Battle'] },
    ];

    seriesChapterPatterns.forEach(({ id, prefix, source, themes }) => {
        for (let i = 40; i >= 1; i--) {
            allChapters.push({
                seriesId: id,
                number: i,
                title: `Chapter ${i}: ${themes[i % themes.length]}`,
                language: i % 10 === 0 ? 'ja' : i % 20 === 0 ? 'es' : 'en',
                publishedAt: new Date(2024, (i + id) % 12, (i % 28) + 1).toISOString(),
                pages: Math.floor(Math.random() * 25) + 20,
                externalId: `${prefix}-${i.toString().padStart(3, '0')}-${Math.random().toString(36).substr(2, 9)}`,
                sourceId: source,
                createdAt: new Date(2024, (i + id) % 12, (i % 28) + 1).toISOString(),
            });
        }
    });

    await db.insert(mangaChapters).values(allChapters);

    // 4. Library entries for 4 active users
    const libraryEntries = [
        // User 1 (Sarah Chen) - Active reader
        { userId: 1, seriesId: 1, status: 'reading', rating: null, notes: 'Amazing world building!', notifications: true, lastReadChapterId: 35, lastReadAt: new Date('2024-12-01').toISOString(), createdAt: new Date('2024-01-20').toISOString(), updatedAt: new Date('2024-12-01').toISOString() },
        { userId: 1, seriesId: 2, status: 'completed', rating: 9, notes: 'Mind-blowing ending!', notifications: false, lastReadChapterId: 80, lastReadAt: new Date('2024-11-15').toISOString(), createdAt: new Date('2024-02-01').toISOString(), updatedAt: new Date('2024-11-15').toISOString() },
        { userId: 1, seriesId: 4, status: 'reading', rating: null, notes: 'Love the leveling system', notifications: true, lastReadChapterId: 150, lastReadAt: new Date('2024-11-28').toISOString(), createdAt: new Date('2024-03-10').toISOString(), updatedAt: new Date('2024-11-28').toISOString() },
        { userId: 1, seriesId: 7, status: 'completed', rating: 8, notes: 'So wholesome and cute', notifications: false, lastReadChapterId: 155, lastReadAt: new Date('2024-10-20').toISOString(), createdAt: new Date('2024-04-05').toISOString(), updatedAt: new Date('2024-10-20').toISOString() },
        { userId: 1, seriesId: 12, status: 'plan_to_read', rating: null, notes: 'Heard great things about this', notifications: true, lastReadChapterId: null, lastReadAt: null, createdAt: new Date('2024-11-01').toISOString(), updatedAt: new Date('2024-11-01').toISOString() },

        // User 2 (Marcus Rodriguez) - Casual reader
        { userId: 2, seriesId: 3, status: 'completed', rating: 10, notes: 'Masterpiece of psychological thriller', notifications: false, lastReadChapterId: 120, lastReadAt: new Date('2024-09-30').toISOString(), createdAt: new Date('2024-02-15').toISOString(), updatedAt: new Date('2024-09-30').toISOString() },
        { userId: 2, seriesId: 9, status: 'reading', rating: null, notes: 'Great animation adaptation too', notifications: true, lastReadChapterId: 200, lastReadAt: new Date('2024-11-25').toISOString(), createdAt: new Date('2024-05-01').toISOString(), updatedAt: new Date('2024-11-25').toISOString() },
        { userId: 2, seriesId: 10, status: 'on_hold', rating: null, notes: 'Too intense, taking a break', notifications: false, lastReadChapterId: 290, lastReadAt: new Date('2024-08-15').toISOString(), createdAt: new Date('2024-07-01').toISOString(), updatedAt: new Date('2024-08-15').toISOString() },
        { userId: 2, seriesId: 5, status: 'plan_to_read', rating: null, notes: 'Waiting for next season', notifications: true, lastReadChapterId: null, lastReadAt: null, createdAt: new Date('2024-10-10').toISOString(), updatedAt: new Date('2024-10-10').toISOString() },

        // User 4 (James Kim) - Action fan
        { userId: 4, seriesId: 1, status: 'reading', rating: null, notes: 'Best shonen ever!', notifications: true, lastReadChapterId: 38, lastReadAt: new Date('2024-12-02').toISOString(), createdAt: new Date('2024-01-15').toISOString(), updatedAt: new Date('2024-12-02').toISOString() },
        { userId: 4, seriesId: 4, status: 'completed', rating: 9, notes: 'Epic power fantasy', notifications: false, lastReadChapterId: 200, lastReadAt: new Date('2024-11-10').toISOString(), createdAt: new Date('2024-03-01').toISOString(), updatedAt: new Date('2024-11-10').toISOString() },
        { userId: 4, seriesId: 11, status: 'reading', rating: null, notes: 'Plus Ultra!', notifications: true, lastReadChapterId: 350, lastReadAt: new Date('2024-11-30').toISOString(), createdAt: new Date('2024-06-01').toISOString(), updatedAt: new Date('2024-11-30').toISOString() },
        { userId: 4, seriesId: 6, status: 'plan_to_read', rating: null, notes: null, notifications: true, lastReadChapterId: null, lastReadAt: null, createdAt: new Date('2024-11-15').toISOString(), updatedAt: new Date('2024-11-15').toISOString() },

        // User 8 (Alex Johnson) - Romance enthusiast
        { userId: 8, seriesId: 7, status: 'completed', rating: 10, notes: 'Perfect romance story', notifications: false, lastReadChapterId: 155, lastReadAt: new Date('2024-10-25').toISOString(), createdAt: new Date('2024-04-01').toISOString(), updatedAt: new Date('2024-10-25').toISOString() },
        { userId: 8, seriesId: 8, status: 'reading', rating: null, notes: 'Brilliant comedy and romance', notifications: true, lastReadChapterId: 270, lastReadAt: new Date('2024-11-29').toISOString(), createdAt: new Date('2024-05-15').toISOString(), updatedAt: new Date('2024-11-29').toISOString() },
        { userId: 8, seriesId: 2, status: 'completed', rating: 8, notes: 'Dark but amazing', notifications: false, lastReadChapterId: 80, lastReadAt: new Date('2024-09-20').toISOString(), createdAt: new Date('2024-08-01').toISOString(), updatedAt: new Date('2024-09-20').toISOString() },
        { userId: 8, seriesId: 12, status: 'on_hold', rating: null, notes: 'Good but very intense', notifications: false, lastReadChapterId: 440, lastReadAt: new Date('2024-07-30').toISOString(), createdAt: new Date('2024-07-01').toISOString(), updatedAt: new Date('2024-07-30').toISOString() },
    ];

    await db.insert(library).values(libraryEntries);

    // 5. Progress entries for reading users
    const progressEntries = [
        // Sarah Chen's progress
        { userId: 1, seriesId: 1, chapterId: 35, currentPage: 12, completed: false, updatedAt: new Date('2024-12-01T14:30:00').toISOString() },
        { userId: 1, seriesId: 4, chapterId: 150, currentPage: 45, completed: true, updatedAt: new Date('2024-11-28T16:45:00').toISOString() },
        
        // Marcus Rodriguez's progress
        { userId: 2, seriesId: 9, chapterId: 200, currentPage: 23, completed: false, updatedAt: new Date('2024-11-25T19:20:00').toISOString() },
        
        // James Kim's progress
        { userId: 4, seriesId: 1, chapterId: 38, currentPage: 8, completed: false, updatedAt: new Date('2024-12-02T10:15:00').toISOString() },
        { userId: 4, seriesId: 11, chapterId: 350, currentPage: 31, completed: false, updatedAt: new Date('2024-11-30T21:00:00').toISOString() },
        
        // Alex Johnson's progress
        { userId: 8, seriesId: 8, chapterId: 270, currentPage: 18, completed: false, updatedAt: new Date('2024-11-29T13:45:00').toISOString() },
    ];

    await db.insert(progress).values(progressEntries);

    // 6. Comments across different series
    const sampleComments = [
        {
            userId: 1,
            seriesId: 1,
            parentId: null,
            content: 'One Piece never fails to amaze me! The world building is absolutely incredible and each arc keeps getting better.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-28T10:30:00').toISOString(),
        },
        {
            userId: 2,
            seriesId: 3,
            parentId: null,
            content: 'Death Note is a masterclass in psychological thriller. The cat and mouse game between Light and L is phenomenal.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-25T14:15:00').toISOString(),
        },
        {
            userId: 4,
            seriesId: 4,
            parentId: null,
            content: 'Solo Leveling has the best power progression system I have ever seen in manga. Jinwoo is such a badass!',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-20T18:45:00').toISOString(),
        },
        {
            userId: 8,
            seriesId: 7,
            parentId: null,
            content: 'Horimiya is pure wholesome content. The relationship between Hori and Miyamura is so realistic and sweet.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-15T12:20:00').toISOString(),
        },
        {
            userId: 3,
            seriesId: 2,
            parentId: null,
            content: 'Attack on Titan completely subverted my expectations. The plot twists in the later chapters are mind-blowing!',
            edited: true,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-10T16:30:00').toISOString(),
        },
        {
            userId: 5,
            seriesId: 8,
            parentId: null,
            content: 'Kaguya-sama is comedy gold! The psychological warfare between the main characters is hilarious yet touching.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-05T09:15:00').toISOString(),
        },
        {
            userId: 6,
            seriesId: 9,
            parentId: null,
            content: 'Demon Slayer has some of the most beautiful art I have seen in manga. The breathing techniques are so cool!',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-01T20:45:00').toISOString(),
        },
        {
            userId: 7,
            seriesId: 5,
            parentId: null,
            content: 'Tower of God has such an intricate world and mystery. Every floor brings new surprises and character development.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-10-28T11:00:00').toISOString(),
        },
        {
            userId: 9,
            seriesId: 12,
            parentId: null,
            content: 'Jujutsu Kaisen has amazing fight choreography and the curse system is really unique and well thought out.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-10-25T15:30:00').toISOString(),
        },
        {
            userId: 10,
            seriesId: 10,
            parentId: null,
            content: 'Chainsaw Man is absolutely insane in the best way possible. Denji is such a relatable yet chaotic protagonist.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-10-20T13:45:00').toISOString(),
        },
        {
            userId: 1,
            seriesId: 11,
            parentId: null,
            content: 'My Hero Academia really captures the essence of being a hero. Deku journey from zero to hero is inspiring!',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-10-15T17:20:00').toISOString(),
        },
        {
            userId: 4,
            seriesId: 6,
            parentId: null,
            content: 'Battle Through the Heavens has great cultivation progression, though the pacing can be a bit slow at times.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-10-10T08:30:00').toISOString(),
        },
        {
            userId: 2,
            seriesId: 1,
            parentId: 1,
            content: 'Completely agree! Oda world building skills are unmatched. Each island feels like a complete adventure.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-29T11:15:00').toISOString(),
        },
        {
            userId: 8,
            seriesId: 8,
            parentId: null,
            content: 'The way Kaguya-sama balances comedy with genuine character development is phenomenal. Best rom-com ever!',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-10-05T19:00:00').toISOString(),
        },
        {
            userId: 3,
            seriesId: 4,
            parentId: 3,
            content: 'The ant arc was peak fiction! The way Sung Jin-Woo evolved throughout that arc was incredible to witness.',
            edited: false,
            deleted: false,
            flagsCount: 0,
            createdAt: new Date('2024-11-22T14:30:00').toISOString(),
        }
    ];

    await db.insert(comments).values(sampleComments);

    console.log('✅ Comprehensive Phase C-D seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});