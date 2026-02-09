---
description: Project structure and references.
globs:
  - "**/*"
alwaysApply: true
---

# Project Structure

The project structure is self-documenting - explore the codebase directly.

- compass/ - Core Python package (evaluation logic + FastAPI API)
- compass/api/ - FastAPI application and routes
- compass/core/ - Configuration and constants
- web/ - React frontend (Vite + TypeScript + shadcn/ui)
- web/src/ - Components, hooks, stores
- tests/ - Python tests (pytest)
- helm/ - Kubernetes Helm charts
- Makefile - Run make help for commands
- .pre-commit-config.yaml - Pre-commit hooks
- pyproject.toml - Python dependencies and tool config
- docker-compose.yml - Local development setup
