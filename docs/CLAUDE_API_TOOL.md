# Claude API Tool Feature

## Overview

The Claude API Tool feature allows you to create custom AI tools powered by Claude API models with extended thinking and web search capabilities. Each tool can be configured with three distinct prompts to control different stages of interaction.

## Features

- **Multiple Claude Models**: Support for Claude 4, Claude 3.5, and Claude 3 families with extended thinking
- **Extended Thinking**: Enable deep reasoning with configurable thinking budgets (up to 100,000 tokens)
- **UltraThink Mode**: Deep thinking mode with 50,000 token budget for complex reasoning
- **Prompt Caching**: Cache system prompts to save 90% on repeated requests (costs 25% more to write, 90% less to read)
- **Web Search Tool**: Integrate real-time web search capabilities
- **Three-Prompt System**: Configure main, first message, and continuation prompts
- **Conversation History**: Automatically saves and tracks all conversations
- **Cost Tracking**: Monitor token usage and costs for each interaction
- **Multi-Tool Management**: Create and manage multiple tools with different configurations

## Database Schema

### ClaudeTool Model

```prisma
model ClaudeTool {
  id                    String    @id @default(cuid())
  name                  String
  description           String?

  // Three prompts as requested
  mainPrompt            String    // Main system prompt
  firstMessagePrompt    String    // Initial message to start conversation
  continuePartsPrompt   String    // Prompt for continuing/extending content

  // Claude API settings
  model                 String    @default("claude-sonnet-4-5-20250929")
  useExtendedThinking   Boolean   @default(true)
  thinkingBudget        Int?      @default(10000)
  useUltraThink         Boolean   @default(false) // 50k token budget
  useWebSearch          Boolean   @default(true)
  usePromptCaching      Boolean   @default(true)  // Save $ with caching
  maxTokens             Int       @default(16000) // Must be > thinkingBudget
  temperature           Float     @default(1.0)

  // Status
  isActive              Boolean   @default(true)

  // Relations
  conversations         ToolConversation[]

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### ToolConversation Model

```prisma
model ToolConversation {
  id                    String    @id @default(cuid())
  toolId                String
  tool                  ClaudeTool @relation(fields: [toolId], references: [id], onDelete: Cascade)

  // Conversation data
  messages              String    // JSON array of messages
  thinkingContent       String?   // Extended thinking output

  // Metadata
  tokensUsed            Int?
  cost                  Float?
  webSearchUsed         Boolean   @default(false)

  createdAt             DateTime  @default(now())
}
```

## API Routes

### POST /api/claude-tool

Generates a response using the Claude API with the configured tool settings.

**Request Body:**
```json
{
  "toolId": "string",
  "userMessage": "string (optional)",
  "conversationId": "string (optional)",
  "mode": "start | continue | custom"
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "string",
  "response": "string",
  "thinking": "string",
  "usage": {
    "inputTokens": 1234,
    "outputTokens": 5678,
    "totalTokens": 6912
  },
  "cost": 0.0456,
  "webSearchUsed": false
}
```

## Server Actions

Located in `/app/actions/claude-tool.ts`:

- `getClaudeTools()` - Get all tools
- `getClaudeTool(id)` - Get a specific tool with recent conversations
- `createClaudeTool(data)` - Create a new tool
- `updateClaudeTool(id, data)` - Update tool configuration
- `deleteClaudeTool(id)` - Delete a tool
- `getToolConversations(toolId)` - Get all conversations for a tool

## UI Pages

### Tools List (`/automation/tools`)
- View all created tools
- Quick access to tool configurations
- Create new tools

### New Tool (`/automation/tools/new`)
- Create a new tool with all configuration options
- Three-prompt configuration system
- Claude API settings (model, extended thinking, web search, etc.)

### Tool Detail (`/automation/tools/[toolId]`)
- Interactive chat interface
- Three modes of operation:
  - **Start**: Begin a new conversation with the first message prompt
  - **Continue**: Continue the conversation with the continue prompt
  - **Custom**: Send a custom message
- Real-time thinking output display
- Token usage and cost tracking
- Tool settings management

## Usage Example

### Creating a Tool

1. Navigate to `/automation/tools`
2. Click "Create New Tool"
3. Configure the three prompts:
   - **Main Prompt**: System instructions for the AI
   - **First Message**: How to start each conversation
   - **Continue Parts**: How to continue/extend responses
4. Configure Claude API settings (model, extended thinking, web search)
5. Click "Create Tool"

### Using a Tool

1. Click on a tool from the tools list
2. Click "Start New Conversation" to begin
3. The tool will use the first message prompt automatically
4. Click "Continue" to extend the conversation with the continue prompt
5. Or type a custom message and click "Send Message"
6. View extended thinking output in the sidebar
7. Monitor token usage and costs

## Three-Prompt System (Like Claude Projects)

The tool works like **Claude Projects**, where you have persistent instructions that guide the AI's behavior. The three prompts work together to create a complete conversational experience:

### Main Prompt (System Instructions)
The **main system prompt** defines the tool's core behavior, personality, and capabilities. This is **always sent as the system parameter** with every request, similar to project instructions in Claude Projects.

**Example for YouTube Script Generator:**
```
You are an expert YouTube content writer and scriptwriter. You create engaging,
well-researched scripts that capture audience attention and drive engagement.

