---
description: Code quality checks and functional transformations.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# Code Quality Checks (CRITICAL)

## Pre-Completion Checklist

- Run `make format`.
- Run `make check`.

### React Hooks Linter (TypeScript/React changes)

- Run `cd web && npm run lint:hooks`.

### Smoke Tests (TypeScript changes)

- Run `cd web && npm run test:smoke`.

### Syntax Validation

- Python: no SyntaxError or IndentationError on import.
- TypeScript: no compilation errors.

## Functional Transformations (CRITICAL)

Always use map() and comprehensions instead of loops with push or append.

```typescript
// GOOD: Array.map()
const scores = results.map((r) => r.score);

// BAD: forEach with push
const scores: number[] = [];
results.forEach((r) => scores.push(r.score));
```

```python
# GOOD: List comprehension
scores = [r.score for r in results]

# BAD: Empty list + append
scores = []
for r in results:
    scores.append(r.score)
```
