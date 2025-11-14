# YouTube AI Automation System - Implementation Plan
### Faceless Channel Content Generation Platform

## 🎯 System Overview

A scalable content automation platform for managing multiple YouTube channels with AI-powered:
- Script generation using Claude API with extended thinking
- Image prompt generation for thumbnails/B-roll
- Video prompt generation for AI video tools
- Text-to-speech using ElevenLabs (future)
- Web search integration for trending topics

---

## 🏗️ Architecture (2025 Best Practices)

### Tech Stack

**Frontend/Backend:**
- Next.js 14+ (App Router, Server Actions)
- TypeScript (strict mode)
- React 19 features

**Database:**
- PostgreSQL with Prisma ORM
- Alternative: SQLite for local development

**State Management:**
- Zustand (lightweight, simple)
- TanStack Query (server state, caching)

**Job Queue:**
- Inngest (serverless job queue with observability)
- Alternative: BullMQ with Redis

**AI APIs:**
- Anthropic Claude API (Sonnet 4, Opus 4)
  - Extended thinking for complex scripts
  - Web search for trending topics
  - Projects for maintaining context
- ElevenLabs API (text-to-speech)

**Validation & Type Safety:**
- Zod (runtime validation)
- TypeScript (compile-time)

**Deployment:**
- Vercel (Next.js native)
- Database: Vercel Postgres or Supabase
- Job Queue: Inngest Cloud

---

## 📊 Database Schema

