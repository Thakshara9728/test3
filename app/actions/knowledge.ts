'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getKnowledgeBase(channelId: string) {
  try {
    const items = await prisma.knowledgeBase.findMany({
      where: { channelId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return { success: true, items };
  } catch (error: any) {
    console.error('Error fetching knowledge base:', error);
    return { success: false, error: error.message };
  }
}

export async function getActiveKnowledgeBase(channelId: string) {
  try {
    const items = await prisma.knowledgeBase.findMany({
      where: {
        channelId,
        isActive: true,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return { success: true, items };
  } catch (error: any) {
    console.error('Error fetching active knowledge base:', error);
    return { success: false, error: error.message };
  }
}

export async function createKnowledgeBase(data: {
  channelId: string;
  type: string;
  title: string;
  content: string;
  description?: string;
  tags?: string;
  priority?: number;
}) {
  try {
    const item = await prisma.knowledgeBase.create({
      data: {
        channelId: data.channelId,
        type: data.type,
        title: data.title,
        content: data.content,
        description: data.description,
        tags: data.tags,
        priority: data.priority || 0,
      },
    });

    revalidatePath('/automation/channels');
    return { success: true, item };
  } catch (error: any) {
    console.error('Error creating knowledge base item:', error);
    return { error: error.message || 'Failed to create knowledge base item' };
  }
}

export async function updateKnowledgeBase(itemId: string, data: {
  title?: string;
  content?: string;
  description?: string;
  tags?: string;
  priority?: number;
  isActive?: boolean;
}) {
  try {
    const item = await prisma.knowledgeBase.update({
      where: { id: itemId },
      data,
    });

    revalidatePath('/automation/channels');
    return { success: true, item };
  } catch (error: any) {
    console.error('Error updating knowledge base item:', error);
    return { error: error.message || 'Failed to update knowledge base item' };
  }
}

export async function deleteKnowledgeBase(itemId: string) {
  try {
    await prisma.knowledgeBase.delete({
      where: { id: itemId },
    });

    revalidatePath('/automation/channels');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting knowledge base item:', error);
    return { error: error.message || 'Failed to delete knowledge base item' };
  }
}

export async function buildChannelContext(channelId: string) {
  try {
    // Get all active knowledge base items for this channel
    const result = await getActiveKnowledgeBase(channelId);

    if (!result.success || !result.items) {
      return '';
    }

    // Build context string from knowledge base
    let context = '';

    if (result.items.length > 0) {
      context += '\n\n## Channel Knowledge Base\n\n';

      result.items.forEach((item) => {
        context += `### ${item.title}\n`;
        if (item.description) {
          context += `*${item.description}*\n\n`;
        }
        context += `${item.content}\n\n`;
      });
    }

    return context;
  } catch (error: any) {
    console.error('Error building channel context:', error);
    return '';
  }
}
