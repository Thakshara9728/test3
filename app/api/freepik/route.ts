import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FreepikImage {
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  format?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = '1:1', negativePrompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiToken = process.env.APIFY_API_TOKEN;

    if (!apiToken || apiToken === 'your_apify_api_token_here') {
      return NextResponse.json(
        { error: 'Apify API token not configured. Please set APIFY_API_TOKEN in your environment variables' },
        { status: 500 }
      );
    }

    // Create database record
    const generation = await prisma.freepikGeneration.create({
      data: {
        prompt,
        aspectRatio,
        negativePrompt,
        status: 'PROCESSING',
      },
    });

    try {
      // Prepare input for Apify Freepik NanoBanana actor
      const input = {
        generations: [
          {
            name: 'generation-1',
            text: prompt,
            aspectRatio: aspectRatio,
            // Add negative prompt if provided
            ...(negativePrompt && { negativePrompt }),
          },
        ],
        concurrency: 1,
        minWait: 1000,
        maxWait: 3000,
        jobTimeout: 300000, // 5 minutes
      };

      // Call Apify API with run-sync to wait for completion
      const response = await fetch(
        `https://api.apify.com/v2/acts/igolaizola~freepik-nanobanana/run-sync-get-dataset-items?token=${apiToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
          // Increase timeout for image generation
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Apify API error:', errorText);

        await prisma.freepikGeneration.update({
          where: { id: generation.id },
          data: {
            status: 'FAILED',
            errorMessage: `Apify API error: ${response.statusText}`,
          },
        });

        return NextResponse.json(
          { error: `Apify API error: ${response.statusText}` },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Extract images from response
      const images: FreepikImage[] = [];

      if (Array.isArray(data) && data.length > 0) {
        for (const item of data) {
          if (item.images && Array.isArray(item.images)) {
            for (const img of item.images) {
              images.push({
                imageUrl: img.url || img.imageUrl || img,
                thumbnailUrl: img.thumbnailUrl,
                width: img.width,
                height: img.height,
                format: img.format || 'png',
              });
            }
          } else if (item.url || item.imageUrl) {
            // Single image in item
            images.push({
              imageUrl: item.url || item.imageUrl,
              thumbnailUrl: item.thumbnailUrl,
              width: item.width,
              height: item.height,
              format: item.format || 'png',
            });
          }
        }
      }

      if (images.length === 0) {
        await prisma.freepikGeneration.update({
          where: { id: generation.id },
          data: {
            status: 'FAILED',
            errorMessage: 'No images generated',
          },
        });

        return NextResponse.json(
          { error: 'No images were generated. Please try again with a different prompt.' },
          { status: 500 }
        );
      }

      // Save images to database
      await prisma.freepikGeneration.update({
        where: { id: generation.id },
        data: {
          status: 'COMPLETED',
          images: {
            create: images,
          },
        },
      });

      // Fetch the updated generation with images
      const updatedGeneration = await prisma.freepikGeneration.findUnique({
        where: { id: generation.id },
        include: {
          images: true,
        },
      });

      return NextResponse.json({
        success: true,
        generation: updatedGeneration,
        imageCount: images.length,
      });
    } catch (error: any) {
      // Update database with error
      await prisma.freepikGeneration.update({
        where: { id: generation.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  } catch (error: any) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch generation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const generations = await prisma.freepikGeneration.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        images: true,
      },
    });

    const total = await prisma.freepikGeneration.count();

    return NextResponse.json({
      generations,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Error fetching generations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch generations' },
      { status: 500 }
    );
  }
}
