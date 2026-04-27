# OpenAxis Plan Status Review

As of 2026-04-27, this is a docs-first review of where execution currently stands versus the published OpenAxis plan.

## Current Status

- The specification docs define a broad multi-node platform vision (`core`, `sigwire`, `meansky`, `trader`, `opendata`, `viz`, `shell`).
- `docs/progress.md` currently reports Phases A-E as complete.
- Repository structure does not yet fully match that completion claim:
  - `packages/sigwire` exists.
  - `packages/core` and `packages/shell` are not present.
  - `backend/` and `frontend/` directories still exist.

## Current-State Review

### 1) Status Drift (High Risk)

- Claimed completion in `docs/progress.md` is ahead of verifiable repo state.
- Risk: roadmap and delivery decisions are made from inaccurate assumptions.

### 2) Architecture Ambiguity (High Risk)

- Spec and rules point to `packages/*` node architecture.
- Existing repo still includes legacy-style `backend/` + `frontend/`.
- Risk: duplicate effort and unclear source of truth.

### 3) MCP Readiness Gap (Medium Risk)

- SigWire manifest advertises MCP tools/resources.
- End-to-end MCP implementation is not clearly reflected in current code paths.
- Risk: demo/documentation promises may exceed runtime behavior.

### 4) Plan Document Semantics (Medium Risk)

- `docs/spec/phases.md` is still mostly a strategic checklist.
- `docs/progress.md` reads as fully completed retrospective.
- Risk: unclear distinction between aspirational and verified status.

## Suggested Next Steps

### Priority 1: Re-baseline progress documentation

- Update `docs/progress.md` to "verified as-of date" status.
- Split sections into:
  - Done (verified in repo)
  - In progress
  - Planned
- Link each "done" item to concrete proof paths (files/tests/endpoints).

### Priority 2: Publish architecture decision

- Declare whether active track is:
  - `packages/*` node architecture, or
  - temporary continuation of `backend/` + `frontend/`.
- If migrating, publish explicit deprecation/migration timeline.

### Priority 3: Lock a true Phase 1 ship checklist

- Validate a minimal SigWire ship path end to end:
  - `/health`
  - scrape + rank cycle
  - article feed path
  - basic blog publish/read
- Document commands and expected outputs.

### Priority 4: Align MCP scope to current milestone

- Either implement MCP fully for the active milestone, or
- mark MCP items as upcoming and remove "complete" language.

### Priority 5: Add one source-of-truth status page

- Maintain a concise status doc with:
  - current milestone
  - completion by workstream
  - blockers
  - next 7-day goals

## Immediate Execution Order

1. Documentation truth pass (same day)
2. Architecture decision note (same day)
3. SigWire launch checklist verification (1-2 days)
4. MCP implementation or scope correction (next)
