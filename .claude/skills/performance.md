---
description: Performance optimization checklist.
globs:
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# Performance Optimization (CRITICAL)

## API Request Optimization

- Combine related data into single endpoints.
- Parallelize independent requests.
- Use React Query caching with proper staleTime.

## API Performance

- Parallelize I/O (asyncio.gather).
- Cache expensive operations.

## React Query Best Practices

- Use staleTime and gcTime appropriately.
- Avoid refetch on every render.

## Performance Checklist

- Minimize API requests.
- Use caching for stable data.
- Avoid unnecessary re-renders.
- Virtualize large lists (>100 items).
- Measure before and after optimization.
