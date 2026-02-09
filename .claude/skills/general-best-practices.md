---
description: General best practices and logging rules.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# General Best Practices

| Practice | Rule |
| --- | --- |
| Side effects | No side effects at import time - only define exports |
| Explicit > implicit | Explicit initialization, no magic or auto-config |
| Fail fast | Validate early, throw meaningful errors |
| Single responsibility | One thing well - if you say "and", split it |
| Composition > inheritance | Build from simple, composable pieces |
| Optimization | Clear code first, optimize when measured |
| Magic values | Use named constants with clear intent |
| Edge cases | Handle null, undefined, empty, error, loading states |
| Resource cleanup | useEffect cleanup, remove listeners, cancel subscriptions |
| Dependencies | Do not add packages for trivial functionality |
| Logging (CRITICAL) | loglevel (web), loguru (api) - never use console.* |
| Code quality | Run make format and make check before completing |
| Verification | Ensure code imports and app starts without errors |
| Refactoring | Refactor as you go - do not accumulate tech debt |
| When stuck | Redesign from first principles, do not patch broken approaches |
