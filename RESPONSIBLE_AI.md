# IdeaForge: Responsible AI Design

The risks we saw in IdeaForge, what the code does about each one, and what it does not do.

## Risks and mitigations

### 1. Over-reliance on AI output
People may treat the assumptions, milestones and first step as answers instead of starting points.

- **Human in the loop:** every milestone starts as a draft. The user accepts milestones one by one
  (`PATCH /api/milestones/:id/accept`), and the accept time is stored in `acceptedAt`.
- **Banner:** once a roadmap exists, every stage shows a banner saying the AI proposes a plan but
  never validates the idea, and market testing stays with the person.

### 2. Narrow or biased assumptions
The model may lean towards some business models or markets.

- **Risk tags:** each assumption carries a low, medium or high tag that the user can see and
  challenge, and the user can mark each one validated or invalidated.
- **Prompt focus:** the assumption agent is told to put demand, willingness to pay and distribution
  ahead of generic statements.

### 3. Harmful input
People may submit content the agents should not process.

- **Deny-list moderation** (`backend/src/middleware/moderation.ts`): runs on the four routes that
  call Gemini, before the model is called. A match returns 403 and only metadata is logged, never
  the text.
- **Validation** (`backend/src/schemas/index.ts`): Zod checks ids and bodies (the idea must be 10 to
  2,000 characters, each 6W3H answer at most 500).
- **Rate limits** (`backend/src/middleware/rateLimiter.ts`): 60 API calls per minute and 30 AI calls
  per hour per IP. They use Upstash Redis when it is configured and counts in memory otherwise.

### 4. Hallucination
The model may produce plausible but wrong content.

- **Structured output:** each agent must answer in JSON; replies that do not parse are rejected
  with an error instead of being shown.
- **Small tasks:** each agent has one narrow job (for example, 3 to 5 assumptions), and the
  human-in-the-loop step puts the user's judgement between the plan and the first step.

### 5. Privacy
People may type ideas they consider confidential.

- **No sign-up:** no names or emails are asked for. Each browser gets an anonymous id, and the
  backend only returns a user's own roadmaps.
- **Storage:** roadmaps are stored in PostgreSQL. Text is sent to the Gemini API to run the agents.
- **No analytics:** the app includes no tracking or analytics scripts.

## Limitations

1. The AI is not a business advisor. It structures thinking; it does not replace customer
   interviews or market research.
2. Weak input gives weak output. The 6W3H questions help but do not fix a vague idea.
3. The moderation is a regex deny-list. It catches common harmful phrases and nothing more.
4. Without Upstash, rate limits are counted per server instance, so they are soft on serverless
   hosting.
5. The anonymous id lives in the browser. Clearing site data starts a new, empty session, and
   anyone who has the id can read that session's roadmaps.
