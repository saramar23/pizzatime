# PizzaTime

Real-time pizza shop menu with a conversational AI agent (Mastra) and Convex backend.

See [docs/features.md](docs/features.md) for product goals and feature list.

## Prerequisites

- Node.js 22.13+
- [Convex](https://convex.dev) account (for `npx convex dev`)
- API keys for your Mastra model provider (e.g. Groq)

## Setup

```bash
npm install
cp .env.example .env.local
# Add secrets to .env.local, then start Convex (writes NEXT_PUBLIC_CONVEX_URL):
npx convex dev
```

In another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Mastra Studio (agents/workflows): see [AGENTS.md](AGENTS.md) for `npm run dev` / build commands in the Mastra subproject.

## AI assistant docs

- [AGENTS.md](AGENTS.md) — Mastra conventions for this repo
- [CLAUDE.md](CLAUDE.md) — Convex guidelines pointer

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Convex](https://convex.dev) — menu, cart, orders, chat
- [Mastra](https://mastra.ai) — menu agent and tools
