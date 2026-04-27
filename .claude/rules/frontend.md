---
paths:
  - "packages/*/web/**/*.{jsx,tsx,js,ts,css}"
---

# Frontend Rules (React/Vite/Tailwind)

- React 19 with functional components and hooks
- Use Tailwind utilities only — no custom CSS files
- Dark mode palette: `gray-950` bg, `gray-100` text, `orange-500` internal, `blue-500` external
- Mobile-first: default styles are mobile, use `md:` and `lg:` for larger screens
- Use TanStack Query for all API calls
- Vite for bundling, no webpack
- File structure: one component per file, colocate hooks/utils with their feature
- Each app has its own frontend in `packages/{app}/web/`
