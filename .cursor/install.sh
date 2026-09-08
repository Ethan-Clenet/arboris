#!/usr/bin/env bash
# One-time (idempotent) environment bootstrap for Arboris.
# Runs after the repository is checked out. Must terminate.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# 1. System packages needed to run PostgreSQL through Docker (nested container).
if ! command -v docker >/dev/null 2>&1 \
  || ! docker compose version >/dev/null 2>&1 \
  || ! command -v fuse-overlayfs >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    docker.io docker-compose-v2 fuse-overlayfs
fi

# 2. Node dependencies. The repo requires --legacy-peer-deps (see CI + vercel.json).
#    `postinstall` runs `prisma generate`.
npm install --legacy-peer-deps

# 3. Local environment file. Never overwrite an existing one.
if [ ! -f .env ]; then
  cp .env.example .env
  SECRET="$(openssl rand -hex 32)"
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=\"${SECRET}\"|" .env
  sed -i "s|^ARBORIS_WORKSPACE_ROOT=.*|ARBORIS_WORKSPACE_ROOT=\"${REPO_ROOT}\"|" .env
fi

# 4. Database: start Postgres, apply migrations, seed the catalogue.
bash .cursor/db-up.sh
npx prisma migrate deploy
npx prisma db seed

echo "Arboris install complete."
