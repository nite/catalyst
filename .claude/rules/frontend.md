---
paths:
  - "frontend/**/*.{jsx,tsx,js,ts,css}"
  - "web/**/*.{jsx,tsx,js,ts,css}"
---

# Frontend Rules (React/Vite/Tailwind)

- React 19 with functional components and hooks
- Wrap all Node views in `<NodeWrapper>`
- Use Tailwind utilities only — no custom CSS files
- Dark mode palette: `gray-950` bg, `gray-100` text, `orange-500` internal, `blue-500` external
- Mobile-first: default styles are mobile, use `md:` and `lg:` for larger screens
- Use TanStack Query for all API calls
- Use Zustand store for cross-Node shared state
- Vite for bundling, no webpack
- File structure: one component per file, colocate hooks/utils with their feature
