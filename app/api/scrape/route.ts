import { NextRequest, NextResponse } from 'next/server';

interface Video {
  title: string;
  url: string;
  viewCount: number;
  thumbnailUrl: string;
  date: string;
  duration: string;
}

export async function POST(request: NextRequest) {
  try {
    const { channelUrl } = await request.json();

    if (!channelUrl) {
      return NextResponse.json(
        { error: 'Channel URL is required' },
        { status: 400 }
      );
    }

    const apiToken = process.env.APIFY_API_TOKEN;

    if (!apiToken || apiToken === 'your_apify_api_token_here') {
      return NextResponse.json(
        { error: 'Apify API token not configured. Please set APIFY_API_TOKEN in .env.local' },
        { status: 500 }
      );
    }

    // Prepare input for Apify YouTube scraper
    // Using 'popular' sorting to get all-time most viewed videos
    const input = {
      startUrls: [{ url: channelUrl }],
      maxResults: 50, // Get top 50 most viewed regular videos
      maxResultsShorts: 0, // Exclude YouTube Shorts
      maxResultStreams: 0, // Exclude live streams
      sorting: 'popular' // Sort by most popular (all-time most viewed)
    };

    // Call Apify API
    const response = await fetch(
      `https://api.apify.com/v2/acts/streamers~youtube-scraper/run-sync-get-dataset-items?token=${apiToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Apify API error:', errorText);
      return NextResponse.json(
        { error: `Apify API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform videos (already sorted by popularity from API)
    // Additional client-side sort as backup to ensure top 50 by view count
    const videos: Video[] = data
      .filter((item: any) => item.title && item.viewCount !== undefined)
      .map((item: any) => ({
        title: item.title,
        url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
        viewCount: parseInt(item.viewCount) || 0,
        thumbnailUrl: item.thumbnailUrl || '',
        date: item.date || '',
        duration: item.duration || '',
      }))
      .sort((a: Video, b: Video) => b.viewCount - a.viewCount) // Sort by view count descending
      .slice(0, 50); // Ensure we return exactly top 50

    return NextResponse.json({ videos, count: videos.length });
  } catch (error: any) {
    console.error('Error scraping YouTube:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scrape YouTube channel' },
      { status: 500 }
    );
  }
}
