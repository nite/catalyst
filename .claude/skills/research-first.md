---
description: Research-first implementation rules and checklist.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.sql"
alwaysApply: true
---

# Research First - Always Find the Best Practice (CRITICAL)

**NEVER start implementing without researching the proper way to do it.**

## Mandatory Research Steps

| Step | Action | Why |
| --- | --- | --- |
| 1. Check official docs | Read the library or framework docs | Official docs show the intended way |
| 2. Search for native solutions | Look for built-in configs or APIs | Do not patch what has a proper solution |
| 3. Check recent versions | Verify newer versions or fixes | Avoid workarounds for solved problems |
| 4. Review similar patterns | Check @tractor, @nexus, existing code | Learn from proven implementations |
| 5. Consider trade-offs | Evaluate multiple approaches | Pick maintainable, not quick |

## Research Checklist

Before implementing ANY solution:

1. Did I read the official documentation for this library or framework?
2. Is there a native configuration option or API for this?
3. Are there newer versions that handle this better?
4. Have I checked how similar projects solve this?
5. Am I patching or workaround-ing something that should not need it?
6. Is there a simpler, more maintainable approach?

## Examples

```typescript
// BAD: Patching JavaScript bundle without researching
// Storybook: Patching globals-runtime.js to fix iframe URL
// (When Storybook might have proper config for subpath deployment)

// GOOD: Research shows proper approach
// Check Storybook docs for:
// - managerHead configuration option
// - previewUrl setting
// - base path configuration in Vite
// - GitHub Pages deployment guides

// BAD: Writing custom date formatter
function formatDate(date: Date): string {
  // 50 lines of custom date formatting...
}

// GOOD: Research shows dayjs is already in project
import dayjs from "dayjs";
const formatted = dayjs(date).format("YYYY-MM-DD");
```

## If No Clear Solution Exists

1. Document your research and why it did not work.
2. Ask the user with options and trade-offs.
3. Plan for change and make workarounds easy to remove.
4. Add comments explaining why this approach was necessary.

**Never implement a workaround without proving it is necessary.**
