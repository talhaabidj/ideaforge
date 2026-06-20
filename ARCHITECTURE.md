# IdeaForge — System Architecture

> A complete reference for how IdeaForge is built, from raw idea to first step.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  Next.js 16 App Router · Tailwind CSS 4 · shadcn/ui · Framer   │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Intake   │→│Assumptions│→│Milestones │→│First Step│          │
│  │ Chatbot   │ │   View   │ │  View     │ │  View    │          │
│  │ (6W3H)    │ │ (Risks)  │ │ (30/60/90)│ │ (Action) │          │
│  └─────┬─────┘ └─────┬────┘ └─────┬─────┘ └─────┬────┘          │
│        │              │            │              │              │
│  Zustand Store ←──────┴────────────┴──────────────┘              │
│  (stage, roadmapId, rawIdea)                                    │
└────────┬──────────────┬────────────┬──────────────┬──────────────┘
         │ POST /intake │ POST /gen  │ PATCH /accept│ POST /recommend
         ▼              ▼            ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express.js)                        │
│            Dedicated REST API Server (port 3001)                │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Validation  │→│  Moderation   │→│  Rate Limit   │          │
│  │  (Zod)       │  │ (Regex deny) │  │ (In-memory)  │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
│         │                                                       │
│  ┌──────▼───────────────────────────────────────────┐          │
│  │              AI SERVICE LAYER                     │          │
│  │  ┌────────────┐ ┌───────────────┐ ┌────────────┐│          │
│  │  │inferSixW3H │ │extractAssumps │ │genMilestone││          │
│  │  └──────┬─────┘ └───────┬───────┘ └──────┬─────┘│          │
│  │  ┌──────▼───────────────▼────────────────▼──────┐│          │
│  │  │        z-ai-web-dev-sdk (LLM Gateway)        ││          │
│  │  └──────────────────────────────────────────────┘│          │
│  └──────────────────────┬───────────────────────────┘          │
│                         │                                       │
│  ┌──────────────────────▼───────────────────────────┐          │
│  │               DATABASE (Prisma + SQLite)          │          │
│  │  User │ Roadmap │ Assumption │ Milestone │ FirstStep        │
│  └───────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend vs Backend Boundaries

IdeaForge uses **Next.js App Router**, which co-locates frontend and backend:

| Layer | Location | Technology |
|-------|----------|------------|
| **Frontend** | `src/app/page.tsx`, `src/components/` | React 19, Framer Motion, Zustand |
| **Backend** | `src/app/api/` (12 route handlers) | Prisma, Zod, z-ai-web-dev-sdk |
| **Shared** | `src/lib/` | Types, validation schemas, utilities |

The API routes function identically to an Express server — they receive HTTP requests, validate input, call AI services, persist to the database, and return JSON responses.

---

## The 4-Agent Pipeline

Each stage has a dedicated AI agent with a specialized system prompt:

### Stage 1: Intake (6W3H Chatbot)
- **Agent:** `inferSixWThreeH`
- **Input:** Raw idea string (e.g., "I want to build a pet-sitting app")
- **Processing:** Structures the idea across 9 fields — Who, What, Where, When, Why, Which, How, How much, How many
- **Output:** Structured JSON with inferred values for each field
- **Key Design:** AI infers gaps but NEVER overwrites user-provided values

### Stage 2: Assumption Extraction
- **Agent:** `extractAssumptions`
- **Input:** Raw idea + 6W3H summary
- **Processing:** Surfaces the 3-5 riskiest unvalidated beliefs (demand, willingness to pay, distribution)
- **Output:** Array of `{statement, riskLevel: "low"|"medium"|"high"}`
- **Key Design:** Risk levels enable prioritized validation

### Stage 3: Milestone Generation
- **Agent:** `generateMilestones`
- **Input:** Raw idea + summary + assumptions + optional constraints
- **Processing:** Synthesizes a chronological 30/60/90-day plan (~15 milestones)
- **Output:** Array of `{title, description, dayBucket: 30|60|90, orderIndex}`
- **Key Design:** **HITL (Human-in-the-Loop)** — every milestone stays `draft` until the user explicitly accepts it via PATCH

