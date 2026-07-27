---
name: audit-deps
description: npm audit / revue des vulnérabilités de dépendances, tri et plan de fix.
---

# Audit dépendances

1. Détecte les manifests (`package.json` racine + workspaces).
2. Lance l’audit adapté :
   ```bash
   npm audit
   # ou : pnpm audit / yarn npm audit
   ```
3. Trie : **critique / haut** d’abord ; ignore le bruit low si hors chemin runtime.
4. Pour chaque finding actionnable : fix (`npm audit fix`), bump ciblé, ou justification « risk accepted ».
5. Après fix : réinstall + tests/CI smoke du repo.
6. Compte-rendu : table package → sévérité → action.

Complémentaire de `/ncu` (versions) : ici on traite surtout la **sécu**, pas le confort des majors.
