---
description: Git operations rules.
globs:
  - "**/*"
alwaysApply: true
---

# Git Operations (CRITICAL)

**NEVER run git commands or request git_write permissions.**

- Do NOT run `git add`, `git commit`, `git push`, `git checkout`, etc.
- Do NOT request git_write or ["all"] permissions for git operations.
- Make all file changes as requested.
- Run tests, linters, formatters, builds.
- The user handles all git operations manually.

**Why**: The user prefers to review all changes before committing and wants full control over git history.
