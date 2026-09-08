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

# 1. Start the Docker daemon if it is not already running.
if ! sudo docker info >/dev/null 2>&1; then
  sudo mkdir -p /etc/docker
  if [ ! -f /etc/docker/daemon.json ]; then
    echo '{"iptables":false,"bridge":"none","features":{"containerd-snapshotter":false},"storage-driver":"fuse-overlayfs"}' \
      | sudo tee /etc/docker/daemon.json >/dev/null
  fi
  sudo nohup dockerd >/tmp/dockerd.log 2>&1 &
  for _ in $(seq 1 30); do
    sudo docker info >/dev/null 2>&1 && break
    sleep 1
  done
fi

# 2. Let the repo's npm scripts (`npm run db:up`, etc.) talk to Docker without sudo.
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

# 3. Bring up the Postgres container (published on host port 5433).
docker compose up -d

# 4. Wait until Postgres reports healthy before returning.
for _ in $(seq 1 60); do
  status="$(docker inspect --format '{{.State.Health.Status}}' arboris-postgres 2>/dev/null || echo starting)"
  [ "$status" = "healthy" ] && break
  sleep 2
done

echo "PostgreSQL is up (host port 5433)."