```prisma
// schema.prisma

model Channel {
  id              String    @id @default(cuid())
  name            String
  niche           String
  description     String?
  status          ChannelStatus @default(ACTIVE)

  // Claude Projects integration
  claudeProjectId String?

  // Settings
  settings        Json      // { targetAudience, toneOfVoice, etc }

  prompts         Prompt[]
  scripts         Script[]
  jobs            Job[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Prompt {
  id              String    @id @default(cuid())
  channelId       String
  channel         Channel   @relation(fields: [channelId], references: [id])

  type            PromptType // SCRIPT, IMAGE, VIDEO
  name            String     // e.g., "Script Generator v2"
  systemPrompt    String     @db.Text

  // Claude API settings
  useExtendedThinking Boolean @default(false)
  thinkingBudget  Int?       // Token budget for thinking
  useWebSearch    Boolean    @default(false)

  version         Int       @default(1)
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([channelId, type, isActive])
}

model Script {
  id              String    @id @default(cuid())
  channelId       String
  channel         Channel   @relation(fields: [channelId], references: [id])

  title           String
  topic           String
  content         String    @db.Text

  // Metadata
  wordCount       Int?
  duration        Int?      // Estimated seconds
  status          ScriptStatus @default(DRAFT)

  // Generated assets
  imagePrompts    ImagePrompt[]
  videoPrompts    VideoPrompt[]
  audioAssets     AudioAsset[]

  // Claude API metadata
  thinkingContent String?   @db.Text
  tokensUsed      Int?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  publishedAt     DateTime?

  @@index([channelId, status])
}

model ImagePrompt {
  id              String    @id @default(cuid())
  scriptId        String
  script          Script    @relation(fields: [scriptId], references: [id])

  type            ImageType // THUMBNAIL, B_ROLL, SCENE
  prompt          String    @db.Text
  negativePrompt  String?   @db.Text

  // Settings for image generation
  settings        Json      // { style, aspectRatio, etc }

  // Generated image
  imageUrl        String?
  generatedAt     DateTime?

  order           Int       // Order in script

  createdAt       DateTime  @default(now())
}

model VideoPrompt {
  id              String    @id @default(cuid())
  scriptId        String
  script          Script    @relation(fields: [scriptId], references: [id])

  prompt          String    @db.Text
  duration        Int?      // Seconds
  settings        Json      // { style, motion, camera, etc }

  // Generated video
  videoUrl        String?
  generatedAt     DateTime?

  order           Int

  createdAt       DateTime  @default(now())
}

model AudioAsset {
  id              String    @id @default(cuid())
  scriptId        String
  script          Script    @relation(fields: [scriptId], references: [id])

  text            String    @db.Text
  voiceId         String    // ElevenLabs voice ID

  // Generated audio
  audioUrl        String?
  duration        Int?      // Seconds
  generatedAt     DateTime?

  order           Int

  createdAt       DateTime  @default(now())
}

model Job {
  id              String    @id @default(cuid())
  channelId       String
  channel         Channel   @relation(fields: [channelId], references: [id])

  type            JobType   // SCRIPT_GENERATION, IMAGE_GENERATION, etc
  status          JobStatus @default(PENDING)

  input           Json      // Job parameters
  result          Json?     // Job results
  error           String?   @db.Text

  // Metadata
  tokensUsed      Int?
  cost            Float?
  duration        Int?      // Milliseconds

  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime  @default(now())

  @@index([channelId, status])
}

// Enums
enum ChannelStatus {
  ACTIVE
  PAUSED
  ARCHIVED
}

enum PromptType {
  SCRIPT
  IMAGE
  VIDEO
}

enum ScriptStatus {
  DRAFT
  GENERATING
  GENERATED
  REVIEWED
  PUBLISHED
}

enum ImageType {
  THUMBNAIL
  B_ROLL
  SCENE
}

enum JobType {
  SCRIPT_GENERATION
  IMAGE_PROMPT_GENERATION
  VIDEO_PROMPT_GENERATION
  TTS_GENERATION
  BATCH_GENERATION
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## 🚀 Core Features Implementation

### 1. Channel Management Dashboard

**Features:**
- Create/edit/archive channels
- Configure channel-specific settings
- View analytics per channel
- Manage Claude Projects per channel

**UI Components:**
```typescript
/app/dashboard/channels
├── page.tsx              // Channel list
├── [channelId]/page.tsx  // Channel detail
├── [channelId]/settings  // Channel settings
└── [channelId]/prompts   // Prompt management
```

### 2. Prompt Template Management

**Features:**
- Create versioned prompts per channel
- Configure Claude API settings per prompt
- Toggle extended thinking & web search
- A/B test different prompts
- Import/export prompt templates

**Example Prompt Structure:**
```typescript
interface PromptConfig {
  systemPrompt: string;
  claudeSettings: {
    model: 'claude-sonnet-4' | 'claude-opus-4';
    maxTokens: number;
    temperature: number;
    extendedThinking?: {
      enabled: boolean;
      budget: number; // min 1024
    };
    webSearch?: boolean;
  };
}
```

### 3. Script Generation Pipeline

**Workflow:**
1. User selects channel + topic
2. System loads channel-specific prompts
3. Optional: Web search for trending info
4. Claude generates script with extended thinking
5. Parse script into sections
6. Store with metadata

**Server Action Example:**
```typescript
// app/actions/generate-script.ts
'use server';

