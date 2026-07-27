---
name: sync-env
description: Fusionne .env.example → .env sans écraser les secrets locaux.
---

# Sync env

Aligne le `.env` local sur `.env.example` **sans détruire** les valeurs déjà renseignées.

## Détection

- Cherche `.env.example` / `.env.sample` à la racine et dans les packages (apps, `apps/*`, etc.).
- Cible correspondante : `.env` (ou `.env.local` si c’est la convention du repo — demander si ambigu).

## Fusion

1. Si `.env` absent → le créer depuis l’exemple (l’utilisateur complétera les secrets).
2. Si `.env` existe :
   - pour chaque `CLÉ` de l’exemple absente du `.env` → **ajouter** (avec commentaire voisin si utile) ;
   - si la clé existe déjà → **ne pas modifier** ;
   - ne **pas** supprimer les clés locales absentes de l’exemple.
3. **Interdit** : `cp .env.example .env` sur un fichier existant.
4. **Ne jamais** coller le contenu réel de `.env` dans le chat ni le committer.

## Sortie

Noms des **nouvelles clés** ajoutées uniquement + rappel de renseigner les secrets.
