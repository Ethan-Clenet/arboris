# Rapport de veille skills — 2026-09-14

Scan de référence : `2026-09-14T11:42:21.387Z`  
Delta baseline : nouveau=0 | maj=0 | obsolete=1  
En suspens : resync=8 | candidats nouveaux connus=62

## Actions réalisées

### 1. Retrait `convex-setup-auth` → remplacement

| Retiré | Remplacé par | Motif |
|--------|--------------|-------|
| `convex-setup-auth` | `convex-auth` | Skill obsolète côté Convex ; auth moderne via `@convex-dev/auth` |
| — | `convex` | Routeur principal vers l’écosystème `convex-*` (recommandation veille) |

Mises à jour associées : pack `convex-starter` (collections), `skills-lock.json`, `.agents/skills/`, `prisma/skills/`.

### 2. Resync lock (8 skills)

Resynchronisés depuis les repos vendors (`node scripts/sync-skills-lock.mjs …`) :

- `convex-quickstart`
- `firebase-auth-basics`, `firebase-basics`, `firebase-firestore`
- `neon-postgres`, `postgres`
- `supabase`, `supabase-postgres-best-practices`

Hashes `computedHash` mis à jour dans `skills-lock.json`.

### 3. Évaluation SkillSpector (9 candidats)

Scanner : SkillSpector **v2.11.2** (static). Score Arboris = `100 − risk_score`.

| Skill | Risk | Score | Issues | Décision |
|-------|------|-------|--------|----------|
| `firebase-security-rules-auditor` | 0 | 100 | 0 | **Ajouté** au lock |
| `firestore-rules-creation` | 0 | 100 | 0 | **Ajouté** au lock |
| `convex-auth` | 12 | 88 | 4 | **Ajouté** (remplacement) |
| `convex-test` | 0 | 100 | 0 | **Ajouté** au lock |
| `convex` | 7 | 93 | 1 | **Ajouté** (routeur) |
| `convex-agent` | 0 | 100 | 0 | **Ajouté** au lock |
| `turso-cloud` | 26 | 74 | 3 | **Ajouté** au lock (complète `turso-db`) |
| `neon-functions` | 43 | 57 | 5 | **Reporté** — findings HIGH (credentials), recouvrement `neon-postgres` |
| `neon` | 45 | 55 | 7 | **Reporté** — score bas + overlap `neon-postgres` |

Rapports : `prisma/skillspector-reports/<skill>.json`

## Outils ajoutés

- `scripts/sync-skills-lock.mjs` — resync `skills-lock.json` → `.agents/skills/` + `prisma/skills/`
- `scripts/fetch-vendor-skill.mjs` — fetch ponctuel pour évaluation

## Prochaine revue

Abonnement hebdomadaire (timer) — rescanner le lock et réévaluer les candidats en suspens (`neon`, `neon-functions`, + 55 autres connus).
