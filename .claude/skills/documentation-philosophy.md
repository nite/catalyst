---
description: Documentation rules and markdown placement.
globs:
  - "**/*"
alwaysApply: true
---

# Documentation Philosophy (CRITICAL)

**Code and config files ARE the documentation. Do not create redundant docs.**

## Documentation Rules

| Do Document | Do Not Document |
| --- | --- |
| Inline comments for complex logic | Separate files duplicating config |
| Docstrings for functions or classes | Tool summaries (redundant) |
| README.md for high-level overview ONLY | Command lists (use make help) |
| Architecture decisions in code | Config explanations (self-documenting) |

## Where to Put Documentation

| Content Type | Location | Example |
| --- | --- | --- |
| High-level overview | README.md | What is Compass, key features, quick start |
| Commands | Makefile | Run make help to see all commands |
| Architecture decisions | Code comments | Why a specific pattern was chosen |
| API documentation | Docstrings | Function or class behavior and parameters |

## Markdown Files (CRITICAL)

**NEVER create markdown files in code directories (e.g., web/e2e/, web/src/components/).**

**NEVER reference docs/local/ in committed files (README, code, etc.) - this directory is gitignored.**

| Wrong | Correct |
| --- | --- |
| web/e2e/README.md | Do not create - use code comments |
| web/src/components/ui/component.test.md | Do not create - use code comments |
| web/e2e/README-FEATURE.md | Do not create - use code comments |
| README.md linking to docs/local/ | Do not link - docs/local/ is gitignored |

**Exceptions**:

- README.md at project root - high-level overview only
- docs/*.md (checked in) - architecture or setup guides that need version control

## Learning From the Codebase

- Read existing code for consistency.
- Not all existing code is perfect - find best examples.
- Do not perpetuate bad patterns.
- Check multiple files to identify consistent patterns.
- Reference @tractor and @nexus for proven patterns.
