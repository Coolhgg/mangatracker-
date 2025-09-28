import { db } from '@/db';
import { readingHistory } from '@/db/schema';

async function main() {
    const now = Date.now();
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    
    // Define series with their chapter ranges
    const seriesData = [
        { id: 1, name: 'one-piece', chapters: 40 },
        { id: 2, name: 'solo-leveling', chapters: 40 },
        { id: 3, name: 'berserk', chapters: 40 },
        { id: 4, name: 'vinland-saga', chapters: 40 }
    ];
    
    const sampleReadingHistory = [];
    
    // Generate reading patterns for last 30 days
    const activeDays = [1, 2, 3, 5, 6, 7, 9, 10, 12, 14, 15, 16, 17, 19, 20, 21, 22, 24, 25, 26, 27, 28, 29, 30];
    
    activeDays.forEach(daysAgo => {
        const baseTimestamp = now - (daysAgo * millisecondsPerDay);
        
        // Determine reading intensity for the day
        let chaptersToRead;
        if (daysAgo <= 7) {
            // More active in recent week
            chaptersToRead = daysAgo % 7 === 0 || daysAgo % 7 === 6 ? 
                Math.floor(Math.random() * 4) + 3 : // Weekend binge (3-6 chapters)
                Math.floor(Math.random() * 3) + 1; // Weekday (1-3 chapters)
        } else if (daysAgo <= 14) {
            // Moderate activity in second week
            chaptersToRead = daysAgo % 7 === 0 || daysAgo % 7 === 6 ? 
                Math.floor(Math.random() * 3) + 2 : // Weekend (2-4 chapters)
                Math.floor(Math.random() * 2) + 1; // Weekday (1-2 chapters)
        } else {
            // Lower activity in older days
            chaptersToRead = Math.floor(Math.random() * 2) + 1; // 1-2 chapters
        }
        
        // Generate chapters for this day
        for (let i = 0; i < chaptersToRead; i++) {
            // Choose series (bias towards one-piece and solo-leveling)
            const seriesWeights = [0.4, 0.3, 0.2, 0.1]; // one-piece, solo-leveling, berserk, vinland-saga
            const rand = Math.random();
            let selectedSeries;
            
            if (rand < 0.4) selectedSeries = seriesData[0];
            else if (rand < 0.7) selectedSeries = seriesData[1];
            else if (rand < 0.9) selectedSeries = seriesData[2];
            else selectedSeries = seriesData[3];
            
            // Choose chapter (sequential reading with some re-reading)
            let chapterNumber;
            if (Math.random() < 0.15) {
                // 15% chance of re-reading earlier chapters
                chapterNumber = Math.floor(Math.random() * 20) + 1;
            } else {
                // Progressive reading
                const baseChapter = Math.max(1, 40 - daysAgo);
                chapterNumber = Math.min(40, baseChapter + Math.floor(Math.random() * 5));
            }
            
            // Calculate chapter ID (assuming chapters are sequential across series)
            const chapterId = ((selectedSeries.id - 1) * 40) + chapterNumber;
            
            // Add random minutes to spread readings throughout the day
            const readingTime = baseTimestamp + (Math.random() * millisecondsPerDay);
            
            sampleReadingHistory.push({
                userId: 1,
                seriesId: selectedSeries.id,
                chapterId: chapterId,
                readAt: Math.floor(readingTime)
            });
        }
    });
    
    // Add some additional re-reading entries for variety
    const rereadingEntries = [
        {
            userId: 1,
            seriesId: 1,
            chapterId: 1, // Re-read One Piece chapter 1
            readAt: now - (5 * millisecondsPerDay) + (3 * 60 * 60 * 1000) // 5 days ago, afternoon
        },
        {
            userId: 1,
            seriesId: 2,
            chapterId: 41, // Re-read Solo Leveling chapter 1
            readAt: now - (3 * millisecondsPerDay) + (8 * 60 * 60 * 1000) // 3 days ago, evening
        },
        {
            userId: 1,
            seriesId: 1,
            chapterId: 5,
            readAt: now - (2 * millisecondsPerDay) + (7 * 60 * 60 * 1000) // 2 days ago, evening
        }
    ];
    
    sampleReadingHistory.push(...rereadingEntries);
    
    // Sort by readAt timestamp for chronological order
    sampleReadingHistory.sort((a, b) => a.readAt - b.readAt);
    
    await db.insert(readingHistory).values(sampleReadingHistory);
    
    console.log('✅ Reading history seeder completed successfully');
    console.log(`📊 Generated ${sampleReadingHistory.length} reading history entries across ${activeDays.length} days`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});