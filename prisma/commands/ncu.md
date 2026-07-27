---
name: ncu
description: Met à jour les packages npm du projet avec npm-check-updates (ncu).
---

# Update npm packages (ncu)

Tu mets à jour les dépendances npm du workspace courant de façon sûre et traçable.

## Procédure

1. **Contexte** — repère le ou les `package.json` (racine + workspaces éventuels). Ne touche pas aux lockfiles à la main.
2. **Audit** — lance d’abord un dry-run :
   ```bash
   npx npm-check-updates
   ```
   (ou `npx npm-check-updates -ws` / `-r` si monorepo / récursif).
3. **Plan** — résume les majeurs vs mineurs/patchs. Signale les breaking changes probables (semver major, packages critiques : react, next, prisma, typescript, etc.).
4. **Appliquer** — avec accord implicite de cette commande, mets à jour `package.json` :
   ```bash
   npx npm-check-updates -u
   ```
   Puis réinstalle :
   ```bash
   npm install
   ```
   Adapte le gestionnaire (npm / pnpm / yarn / bun) à celui déjà utilisé dans le repo (présence de `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, etc.).
5. **Vérifier** — lance les checks déjà présents dans le projet (`typecheck`, `test`, `lint`, `build`) plutôt que d’en inventer. Corrige les erreurs de compatibilité évidentes.
6. **Compte-rendu** — liste :
   - packages mis à jour (avant → après)
   - majors risqués laissés de côté ou mis à jour volontairement
   - commandes de vérif exécutées et résultat
   - éventuels follow-ups (migrations, peer deps, changelogs)

## Règles

- Ne force pas de majors dangereuses sans les mentionner clairement.
- Ne commit / push que si l’utilisateur le demande.
- Si `ncu` échoue ou qu’aucun `package.json` n’est trouvé, explique pourquoi et stoppe.
