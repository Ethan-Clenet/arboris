---
name: hotfix
description: Protocole branche hotfix depuis prod — correctif minimal, tests, rétroportage.
---

# Hotfix

Tu ouvres et mènes un **hotfix** depuis la branche / le tag de production, avec surface minimale.

## Procédure

1. **Base** — partir de la branche ou du tag **prod** (jamais d’une branche de feature instable).
2. **Branche** — `hotfix/<issue-ou-slug>` (kebab-case).
3. **Changement** — correctif **minimal** + tests ciblés uniquement.
4. **Vérifs** — lancer les checks déjà présents (`test`, `lint`, `typecheck`, smoke).
5. **Notes** — 2–4 lignes : cause, fix, risque résiduel, plan de rétroportage.
6. **Merge** — vers prod selon la politique du repo, puis **rétroporter** vers `main`/`develop` (merge ou cherry-pick).

## Interdits

- Refacto large, bump de deps non liés, « tant qu’on y est ».
- Force-push sur prod / tags sans demande explicite.
- Push sans demande explicite.
