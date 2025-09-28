import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing the response format
const mockSeriesData = [
  {
    id: 1,
    slug: 'one-piece',
    title: 'One Piece',
    description: 'Follow Monkey D. Luffy and his Straw Hat Pirates on their epic adventure to find the legendary treasure known as One Piece and become the Pirate King.',
    coverImageUrl: 'https://cdn.myanimelist.net/images/manga/2/253146.jpg',
    sourceName: 'MangaDX',
    sourceUrl: 'https://mangadx.org/title/a96676e5-8ae2-425e-b549-7f15dd34a6d8',
    tags: ['action', 'adventure', 'comedy', 'shounen'],
    rating: 9.2,
    year: 1997,
    status: 'ongoing',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    slug: 'solo-leveling',
    title: 'Solo Leveling',
    description: 'In a world where hunters battle monsters that emerge from mysterious gates, the weakest hunter Sung Jin-Woo gains the ability to level up infinitely.',
    coverImageUrl: 'https://cdn.myanimelist.net/images/manga/3/222295.jpg',
    sourceName: 'Webtoons',
    sourceUrl: 'https://www.webtoons.com/en/action/solo-leveling/list?title_no=1825',
    tags: ['action', 'fantasy', 'manhwa', 'supernatural'],
    rating: 8.9,
    year: 2018,
    status: 'completed',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: 3,
    slug: 'berserk',
    title: 'Berserk',
    description: 'Follow Guts, a lone swordsman, as he struggles against fate in a dark medieval world filled with demons and supernatural horrors.',
    coverImageUrl: 'https://cdn.myanimelist.net/images/manga/1/157897.jpg',
    sourceName: 'MangaDX',
    sourceUrl: 'https://mangadx.org/title/801513ba-a712-498c-8f57-cae55b38cc92',
    tags: ['action', 'drama', 'fantasy', 'horror', 'seinen'],
    rating: 9.4,
    year: 1989,
    status: 'hiatus',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug parameter required" 
      }, { status: 400 });
    }

    // Find the series by slug in mock data
    const seriesData = mockSeriesData.find(s => s.slug === slug);

    if (!seriesData) {
      return NextResponse.json({ 
        error: "Series not found" 
      }, { status: 404 });
    }

    // Transform to match expected response format for UI compatibility
    const response = {
      id: seriesData.slug,
      slug: seriesData.slug,
      title: seriesData.title,
      description: seriesData.description || '',
      cover_image_url: seriesData.coverImageUrl || '',
      status: seriesData.status || '',
      tags: seriesData.tags || [],
      rating_avg: seriesData.rating || 0,
      year: seriesData.year || 0,
      source: "internal"
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}