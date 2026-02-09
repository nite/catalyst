---
description: Annotation UI behavior rules.
globs:
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# Annotation UI Rules (CRITICAL)

## Annotation Panel Collapse Rules

Panels only collapse when complete. Complete = all questions either PASS or FAIL with comment.

| Panel Type | Complete When | Incomplete When | Behavior |
| --- | --- | --- | --- |
| Citation | PASS (any comment) OR FAIL with comment | FAIL without comment OR no rating | Collapse if complete, expand if incomplete |
| Summary Item | ALL citations complete AND missing citations complete | ANY citation incomplete OR missing citations incomplete | Collapse if complete, expand if incomplete |
| Rubric Criterion | PASS (any comment) OR FAIL with comment | FAIL without comment OR no rating | Collapse if complete, expand if incomplete |

Implementation rules:

- Apply on initial load (from stored annotations).
- Reapply on reload (useEffect watching annotations.updatedAt).
- User can manually override by clicking chevrons.
- Auto-collapse on PASS rating (preserve existing behavior).
- Derived criteria (citations, no_potential_harm) never auto-collapse.

## Annotation Save Behavior (CRITICAL)

All annotation edits MUST post to the API.

| Interaction | Save Trigger | Notes |
| --- | --- | --- |
| PASS or FAIL change | Immediately on selection | Always persist new rating |
| Comment edits | On textarea blur | Do not save on every keystroke |
| Label changes | Immediately on change | Treat as full update |

Use local draft comment state and call the save handler in onBlur.

## Data Consistency Across Views (CRITICAL)

Same data must be displayed consistently across all UI contexts.

- Same data source.
- Same calculation for derived values.
- Context-appropriate format.
- Synchronized updates.
