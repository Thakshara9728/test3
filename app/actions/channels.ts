'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createChannel(formData: FormData) {
  const name = formData.get('name') as string;
  const niche = formData.get('niche') as string;
  const description = formData.get('description') as string;

  if (!name || !niche) {
    return { error: 'Name and niche are required' };
  }

  try {
    const channel = await prisma.channel.create({
      data: {
        name,
        niche,
        description: description || null,
        settings: JSON.stringify({
          targetAudience: '',
          toneOfVoice: 'professional',
          contentStyle: '',
        }),
      },
    });

    // Create default prompts for the channel
    await prisma.prompt.createMany({
      data: [
        {
          channelId: channel.id,
          type: 'SCRIPT',
          name: 'Default Script Generator',
          systemPrompt: `You are a professional YouTube script writer for the ${niche} niche. Create engaging, informative scripts that:
- Hook viewers in the first 10 seconds
- Provide valuable information
- Use storytelling techniques
- Include call-to-actions
- Match the channel's tone and style

Channel: ${name}
Niche: ${niche}`,
          useExtendedThinking: true,
          thinkingBudget: 2048,
          useWebSearch: false,
        },
        {
          channelId: channel.id,
          type: 'IMAGE',
          name: 'Default Image Prompt Generator',
          systemPrompt: `Generate detailed image prompts for YouTube thumbnails and B-roll for ${niche} content. Include:
- Visual style and composition
- Colors and mood
- Key elements to feature
- Text overlay suggestions (if applicable)`,
          useExtendedThinking: false,
          useWebSearch: false,
        },
        {
          channelId: channel.id,
          type: 'VIDEO',
          name: 'Default Video Prompt Generator',
          systemPrompt: `Create video prompts for AI video generation tools for ${niche} content. Specify:
- Scene description
- Camera movements
- Visual effects
- Timing and duration
- Style (realistic, animated, etc.)`,
          useExtendedThinking: false,
          useWebSearch: false,
        },
      ],
    });

    revalidatePath('/automation/channels');
    return { success: true, channel };
  } catch (error: any) {
    console.error('Error creating channel:', error);
    return { error: error.message || 'Failed to create channel' };
  }
}

export async function getChannels() {
  try {
    const channels = await prisma.channel.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            scripts: true,
            prompts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, channels };
  } catch (error: any) {
    console.error('Error fetching channels:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteChannel(channelId: string) {
  try {
    await prisma.channel.delete({
      where: { id: channelId },
    });

    revalidatePath('/automation/channels');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting channel:', error);
    return { error: error.message || 'Failed to delete channel' };
  }
}

export async function updateChannel(channelId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const niche = formData.get('niche') as string;
  const description = formData.get('description') as string;

  try {
    const channel = await prisma.channel.update({
      where: { id: channelId },
      data: {
        name,
        niche,
        description: description || null,
      },
    });

    revalidatePath('/automation/channels');
    return { success: true, channel };
  } catch (error: any) {
    console.error('Error updating channel:', error);
    return { error: error.message || 'Failed to update channel' };
  }
}
