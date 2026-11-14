# IdeaForge: System Architecture

How the deployed app is built, from raw idea to first step.

## Overview

```
Browser
  │
  ▼
Frontend: Next.js (App Router, React 19), Tailwind CSS, shadcn/ui, Framer Motion, Zustand
  │   one page; Zustand moves the user through the four stages
  │   calls /_/backend/api in production, http://localhost:3001/api in development
  ▼
Backend: Express.js REST API (backend/src/index.ts)
  │   four agent services in backend/src/services/
  │   each calls Gemini 2.5 Flash through @google/generative-ai (geminiClient.ts)
  ▼
Database: PostgreSQL through Prisma (backend/prisma/schema.prisma)
```

Both parts deploy to Vercel as two services from one repository (`vercel.json`): the frontend at `/`
and the backend at `/_/backend`.

## The four agents

| Stage | Service | Input | Output |
|---|---|---|---|
| 1. Intake (6W3H) | `aiAgent.service.ts` (`inferSixWThreeH`) | raw idea and any 6W3H answers the user gave | the nine 6W3H fields; the model fills gaps and keeps the user's answers |
| 2. Assumptions | `assumptionExtractor.service.ts` | idea and 6W3H summary | 3 to 5 risky assumptions, each tagged low, medium or high |
| 3. Milestones | `milestoneGenerator.service.ts` | idea, summary and assumptions | a 30/60/90-day plan; each milestone starts as a draft |
| 4. First step | `firstStepRecommender.service.ts` | idea and milestones | one action for the next 24 hours, with a rationale and time estimate |

Each service asks for JSON and parses the reply. When Gemini returns a rate-limit error (429), the
backend passes it to the frontend so the user sees what happened.

## Data flow

```
POST /api/intake                        → stage 1, creates a Roadmap
POST /api/assumptions/:id/generate      → stage 2, stores Assumptions
POST /api/milestones/:id/generate       → stage 3, stores Milestones (isAccepted = false)
PATCH /api/milestones/:id/accept        → the user accepts a milestone (human in the loop)
POST /api/first-step/:id/recommend      → stage 4, stores the FirstStep
```

Other routes: `GET /api/health`, `GET /api/session`, `GET /api/roadmaps`, `GET` routes to read each
stage, `PATCH /api/assumptions/validate/:id` and `DELETE /api/roadmaps/:id`.

## Database

Five Prisma models: `User`, `Roadmap`, `Assumption`, `Milestone` and `FirstStep`, with cascading
deletes from `Roadmap`. The backend build runs `prisma db push` against `DATABASE_URL`.

## State

- Server: PostgreSQL holds all pipeline data.
- Client: Zustand with `persist` keeps the current roadmap and stage; each stage reloads its data
  from the API.

## Identity

There is no sign-in. `GET /api/session` creates an anonymous user and returns its id; the frontend
keeps the id in the browser and sends it as the `X-User-Id` header. Every other route checks it
(`middleware/session.ts`) and only reads or changes that user's own roadmaps.

## Request checks

Applied in `index.ts`, in this order:

1. Security headers (helmet) and CORS (`middleware/security.ts`).
2. A general rate limit on all `/api` routes (`middleware/rateLimiter.ts`).
3. Zod validation of route ids and request bodies (`schemas/index.ts`, `utils/validateRequest.ts`).
4. On the four routes that call Gemini: the session check, a tighter rate limit, then the regex
   deny-list (`middleware/moderation.ts`).

Rate limits use Upstash Redis when it is configured. Without it they fall back to counts kept in
memory per server instance, which is a soft cap on serverless hosting.

The human-in-the-loop step: milestones stay drafts until the user accepts each one, and a banner
in the interface says the AI proposes a plan but does not validate the idea.

## Design choices

1. **6W3H intake.** A fixed set of nine questions (who, what, where, when, why, which, how, how
   much, how many) captures the idea more completely than a free-form prompt.
2. **One-page pipeline.** The four stages share one page and move forward through the Zustand
   store instead of separate routes.
3. **Separate frontend and backend.** The Express backend keeps the agents and database access out
   of the browser bundle, and both deploy from one repository.
