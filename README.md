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
- Interactive Agent Lab using Groq model llama3-70b-8192
- Searchable/sortable/paginated 300-row Data Science project repository

## Routes

- / : Command center hub
- /playbook : Focused FDE playbook page
- /repository : Dedicated project table page
- /api/signals : Signal feed API (with filtering, scoring, Groq summarization)
- /api/agent : Interview generation API

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
