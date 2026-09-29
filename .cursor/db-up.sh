#!/usr/bin/env bash
# Idempotently bring up the local PostgreSQL used by Arboris.
#
# The Cloud Agent VM is itself a container, so Docker runs "nested". The default
# overlay storage driver cannot mount overlay-on-overlay, so the daemon is
# configured to use fuse-overlayfs. iptables/nftables management is disabled
# (published ports still work through docker-proxy).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

ensure_docker_packages() {
  if command -v docker >/dev/null 2>&1 \
    && docker compose version >/dev/null 2>&1 \
    && command -v fuse-overlayfs >/dev/null 2>&1; then
    return 0
  fi
  sudo apt-get update -qq
  # `--force-conf{old,def}` keeps existing conffiles (e.g. /etc/fuse.conf that the
  # base image already ships) instead of triggering an interactive dpkg prompt,
  # which would abort the non-interactive install.
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
    -o Dpkg::Options::="--force-confold" \
    -o Dpkg::Options::="--force-confdef" \
    docker.io docker-compose-v2 fuse-overlayfs
}

ensure_dockerd() {
  if sudo docker info >/dev/null 2>&1; then
    return 0
  fi
  sudo mkdir -p /etc/docker
  if [ ! -f /etc/docker/daemon.json ]; then
    echo '{"iptables":false,"bridge":"none","features":{"containerd-snapshotter":false},"storage-driver":"fuse-overlayfs"}' \
      | sudo tee /etc/docker/daemon.json >/dev/null
  fi
  sudo nohup dockerd >/tmp/dockerd.log 2>&1 &
  for _ in $(seq 1 30); do
    sudo docker info >/dev/null 2>&1 && return 0
    sleep 1
  done
  echo "dockerd failed to become ready. Last log lines:" >&2
  tail -n 40 /tmp/dockerd.log >&2 || true
  return 1
}

ensure_docker_packages
ensure_dockerd

# Let the repo's npm scripts (`npm run db:up`, etc.) talk to Docker without sudo.
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

if [ "${1:-}" = "--pull-image" ]; then
  docker pull postgres:16-alpine
  echo "postgres:16-alpine image cached."
  exit 0
fi

# Bring up the Postgres container (published on host port 5433).
docker compose up -d

# Wait until Postgres reports healthy before returning.
status="starting"
for _ in $(seq 1 60); do
  status="$(docker inspect --format '{{.State.Health.Status}}' arboris-postgres 2>/dev/null || echo starting)"
  [ "$status" = "healthy" ] && break
  sleep 2
done

if [ "$status" != "healthy" ]; then
  echo "PostgreSQL did not become healthy (status=${status})." >&2
  docker compose ps >&2 || true
  docker logs arboris-postgres >&2 || true
  exit 1
fi

echo "PostgreSQL is up (host port 5433)."
