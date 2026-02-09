# BI UX research + implementation notes

Date: 2026-02-08

## Scope
This document captures:
- Research sources and apps compared
- UX review themes relevant to Catalyst
- What has been implemented in this codebase
- Future plans and ideas

## Apps compared (2025-2026 context)
- Hex (https://hex.tech/)
- Sigma Computing (https://www.sigmacomputing.com/product)
- Metabase (https://www.metabase.com/product)
- Apache Superset (https://superset.apache.org/)
- Evidence (https://evidence.dev/)
- ThoughtSpot (https://www.thoughtspot.com/)
- Lightdash (https://www.lightdash.com/)

## UX review summary (themes to borrow)
- Conversational + assisted flow: natural language prompt to trusted answers, then pivot into interactive charts or apps.
- Answer -> explore -> app ladder: quick KPI answer, one-tap to a chart view, then a shareable view.
- Mobile-first card layouts: lightweight KPI cards and filter chips above the fold, drill-down on tap.
- Progressive disclosure: keep the first view clean; reveal filters and tables only when needed.
- Governance surfaced in UI: clear labels for sources, time coverage, and refresh cadence to build trust.
- Performance optics: fast paint, small transitions, and clear loading states to keep the system feeling responsive.


## What is implemented now
- Full-width, fullscreen layout shell with lighter header and no footer.
- Updated visual system: new fonts, teal color system, gradients, and softened card styling.
- Dataset viewer control bar with dataset and chart dropdowns for fast switching.
- Filters panel redesigned with mobile overlay behavior.
- Chart responsiveness updated to fit the new layout.
- Simple load animations (rise/fade) for hero and cards.
- Playwright tests for dataset browsing and switching.
- Basic web CI workflow for lint/build.

## Future plans and ideas (prioritized)
| Priority | Idea | Value | Effort |
| --- | --- | --- | --- |
| 1 | Filter chips row with quick remove and clear-all actions. | High | Low |
| 2 | Answer-first KPI strip that summarizes the dataset (row count, time range, max/min values) with inline trend deltas. | High | Medium |
| 3 | Dataset coverage panel (time range, geography, refresh cadence). | Medium | Low |
| 4 | Cache-first interactions: load data once, then reuse in-memory data to avoid server round-trips when users adjust filters or parameters. | High | Medium |
| 5 | Table column pinning and search inside the preview table. | Medium | Medium |
| 6 | Per-chart controls: per-chart filters and parameters (separate queries), plus chart clones for quick side-by-side comparisons. | High | High |
| 7 | Chart configuration drawer for advanced users (aggregation, grouping, and sorting). | Medium | High |
| 8 | Shareable insight cards (export PNG/SVG) and permalinked views. | Medium | Medium |
| 9 | Add Playwright tests for filters and table preview behavior. | Medium | Medium |
| 10 | CI: add Playwright to run against a preview environment. | Medium | Low |
| 11 | Exploration tools: instrument selector/stock screener, universe builder, and basket-level comparisons. | High | High |
| 12 | Currency agility: in-session FX conversion across regions and currencies after load, using stored FX rates. | Medium | High |
| 13 | Analytics depth: data aggregation, statistics, dynamic metrics, contributor drill-down, CBBO views, portfolios, and pre-canned reports. | High | High |
