# OpenAxis — Build Philosophy

## Libraries, Not a Framework

OpenAxis is **not** a framework. It's a set of libraries that compose.

| Framework (what we're NOT) | Library (what we ARE) |
|---|---|
| "Put your code in our folders" | "Import our code into your project" |
| You conform to our structure | You stay in control of your structure |
| The framework calls your code | Your code calls the library |
| All-or-nothing adoption | Pick and choose what you need |
| Delete the framework, rewrite everything | Delete one library, everything else still works |

**Practical consequence**: A developer should be able to `pip install openaxis-core` and get auth + MCP helpers without adopting anything else.

**Every library is a separate package.** Each can be published to PyPI / npm independently. Each has its own repo (or monorepo subfolder). Each works standalone.

**The default stack is Python/FastAPI backend and React/Vite frontend**, but the architecture is language-agnostic — any Node just needs to expose REST and optionally MCP.

---

## "No Plan Mode"

1. **Start with one working thing.** Don't design a "platform" — start with a single script that does one thing well.
2. **Conversational architecture.** Describe what you want in plain English. Let the code emerge from the conversation.
3. **Ship ugly, ship fast.** Ship because it *works*, not because it's polished.
4. **Let the community define the roadmap.** Features you didn't plan will get demanded. Build them when demanded.
5. **The "vibe" is the product.** The README, the demo video, the name — these matter as much as the code.

**This spec is a compass, not a blueprint.** It tells the AI agent *what* we're building and *why*. The *how* emerges from vibe-coding sessions.

---

## Terminology

- **openaxis-core** — the shared library: auth, MCP helpers, permissions, config
- **Node** — an independent app that optionally uses openaxis-core. Each Node is its own library/package.
- **Shell** — the React frontend library that provides a UI shell for loading Nodes

---

## The 7 Hard Rules (Non-Negotiable)

**Rule 1: Each Node Is Its Own Package.**
Every Node is a standalone package with its own `pyproject.toml`, its own dependencies, its own storage (if any). It can be installed and run independently. It MAY depend on `openaxis-core` but doesn't have to.

**Rule 2: Nodes Talk Through REST or MCP — Never Direct Imports.**
If the Trader needs articles from SigWire, it calls the SigWire REST API. It does NOT import SigWire's internals.

**Rule 3: If a Node Has Storage, It Owns That Storage.**
Not every Node needs a database. If a Node does need persistence, it owns its own storage. Nodes never share storage.

**Rule 4: Every Node Has a Health Endpoint.**

**Rule 5: Config Comes From Environment Variables Only.**

**Rule 6: Commit Messages Describe What Changed.**
Format: `{package}: {what changed}`

**Rule 7: No God Files.**
No file over ~300 lines. Split by concern.

**Rule 8: No Backwards Compatibility. Always an Upgrade Path.**
There is one version: the latest. Every breaking release ships with an upgrade script. AI agents can run these automatically.

---

## Soft Practices

**Smoke Test After Every Session:**
```bash
uvicorn openaxis_sigwire.app:app --port 8001
curl http://localhost:8001/health
```

**Tests for the Scary Parts Only:** LLM response parsing, Gatekeeper rule enforcement, auth token validation.

**Keep a CHANGELOG per package.** Append-only. Date + what shipped.

**The "Fresh Agent" Test:** Every few days, open a new AI chat. Paste this spec + current file tree. Ask: "What does this project do?" If it's confused, your structure has drifted.

---

## Vibe-Coding Session Template

```
1. DECIDE (30 sec)    — What's the ONE thing I'm building this session?
2. CONTEXT (2 min)    — Paste the target package files into the AI agent
3. BUILD (30-90 min)  — Let the AI generate. Run it. Fix it. Iterate.
4. SMOKE TEST (2 min) — Does the package start standalone? Health check?
5. COMMIT (1 min)     — git commit -m "sigwire: add HN scraper"
6. CHANGELOG (30 sec) — Append one line
7. STOP or LOOP
```

---

## Plain-English Summaries

### For Developers
OpenAxis is a set of composable libraries that turn the internet into secure, interchangeable building blocks for AI. Using MCP, it lets AI agents safely move between reading news, analyzing data, and executing financial actions — without being trapped in any single company's ecosystem.

The first app is **Signal in the Wire** (SigWire) — an AI-ranked news aggregator that scores articles on technical depth, market impact, and novelty. Each package works standalone or composes with others. Deploy anywhere.

### For Westy
Just `pip install openaxis-core` and you get auth and MCP for free. Build your Stock Correlation logic as a normal Python app, import the bits you need, and you've got a full product without being locked into expensive platforms.
