# MindPulse — Student Mental Wellness

## Overview

pnpm workspace monorepo using TypeScript. Full-stack student mental wellness app with AI chat and real-time facial emotion detection.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT-based (bcrypt password hashing, 30-day tokens)
- **AI**: Gemini 2.5 Flash via Replit AI Integrations (streaming SSE)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── mindpulse/          # React frontend (port 26171)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-gemini-ai/  # Gemini AI client wrapper
└── scripts/                # Utility scripts
```

## Features

### Existing (from Mindplus main repo)
- **Auth**: Register/Login with JWT tokens, persistent sessions
- **Dashboard**: Overview with mood stats, streak, points
- **Check-ins**: Daily mood/stress/sleep logging
- **Analytics**: Charts and trend analysis
- **Insights**: AI-generated wellness insights
- **Achievements**: Gamification with badges and levels
- **Community**: Social feed with posts and interactions
- **Resources**: Mental health resource library

### Added (from minplus-part repo)
- **Mind Chat** (`/chat`): AI-powered mental wellness chatbot (Pulse) using Gemini 2.5 Flash with streaming SSE responses, conversation history, auth-protected and user-scoped
- **Emotion Tracker** (`/emotion`): Real-time facial emotion detection using face-api.js via webcam, no backend required

## API Routes

- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login and get JWT
- `GET /api/auth/me` — Get current user (auth required)
- `GET/POST /api/checkins` — Daily check-ins (auth required)
- `GET /api/insights` — AI wellness insights (auth required)
- `GET /api/achievements` — User achievements (auth required)
- `GET/POST /api/community/posts` — Community feed (auth required)
- `GET /api/resources` — Resource library
- `GET/POST /api/gemini/conversations` — Chat conversations (auth required)
- `GET/DELETE /api/gemini/conversations/:id` — Conversation management (auth required)
- `GET /api/gemini/conversations/:id/messages` — Message history (auth required)
- `POST /api/gemini/conversations/:id/messages` — Send message + stream AI response (auth required)

## DB Schema

- `users` — User accounts with streak, points, level tracking
- `checkins` — Daily mood/stress/sleep check-ins
- `community_posts` — Community posts
- `conversations` — Gemini chat conversations (user-scoped)
- `messages` — Chat messages per conversation

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)
- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Gemini proxy URL (auto-set)
- `AI_INTEGRATIONS_GEMINI_API_KEY` — Gemini API key (auto-set)
- `JWT_SECRET` — JWT signing secret (defaults to hardcoded dev key)
- `PORT` — Server port (set by Replit per artifact)
- `BASE_PATH` — Frontend base path (set by Replit per artifact)

## Development

```bash
pnpm install                                    # Install all deps
pnpm --filter @workspace/api-spec run codegen  # Regenerate API client
pnpm --filter @workspace/db run push           # Push DB schema changes
```
