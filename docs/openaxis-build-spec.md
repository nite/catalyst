# OpenAxis — Complete Build Specification
### v0.1.0-genesis | The Sovereign Agentic Platform

> A set of composable libraries that let you build, connect, and deploy intelligent web apps. Import what you need. Run each piece standalone or together. No framework lock-in.

---

## Specification Index

| Doc | What It Covers |
|-----|---------------|
| [Philosophy](spec/philosophy.md) | Build philosophy, No Plan Mode, 7 Hard Rules, Soft Practices, Vibe-Coding template |
| [Architecture](spec/architecture.md) | Monorepo layout, Node structure, compose vs standalone, manifest, connectivity, design system |
| [Stack](spec/stack.md) | Tech stack choices, what we're NOT using, environment variables |
| [Core Library](spec/core.md) | openaxis-core: auth, MCP helpers, DB factory, permissions, audit trail, event bus |
| [SigWire Node](spec/nodes/sigwire.md) | Signal in the Wire: scraping, LLM ranking, DB schema, MCP endpoints, frontend |
| [Other Nodes](spec/nodes/other-nodes.md) | Trader, OpenData, Viz: specs, DB schemas, data flows |
| [Deployment](spec/deployment.md) | Render, Koyeb, Docker Compose, security model |
| [Phases & Launch](spec/phases.md) | Build phases, HN launch strategy, OpenAxis as Node Zero |

---

## The Pitch

Build and deploy full-stack web apps for free, with AI. Like what Vercel, Lovable, Bolt, Replit, and v0 promise — but without the lock-in, without the serverless limitations, and with something none of them offer: every app you build can be talked to by AI agents and can talk to every other app.

**What you get that they don't:**
- Real backends (not serverless functions), real persistent storage, real APIs
- Every app is automatically MCP-queryable — Claude, ChatGPT, or any agent can talk to it
- Apps share data over REST and MCP — build a news feed, weather app, BI tool, and they compose
- Open source, deploy anywhere — not trapped on one platform's infra

**Launch apps** (each built in a day, works alone, talks to the others):

- **Signal in the Wire (SigWire)** — AI-ranked news feed. LLM scores articles by depth, impact, novelty. Ask Claude: "what are today's top AI stories?" via MCP.
- **MeanSky** — 8 weather models averaged into one forecast.
- **Open Data Explorer** — FRED, SEC, data.gov. Every dataset is an MCP resource.
- **GenBI Viz** — BI / analytics. Traditional charting first, GenBI layer on top.

**OpenAxis is its own first user.** The project site is an OpenAxis node — queryable via MCP.

---

## Packages

| Package | What It Does | Standalone? |
|---------|-------------|-------------|
| `openaxis-core` | Auth, MCP helpers, permissions, config | Yes |
| `openaxis-sigwire` | Signal in the Wire — AI-ranked news aggregator | Yes |
| `openaxis-meansky` | MeanSky — 8-model weather ensemble | Yes |
| `openaxis-trader` | Trading engine using news intelligence + technicals | Yes |
| `openaxis-opendata` | Public dataset browser and query engine | Yes |
| `openaxis-viz` | BI / analytics tool with GenBI layer | Yes |
| `openaxis-shell` | React UI that loads any Node's frontend | Yes |

---

*OpenAxis v0.1.0-genesis — Signal in the Wire: finding the signal in the noise.*
