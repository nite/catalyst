---
description: Tailwind, shadcn/ui, and UI/UX rules.
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.css"
alwaysApply: true
---

# Tailwind and UI/UX

## shadcn/ui Components

Always use shadcn/ui components from @/components/ui/.

## Styling Best Practices

- Use Tailwind utilities with cn() for conditional classes.
- Use semantic colors (bg-background, text-foreground).
- Avoid hardcoded colors.

## Text Alignment (CRITICAL)

**All text content MUST be left-aligned. Never use text-center.**

## cn() Utility (CRITICAL)

Always use cn() to combine class names.

## Required UI States

Always implement loading, error, empty, and data states for async operations.

## Tooltip for Truncated Text (CRITICAL)

Use Tooltip around truncated text to show full content.

## Adaptive Hover Delays (CRITICAL)

Use adaptive delays for hover previews: 800ms initial, 300ms scanning, reset after 10s idle.

## Interactive Hover States (CRITICAL)

Use consistent blue hover styles for interactive elements.

## Tooltips for Disabled Elements (CRITICAL)

Disabled interactive elements MUST have a tooltip explaining why and how to enable.

## Filter UI Patterns (CRITICAL)

- 2-4 options with short labels: checkbox-style buttons.
- 5+ options or long labels: dropdown select.
- Multi-select: checkbox list.

## Full-Height Layout (CRITICAL)

Use 100% viewport height with independent scrolling regions.

## Avoid Redundant Borders (CRITICAL)

Do not create double borders. Use background colors for inner elements.
