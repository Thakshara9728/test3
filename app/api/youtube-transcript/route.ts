import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check for Apify API token
    if (!process.env.APIFY_API_TOKEN) {
      return NextResponse.json(
        { error: 'APIFY_API_TOKEN is not set in environment variables. Please add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'videoUrl is required' },
        { status: 400 }
      );
    }

    console.log('=== FETCHING YOUTUBE TRANSCRIPT ===');
    console.log('Video URL:', videoUrl);

    // Call Apify YouTube Scraper API
    const apifyResponse = await fetch('https://api.apify.com/v2/acts/streamers~youtube-scraper/run-sync-get-dataset-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`,
      },
      body: JSON.stringify({
        startUrls: [{ url: videoUrl }],
        maxResults: 1,
        subtitlesLanguage: 'en', // Request English subtitles
        subtitlesFormat: 'text', // Get text format
      }),
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Apify API Error:', errorText);
      return NextResponse.json(
        { error: `Apify API error: ${apifyResponse.status} - ${errorText}` },
        { status: apifyResponse.status }
      );
    }

    const data = await apifyResponse.json();
    console.log('Apify Response:', JSON.stringify(data, null, 2));

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data returned from Apify. Video may not exist or may be private.' },
        { status: 404 }
      );
    }

    const videoData = data[0];

    // Extract transcript from subtitles
    let transcript = '';
    let subtitles = [];

    // Handle different subtitle formats Apify might return
    if (videoData.subtitles) {
      if (typeof videoData.subtitles === 'string') {
        // If subtitles is a string, use it directly
        transcript = videoData.subtitles;
      } else if (Array.isArray(videoData.subtitles)) {
        // If it's an array of subtitle objects
        subtitles = videoData.subtitles;
        transcript = videoData.subtitles.map((sub: any) => sub.text || sub.content || '').join(' ');
      }
    }

    // If no subtitles found, check for 'text' field (description)
    if (!transcript && videoData.text) {
      transcript = videoData.text;
    }

    console.log('=== TRANSCRIPT FETCHED ===');
    console.log('Title:', videoData.title);
    console.log('Transcript length:', transcript.length);
    console.log('Subtitles type:', typeof videoData.subtitles);
    console.log('==========================');

    return NextResponse.json({
      success: true,
      videoId: videoData.id,
      title: videoData.title,
      channelName: videoData.channelName,
      channelUrl: videoData.channelUrl,
      description: videoData.description || videoData.text,
      viewCount: videoData.viewCount,
      uploadDate: videoData.date || videoData.uploadDate,
      duration: videoData.duration,
      transcript: transcript,
      subtitles: subtitles.length > 0 ? subtitles : null, // Raw subtitle data with timestamps
    });
  } catch (error: any) {
    console.error('Error fetching YouTube transcript:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
