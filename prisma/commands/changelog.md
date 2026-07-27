---
name: changelog
description: Met à jour ou génère une entrée CHANGELOG (semver + sections Added/Fixed/Security).
---

# Changelog / release notes

Tu mets à jour le changelog du projet selon le **diff du lot** (pas tout l’historique).

## Détecter la convention

1. Cherche `CHANGELOG.md`, `CHANGELOG`, Changesets (`.changeset/`), `release-please`, `semantic-release`.
2. Si un outil de release existe → **respecte-le** (ne duplique pas à la main sauf demande).
3. Sinon → Keep a Changelog adapté (FR ou EN selon le fichier existant).

## Gabarit (si fichier libre)

```markdown
## [x.y.z] — AAAA-MM-JJ

### Ajouté
- …

### Corrigé
- …

### Sécurité
- …

### Breaking / déploiement
- …
```

## Règles

- Entrées orientées **utilisateur / opérateur**, pas le diff brut.
- Mapper `feat` → Ajouté, `fix` → Corrigé, `perf`/`refactor` utiles → Amélioré si section présente.
- Breaking (`!` / `BREAKING CHANGE`) → section dédiée + impact semver **major**.
- Une version = une section ; enrichir plutôt que dupliquer.
- Ne bump `package.json` version que si le repo le fait déjà ainsi / demandé.
