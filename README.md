# 🚀 IdeaForge: Zero-to-One Builder

> **From raw idea to the single smallest testable action in 4 steps.** 
> An agentic AI pipeline that structures startup ideas, extracts riskiest assumptions, generates a human-approved 30/60/90-day roadmap, and isolates your very first step.

**Built for the USAII Global AI Hackathon 2026**  
*Undergraduate Track · Challenge Brief 3: Build the "Second Brain" for Real Life · Direction B: Zero-to-One Builder.*

---

## 🎯 The Problem

**Zero-to-one builders face cognitive overload.** You have a raw idea — maybe just a sentence — but translating it into a structured plan feels overwhelming. What are your riskiest assumptions? What should you build first? What's the smallest thing you can do *today* to get real signal?

Most people never start. Not because the idea is bad, but because the gap between "I have an idea" and "here's what I do next" is paralyzing.

**IdeaForge bridges that gap** with four specialized AI agents that structure your thinking, surface your blind spots, plan your path, and break the paralysis — all while keeping *you* in control.

---

## 🧠 The 4-Stage Agentic Pipeline

| Stage | Agent | What It Does |
|-------|-------|-------------|
| **01 · Intake** | 6W3H Chatbot | Structures your raw idea across 9 dimensions (Who/What/Where/When/Why/Which/How/How much/How many). AI infers gaps but never overwrites your input. |
| **02 · Assumptions** | Risk Analyst | Surfaces the 3–5 riskiest unvalidated beliefs about your idea (demand, willingness to pay, distribution). Each tagged low/medium/high. |
| **03 · Roadmap** | Execution Coach | Synthesizes a 30/60/90-day milestone plan. **Human-in-the-Loop**: every milestone stays draft until you explicitly accept it. |
| **04 · First Step** | Paralysis Breaker | Isolates the single smallest testable action — 24 hours, no budget, no team — that produces real signal about your riskiest assumption. |

---

## 🏗️ Production Architecture

IdeaForge is structured as a commercial-grade full-stack application with completely decoupled frontend and backend services:

- **Frontend (`/frontend`):** Next.js App Router (React 19) with Tailwind CSS 4, shadcn/ui, Framer Motion, and Zustand
- **Backend (`/backend`):** Dedicated Express.js server exposing REST API endpoints
- **Database:** SQLite with Prisma ORM (stored in `/backend/prisma`)
- **AI Layer:** 4 specialized agents utilizing `@google/generative-ai` (Gemini API)

> 📐 See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system diagram, data flow, and design decisions.

---

## 🛡️ Responsible AI

We take AI responsibility seriously. Our design addresses five risk categories with concrete, code-level mitigations:

| Risk | Mitigation |
|------|-----------|
| **Over-reliance** | HITL milestone acceptance — AI proposes, human disposes |
| **Algorithmic bias** | Transparent risk tags + diverse prompt engineering |
| **Content safety** | Regex moderation layer blocks harmful input pre-AI |
| **Hallucination** | Structured JSON contracts + bounded agent scope |
| **Data privacy** | Local SQLite, no PII, session-based identity |

> 📋 See [RESPONSIBLE_AI.md](./RESPONSIBLE_AI.md) for the full risk analysis and mitigation documentation.

---

## 🚀 Getting Started

The project is structured as a monorepo with a single root configuration to launch both the frontend and the backend simultaneously.

```bash
# 1. Install all dependencies (Root, Frontend, Backend)
npm run install:all

# 2. Start the development servers
npm run dev
```

The application will start automatically:
- **Frontend** runs on `http://localhost:3000`
- **Backend API** runs on `http://localhost:3001`

---

## 📂 Project Structure

```
ideaforge/
├── frontend/                          # Next.js Application
│   ├── src/
│   │   ├── app/                       # App Router pages & layouts
│   │   ├── components/                # UI components (shadcn, chatbot, views)
│   │   ├── lib/                       # API clients, types, and Zustand store
│   │   └── hooks/                     # Custom React hooks
│   ├── public/                        # Static assets
│   ├── next.config.ts                 # Next.js configuration
│   └── package.json                   # Frontend dependencies
│
├── backend/                           # Express.js REST API
│   ├── src/
│   │   ├── index.ts                   # Express server entry point & routes
│   │   ├── config/                    # Database and environment config
│   │   ├── schemas/                   # Zod validation schemas
│   │   ├── services/                  # The 4 AI Agents implementation
│   │   └── geminiClient.ts            # Gemini API integration
│   ├── prisma/                        # SQLite Database & ORM Schema
│   │   ├── schema.prisma              # Data models (Roadmap, Assumption, etc)
│   │   └── dev.db                     # Local SQLite database
│   └── package.json                   # Backend dependencies
│
├── package.json                       # Root orchestrator (concurrently)
├── README.md                          # You are here
├── ARCHITECTURE.md                    # Technical documentation
└── RESPONSIBLE_AI.md                  # Ethical AI documentation
```

---

## 📋 API Endpoints (Port 3001)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Server + database health check |
| GET | `/api/session` | Session management (anonymous UUID) |
| GET | `/api/roadmaps` | List user's roadmaps |
| POST | `/api/intake` | Create roadmap from raw idea + 6W3H AI Agent |
| GET | `/api/intake/:roadmapId` | Fetch a specific roadmap |
| POST | `/api/assumptions/:roadmapId/generate` | Run assumption extraction AI Agent |
| GET | `/api/assumptions/:roadmapId` | List assumptions for a roadmap |
| POST | `/api/milestones/:roadmapId/generate` | Run milestone generation AI Agent |
| GET | `/api/milestones/:roadmapId` | List milestones for a roadmap |
| PATCH | `/api/milestones/:milestoneId/accept` | HITL accept a milestone |
| POST | `/api/first-step/:roadmapId/recommend` | Run first-step recommendation AI Agent |
| GET | `/api/first-step/:roadmapId` | Fetch first-step recommendation |

---

## 👥 Team Labaik

Proudly engineered and designed for the **USAII® Global AI Hackathon 2026**.

| Team Member | Role | Focus Area |
| :--- | :--- | :--- |
| **Talha Abid** | Frontend Developer | React / Next.js / Tailwind CSS (Frontend, QA, & Deployment) |
| **Eman Mirza** | Backend Developer | Node.js / Express Architecture (Backend, QA & Deployment) |
| **Mahad** | Database Engineer | Data Modeling & Prisma ORM |
| **Mahrukh** | Product Strategy | Brainstorming & Problem Solving |
---

## 📜 License

MIT License

---

<p align="center">
  <strong>Forged for the ambitious · USAII Global AI Hackathon 2026</strong><br>
  Undergraduate Track · Challenge Brief 03 · Direction B: Zero-to-One Builder
</p>
