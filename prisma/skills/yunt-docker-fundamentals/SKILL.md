---
name: yunt-docker-fundamentals
description: >
  Fondamentaux Docker (Yunt Academy) : modèle mental image/conteneur/registre,
  différence avec une VM, installation Docker Engine ou Desktop, vérification
  et diagnostic d’une install. À utiliser pour expliquer Docker, installer
  l’outil, ou débloquer « daemon », permissions et hello-world.
metadata:
  origin: Yunt
  course: Conteneuriser ses projets web avec Docker
  source: https://academy.yunt.fr/dashboard/cours/cmta1lr1j000404l1qfs3kl25
---

# Yunt — Fondamentaux Docker

Compétences issues du cours Yunt Academy *Conteneuriser ses projets web avec Docker* (chapitres concepts + installation), condensées pour un agent.

## When to Activate

- Expliquer ce qu’est un conteneur vs une VM
- Installer ou vérifier Docker (Engine / Desktop)
- Diagnostiquer `command not found`, `Cannot connect to the Docker daemon`, `permission denied`
- Lever une confusion image / conteneur / registre / couche

## When not to use

- Manipuler des conteneurs déjà installés → `yunt-docker-containers`
- Dockerfile / build → `yunt-docker-images-build`
- Volumes, réseaux, Compose → skills dédiés

## Modèle mental

- **Image** : modèle immuable (couches en lecture seule). Ne s’exécute pas.
- **Conteneur** : instance d’une image + couche modifiable éphémère. Quand le PID 1 se termine, le conteneur s’arrête.
- **Registre** : distribution d’images (Docker Hub par défaut).
- **Isolation** : namespaces + cgroups sur le noyau **partagé** de l’hôte (pas un second OS comme une VM).
- **Éphémérité** : tout écrit dans le FS du conteneur disparaît avec lui, sauf volume / bind mount.

## Installer et vérifier

**Choix** : Docker Engine (Linux serveur) vs Docker Desktop (macOS / Windows / Linux desktop, VM Linux embarquée).

**Linux (Engine)** — dépôts officiels Docker recommandés ; ajouter l’utilisateur au groupe `docker` (équivalent root sur le socket).

**Vérification minimale** (installation validée seulement si un conteneur tourne vraiment) :

```bash
docker --version
docker info
docker run --rm hello-world
```

### Erreurs fréquentes

| Symptôme | Cause typique | Piste |
| --- | --- | --- |
| `command not found` | PATH / paquet manquant | Réinstaller le client |
| `Cannot connect to the Docker daemon` | Daemon arrêté, Desktop off, mauvais contexte | Démarrer le service / Desktop ; `docker context ls` |
| `permission denied` sur le socket | Pas dans le groupe `docker` | `usermod -aG docker $USER` puis re-login |

## Méthodologie agent

1. Clarifier la confusion (vocabulaire vs install vs runtime).
2. Ancrer sur image → conteneur → couche éphémère.
3. Proposer une commande d’observation (`version`, `info`, `hello-world`).
4. Renvoyer vers le skill opérationnel pour l’action suivante.

## Attribution

Contenu pédagogique condensé avec autorisation du créateur — Yunt Academy.
