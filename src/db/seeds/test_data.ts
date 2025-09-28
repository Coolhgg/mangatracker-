import { db } from '@/db';
import { users, series, mangaNotes, mangaRatings } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    // Check if user with id=1 exists, if not create it
    const existingUser = await db.select().from(users).where(eq(users.id, 1)).limit(1);
    
    if (existingUser.length === 0) {
        await db.insert(users).values({
            id: 1,
            email: 'demo@example.com',
            name: 'Demo User',
            roles: [],
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        });
        console.log('✅ Created demo user with id=1');
    } else {
        console.log('✅ Demo user with id=1 already exists');
    }
    
    // Check if series with slug='one-piece' exists, if not create it
    const existingSeries = await db.select().from(series).where(eq(series.slug, 'one-piece')).limit(1);
    let seriesId: number;
    
    if (existingSeries.length === 0) {
        const insertedSeries = await db.insert(series).values({
            slug: 'one-piece',
            title: 'One Piece',
            description: 'Epic pirate adventure following Monkey D. Luffy and his crew as they search for the legendary treasure One Piece.',
            status: 'ongoing',
            year: 1997,
            rating: 4.8,
            tags: ['adventure', 'action', 'comedy', 'shounen'],
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        }).returning();
        seriesId = insertedSeries[0].id;
        console.log('✅ Created One Piece series');
    } else {
        seriesId = existingSeries[0].id;
        console.log('✅ One Piece series already exists');
    }
    
    // Insert test note for user 1 on one-piece series
    try {
        await db.insert(mangaNotes).values({
            userId: 1,
            seriesId: seriesId,
            body: 'Great arc! Love the character development and how each crew member gets their moment to shine. The world-building is incredible.',
            createdAt: currentTimestamp,
        });
        console.log('✅ Created test note for One Piece');
    } catch (error) {
        console.log('ℹ️ Test note may already exist or constraint violation occurred');
    }
    
    // Insert test rating for user 1 on one-piece series (using INSERT OR IGNORE equivalent)
    try {
        await db.insert(mangaRatings).values({
            userId: 1,
            seriesId: seriesId,
            value: 5,
            createdAt: currentTimestamp,
        });
        console.log('✅ Created test rating for One Piece');
    } catch (error) {
        console.log('ℹ️ Test rating may already exist due to unique constraint');
    }
    
    console.log('✅ Test data seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});