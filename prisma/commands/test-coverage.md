---
name: test-coverage
description: Lance les tests avec couverture ciblée sur les fichiers / modules touchés.
---

# Couverture ciblée

Après modification d’un module, tu mesures la couverture **sur le périmètre touché**.

## Détection

- Vitest / Jest / Playwright / autre : lis `package.json` scripts (`test`, `test:coverage`, `vitest`, `jest`).
- Adapte le gestionnaire (npm / pnpm / yarn / bun).

## Exécution (exemples)

```bash
# Vitest
npx vitest run --coverage <chemins-ou-pattern>

# Jest
npx jest --coverage --collectCoverageFrom='src/**/<module>/**' --testPathPattern='<pattern>'
```

## Règles

- Priorité aux **branches / chemins nouveaux** du diff.
- Ajoute un test minimal si une branche critique n’est pas couverte (sauf si l’utilisateur refuse).
- Pas de `console.log` de debug laissés dans les tests.
- Compte-rendu : fichiers couverts, trous, commandes lancées.
