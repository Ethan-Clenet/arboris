---
name: yunt-docker-containers
description: >
  Manipuler les conteneurs Docker (Yunt Academy) : docker run, cycle de vie,
  logs, exec, inspect, stop/rm, ports et variables d’environnement. À utiliser
  pour démarrer, inspecter, déboguer ou nettoyer des conteneurs en CLI.
metadata:
  origin: Yunt
  course: Conteneuriser ses projets web avec Docker
  source: https://academy.yunt.fr/dashboard/cours/cmta1lr1j000404l1qfs3kl25
---

# Yunt — Manipuler les conteneurs

Compétences du cours Yunt Academy (chapitre *Manipuler les conteneurs*), condensées pour un agent.

## When to Activate

- Lancer un conteneur avec ports, env, redémarrage, nom
- Lire les logs, entrer dans un conteneur (`exec`), inspecter la config
- Arrêter / supprimer / lister conteneurs
- Comprendre pourquoi un conteneur « disparaît » ou redémarre en boucle

## When not to use

- Install / concepts → `yunt-docker-fundamentals`
- Build d’image / Dockerfile → `yunt-docker-images-build`
- Persistance ou réseau multi-conteneurs → skills volumes/réseaux / Compose

## Cycle de vie

`create` → `start` → `running` → `stop` / `kill` → `rm`

`docker run` = create + start. Sans `-d`, le terminal suit le processus principal ; avec `-d`, détaché.

## Commandes clés

```bash
# Lancer (exemple nginx)
docker run -d --name web -p 8080:80 nginx:alpine

# Lister
docker ps          # en cours
docker ps -a       # tous

# Logs / shell / inspect
docker logs -f web
docker exec -it web sh
docker inspect web

# Arrêt / suppression
docker stop web
docker rm web
docker rm -f web   # force

# Nettoyage
docker container prune
```

### Options `run` utiles

| Option | Rôle |
| --- | --- |
| `-d` | Détaché |
| `--name` | Nom stable |
| `-p hôte:conteneur` | Publication de port |
| `-e KEY=val` / `--env-file` | Variables d’environnement |
| `--rm` | Supprime à l’arrêt |
| `--restart unless-stopped` | Politique de redémarrage |
| `-v` / `--mount` | Persistance (détails → skill volumes) |

## Méthodologie de debug

1. `docker ps -a` — état et code de sortie.
2. `docker logs` — erreur applicative.
3. `docker inspect` — ports, env, montages, réseau.
4. `docker exec` — vérifier depuis l’intérieur si le process tourne encore.
5. Recréer avec `--rm` et options explicites plutôt que « patcher » un conteneur opaque.

## Attribution

Contenu pédagogique condensé avec autorisation du créateur — Yunt Academy.
