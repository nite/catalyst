# OpenAxis — Deployment

## Principle: Build Locally, Deploy Anywhere

OpenAxis apps are built on your machine and deployed with a git push. No platform lock-in.

**Why Render and Koyeb?** Both have free tiers that work for real apps. Both deploy from a git push. Both support Python web services natively, persistent disks, and have config simple enough for an AI agent to generate in one pass.

Everything else (Railway, Fly.io, DigitalOcean, bare metal, K8s) will also work — Render and Koyeb are the first-class targets with configs in the repo.

## Local Dev (Docker Compose)

```bash
docker compose up           # Everything
docker compose up sigwire   # Just Signal in the Wire
```

## Render (Free Tier)

```yaml
# render.yaml
services:
  - type: web
    name: openaxis-sigwire
    runtime: python
    buildCommand: cd packages/sigwire && pip install -e .
    startCommand: uvicorn openaxis.sigwire.app:app --host 0.0.0.0 --port $PORT
    disk:
      name: sigwire-data
      mountPath: /app/data
      sizeGB: 1
    envVars:
      - key: SIGWIRE_DATABASE_URL
        value: sqlite+aiosqlite:///app/data/sigwire.db
      - key: LLM_API_KEY
        sync: false

  - type: web
    name: openaxis-shell
    runtime: static
    buildCommand: cd packages/shell && npm ci && npm run build
    staticPublishPath: packages/shell/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

## Koyeb (Free Tier)

```yaml
# koyeb.yaml
name: openaxis-sigwire
services:
  - name: sigwire
    type: web
    git:
      repository: github.com/youruser/openaxis
      branch: main
      build_command: cd packages/sigwire && pip install -e .
      run_command: uvicorn openaxis.sigwire.app:app --host 0.0.0.0 --port 8001
    instance_types:
      - type: nano
    ports:
      - port: 8001
        protocol: http
    env:
      - key: SIGWIRE_DATABASE_URL
        value: "sqlite+aiosqlite:///data/sigwire.db"
      - key: LLM_API_KEY
        value: "${LLM_API_KEY}"
```

## Install Standalone

```bash
pip install openaxis-sigwire
SIGWIRE_DATABASE_URL=sqlite+aiosqlite:///sigwire.db LLM_API_KEY=sk-ant-... \
  uvicorn openaxis.sigwire.app:app
```

## Secrets Escalation

| Stage | Method |
|-------|--------|
| Local dev | `.env` file |
| Render/Koyeb | Platform env vars / secrets manager |
| K8s production | HashiCorp Vault + mTLS |

## Security Model

- JWT-based auth with access + refresh tokens, OAuth2 (Google, GitHub), API keys
- RBAC: `admin`, `user`, `viewer`, `api_consumer`
- Nodes declare `requires`/`grants` in manifest; Permission Proxy enforces at API level
- Every cross-Node call and financial action is logged in Core's audit table
- Never store secrets in code — use env vars
- All cross-Node data access via REST only, never shared DB
- AI-proposed financial actions always require human approval
