'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getChannelPrompts(channelId: string) {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { channelId },
      orderBy: [
        { type: 'asc' },
        { version: 'desc' },
      ],
    });

    return { success: true, prompts };
  } catch (error: any) {
    console.error('Error fetching prompts:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePrompt(promptId: string, data: {
  name?: string;
  systemPrompt?: string;
  useExtendedThinking?: boolean;
  thinkingBudget?: number;
  useWebSearch?: boolean;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}) {
  try {
    const prompt = await prisma.prompt.update({
      where: { id: promptId },
      data,
    });

    revalidatePath('/automation/channels');
    return { success: true, prompt };
  } catch (error: any) {
    console.error('Error updating prompt:', error);
    return { error: error.message || 'Failed to update prompt' };
  }
}

export async function getChannel(channelId: string) {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return { error: 'Channel not found' };
    }

    return { success: true, channel };
  } catch (error: any) {
    console.error('Error fetching channel:', error);
    return { error: error.message };
  }
}
