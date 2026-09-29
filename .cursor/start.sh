#!/usr/bin/env bash
# Per-boot reconciliation for Arboris. Must tolerate restarts and then return.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Safety net when a snapshot is missing generated state (fresh checkout).
if [ ! -d node_modules ]; then
  echo "node_modules missing — running npm install."
  npm install --legacy-peer-deps
fi

if [ ! -f .env ]; then
  cp .env.example .env
  SECRET="$(openssl rand -hex 32)"
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=\"${SECRET}\"|" .env
  sed -i "s|^ARBORIS_WORKSPACE_ROOT=.*|ARBORIS_WORKSPACE_ROOT=\"${REPO_ROOT}\"|" .env
fi

# Start the Docker daemon + Postgres (idempotent; installs Docker if missing).
bash .cursor/db-up.sh

# Apply any migrations added since the baseline snapshot (no-op when up to date).
npx prisma migrate deploy

# Seed only when the catalogue is empty (never wipe an existing database).
# `--env-file` is required: without DATABASE_URL the probe always fails and
# start would re-seed on every boot.
if ! node --env-file=.env -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.skill.count().then(n=>{p.\$disconnect();process.exit(n>0?0:1)}).catch(()=>process.exit(1))" >/dev/null 2>&1; then
  echo "Catalogue empty or unreachable — seeding."
  npx prisma db seed || true
fi

echo "Arboris start complete."
