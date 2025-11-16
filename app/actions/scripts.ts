'use server';

import { prisma } from '@/lib/prisma';
import { anthropic, CLAUDE_MODELS } from '@/lib/anthropic';
import { revalidatePath } from 'next/cache';
import { buildChannelContext } from './knowledge';

export async function generateScript(input: {
  channelId: string;
  title: string;
  topic: string;
  additionalContext?: string;
}) {
  const { channelId, title, topic, additionalContext } = input;

  if (!channelId || !title || !topic) {
    return { error: 'Channel, title, and topic are required' };
  }

  try {
    // Get channel and active script prompt
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        prompts: {
          where: {
            type: 'SCRIPT',
            isActive: true,
          },
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!channel) {
      return { error: 'Channel not found' };
    }

    const prompt = channel.prompts[0];
    if (!prompt) {
      return { error: 'No active script prompt found for this channel' };
    }

    // Build channel context from knowledge base
    const channelContext = await buildChannelContext(channelId);

    // Enhance system prompt with channel context
    const enhancedSystemPrompt = `${prompt.systemPrompt}${channelContext}`;

    // Build user message
    const userMessage = `Create a YouTube video script for the following:

Title: ${title}
Topic: ${topic}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Please structure the script with:
1. Hook (first 10 seconds)
2. Introduction
3. Main content (with clear sections)
4. Conclusion
5. Call-to-action

Make it engaging, informative, and optimized for viewer retention.`;

    // Call Claude API with extended thinking
    console.log('Calling Claude API with extended thinking and channel context...');

    const response = await anthropic.messages.create({
      model: prompt.model || CLAUDE_MODELS.SONNET,
      max_tokens: prompt.maxTokens || 4096,
      temperature: prompt.temperature || 1.0,
      ...(prompt.useExtendedThinking && {
        thinking: {
          type: 'enabled' as const,
          budget_tokens: prompt.thinkingBudget || 2048,
        },
      }),
      system: enhancedSystemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract thinking and text content
    const thinkingBlock = response.content.find((block: any) => block.type === 'thinking') as any;
    const textBlock = response.content.find((block: any) => block.type === 'text') as any;

    if (!textBlock || !textBlock.text) {
      return { error: 'No script content generated' };
    }

    const scriptContent = textBlock.text;
    const thinkingContent = thinkingBlock?.thinking || null;

    // Calculate cost (approximate)
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015); // Sonnet 4 pricing

    // Save script to database
    const script = await prisma.script.create({
      data: {
        channelId,
        title,
        topic,
        content: scriptContent,
        thinkingContent,
        tokensUsed: inputTokens + outputTokens,
        cost,
        wordCount: scriptContent.split(/\s+/).length,
        status: 'GENERATED',
      },
    });

    console.log(`Script generated: ${script.id}`);

    revalidatePath('/automation/scripts');
    return { success: true, script };
  } catch (error: any) {
    console.error('Error generating script:', error);

    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      return { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to .env.local' };
    }

    return { error: error.message || 'Failed to generate script' };
  }
}

export async function getScripts(channelId?: string) {
  try {
    const scripts = await prisma.script.findMany({
      where: channelId ? { channelId } : undefined,
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            niche: true,
          },
        },
        _count: {
          select: {
            imagePrompts: true,
            videoPrompts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, scripts };
  } catch (error: any) {
    console.error('Error fetching scripts:', error);
    return { success: false, error: error.message };
  }
}

export async function getScript(scriptId: string) {
  try {
    const script = await prisma.script.findUnique({
      where: { id: scriptId },
      include: {
        channel: true,
        imagePrompts: {
          orderBy: { order: 'asc' },
        },
        videoPrompts: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!script) {
      return { error: 'Script not found' };
    }

    return { success: true, script };
  } catch (error: any) {
    console.error('Error fetching script:', error);
    return { error: error.message };
  }
}

export async function deleteScript(scriptId: string) {
  try {
    await prisma.script.delete({
      where: { id: scriptId },
    });

    revalidatePath('/automation/scripts');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting script:', error);
    return { error: error.message || 'Failed to delete script' };
  }
}
