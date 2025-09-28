import { db } from '@/db';
import { mangaSources, authors, series, mangaChapters } from '@/db/schema';

async function main() {
    try {
        // 1. Create MangaDx source
        const sampleSource = {
            id: 1,
            name: 'MangaDx',
            baseUrl: 'https://mangadx.org'
        };

        await db.insert(mangaSources).values(sampleSource).onConflictDoNothing();

        // 2. Create test author
        const sampleAuthor = {
            id: 1,
            name: 'Test Author'
        };

        await db.insert(authors).values(sampleAuthor).onConflictDoNothing();

        // 3. Create test series
        const sampleSeries = {
            id: 1,
            slug: 'test-manga-series',
            title: 'Test Manga Series',
            altTitles: ['テストマンガ', 'Test Manga'],
            description: 'A test manga series for verifying database connectivity and structure.',
            year: 2024,
            status: 'ongoing' as const,
            contentRating: 'safe' as const,
            originalLanguage: 'ja',
            tags: ['action', 'adventure', 'test'],
            coverImageUrl: 'https://example.com/cover.jpg',
            popularityScore: 100,
            ratingAvg: 4.5,
            ratingCount: 10,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString()
        };

        await db.insert(series).values(sampleSeries).onConflictDoNothing();

        // 4. Create test chapter
        const sampleChapter = {
            id: 1,
            seriesId: 1,
            sourceId: 1,
            externalId: 'test-chapter-001',
            number: 1.0,
            title: 'Chapter 1: The Beginning',
            language: 'en',
            publishedAt: new Date('2024-01-15').toISOString(),
            pages: 20
        };

        await db.insert(mangaChapters).values(sampleChapter).onConflictDoNothing();

        console.log('✅ Minimal test seeder completed successfully');
        console.log('📊 Created: 1 source, 1 author, 1 series, 1 chapter');
    } catch (error) {
        console.error('❌ Seeder failed:', error);
        throw error;
    }
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});