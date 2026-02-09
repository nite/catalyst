---
description: Constants and configuration rules.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# Constants and Configuration (CRITICAL)

All magic strings, numbers, and configuration values MUST be centralized.

- Backend: api/compass_api/core/constants.py
- Frontend: web/src/lib/constants.ts

## Backend Constants Pattern

```python
from typing import Final

class LLMDefaults:
    """Default LLM configuration values."""
    MODEL: Final[str] = "gpt-4o"
    MAX_TOKENS: Final[int] = 4096
    TEMPERATURE: Final[float] = 0.0
```

## Frontend Constants Pattern

```typescript
export const LLM_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "claude-3-5-sonnet",
  "claude-3-5-haiku",
] as const;
export type LLMModel = (typeof LLM_MODELS)[number];
```
