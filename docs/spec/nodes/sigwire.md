# Signal in the Wire (SigWire)

**Full name**: Signal in the Wire  
**Short name**: SigWire  
**Package**: `openaxis-sigwire`  
**Category**: Intelligence

## What It Does

Scrapes tech/dev/finance news sources, scores each article with an LLM, surfaces the best articles in a ranked feed. Users can also publish their own blog posts into the feed.

## Sources

- Hacker News (official API: `https://hacker-news.firebaseio.com/v0/`)
- RSS feeds: Simon Willison, TLDR AI, Latent Space, AlphaSignal, The Batch
- Substacks: OxyKodit and others via RSS
- Techmeme (Playwright — add later)

## Database Tables

```sql
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    scraper_type TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    last_scraped TIMESTAMPTZ
);

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    source_id INT REFERENCES sources(id),
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    summary TEXT,
    score_technical FLOAT,
    score_market FLOAT,
    score_novelty FLOAT,
    score_overall FLOAT,
    llm_rationale TEXT,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    is_internal BOOLEAN DEFAULT false
);

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    external_url TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## LLM Ranking Prompt

```
You are a senior AI/software engineer and financial analyst.
Score each article 1-10 on three dimensions:

1. Technical Depth — does it contain implementation details, code, or architecture?
2. Market Impact — could this move a stock, sector, or funding round?
3. Novelty — is this genuinely new information vs. rehashed takes?

Weighting rules:
- 2x weight if the article mentions: latency optimization, RAG, agentic workflows,
  fine-tuning, token economics, regulatory changes, or open-source model releases
- 0.5x weight if the article is purely about AI company valuations or
  "AI will replace X" opinion pieces with no technical substance

Return ONLY valid JSON array:
[{"title": "...", "url": "...", "score_technical": N, "score_market": N,
  "score_novelty": N, "score_overall": N, "rationale": "..."}]
```

**Scraping interval**: Every 15 minutes (configurable). Cached for 4 hours to save LLM costs.

## Events Emitted (Phase 5+)

- `NEWS_FLASH` — when any article scores >= 8.0 overall
- `ARTICLE_RANKED` — when a new batch is scored

## MCP Endpoints

- Tool: `get_top_articles` — returns ranked articles
- Tool: `search_articles` — keyword search
- Resource: `openaxis://sigwire/trending`

## Frontend

- Mobile-first, single-column card feed (max-width 640px centered on desktop)
- Each card: rank number, title (links to source), source badge, score, upvote/bookmark
- Internal blog posts: orange left border + "Original" badge
- External articles: standard styling, link opens in new tab
- Admin page: split-pane editor on desktop, stacked on mobile
- Toggle between "Internal Blog" (markdown) and "Direct Link" (URL)
