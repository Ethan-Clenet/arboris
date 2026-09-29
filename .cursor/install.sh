#!/usr/bin/env bash
# One-time (idempotent) environment bootstrap for Arboris.
# Runs after the repository is checked out. Must terminate.
# Durable files only: system packages, node_modules, .env, cached Postgres image.
# Runtime (dockerd, Postgres, migrations, seed) belongs in start.sh.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# 1. System packages + cached Postgres image for nested Docker.
bash .cursor/db-up.sh --pull-image

# 2. Node dependencies. The repo requires --legacy-peer-deps (see CI + vercel.json).
#    `postinstall` runs `prisma generate` + `build:cli`.
if [ ! -d node_modules ]; then
  npm install --legacy-peer-deps
else
  npm install --legacy-peer-deps --no-audit --no-fund
fi

# 3. Local environment file. Never overwrite an existing one.
if [ ! -f .env ]; then
  cp .env.example .env
  SECRET="$(openssl rand -hex 32)"
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=\"${SECRET}\"|" .env
  sed -i "s|^ARBORIS_WORKSPACE_ROOT=.*|ARBORIS_WORKSPACE_ROOT=\"${REPO_ROOT}\"|" .env
fi

echo "Arboris install complete."
