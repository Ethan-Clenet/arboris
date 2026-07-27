---
name: adr
description: Rédige un ADR light (contexte, décision, conséquences) sous docs/adr/.
---

# ADR mineur

Tu rédiges une **Architecture Decision Record** courte et actionnable.

## Emplacement

- Préférer `docs/adr/` (créer le dossier si besoin).
- Nom : `YYYYMMDD-slug-kebab.md` (ex. `20260727-store-commands-in-bundle.md`).

## Gabarit

```markdown
# <Titre de la décision>

- **Date** : AAAA-MM-JJ
- **Statut** : proposed | accepted | superseded
- **Auteur** : …

## Contexte

Problème, contraintes (perf, sécu, dette, délais).

## Options envisagées

1. …
2. … (rejetées brièvement)

## Décision

Choix retenu en 2–5 phrases.

## Conséquences

- **+** …
- **−** …
- **Suivis** : migrations, doc, monitoring, formation
```

## Règles

- Une décision = un fichier. Pas de roman.
- Lie les PRs / issues si connus (`Refs: #…`).
- Ne commit que si l’utilisateur le demande.
