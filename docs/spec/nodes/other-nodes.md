# Starter Nodes — Trader, OpenData, Viz

## openaxis-trader (Action Node)

Subscribes to SigWire articles (via REST polling, event bus in Phase 5+), extracts tickers, runs technical + fundamental analysis, generates an LLM trade thesis, proposes trades for user approval.

**Data flow:**
```
Poll SigWire API for high-scoring articles
→ Extract ticker symbols
→ Fetch technicals via yfinance: RSI, MACD, Bollinger, Volume
→ Fetch fundamentals: P/E, revenue growth, sector data
→ LLM synthesizes trade thesis with confidence score
→ Constitutional Gatekeeper checks against user rules
→ If passes: notify user
→ User approves in UI → execute (paper trading for v0.1)
```

**Database tables:**
```sql
CREATE TABLE signals (
    id SERIAL PRIMARY KEY,
    article_id INT,
    ticker TEXT NOT NULL,
    direction TEXT NOT NULL,
    confidence FLOAT,
    thesis TEXT,
    technicals JSONB,
    fundamentals JSONB,
    gatekeeper_result JSONB,
    status TEXT DEFAULT 'proposed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    ticker TEXT NOT NULL,
    notes TEXT,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    signal_id INT REFERENCES signals(id),
    ticker TEXT NOT NULL,
    entry_price FLOAT,
    quantity FLOAT,
    status TEXT DEFAULT 'open',
    pnl FLOAT,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);
```

**v0.1 = Paper Trading Only. No real money.**

### Constitutional Gatekeeper

For financial actions, checks AI proposals against user-defined plain-English rules:
```json
[
  "Never allocate more than 5% of portfolio to a single position",
  "Require manual approval for any action over $500",
  "No crypto trades during weekends",
  "Block trades when article sentiment confidence is below 70%"
]
```

---

## openaxis-opendata (Utility Node)

Indexes and queries public datasets. Makes them available via REST + MCP.

**Initial connectors**: FRED, SEC EDGAR, data.gov, user-uploaded CSV/JSON.

**Key features**: Dataset registry with schema metadata, natural language search, auto-detect CSV/JSON column types.

**MCP resource**: `openaxis://opendata/datasets/{id}`

---

## openaxis-viz (Utility Node)

Modern BI / analytics tool. Traditional BI first, GenBI layer on top.

**No database needed.** Viz connects to external data sources (other Nodes, REST endpoints, CSV/JSON) — it doesn't store data, it renders it.

**Key features:**
- Traditional BI: connect data sources, drag-and-drop chart builder, filters, grouping
- GenBI layer: natural language queries, auto chart type selection
- Interactive charts via Recharts or Chart.js
- Export PNG/SVG, embeddable standalone URLs

**MCP tool**: `generate_chart(source_url, chart_type)`
