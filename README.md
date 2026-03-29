# FDE + AI Engineering Command Center

Production-quality Next.js App Router resource hub for Forward Deployment Engineering, AI Engineering interview prep, and a searchable 300+ project repository.

## Stack

- Next.js App Router
- Tailwind CSS
- Framer Motion
- Lucide React
- groq-sdk
- react-markdown + remark-gfm
- Fuse.js

## Features

- Material Design 3 dark-mode-first command-center UI
- Sticky navigation rail + compact mobile drawer
- Documentation-first sections with anchor links and sticky sub-navigation
- FDE Playbook markdown rendering with rich callout and code styles
- AI Engineering Mastery with practical decision matrix and checklists
- Live Signal Intelligence panel with resilient server fallback
- Interactive Agent Lab using Groq model fallback chain (primary, fallback, safe)
- Searchable/sortable/paginated 300-row Data Science project repository

## Autonomous Agent System

The repository now includes a self-evolving agent runtime under [agent/agent.ts](agent/agent.ts) with:

- Groq planner with model fallback chain (primary, fallback, safe model)
- Strict JSON planning output with diff-only patch edits
- Validation gates (patch shape, duplication checks, lint + build safety)
- Automatic rollback on validation failure
- Memory tracking in [agent/memory.json](agent/memory.json)
- Project awareness graph in [agent/projectGraph.ts](agent/projectGraph.ts)
- Observability logs in [agent/logger.ts](agent/logger.ts)
- Git automation with commit threshold and daily caps

### Scheduler

Workflow: [.github/workflows/auto-update.yml](.github/workflows/auto-update.yml)

- Runs hourly and supports manual dispatch
- Uses random delay mode for human-like timing
- Commits only when quality score >= 6

### Agent Setup

1. Configure environment values from [.env.example](.env.example)
2. Add repository secrets: `GROQ_API_KEY`, `NEWS_API_KEY`
3. Add repository variables (optional): `PRIMARY_MODEL`, `FALLBACK_MODEL`, `SAFE_MODEL`
4. Run locally: `npm run agent:run`

## Routes

- / : Command center hub
- /playbook : Focused FDE playbook page
- /repository : Dedicated project table page
- /api/signals : Signal feed API (with filtering, scoring, Groq summarization)
- /api/agent : Interview generation API
- /api/interview : Mock interviewer with scoring and follow-ups
- /api/stack-recommendation : Situation to solution decision engine

## Environment

Copy .env.example values into local environment:

- GROQ_API_KEY
- NEWS_API_KEY

Security notes:

- Secrets are only used in server routes
- No client-side secret exposure
- API handlers include graceful fallback logic

## Local Development

1. Install dependencies: npm install
2. Start dev server: npm run dev
3. Production check: npm run build
4. Lint check: npm run lint

## Future Expansion Hooks

Current architecture is prepared for:

- structured model responses
- function/tool calling
- eval pipelines
- conversation memory persistence
- logging and observability integrations
- source citation graph, deduplication, and ranking for signal intelligence