### Stage 4: First Step Recommendation
- **Agent:** `recommendFirstStep`
- **Input:** Raw idea + summary + assumptions + milestones + optional focus milestone
- **Processing:** Isolates the single smallest testable action
- **Output:** `{action, rationale, estimatedTimeHours}`
- **Key Design:** Constraints: 24 hours, no budget, no team — produces real signal about the riskiest assumption

---

## Data Flow

```
User types raw idea
    │
    ▼
POST /api/intake
    │ → Zod validates input
    │ → Moderation checks for harmful content
    │ → Rate limiter checks request frequency
    │ → inferSixWThreeH(rawIdea) → AI structures via 6W3H
    │ → Prisma creates Roadmap record
    │ → Returns 201 { roadmap }
    ▼
POST /api/assumptions/:id/generate
    │ → Loads roadmap from DB
    │ → extractAssumptions(rawIdea, summary) → AI extracts risks
    │ → Prisma creates 3-5 Assumption records
    │ → Returns 200 { assumptions }
    ▼
POST /api/milestones/:id/generate
    │ → Loads roadmap + assumptions from DB
    │ → generateMilestones(rawIdea, summary, assumptions) → AI plans
    │ → Prisma creates ~15 Milestone records (isAccepted: false)
    │ → Returns 200 { milestones }
    ▼
PATCH /api/milestones/:milestoneId/accept   ← HITL checkpoint
    │ → Updates isAccepted = true, sets acceptedAt
    │ → Returns 200 { milestone }
    ▼
POST /api/first-step/:id/recommend
    │ → Loads roadmap + assumptions + milestones from DB
    │ → recommendFirstStep(...) → AI isolates action
    │ → Prisma creates FirstStep record
    │ → Returns 200 { firstStep }
```

---

## Database Schema

Five models with cascading deletes:

| Model | Key Fields | Purpose |
|-------|------------|---------|
| **User** | id, email (unique), name | Session-based user (no auth provider in sandbox) |
| **Roadmap** | id, userId, title, rawIdea, sixW3hSummary, status | Central entity linking all pipeline stages |
| **Assumption** | id, roadmapId, statement, riskLevel, isValidated | Risk-tagged beliefs extracted by AI |
| **Milestone** | id, roadmapId, title, dayBucket, isAccepted | 30/60/90-day plan items with HITL flag |
| **FirstStep** | id, roadmapId, action, rationale, estimatedTimeHours | Smallest testable action |

---

## State Management

- **Server State:** Prisma/SQLite (source of truth for all pipeline data)
- **Client State:** Zustand with `persist` middleware
  - Persisted: `userId`, `roadmapId`, `stage`, `rawIdea`
  - Non-persisted: `assumptions`, `milestones`, `firstStep` (re-fetched from API on reload)
- **Hydration:** Each pipeline stage component fetches its data from the API on mount

---

## Security & Safety

| Layer | Implementation | Purpose |
|-------|---------------|---------|
| **Input Validation** | Zod schemas on every endpoint | Reject malformed requests |
| **Content Moderation** | Regex deny-list (src/lib/moderation.ts) | Block harmful content before AI |
| **Rate Limiting** | In-memory sliding window (src/lib/rateLimit.ts) | Prevent abuse |
| **HITL Safety** | Milestone accept requires explicit PATCH | Human approval before advancing |
| **AI Disclaimer** | Persistent HitlBanner in footer | Transparency about AI-generated content |
| **Error Handling** | Consistent error shapes via src/lib/http.ts | Predictable API responses |

---

## Key Design Decisions

1. **Next.js API Routes vs Express:** The teammate built Express + Neon Postgres. We reimplemented as Next.js routes with Prisma/SQLite for sandbox deployability while maintaining the identical API contract.

2. **z-ai-web-dev-sdk vs Anthropic:** The teammate planned Anthropic Claude but left agents as 501 TODOs. We wired in z-ai-web-dev-sdk which provides equivalent LLM capabilities.

3. **Light Mode Only:** Dark mode was abandoned as an "AI tell" — professional SaaS products use light themes. The design system enforces a cool off-white canvas with restrained emerald accents.

4. **6W3H Framework:** Instead of a free-form prompt, we use the structured 6W3H journalistic framework (Who, What, Where, When, Why, Which, How, How Much, How Many) to ensure comprehensive idea capture.

5. **Single-Page Pipeline:** The entire pipeline runs on a single page with Zustand-managed stage transitions, rather than traditional routing, for a cohesive product feel.
