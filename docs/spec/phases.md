# OpenAxis — Build Phases

> **The golden rule: SigWire ships before anything else gets started.**

## Phase 1: OpenAxis Studio + SigWire (The Week)

**Goal**: A working dashboard you use to build and monitor everything else. SigWire is the first real node built inside it.

**Day 1 (Mon) — Studio skeleton + SigWire API:**
- [ ] `openaxis-studio`: React app — dev dashboard showing registered nodes, health status, API doc links
- [ ] `openaxis-sigwire`: FastAPI app with own SQLite DB
- [ ] HN scraper + RSS scraper (Simon Willison, TLDR AI, Latent Space)
- [ ] LLM ranker: score articles, return the best
- [ ] Studio shows SigWire as a registered node with health check

**Day 2 (Tue) — Feed UI + deploy:**
- [ ] Studio gets a feed view for SigWire (Reddit-style cards, mobile-first)
- [ ] Blog admin page: add internal posts, toggle Internal Blog / Direct Link
- [ ] Deploy Studio + SigWire to Render
- [ ] **Send the link to 5 people. Do they come back?**

**Day 3 (Wed) — MCP:**
- [ ] `openaxis-core`: MCP decorator library (`@mcp_tool`, `@mcp_resource`)
- [ ] SigWire exposed as MCP resources + tools
- [ ] Studio MCP server: `list_nodes()`, `get_node_schema()`, `scaffold_node()`
- [ ] Test with Claude Desktop / Cursor: "what are today's top AI stories?"
- [ ] **Record a 60-second demo**

**Day 4 (Thu) — Node Zero + MeanSky retrofit:**
- [ ] Studio pitch page: what OpenAxis is, what's built, roadmap
- [ ] Embed API docs (FastAPI gives this for free)
- [ ] Retrofit MeanSky as an OpenAxis node (add manifest, health endpoint, register in Studio)

**Day 5 (Fri) — Open Data Explorer:**
- [ ] `openaxis-opendata`: FRED API connector
- [ ] Natural language search for datasets
- [ ] Expose as MCP resource

**Day 6 (Sat) — GenBI Viz:**
- [ ] `openaxis-viz`: connect to Open Data, basic charting (Recharts)
- [ ] Traditional BI controls: pick a dataset, pick chart type, render
- [ ] Embeddable chart URLs

**Day 7 (Sun) — Polish + ship:**
- [ ] Studio polish + compelling pitch page
- [ ] API key onboarding wizard (Anthropic, Render, Koyeb keys)
- [ ] README, demo video (2 min), CHANGELOG
- [ ] **Post "Show HN" Monday morning**

---

### CHECKPOINT: Does anyone care?

Evaluate. If people are using it and the MCP demo gets traction, proceed. If not, iterate.

---

## Phase 2: Core Library Extraction (When needed)

Only when building the Trader or onboarding Westy.

- [ ] `openaxis-core`: auth library + its own SQLite DB
- [ ] `openaxis-core`: DB factory helper
- [ ] `openaxis-core`: permissions + audit logging
- [ ] Retrofit SigWire to use Core auth
- [ ] Publish `openaxis-core` to PyPI

## Phase 3: Signal Trader — Paper Trading Demo

Only if the MCP demo generated interest.

- [ ] `openaxis-trader`: own FastAPI app, own DB
- [ ] Poll SigWire API for high-scoring articles
- [ ] Technical analysis via yfinance
- [ ] LLM trade thesis generation
- [ ] Constitutional Gatekeeper
- [ ] **Record the full "Intelligence-to-Action" demo video**

## Phase 4: Studio Evolution

Grow from dev dashboard into the Lovable/Replit competitor.

- [ ] Embed **Sandpack** (CodeSandbox's open-source editor, MIT) for in-browser code editing
- [ ] Plain-English app scaffolding via Claude API → generates code in Sandpack → deploy
- [ ] One-click deploy to Render or Koyeb from the UI
- [ ] Import: paste a GitHub URL, or import from Lovable/Replit/Bolt
- [ ] Eject button: clone to GitHub, open in Cursor, never come back

## Phase 5: Community & Ecosystem

Only when someone else is actively trying to build a Node.

- [ ] Publish all packages to PyPI / npm
- [ ] Contributor docs
- [ ] Onboard Westy's Stock Correlations as first external Node
- [ ] **GitHub launch + Hacker News "Show HN" post**

## Phase 6: Capital Layer (With legal review + team)

- [ ] Open Banking integration (Plaid/TrueLayer) as new Node
- [ ] DeFi integration (Wagmi/Viem) as new Node
- [ ] Subscription/payments (Stripe)
- [ ] Helm chart for K8s deployment

---

## Launch Strategy

### The HN Play

Lead with the app, not the platform:

> **"Show HN: SigWire — an AI-ranked news feed you can query from Claude via MCP"**

People click on tools they can use today. The platform story comes out in the comments.

HN loves: open source replacing locked-in SaaS, solo dev "I built this" narratives, working demos, MCP (hot protocol right now), anti-vendor-lock-in. OpenAxis hits all of these — but only if SigWire is live and useful.

### The Demo Video

1. Ask Claude via MCP: "What are today's top AI stories on SigWire?"
2. Claude reads the feed via `openaxis://sigwire/trending`
3. Claude identifies a high-impact story
4. Claude calls `propose_trade` MCP tool
5. Gatekeeper checks against user rules
6. User approves in the Shell UI

Record as a 2-minute screen recording.

---

## OpenAxis as Node Zero

The project site is itself an OpenAxis node — built with the same libraries, queryable via MCP.

**The OpenAxis MCP Server** lets developers connect from Cursor/Claude Code and get:

- `scaffold_node(name, category, description)` → generates a complete node package
- `scaffold_plugin(type, name)` → generates a plugin skeleton
- `list_nodes()` → all known nodes with status and API URLs
- `get_node_schema(node_id)` → manifest, endpoints, MCP tools
- `submit_plugin(repo_url, description)` → register a new plugin
- `create_pull_request(...)` → format and submit a PR to the core repo
