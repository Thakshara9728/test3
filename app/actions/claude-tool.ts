'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getClaudeTools() {
  try {
    const tools = await prisma.claudeTool.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, tools };
  } catch (error: any) {
    console.error('Error fetching Claude tools:', error);
    return { success: false, error: error.message };
  }
}

export async function getClaudeTool(id: string) {
  try {
    const tool = await prisma.claudeTool.findUnique({
      where: { id },
      include: {
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!tool) {
      return { error: 'Tool not found' };
    }

    return { success: true, tool };
  } catch (error: any) {
    console.error('Error fetching Claude tool:', error);
    return { error: error.message };
  }
}

export async function createClaudeTool(data: {
  name: string;
  description?: string;
  mainPrompt: string;
  firstMessagePrompt: string;
  continuePartsPrompt: string;
  model?: string;
  useExtendedThinking?: boolean;
  thinkingBudget?: number;
  useUltraThink?: boolean;
  useWebSearch?: boolean;
  usePromptCaching?: boolean;
  maxTokens?: number;
  temperature?: number;
}) {
  try {
    const tool = await prisma.claudeTool.create({
      data: {
        name: data.name,
        description: data.description,
        mainPrompt: data.mainPrompt,
        firstMessagePrompt: data.firstMessagePrompt,
        continuePartsPrompt: data.continuePartsPrompt,
        model: data.model || 'claude-sonnet-4-5-20250929',
        useExtendedThinking: data.useExtendedThinking ?? true,
        thinkingBudget: data.thinkingBudget ?? 10000,
        useUltraThink: data.useUltraThink ?? false,
        useWebSearch: data.useWebSearch ?? true,
        usePromptCaching: data.usePromptCaching ?? true,
        maxTokens: data.maxTokens ?? 8000,
        temperature: data.temperature ?? 1.0,
      },
    });

    revalidatePath('/automation/tools');
    return { success: true, tool };
  } catch (error: any) {
    console.error('Error creating Claude tool:', error);
    return { error: error.message || 'Failed to create tool' };
  }
}

export async function updateClaudeTool(
  id: string,
  data: {
    name?: string;
    description?: string;
    mainPrompt?: string;
    firstMessagePrompt?: string;
    continuePartsPrompt?: string;
    model?: string;
    useExtendedThinking?: boolean;
    thinkingBudget?: number;
    useUltraThink?: boolean;
    useWebSearch?: boolean;
    usePromptCaching?: boolean;
    maxTokens?: number;
    temperature?: number;
    isActive?: boolean;
  }
) {
  try {
    const tool = await prisma.claudeTool.update({
      where: { id },
      data,
    });

    revalidatePath('/automation/tools');
    return { success: true, tool };
  } catch (error: any) {
    console.error('Error updating Claude tool:', error);
    return { error: error.message || 'Failed to update tool' };
  }
}

export async function deleteClaudeTool(id: string) {
  try {
    await prisma.claudeTool.delete({
      where: { id },
    });

    revalidatePath('/automation/tools');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting Claude tool:', error);
    return { error: error.message || 'Failed to delete tool' };
  }
}

export async function getToolConversations(toolId: string) {
  try {
    const conversations = await prisma.toolConversation.findMany({
      where: { toolId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, conversations };
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: error.message };
  }
}
