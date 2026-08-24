---
name: n8n-patterns
description: n8n workflow patterns for self-hosted automation — Docker Compose, credentials, webhooks, error workflows, queue mode, and idempotent HTTP/API jobs.
metadata:
  origin: ECC
---

# n8n Patterns

Production-grade n8n workflows: self-host with Docker, keep secrets out of JSON, and fail safely.

## When to Activate

- Scaffolding or reviewing an n8n instance (Docker Compose, reverse proxy, env)
- Designing a workflow (webhook, cron, queue, HTTP, error branch)
- Wiring credentials, `$env`, or third-party APIs
- Debugging failed executions, retries, or duplicate runs
- Moving from n8n Cloud to self-host (or the reverse)

## Core Principles

1. **Workflows are integration glue**, not the system of record. Persist business state in your app/DB; n8n orchestrates.
2. **Credentials never live in workflow JSON.** Use n8n Credentials + `$env`. Treat exported workflows as public code.
3. **Every inbound webhook is an API.** Authenticate (header/HMAC), validate payload, respond fast, work async.
4. **Executions must be idempotent.** Retries and duplicate webhooks are normal. Key off an external id.

## Self-host with Docker Compose

Minimum viable stack: n8n + named volume. Set a stable encryption key before the first start — rotating it later orphan credentials.

```yaml
# docker-compose.yml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=${N8N_PROTOCOL:-http}
      - WEBHOOK_URL=${WEBHOOK_URL:-http://localhost:5678/}
      - GENERIC_TIMEZONE=${GENERIC_TIMEZONE:-Europe/Paris}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
    volumes:
      - n8n_data:/home/node/.n8n
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:5678/healthz || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  n8n_data:
```

### Production checklist

- Put n8n behind TLS (Caddy/Traefik/nginx). Set `N8N_PROTOCOL=https`, `N8N_HOST`, and `WEBHOOK_URL=https://n8n.example.com/`.
- Never publish `5678` on the public internet without auth + TLS.
- Pin the image tag (`1.x.y`), do not run `:latest` in prod.
- Persist `n8n_data` (and Postgres if you switch off SQLite).
- Store `N8N_ENCRYPTION_KEY` in the secret manager / `.env` (not in git). Losing it makes stored credentials unreadable.
- Enable execution pruning (`EXECUTIONS_DATA_PRUNE`) so the volume does not grow forever.

### Queue mode (when one process is not enough)

Use Redis + a main process + worker(s) when webhooks or cron jobs pile up:

- `EXECUTIONS_MODE=queue`
- Dedicated Redis service
- One `n8n` main (UI + webhooks) and one or more `n8n worker` containers
- Same `N8N_ENCRYPTION_KEY` and database on every process

Do not enable queue mode until Postgres (not SQLite) is the execution store.

## Credentials and configuration

```text
PASS:  Credential store in n8n UI + expressions like {{ $env.APP_BASE_URL }}
FAIL:  API key hardcoded in an HTTP Header Auth node or a Code node string
FAIL:  Database password in a Set node “for debugging”
```

- Create one credential per environment (dev / staging / prod), never reuse prod keys in test workflows.
- Prefer Header Auth / HMAC on **Webhook** nodes. Disable “unauthenticated” webhooks in production.
- Restrict which workflows can be triggered by the public URL; unpublish unused ones.
- When exporting/sharing a workflow, confirm the JSON has no `data` pin with live PII or tokens.

## Workflow shape

### Default layout

1. **Trigger** — Webhook, Schedule, or app trigger (not a polling loop of HTTP Request nodes).
2. **Validate** — IF / Filter / JSON Schema. Reject garbage before side effects.
3. **Idempotency** — Look up external id (order id, Stripe event id). Stop if already processed.
4. **Work** — Native nodes first (HTTP Request, Code only when a node is missing).
5. **Respond** — Webhook response quickly (200) then continue, or return after the job if the client waits.
6. **Error** — Error Trigger workflow or `onError` continue + notify. Never fail silently.

### Native nodes vs Code

- Use **HTTP Request** + credentials for APIs. Use **Code** for small transforms, not entire integrations.
- Batch with **Split In Batches** + **Wait** when hitting rate limits. Do not fire 10k HTTP requests in one node.
- Prefer **IF** / **Switch** over nested JavaScript in Code nodes so the graph stays reviewable.

### Expressions

```text
{{ $json.id }}
{{ $env.INVOICE_API_URL }}/v1/invoices
{{ $now.toISO() }}
```

Keep expressions short. If you need more than a few lines, move to a Code node with tests (pin input data).

## Webhooks

- Production URL comes from `WEBHOOK_URL`, not from localhost copied out of the editor.
- Use the **production** webhook path after the workflow is active. Test URL is for the editor only.
- Verify signatures when the provider sends them (Stripe, GitHub, Shopify). Reject on mismatch.
- Respond `2xx` only after the payload is accepted (validated + queued), not after every downstream API succeeded — or document that the client must retry.

## Error handling and retries

- Attach an **Error Trigger** workflow: capture `$json.execution`, workflow name, last node, notify Slack/email, do not loop.
- Enable retries on HTTP Request with backoff. Cap attempts.
- On “continue on fail”, branch with IF on `$json.error` — do not process empty items as success.
- For payment / stock / email-send, compensate or mark a dead-letter instead of blindly retrying a non-idempotent POST.

## Idempotency

Pick a natural key (provider event id, `(source, externalId)`). Before mutating:

1. Read your DB / a static data store / n8n static data keyed by that id.
2. Skip if seen.
3. Write the key **before** or **in the same transaction as** the side effect, depending on the store.

Do not rely on “n8n won’t call the webhook twice.”

## Security

- Least privilege on API tokens (read-only when the workflow only reads).
- No `eval` / dynamic `new Function` on untrusted webhook bodies in Code nodes.
- Treat incoming files as untrusted; scan or store outside the n8n container if possible.
- Lock down the editor (`N8N_BASIC_AUTH_*` or SSO). The UI is admin.
- Review community nodes like any third-party dependency before installing.

## Anti-patterns

```text
BAD:  Cron that polls every 5s instead of a webhook
BAD:  One 80-node mega-workflow for all domains — split by bounded context
BAD:  Storing customer PII in execution logs longer than needed
BAD:  Editing production workflows by hand with no export / git backup
BAD:  Calling production APIs from a pinned test execution
```

## When not to use n8n

- Core product business logic that belongs in the application service
- High-throughput, latency-critical paths (use the app + a queue)
- Multi-tenant customer workflows that need a proper workflow engine SLA — evaluate before betting the product on n8n
