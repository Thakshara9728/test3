# Freepik AI Studio Setup Guide

## Overview

The Freepik AI Studio is a new tool integrated into your YouTube AI Automation platform that allows you to generate stunning AI images using Freepik's NanoBanana API powered by Google Gemini 2.5 Flash.

## Features

- **Text-to-Image Generation**: Create images from detailed text prompts
- **Multiple Aspect Ratios**: Support for 1:1, 16:9, 9:16, 4:3, and 3:4
- **Advanced Controls**: Negative prompts to exclude unwanted elements
- **History Tracking**: Keep track of all your generations
- **Batch Download**: Download individual images or all at once
- **Beautiful Gallery**: Lightbox view for full-size previews
- **Responsive Design**: Works perfectly on desktop and mobile

## Setup Instructions

### 1. Database Migration

Run the following command to apply the database schema changes:

```bash
npx prisma migrate dev --name add_freepik_models
```

Or if you prefer to sync without creating a migration:

```bash
npx prisma db push
```

### 2. Environment Variables

Add your Apify API token to your environment variables. Create a `.env.local` file if it doesn't exist:

```env
# Existing variables
APIFY_API_TOKEN=your_apify_api_token_here
ANTHROPIC_API_KEY=your_anthropic_key_here
DATABASE_URL=your_database_url_here

# No additional variables needed for Freepik
# It uses the same APIFY_API_TOKEN
```

### 3. Apify Actor Setup

The tool uses the `igolaizola/freepik-nanobanana` actor on Apify. No additional setup is required - just make sure your APIFY_API_TOKEN has access to this actor.

You can find the actor here: https://apify.com/igolaizola/freepik-nanobanana

### 4. Start the Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000/freepik` to access the Freepik AI Studio.

## Usage

1. **Enter a Prompt**: Describe the image you want to generate in detail
2. **Select Aspect Ratio**: Choose from 5 different aspect ratios
3. **Add Negative Prompt** (Optional): Specify what you don't want in the image
4. **Click Generate**: Wait 30-60 seconds for the AI to create your images
5. **Download**: Save individual images or download all at once
6. **View History**: Access your previous generations from the history panel

## Example Prompts

- "A serene mountain landscape at sunset with vibrant colors"
- "Futuristic city skyline with neon lights and flying cars"
- "Cute cartoon robot playing with a puppy in a garden"
- "Abstract geometric pattern with bold colors and gradients"
- "Professional product photography of a luxury watch"

## API Endpoints

### POST /api/freepik
Generate new images

**Request Body:**
```json
{
  "prompt": "Your detailed image description",
  "aspectRatio": "1:1",
  "negativePrompt": "Optional: what to avoid"
}
```

**Response:**
```json
{
  "success": true,
  "generation": {
    "id": "...",
    "prompt": "...",
    "status": "COMPLETED",
    "images": [...]
  },
  "imageCount": 1
}
```

### GET /api/freepik
Fetch generation history

**Query Parameters:**
- `limit`: Number of generations to fetch (default: 20)
- `offset`: Pagination offset (default: 0)

## Database Schema

### FreepikGeneration
- `id`: Unique identifier
- `prompt`: Text prompt used
- `aspectRatio`: Selected aspect ratio
- `negativePrompt`: Optional negative prompt
- `status`: PENDING, PROCESSING, COMPLETED, or FAILED
- `runId`: Apify run ID
- `errorMessage`: Error details if failed
- `images`: Related FreepikImage records
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### FreepikImage
- `id`: Unique identifier
- `generationId`: Foreign key to FreepikGeneration
- `imageUrl`: Full-size image URL
- `thumbnailUrl`: Optional thumbnail URL
- `width`: Image width in pixels
- `height`: Image height in pixels
- `format`: Image format (png, jpg, webp)
- `createdAt`: Creation timestamp

## Troubleshooting

### Images not generating
- Check that your APIFY_API_TOKEN is valid
- Ensure the Freepik NanoBanana actor is accessible with your account
- Check the browser console for error messages

### Database errors
- Make sure you ran the database migration
- Verify your DATABASE_URL is correct
- Check that the database is running

### Slow generation times
- Image generation typically takes 30-60 seconds
- Complex prompts may take longer
- Check Apify dashboard for actor status

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite/PostgreSQL
- **API**: Apify Freepik NanoBanana Actor
- **AI Model**: Google Gemini 2.5 Flash (via Freepik)

## Files Added

```
app/
├── freepik/
│   ├── page.tsx                          # Main Freepik page
│   └── components/
│       ├── ImageGenerationForm.tsx       # Form for creating images
│       ├── ImageGallery.tsx              # Gallery with download features
│       └── HistoryPanel.tsx              # Generation history sidebar
├── api/
│   └── freepik/
│       └── route.ts                      # API endpoint for generation
└── page.tsx                              # Updated with Freepik card

prisma/
└── schema.prisma                         # Updated with Freepik models
```

## Next Steps

Consider adding these features in the future:
- Batch generation (multiple prompts at once)
- Image editing capabilities
- Style presets
- Integration with the AI Automation tool for script illustrations
- Social media optimization (auto-resize for different platforms)
- Image collections/albums

---

**Enjoy creating amazing AI-generated images with Freepik AI Studio!**
