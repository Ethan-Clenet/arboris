#!/usr/bin/env bash
# Per-boot reconciliation for Arboris. Must tolerate restarts and then return.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Start the Docker daemon + Postgres (idempotent).
bash .cursor/db-up.sh

# Apply any migrations added since the baseline snapshot (no-op when up to date).
npx prisma migrate deploy

# Seed only when the catalogue is empty (never wipe an existing database).
if ! node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.skill.count().then(n=>process.exit(n>0?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1; then
  echo "Catalogue empty or unreachable — seeding."
  npx prisma db seed || true
fi

echo "Arboris start complete."
