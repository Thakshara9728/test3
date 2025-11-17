import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, userMessage, conversationId, mode = 'start' } = body;

    // Validate required fields
    if (!toolId) {
      return NextResponse.json(
        { error: 'toolId is required' },
        { status: 400 }
      );
    }

    // Fetch the tool configuration
    const tool = await prisma.claudeTool.findUnique({
      where: { id: toolId },
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    if (!tool.isActive) {
      return NextResponse.json(
        { error: 'Tool is not active' },
        { status: 400 }
      );
    }

    // Build messages based on mode
    let messages: any[] = [];
    let systemPrompt = tool.mainPrompt;

    if (mode === 'start') {
      // Start a new conversation
      messages = [
        {
          role: 'user',
          content: tool.firstMessagePrompt,
        },
      ];
      if (userMessage) {
        messages.push({
          role: 'user',
          content: userMessage,
        });
      }
    } else if (mode === 'continue') {
      // Continue an existing conversation
      if (conversationId) {
        const conversation = await prisma.toolConversation.findUnique({
          where: { id: conversationId },
        });
        if (conversation) {
          messages = JSON.parse(conversation.messages);
        }
      }

      // Add continue prompt and user message
      messages.push({
        role: 'user',
        content: tool.continuePartsPrompt + (userMessage ? `\n\n${userMessage}` : ''),
      });
    } else if (mode === 'custom' && userMessage) {
      // Custom message
      if (conversationId) {
        const conversation = await prisma.toolConversation.findUnique({
          where: { id: conversationId },
        });
        if (conversation) {
          messages = JSON.parse(conversation.messages);
        }
      }

      messages.push({
        role: 'user',
        content: userMessage,
      });
    }

    // Prepare Claude API request
    const requestParams: any = {
      model: tool.model,
      max_tokens: tool.maxTokens,
      temperature: tool.temperature,
      system: systemPrompt,
      messages,
    };

    // Add extended thinking if enabled
    if (tool.useExtendedThinking) {
      requestParams.thinking = {
        type: 'enabled',
        budget_tokens: tool.thinkingBudget || 10000,
      };
    }

    // Add web search tool if enabled
    if (tool.useWebSearch) {
      requestParams.tools = [
        {
          type: 'web_search_20250610',
        },
      ];
    }

    // Make the API call
    const response = await anthropic.messages.create(requestParams);

    // Extract content blocks
    let textContent = '';
    let thinkingContent = '';
    let webSearchUsed = false;

    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'thinking') {
        thinkingContent += block.thinking;
      }
    }

    // Check if web search was used
    if (response.stop_reason === 'tool_use') {
      webSearchUsed = true;
    }

    // Add assistant response to messages
    messages.push({
      role: 'assistant',
      content: textContent,
    });

    // Calculate cost (Sonnet 3.7 pricing: $3/$15 per million tokens)
    const inputCost = (response.usage.input_tokens / 1_000_000) * 3;
    const outputCost = (response.usage.output_tokens / 1_000_000) * 15;
    const totalCost = inputCost + outputCost;

    // Save conversation to database
    const conversation = await prisma.toolConversation.create({
      data: {
        toolId: tool.id,
        messages: JSON.stringify(messages),
        thinkingContent: thinkingContent || null,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        cost: totalCost,
        webSearchUsed,
      },
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      response: textContent,
      thinking: thinkingContent,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      cost: totalCost,
      webSearchUsed,
    });
  } catch (error: any) {
    console.error('Error in Claude Tool API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
