---
description: Code style and language conventions.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# Code Style

## String Quotes

| Language | Convention | Example |
| --- | --- | --- |
| Python | Double quotes | "hello", f"value: {x}" |
| TypeScript or JavaScript | Single quotes | 'hello', `value: ${x}` |
| Docstrings | Triple double quotes | """Description.""" |

## Naming Conventions

| Type | Convention | Example |
| --- | --- | --- |
| Files | lowercase-dashes | evaluation-card.tsx, llm-service.py |
| Components | PascalCase | EvaluationCard, ExperimentList |
| Functions (TS) | camelCase | fetchEvaluations, buildOptions |
| Functions (Python) | snake_case | fetch_evaluations, build_options |
| Constants | SCREAMING_SNAKE | MAX_TOKENS, DEFAULT_MODEL |
| Types or Interfaces | PascalCase | EvaluationResult, ExperimentConfig |

## Python Import Organization (CRITICAL)

**ALL imports MUST be at the top of the file. NEVER use inline imports inside functions.**

```python
# GOOD: All imports at top of file
from __future__ import annotations

import asyncio
import base64
import time
from typing import Any

from compass.services.label_service import LabelService
from compass.services.pdsqi_service import get_cached_evaluation

# BAD: Import inside function
# def my_function():
#     from compass.services.label_service import LabelService
#     label_service = LabelService()
```

**Exceptions (rare)**:

- Avoiding circular imports (document why in comment).
- Type checking only imports (use if TYPE_CHECKING).
- Optional dependencies with try or except at module level.
