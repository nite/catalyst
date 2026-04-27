# Security Rules

- Never store secrets in code — use env vars and `.env` files
- All cross-Node data access goes through REST, never shared DB
- AI-proposed financial actions always require human approval
- Log everything via `openaxis.core.permissions.log_action`
- Validate all inputs at API boundaries with Pydantic
- Use parameterized queries — never string-interpolate SQL
- Rate-limit public endpoints
- Never expose stack traces in production error responses
