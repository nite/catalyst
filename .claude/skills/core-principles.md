---
description: Core engineering principles and type safety.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.sql"
alwaysApply: true
---

# Core Principles

## Choose the Right Data Structure

**Well-chosen data structures simplify code and eliminate bugs.**

- Use typed tuples or dataclasses instead of parallel lists or magic indices.
- Use dicts with composite keys (id, type) instead of nested dicts.
- Use sets for membership tests instead of item in list.
- Use enums for fixed options instead of string constants.
- Model the domain accurately - if something can be None, make it Optional[T].

```python
# BAD: Complex index management, easy to get wrong
citations_by_item = {}
missing_by_item = {}
for key in annotations:
    parts = key.split("_")
    item_idx = int(parts[1])
    # Complex logic to track which list to use...

# GOOD: Single dict with typed composite key
LookupKey = tuple[tuple[int, ...], int | None, bool]  # (path, citation_idx, is_missing)
annotations: dict[LookupKey, Annotation] = {}
key = (tuple([item_idx]), citation_idx, False)
annotation = annotations[key]
```

## Type Safety First

- TypeScript: strict mode, no any unless absolutely necessary.
- Python: full type hints on all functions, use Final for constants.
- Validate at boundaries: Pydantic for API, Zod for web forms.

## DRY - Do Not Repeat Yourself

- Extract shared logic into functions, hooks, or services.
- Centralize constants in dedicated files.
- Share types between web and api where possible.

## Separation of Concerns

- API: business logic, LLM orchestration, evaluation execution.
- Web: UI state, formatting, user interactions.
- Never format dates in api - return ISO 8601 and format in web.

## API-Driven Architecture (CRITICAL)

**API = source of truth for domain logic. Web = presentation only.**

| API (Business Logic) | Web (Presentation) |
| --- | --- |
| LLM orchestration | API calls, response handling |
| Evaluation execution and scoring | UI state, user interactions |
| Experiment management | Number and date formatting for display |
| Dataset processing | Component rendering, layout |
| Result aggregation | Sorting and filtering fetched data |

## Immutability and Pure Functions (CRITICAL)

**Never mutate input data. Always return new data structures.**

| Mutating | Immutable |
| --- | --- |
| array.sort() | array.toSorted() or [...array].sort() |
| array.push(x) | [...array, x] |
| array.splice() | array.toSpliced() or array.filter() |
| object.prop = x | { ...object, prop: x } |
