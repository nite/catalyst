---
description: Use established libraries, avoid reinventing utilities.
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.py"
alwaysApply: true
---

# Use Established Libraries - Do Not Reinvent the Wheel (CRITICAL)

**NEVER reimplement functions that exist in common libraries.**

| Never Do This | Always Do This |
| --- | --- |
| Custom string manipulation | Use lodash (startCase, camelCase, kebabCase) |
| Custom date formatting | Use dayjs (already in project) |
| Custom array utilities | Use lodash (groupBy, uniq, sortBy) |
| Custom deep clone or merge | Use lodash (cloneDeep, merge) |
| Custom data transformations | Use d3 for complex data operations |
| Custom observables | Use rxjs for reactive programming |
| Custom debounce or throttle | Use lodash (debounce, throttle) |

## Examples

```typescript
// BAD: Custom implementation
export function toTitleCase(text: string): string {
  return text
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// GOOD: Use lodash
import { startCase, toLower } from "lodash";

export function toTitleCase(text: string): string {
  return startCase(toLower(text));
}
```

## Before Writing Any Utility

1. Check lodash docs.
2. Check dayjs for date operations.
3. Check d3 for data transformations.
4. Check project dependencies.
5. Only then write custom code if domain-specific.
