---
name: commit
description: Commit Conventional Commits + changelog/semver (message clair, scope, type).
---

# Commit (Conventional Commits · changelog · semver)

Tu prépares et crées un commit Git selon **Conventional Commits**, pensé pour changelog et semver.

## Avant de committer

1. Parallèle :
   - `git status`
   - `git diff` et `git diff --staged`
   - `git log -8 --oneline` (aligner le ton / la langue du repo)
2. N’inclus **pas** secrets (`.env`, credentials, clés). Préviens si l’utilisateur les a stagés.
3. Ne commit que si l’utilisateur l’a demandé (cette commande = demande explicite).
4. Pas de `git commit --amend`, `--no-verify`, ni force-push sauf demande explicite.

## Choisir le type (semver)

| Type | Quand | Impact semver typique |
|------|--------|------------------------|
| `feat` | nouvelle capacité utilisateur | **minor** |
| `fix` | correction de bug | **patch** |
| `perf` | perf sans changement de comportement | **patch** |
| `refactor` | refacto sans feat/fix | **patch** (souvent omis du changelog user) |
| `docs` | doc seule | none / patch |
| `test` | tests seuls | none / patch |
| `build` / `ci` | build, CI, deps outillage | none / patch |
| `chore` | maintenance diverse | none / patch |
| `style` | formatage | none |

**Breaking change** : ajoute `!` après le type/scope (`feat(api)!: ...`) **ou** un footer `BREAKING CHANGE: ...` → **major**.

## Format du message

```
<type>(<scope optionnel>): <description courte>

[corps optionnel — pourquoi, pas le diff ligne à ligne]

[footers optionnels]
```

Règles :
- description en impératif, ~≤72 chars, **sans** point final ;
- scope court si utile (`commands`, `skills`, `admin`, `cli`, …) ;
- langue : suis les commits récents du repo (FR ou EN) ;
- corps seulement si le *pourquoi* n’est pas évident ;
- footers utiles : `BREAKING CHANGE:`, `Refs: #123`, `Closes: #456`.

## Exécution

1. Stage uniquement les fichiers pertinents (`git add …`) — pas de `git add .` aveugle si le working tree est large.
2. Commit via HEREDOC :

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>

EOF
)"
```

3. `git status` après coup pour confirmer.
4. **Ne push pas** sauf demande explicite.
5. Compte-rendu court : hash, message, type → impact semver attendu (`major` / `minor` / `patch` / none), fichiers inclus.

## Checklist rapide

- [ ] Pas de secrets / `.env` dans le stage
- [ ] Pas de `console.log` / debug oubliés si le lint ne les attrape pas
- [ ] Types / contrats API alignés si endpoints touchés
- [ ] Migration avec chemin de rollback si schéma touché
- [ ] Message < ~100 car., type semver cohérent

## Changelog

- Un bon Conventional Commit **est** l’entrée changelog : `feat` / `fix` / `perf` (+ breaking) alimentent les notes de version.
- Si le repo a déjà `CHANGELOG.md` / Changesets / `release-please` / `semantic-release`, respecte ce flux (ne duplique pas à la main sauf demande).
- Sinon, ne génère un CHANGELOG que si l’utilisateur le demande (voir aussi `/changelog`).

## Interdits

- Commit vide
- Mentions d’agent / co-auteur IA dans le message
- Réécrire l’historique partagé
- Amend d’un commit déjà poussé sans demande explicite
