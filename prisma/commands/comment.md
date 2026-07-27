---
name: comment
description: Ajoute des commentaires FR clairs (intention métier) sans changer le comportement.
---

# Commentaires (FR)

Tu documentes le code **dans le périmètre demandé** (dossier / fichiers cités), en français.

## Règles

- **Ne change pas** la logique sauf bug manifeste **et** demandé.
- Commentaires utiles : *pourquoi*, invariants, pièges — pas de paraphrase du code évident.
- JS/TS : JSDoc sur API publiques (`@param`, `@returns`).
- JSX/TSX : `{/* … */}` au-dessus des blocs significatifs.
- Exclure : `node_modules`, builds, lockfiles, `.env` secrets, JSON générés, chemins `.gitignore`.

## Ordre

1. Points d’entrée / bootstrap
2. Couches structurantes (routes, providers, services)
3. UI / pages
4. Utils / tests

Fichiers volumineux (>400 lignes) : traiter par sous-section.

## Fin de passe

Liste des fichiers touchés + suggestion de lancer lint/tests du projet.
