---
name: docker-rebuild
description: Rebuild Docker sans cache après changement Dockerfile ou deps système.
---

# Docker rebuild (no cache)

1. Repère `docker-compose.yml` / `compose.yaml` / `Dockerfile*` à la racine (ou chemin indiqué).
2. Rebuild sans cache :
   ```bash
   docker compose build --no-cache
   ```
   (ou service ciblé : `docker compose build --no-cache <service>`).
3. Vérifie que les **variables d’env** attendues sont documentées (`.env.example`) — ne dump pas de secrets dans le chat.
4. Relance la stack (`docker compose up -d` ou équivalent projet) puis un **smoke** (`test`, healthcheck, curl local) si disponible.

En cas d’échec : coller l’erreur verbatim + hypothèse courte (couche cache, base image, réseau, secrets manquants).
