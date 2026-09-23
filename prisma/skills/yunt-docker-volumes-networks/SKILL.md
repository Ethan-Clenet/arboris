---
name: yunt-docker-volumes-networks
description: >
  Volumes et réseaux Docker (Yunt Academy) : volumes nommés, bind mounts,
  tmpfs, drivers réseau bridge/host/none, DNS entre conteneurs, publish de
  ports et debug connectivité. À utiliser pour persister des données ou
  connecter des conteneurs entre eux.
metadata:
  origin: Yunt
  course: Conteneuriser ses projets web avec Docker
  source: https://academy.yunt.fr/dashboard/cours/cmta1lr1j000404l1qfs3kl25
---

# Yunt — Volumes & réseaux

Compétences du cours Yunt Academy (persistance + mise en réseau), condensées pour un agent.

## When to Activate

- Données perdues après `docker rm`
- Partager un dossier hôte ↔ conteneur (bind mount)
- Faire communiquer deux conteneurs (DB + app)
- Diagnostiquer « connection refused » / DNS entre services

## When not to use

- Fichier Compose multi-services → `yunt-docker-compose` (réutilise ces concepts)
- Build d’image → `yunt-docker-images-build`

## Persistance

| Mécanisme | Usage | Survit à `rm` du conteneur |
| --- | --- | --- |
| Couche conteneur | Éphémère | Non |
| **Volume nommé** | Données gérées par Docker (DB, uploads) | Oui |
| **Bind mount** | Code source, config locale | Oui (sur l’hôte) |
| **tmpfs** | Secrets / cache en RAM | Non |

```bash
# Volume nommé
docker volume create pgdata
docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

# Bind mount (dev)
docker run --rm -v "$PWD":/app -w /app node:22-alpine node index.js

docker volume ls
docker volume inspect pgdata
```

**Règles** : ne pas bind-mounter les data dirs DB en prod sans maîtrise des permissions ; préférer un volume nommé. Ne jamais committer un bind de `.env` contenant des secrets dans une image.

## Réseaux

- **bridge** (défaut) : réseau privé entre conteneurs ; ports publiés via `-p`.
- **host** : partage la pile réseau de l’hôte (Linux).
- **none** : pas de réseau.
- Sur un **réseau user-defined**, les conteneurs se joignent par **nom** (DNS Docker).

```bash
docker network create appnet

docker run -d --name db --network appnet \
  -e POSTGRES_PASSWORD=secret postgres:16-alpine

docker run -d --name api --network appnet \
  -e DATABASE_URL=postgres://postgres:secret@db:5432/postgres \
  -p 3000:3000 mon-api:dev

docker network ls
docker network inspect appnet
```

### Publish de ports

`-p 8080:80` mappe le port **hôte** 8080 vers le port **conteneur** 80. Sans `-p`, le service reste joignable seulement depuis le même réseau Docker.

## Debug réseau / données

1. `docker inspect` → `Mounts`, `Networks`, `IPAddress`.
2. Depuis un conteneur du même réseau : `ping db`, `nc -zv db 5432` (si outils présents).
3. Vérifier le nom DNS (nom du conteneur / alias) et non `localhost` (localhost = le conteneur lui-même).
4. Volume vide vs mauvais chemin de montage : comparer `Destination` dans `inspect`.

## Attribution

Contenu pédagogique condensé avec autorisation du créateur — Yunt Academy.
