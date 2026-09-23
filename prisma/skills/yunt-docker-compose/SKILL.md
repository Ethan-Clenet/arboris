---
name: yunt-docker-compose
description: >
  Docker Compose (Yunt Academy) : compose.yaml, services, depends_on/healthcheck,
  volumes/réseaux de projet, variables d’environnement, commandes up/down/logs
  et debug multi-conteneurs. À utiliser pour orchestrer une app locale multi-services.
metadata:
  origin: Yunt
  course: Conteneuriser ses projets web avec Docker
  source: https://academy.yunt.fr/dashboard/cours/cmta1lr1j000404l1qfs3kl25
---

# Yunt — Orchestrer avec Docker Compose

Compétences du cours Yunt Academy (Compose + multi-conteneurs), condensées pour un agent.

## When to Activate

- Plusieurs conteneurs liés (app + DB + cache…)
- Remplacer une longue série de `docker run`
- Partager un environnement reproductible (`compose.yaml`)
- Diagnostiquer un projet Compose qui ne démarre pas

## When not to use

- Un seul conteneur ponctuel → `yunt-docker-containers`
- Cluster multi-machines (Kubernetes, Swarm avancé) — hors scope de ce cours

## Concepts

- **Compose v2** : `docker compose` (plugin). Vérifier : `docker compose version`.
- Fichiers reconnus : `compose.yaml`, `compose.yml`, `docker-compose.y(a)ml`.
- La clé top-level `version:` est obsolète.
- **Projet** : préfixe des ressources (dérivé du dossier).
- **Service** : unité ; son nom = DNS sur le réseau du projet.
- Réseau de projet créé implicitement ; volumes nommés déclarés en bas de fichier.

## Exemple minimal

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 3s
      retries: 10

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://app:app@db:5432/app
    depends_on:
      db:
        condition: service_healthy

volumes:
  pgdata:
```

## Commandes

```bash
docker compose up -d          # créer / démarrer
docker compose ps
docker compose logs -f api
docker compose exec api sh
docker compose down           # stop + remove containers/réseau
docker compose down -v        # + volumes nommés du projet (destructif)
docker compose build --no-cache
```

## Bonnes pratiques

1. **Healthcheck + `depends_on.condition`** plutôt que `depends_on` simple (ordre ≠ prêt).
2. **`.env`** à côté du compose pour les substitutions `${VAR}` — ne pas committer les secrets.
3. **Bind mounts** pour le hot-reload en dev ; volumes nommés pour les data stores.
4. Un service = une responsabilité ; images taguées explicitement.
5. Sécurité locale : pas de ports DB exposés sur `0.0.0.0` sans besoin ; mots de passe de démo uniquement en local.

## Debug Compose

1. `docker compose ps` / `logs` du service qui échoue.
2. `docker compose config` — valider le YAML fusionné.
3. Vérifier le DNS : depuis `api`, l’hôte s’appelle `db`, pas `localhost`.
4. Rebuild si le Dockerfile a changé : `docker compose up -d --build`.

## Attribution

Contenu pédagogique condensé avec autorisation du créateur — Yunt Academy.
Cours : https://academy.yunt.fr/dashboard/cours/cmta1lr1j000404l1qfs3kl25