Your scripts are:
- Well-structured with clear hooks, body content, and strong conclusions
- Optimized for viewer retention with strategic pacing
- Researched and fact-checked using web search when needed
- Tailored to the specific niche and target audience

Always provide actionable, valuable content that viewers will love.
```

### First Message Prompt (Conversation Starter)
The **first message prompt** is automatically prepended to the user's first message when starting a new conversation. This sets the initial context and direction.

**How it works:** When mode is 'start', the API combines: `firstMessagePrompt + "\n\n" + userMessage`

**Example:**
```
Let's create an engaging YouTube script together. I'll start by researching the
topic thoroughly, then outline the key points we'll cover, ensuring maximum viewer
engagement and value.

Please provide the topic or niche for this script.
```

### Continue Parts Prompt (Continuation Template)
The **continue parts prompt** is prepended to the user's message when continuing the conversation. This maintains context and guides the continuation.

**How it works:** When mode is 'continue', the API combines: `continuePartsPrompt + "\n\n" + userMessage`

**Example:**
```
Continue developing the script from where we left off. Expand on the next section
while maintaining the same tone, style, and engagement level we've established.
```

### Prompt Flow Examples

**Starting a New Conversation:**
```
System: [Main Prompt - always present]
User: [First Message Prompt] + "\n\n" + "Create a script about AI tools"
Assistant: [Response]
```

**Continuing:**
```
System: [Main Prompt - always present]
User: [Previous conversation...]
User: [Continue Parts Prompt] + "\n\n" + "Add more examples"
Assistant: [Response]
```

**Custom Message:**
```
System: [Main Prompt - always present]
User: [Previous conversation...]
User: "Can you revise the introduction?"
Assistant: [Response]
```

## Configuration

### Model Options

**Claude 4 Family (Latest):**
- `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5) - Recommended for most use cases
- `claude-sonnet-4-20250514` (Claude Sonnet 4)
- `claude-opus-4-20250514` (Claude Opus 4) - Most capable

**Claude 3.5 Family:**
- `claude-3-5-sonnet-20241022` (Claude 3.5 Sonnet - October 2024)
- `claude-3-5-sonnet-20240620` (Claude 3.5 Sonnet - June 2024)

**Claude 3 Family:**
- `claude-3-opus-20240229` (Claude 3 Opus) - Most capable in Claude 3 family
- `claude-3-sonnet-20240229` (Claude 3 Sonnet) - Balanced performance
- `claude-3-haiku-20240307` (Claude 3 Haiku) - Fastest and most cost-effective

**Note:** Extended thinking is only available on certain models. Check the Anthropic documentation for model-specific features.

### Extended Thinking
- **Enabled**: Allows Claude to think deeply before responding
- **Thinking Budget**: 1,000 - 100,000 tokens (default: 10,000)
- **UltraThink Mode**: Automatically sets thinking budget to 50,000 tokens for complex reasoning tasks
- Thinking output is displayed separately in the UI
- **IMPORTANT**: `maxTokens` must be greater than `thinkingBudget`. The API will reject requests where maxTokens ≤ thinkingBudget.

### Prompt Caching
- **Enabled by Default**: Caches the system prompt to reduce costs
- **How it Works**: Uses Claude's `beta.prompt_caching.messages` endpoint
- **Cache Duration**: 5 minutes of inactivity (ephemeral cache)
- **Cost Savings**:
  - Cache writes: 25% more expensive than base input tokens
  - Cache reads: 90% cheaper than base input tokens
  - Example: After first request, subsequent requests save ~90% on system prompt costs
- **Format**: System prompt is sent as an array with `cache_control: { type: 'ephemeral' }`
- Particularly valuable for tools with large system prompts used frequently

### Web Search
- **Tool Type**: `web_search_20250305`
- When enabled, Claude can search the web for current information
- Automatically integrates search results into responses
- **Max Uses**: Limited to 5 searches per request
- **Pricing**: $10 per 1,000 searches (plus standard token costs)
- Tracked in conversation metadata
- Supports optional configurations:
  - `allowed_domains`: Only include results from specified domains
  - `blocked_domains`: Exclude results from specified domains
  - `user_location`: Localize search results

### Token Limits
- **Max Tokens**: 1,024 - 16,384 (default: 16,000)
- Controls the maximum length of generated responses
- **Must be greater than thinkingBudget** when extended thinking is enabled

### Temperature
- Range: 0.0 - 2.0 (default: 1.0)
- Controls randomness/creativity in responses

## Cost Calculation

Costs are automatically calculated based on Claude Sonnet 4.5 pricing:
- Input: $3 per million tokens
- Output: $15 per million tokens

Note: The pricing displayed uses Sonnet 4.5 rates. If using different models (Sonnet 4 or Opus 4), adjust the calculation in the API route accordingly.

Formula:
```
cost = (inputTokens / 1,000,000 × $3) + (outputTokens / 1,000,000 × $15)
```

## Migration

After pulling this feature, run:

```bash
npx prisma migrate dev --name add_claude_tool
# or
npx prisma db push
```

Then generate the Prisma client:

```bash
npx prisma generate
```

## Environment Variables

Ensure you have the following in your `.env.local`:

```env
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=file:./dev.db
```

## Future Enhancements

- [ ] Export conversations to various formats
- [ ] Batch processing multiple prompts
- [ ] Template library for common use cases
- [ ] Integration with knowledge base system
- [ ] Conversation branching and version control
- [ ] Analytics dashboard for tool usage
- [ ] Scheduled/automated tool runs
