---
name: pr-quality
description: Checklist qualité avant merge — bugs, sécu, smells, couverture, justification.
---

# Revue qualité PR

Checklist avant merge (CI Sonar / CodeQL / revue pair — adapter aux outils du repo).

## Ordre de priorité

1. **Bugs & vulnérabilités** / security hotspots
2. **Nouveau code** : couverture et dettes évidentes (complexité, duplication)
3. **Secrets / PII** dans logs ou fichiers versionnés
4. **Contrats** API / types cassés, migrations sans `down` / rollback

## Sortie

- Liste P0 / P1 / P2 avec fichiers
- Faux positifs acceptés → justification courte à coller dans la PR
- Verdict : **OK merge** / **bloquant** / **OK avec suivis**