export async function generateScript(input: {
  channelId: string;
  topic: string;
  additionalContext?: string;
}) {
  // 1. Load channel prompts
  const prompt = await prisma.prompt.findFirst({
    where: {
      channelId: input.channelId,
      type: 'SCRIPT',
      isActive: true
    }
  });

  // 2. Optional: Web search
  let searchResults;
  if (prompt.useWebSearch) {
    searchResults = await searchWeb(input.topic);
  }

  // 3. Call Claude API with extended thinking
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    extended_thinking: prompt.useExtendedThinking ? {
      type: 'enabled',
      budget_tokens: prompt.thinkingBudget || 1024
    } : undefined,
    messages: [{
      role: 'user',
      content: buildPrompt(input, searchResults)
    }],
    system: prompt.systemPrompt
  });

  // 4. Extract thinking and content
  const thinking = response.content.find(
    block => block.type === 'thinking'
  );
  const text = response.content.find(
    block => block.type === 'text'
  );

  // 5. Save to database
  return await prisma.script.create({
    data: {
      channelId: input.channelId,
      topic: input.topic,
      content: text.text,
      thinkingContent: thinking?.thinking,
      tokensUsed: response.usage.output_tokens,
      status: 'GENERATED'
    }
  });
}
```

### 4. Asset Generation (Images & Video Prompts)

**After script generation:**
1. Parse script sections
2. Generate image prompts using Claude
3. Generate video prompts using Claude
4. Store all prompts with order/timing

**Example:**
```typescript
async function generateAssetPrompts(scriptId: string) {
  const script = await prisma.script.findUnique({
    where: { id: scriptId }
  });

  // Generate prompts using Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: `Analyze this script and generate:
      1. Image prompts for key scenes
      2. Video prompts for animations

      Script: ${script.content}

      Format as JSON array.`
    }]
  });

  // Parse and save
  const prompts = JSON.parse(response.content[0].text);

  // Save image prompts
  await prisma.imagePrompt.createMany({
    data: prompts.images.map((p, i) => ({
      scriptId,
      type: 'SCENE',
      prompt: p.prompt,
      order: i
    }))
  });

  // Save video prompts
  await prisma.videoPrompt.createMany({
    data: prompts.videos.map((p, i) => ({
      scriptId,
      prompt: p.prompt,
      duration: p.duration,
      order: i
    }))
  });
}
```

### 5. Job Queue System (Inngest)

**Why Inngest:**
- Serverless, no infrastructure
- Built-in retries & error handling
- Great observability
- Easy local development

**Setup:**
```typescript
// inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'youtube-automation'
});

// inngest/functions/generate-script.ts
export const generateScriptJob = inngest.createFunction(
  {
    id: 'generate-script',
    retries: 3
  },
  { event: 'script/generate' },
  async ({ event, step }) => {
    const { channelId, topic } = event.data;

    // Step 1: Web search (if needed)
    const searchData = await step.run('web-search', async () => {
      return searchWeb(topic);
    });

    // Step 2: Generate script
    const script = await step.run('claude-generate', async () => {
      return generateScript({ channelId, topic, searchData });
    });

    // Step 3: Generate asset prompts
    await step.run('generate-assets', async () => {
      return generateAssetPrompts(script.id);
    });

    return { scriptId: script.id };
  }
);

// Batch processing
export const batchGenerateScripts = inngest.createFunction(
  { id: 'batch-generate-scripts' },
  { event: 'scripts/batch-generate' },
  async ({ event, step }) => {
    const { channelId, topics } = event.data;

    // Fan-out: Generate multiple scripts in parallel
    const results = await Promise.all(
      topics.map(topic =>
        step.run(`generate-${topic}`, () =>
          generateScript({ channelId, topic })
        )
      )
    );

    return { scriptsGenerated: results.length };
  }
);
```

### 6. Claude Projects Integration

**Benefits:**
- Persistent context per channel
- Better understanding of channel style
- Consistent voice across scripts

**Implementation:**
```typescript
// services/claude-projects.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function createChannelProject(channel: Channel) {
  // Create project with channel context
  const project = await anthropic.projects.create({
    name: channel.name,
    description: `YouTube channel: ${channel.niche}`,
    // Add channel context documents
  });

  // Store project ID
  await prisma.channel.update({
    where: { id: channel.id },
    data: { claudeProjectId: project.id }
  });

  return project;
}

export async function generateWithProject(
  channelId: string,
  prompt: string
) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId }
  });

  // Use project context
  return await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    project_id: channel.claudeProjectId,
    messages: [{ role: 'user', content: prompt }]
  });
}
```

### 7. Batch Processing System

**Features:**
- Generate multiple scripts at once
- Schedule generations
- Progress tracking
- Cost estimation

**UI Flow:**
```
1. Select channel
2. Input multiple topics (CSV or textarea)
3. Preview cost estimation
4. Start batch job
5. Monitor progress in dashboard
6. Review generated scripts
```

---

## 🎨 UI/UX Design (2025 Modern)

### Dashboard Layout
```
┌─────────────────────────────────────────────┐
│  YouTube AI Automation                      │
│  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │Channel1│  │Channel2│  │Channel3│  [+]  │
│  └────────┘  └────────┘  └────────┘       │
├─────────────────────────────────────────────┤
│  Quick Actions                              │
│  [Generate Script] [Batch Generate]        │
│  [View Queue] [Analytics]                  │
├─────────────────────────────────────────────┤
│  Recent Scripts                             │
│  ┌─────────────────────────────────────┐   │
│  │ Title 1        | Channel1 | Draft   │   │
│  │ Title 2        | Channel2 | Ready   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Script Generation Flow
```
Step 1: Select Channel
↓
Step 2: Enter Topic/Title
↓
Step 3: Optional Settings
  - Use web search
  - Extended thinking budget
  - Additional context
↓
Step 4: Generate (with progress)
↓
Step 5: Review Script
  - Edit if needed
  - View thinking process
  - Preview assets
↓
Step 6: Generate Assets
  - Image prompts
  - Video prompts
↓
Step 7: Export/Publish
```

---

## 🔐 Environment Variables

```bash
# .env.local

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxx
CLAUDE_MODEL=claude-sonnet-4-20250514

# Database
DATABASE_URL=postgresql://xxx

# Inngest
INNGEST_EVENT_KEY=xxx
INNGEST_SIGNING_KEY=xxx

# ElevenLabs (Future)
ELEVENLABS_API_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📦 Project Structure

```
youtube-ai-automation/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── channels/
│   │   │   ├── page.tsx             # Channel list
│   │   │   └── [channelId]/
│   │   │       ├── page.tsx         # Channel detail
│   │   │       ├── scripts/         # Scripts list
│   │   │       ├── prompts/         # Prompt management
│   │   │       └── settings/        # Channel settings
│   │   ├── scripts/
│   │   │   ├── page.tsx             # All scripts
│   │   │   ├── new/                 # Generate script
│   │   │   └── [scriptId]/          # Script detail
│   │   └── batch/
│   │       ├── page.tsx             # Batch generation
│   │       └── [batchId]/           # Batch details
│   ├── api/
│   │   ├── inngest/                 # Inngest webhook
│   │   └── webhooks/                # External webhooks
│   └── actions/                     # Server actions
│       ├── channels.ts
│       ├── scripts.ts
│       └── prompts.ts
├── components/
│   ├── ui/                          # Shadcn components
│   ├── channels/
│   ├── scripts/
│   └── batch/
├── lib/
│   ├── anthropic.ts                 # Claude API wrapper
│   ├── prisma.ts                    # Prisma client
│   ├── inngest.ts                   # Inngest client
│   └── utils.ts
├── services/
│   ├── script-generator.ts
│   ├── asset-generator.ts
│   ├── web-search.ts
│   └── claude-projects.ts
├── inngest/
│   ├── client.ts
│   └── functions/
│       ├── generate-script.ts
│       ├── generate-assets.ts
│       ├── batch-process.ts
│       └── tts-generation.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── types/
    ├── channel.ts
    ├── script.ts
    └── prompts.ts
```

---

## 🚀 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js project structure
- [ ] Configure PostgreSQL + Prisma
- [ ] Set up authentication (Clerk/NextAuth)
- [ ] Create database schema
- [ ] Build channel management UI
- [ ] Integrate Anthropic Claude API

### Phase 2: Core Features (Week 3-4)
- [ ] Implement prompt template system
- [ ] Build script generation flow
- [ ] Add extended thinking support
- [ ] Integrate web search
- [ ] Create script editor UI
- [ ] Add prompt versioning

### Phase 3: Asset Generation (Week 5)
- [ ] Build asset prompt generator
- [ ] Create image prompt UI
- [ ] Create video prompt UI
- [ ] Add asset preview/edit
- [ ] Implement export functionality

### Phase 4: Automation (Week 6)
- [ ] Set up Inngest job queue
- [ ] Implement batch processing
- [ ] Add scheduling system
- [ ] Build progress tracking
- [ ] Add error handling/retries

### Phase 5: Claude Projects (Week 7)
- [ ] Integrate Claude Projects API
- [ ] Create project per channel
- [ ] Upload channel context
- [ ] Test context persistence

### Phase 6: Polish & Scale (Week 8)
- [ ] Add analytics dashboard
- [ ] Implement cost tracking
- [ ] Build export templates
- [ ] Add keyboard shortcuts
- [ ] Performance optimization
- [ ] Documentation

### Phase 7: TTS Integration (Future)
- [ ] Integrate ElevenLabs API
- [ ] Voice selection per channel
- [ ] Audio generation pipeline
- [ ] Audio preview/editing
- [ ] Batch audio generation

---

## 💰 Cost Estimation

### Claude API (Sonnet 4)
- Input: $3 / million tokens
- Output: $15 / million tokens
- Extended thinking: Uses output tokens

**Estimated per script:**
- System prompt: ~500 tokens
- User input: ~200 tokens
- Script output: ~2000 tokens
- Thinking output: ~1000 tokens
- Asset prompts: ~500 tokens

**Cost per script:** ~$0.06 - $0.10

**For 100 scripts/month across 4 channels:**
- Cost: $6 - $10/month

### Infrastructure
- Vercel Hobby: Free
- Vercel Pro: $20/month (recommended)
- Database: $0 - $20/month
- Inngest: Free tier (10k events/month)

**Total estimated: $20 - $50/month**

---

## 🔒 Best Practices

### 1. Rate Limiting
```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, '1 m'),
});

// Use in server actions
const { success } = await ratelimit.limit(channelId);
if (!success) throw new Error('Rate limit exceeded');
```

### 2. Error Handling
```typescript
// Wrap Claude API calls
async function safeClaudeCall<T>(
  fn: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    if (error.status === 429) {
      // Rate limit - retry with backoff
      await sleep(5000);
      return safeClaudeCall(fn);
    }
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 3. Token Optimization
- Cache system prompts
- Use streaming for long outputs
- Implement token counting before requests
- Set appropriate max_tokens

### 4. Security
- Never expose API keys client-side
- Use server actions for all API calls
- Validate all user inputs with Zod
- Implement proper authentication
- Add CSRF protection

### 5. Monitoring
- Log all API calls
- Track token usage per channel
- Monitor job queue health
- Set up error alerts
- Track costs in real-time

---

## 🎯 Advanced Features (Future Enhancements)

1. **AI Video Generation Integration**
   - Runway ML, Pika Labs, or Luma AI
   - Auto-generate videos from prompts

2. **Auto-Publishing**
   - YouTube API integration
   - Schedule uploads
   - Auto-generate descriptions/tags

3. **A/B Testing**
   - Test different script styles
   - Compare prompt performance
   - Analytics integration

4. **Collaboration**
   - Multi-user support
   - Review/approval workflow
   - Comments on scripts

5. **Template Marketplace**
   - Share prompt templates
   - Import community templates
   - Monetize best-performing prompts

6. **Mobile App**
   - React Native
   - Monitor generations on-the-go
   - Quick edits/approvals

---

## 📚 Resources

### Documentation
- [Claude API Docs](https://docs.anthropic.com)
- [Extended Thinking Guide](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma](https://prisma.io/docs)
- [Inngest](https://inngest.com/docs)

### Libraries to Install
```bash
npm install @anthropic-ai/sdk
npm install @prisma/client prisma
npm install inngest
npm install zod
npm install @tanstack/react-query
npm install zustand
npm install date-fns
npm install react-hook-form
```

---

## 🎬 Getting Started

1. **Clone & Set Up:**
```bash
npm install
cp .env.example .env.local
# Add your API keys
npx prisma generate
npx prisma db push
```

2. **Create First Channel:**
```bash
npm run dev
# Visit http://localhost:3000
# Create channel with system prompts
```

3. **Generate First Script:**
```bash
# Use UI or programmatically
await generateScript({
  channelId: 'xxx',
  topic: 'Your first video topic'
});
```

---

This plan provides a complete, production-ready architecture for your YouTube automation system. Ready to start building? Let me know which phase you'd like to implement first!
