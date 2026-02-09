---
description: Testing strategy and requirements.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# Testing

## Requirements (CRITICAL)

Every new feature MUST include tests before completion. No TODOs for tests later.

## Backend Stack

- pytest, pytest-asyncio, pytest-mock, pytest-cov, httpx

## Frontend Stack

- Vitest, @testing-library/react, Storybook + Vitest, Playwright

## Component Testing (CRITICAL)

Use Storybook stories with play functions for component tests. Do not write standalone component tests in Vitest.

## Playwright (CRITICAL)

Always run headless unless user explicitly requests headed or debug.

## Red/Green Debugging Workflow (CRITICAL)

1. Create or update Playwright test that replicates the bug.
2. Run the test (must fail).
3. Fix the code.
4. Re-run the test (must pass).
5. Suggest running related tests to avoid regressions.

## Test Requirements for New Features

- Backend: unit and integration tests.
- Frontend: unit tests for utilities and hooks, E2E for workflows.

## Code Cleanup and Deduplication (CRITICAL)

Remove duplicate tests, dead code, unused imports, and commented-out code when editing files.
