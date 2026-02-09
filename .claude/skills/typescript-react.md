---
description: TypeScript, React, and web patterns.
globs:
  - "**/*.ts"
  - "**/*.tsx"
alwaysApply: true
---

# TypeScript and React

## Component Patterns

```typescript
// Functional components with explicit return types
export function EvaluationCard({ result }: EvaluationCardProps): JSX.Element {
  if (!result) return <Skeleton className="h-48" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{result.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <MetricsChart data={result.metrics} />
      </CardContent>
    </Card>
  );
}

// Custom hooks - prefix with use
export function useEvaluations() {
  return useQuery({
    queryKey: ["evaluations"],
    queryFn: fetchEvaluations,
    staleTime: 5 * 60 * 1000,
  });
}

// Named exports only - no default exports
export { EvaluationCard, useEvaluations };
```

## Rules of Hooks (CRITICAL)

1. Only call hooks at the top level.
2. Only call hooks from React functions.
3. Hooks must be called in the same order on every render.

**All hooks before any early returns.**

```typescript
// BAD: Early return before hooks
function MyComponent({ isLoading }) {
  const data = useQuery(...);

  if (isLoading) {
    return <Skeleton />;
  }

  const store = useStore();
  const ref = useRef(null);

  return <div>Content</div>;
}

// GOOD: All hooks called unconditionally
function MyComponent({ isLoading }) {
  const data = useQuery(...);
  const store = useStore();
  const ref = useRef(null);

  if (isLoading) {
    return <Skeleton />;
  }

  return <div>Content</div>;
}
```

## State Management

| State Type | Tool | Example |
| --- | --- | --- |
| Server state | TanStack Query | API calls, cached data |
| Client state | Zustand | UI preferences, filters |
| Derived state | useMemo | Computed values |

## State Persistence (CRITICAL)

Use Zustand with persist middleware for user preferences.

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ExperimentState {
  selectedExperiment: string | null;
  setSelectedExperiment: (id: string | null) => void;
}

export const useExperimentStore = create<ExperimentState>()(
  devtools(
    persist(
      (set) => ({
        selectedExperiment: null,
        setSelectedExperiment: (id) => set({ selectedExperiment: id }),
      }),
      { name: "compass-experiment" }
    ),
    { name: "ExperimentStore" }
  )
);
```

## Zustand Subscriptions (CRITICAL)

Read fresh state at execution time with getState().

```typescript
useStore.subscribe(
  (state) => state.annotations,
  async () => {
    const freshState = useStore.getState();
    await saveToAPI(freshState.annotations);
  }
);
```

## Query Key Factory

```typescript
export const queryKeys = {
  all: ["compass"] as const,
  evaluations: () => [...queryKeys.all, "evaluations"] as const,
  evaluation: (id: string) => [...queryKeys.evaluations(), id] as const,
  experiments: () => [...queryKeys.all, "experiments"] as const,
  experiment: (id: string) => [...queryKeys.experiments(), id] as const,
};
```
