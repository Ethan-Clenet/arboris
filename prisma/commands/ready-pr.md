---
name: ready-pr
description: Prépare une PR — branche, checks, changelog, commit, description MR (sans push).
---

# Ready PR

Pipeline pour rendre un lot **prêt à pousser** — **jamais de `git push`** (l’utilisateur pousse).

## Phases

0. **Pré-vol** — `git status`, `git diff --stat`, fetch de la base (`main`/`master`/upstream). Stop si rien à embarquer ou rebase/merge en cours.
1. **Branche** — proposer `<type>/<slug>` (`fix/`, `feat/`, `chore/`, …) ; créer depuis la base à jour si besoin. Attendre validation du nom sauf déjà fourni.
2. **Qualité** — scripts existants (`lint`, `format`, `typecheck`, `test`, `build`) — seulement ceux du repo, max 3 retries sur lint.
3. **Changelog** — si `CHANGELOG.md` (ou Changesets) existe, mettre à jour le lot via l’esprit de `/changelog`.
4. **Commit** — suivre `/commit` (Conventional Commits). Arbre propre en fin (`git status --porcelain` vide) ; commit complémentaire post-hook si besoin (pas d’amend poussé).
5. **Bilan** — SHA, message, checks ✓, **description PR** prête à coller + ligne `git push -u origin <branche>` (à lancer par l’utilisateur).

## Description PR (gabarit)

```markdown
## Résumé
…

## Changements
- …

## Tests
- [ ] lint / typecheck / test / build (cocher ce qui a tourné)

## Notes
…
```

## Interdits

- `git push`, `reset --hard`, stash pour « finir plus vite »
- Terminer avec un working tree sale
