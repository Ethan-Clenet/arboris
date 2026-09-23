---
name: yunt-docker-images-build
description: >
  Images Docker et Dockerfile (Yunt Academy) : pull/tag/push, couches, écriture
  d’un Dockerfile, multi-stage, cache, .dockerignore, optimisation taille et
  sécurité de base. À utiliser pour builder, tagger, publier ou alléger une image.
metadata:
  origin: Yunt
  course: Conteneuriser ses projets web avec Docker
  source: https://academy.yunt.fr/dashboard/catalogue
---

# Yunt — Images & Dockerfile

Compétences du cours Yunt Academy (images, premier Dockerfile, optimisation), condensées pour un agent.

## When to Activate

- Comprendre tags, digests, couches et registre
- Écrire ou revoir un Dockerfile
- Accélérer les builds (cache) et réduire la taille
- Publier une image (`tag` / `push`)

## When not to use

- Seulement lancer un conteneur depuis une image existante → `yunt-docker-containers`
- Orchestration multi-services → `yunt-docker-compose`

## Images & registre

```bash
docker pull nginx:alpine
docker images
docker tag nginx:alpine moncompte/nginx:dev
docker push moncompte/nginx:dev
docker rmi moncompte/nginx:dev
```

- **Tag** : alias mutable (`latest` est dangereux en prod).
- **Digest** (`@sha256:…`) : référence immuable.
- Les couches partagées évitent de re-télécharger le commun.

## Dockerfile — structure minimale

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app

# Dépendances (couche cache)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Code
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

### Instructions essentielles

| Instruction | Rôle |
| --- | --- |
| `FROM` | Image de base (préférer tags précis + alpine/slim si adapté) |
| `WORKDIR` | Répertoire de travail |
| `COPY` / `ADD` | Préférer `COPY` ; `ADD` seulement si extraction d’archive utile |
| `RUN` | Couches build ; enchaîner avec `&&` et nettoyer les caches apt/npm |
| `ENV` / `ARG` | Config runtime vs build-args |
| `EXPOSE` | Documentation du port (ne publie pas) |
| `USER` | Ne pas rester root |
| `CMD` / `ENTRYPOINT` | Processus principal |

## Multi-stage (prod)

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
USER node
CMD ["node", "dist/server.js"]
```

## Optimiser le cache et la taille

1. **Ordre des couches** : fichiers qui changent peu d’abord (`package*.json` avant le code).
2. **`.dockerignore`** : `node_modules`, `.git`, `.env`, builds, docs inutiles.
3. **Une responsabilité par `RUN` logique**, mais fusionner les `apt-get update && install && clean`.
4. **Multi-stage** : outils de build absents de l’image finale.
5. Mesurer : `docker images`, `docker history <image>`.

```bash
docker build -t mon-app:dev .
docker build --no-cache -t mon-app:dev .   # diagnostic cache
```

## Sécurité de base image

- Image de base à jour, utilisateur non-root
- Pas de secrets dans les couches (`ENV` / `COPY` de `.env`)
- Scanner si disponible (`docker scout`, Trivy, etc.) — hors scope détaillé du cours

## Attribution

Contenu pédagogique condensé avec autorisation du créateur — Yunt Academy.
