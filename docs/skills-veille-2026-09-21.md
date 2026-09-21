# Rapport de veille skills — 2026-09-21

Scan de référence : `2026-09-21T09:03:15.138Z`  
Delta : nouveau=1 | maj=5 | inchange=14 | obsolete=0  
Lock drift : 5 | candidats hors lock restants : 56

## Actions réalisées

### 1. Resync lock (5 skills)

Resynchronisés depuis les repos vendors (`node scripts/sync-skills-lock.mjs …`) :

| Skill | Source | Nature des changements |
|-------|--------|------------------------|
| `firebase-auth-basics` | firebase/agent-skills | Doc Android SDK mineure |
| `firebase-security-rules-auditor` | firebase/agent-skills | Clarif. ownership + schéma JSON d’évaluation |
| `firestore-rules-creation` | firebase/agent-skills | Fix `isValidOptionalString` + `areImmutableFieldsUnchanged` |
| `firebase-firestore` | firebase/agent-skills | Blocs bash edition + refs enterprise/standard |
| `neon-postgres` | neondatabase/agent-skills | Scope resserré (auth → `neon-auth`), évite 2e projet si `DATABASE_URL` |

Hashes `computedHash` mis à jour dans `skills-lock.json` ; copies `.agents/skills/` + `prisma/skills/`.

### 2. Revue des mises à jour

Rien de bloquant. Points notables :

- **Firestore rules** : correction réelle du helper optional string (`field` littéral → variable) et lockdown via `areImmutableFieldsUnchanged()`.
- **Neon Postgres** : oriente explicitement login/sessions vers `neon-auth` ; ne recrée plus un projet Neon si une URL existe déjà.

### 3. Évaluation SkillSpector — `neon-auth`

Scanner : SkillSpector **v2.11.2** (static). Score Arboris = `100 − risk_score`.

| Skill | Risk | Score | Issues | Décision |
|-------|------|-------|--------|----------|
| `neon-auth` | 8 | 92 | 1 (AS3 MEDIUM — renvoi parent `neon`) | **Ajouté** au lock |

Motif : score élevé (comparable à `convex-auth` 88) ; finding AS3 attendu pour l’écosystème Neon (parent skill). Complète `neon-postgres` qui délègue désormais l’auth.

Rapport : `prisma/skillspector-reports/neon-auth.json`

### 4. Catalogue

- Heuristique catégorie `neon-auth` → `security`
- Stacks : `neon`, `ts`, `js`

## Prochaine revue

Abonnement hebdomadaire (timer) — rescanner le lock et réévaluer les candidats en suspens (`neon`, `neon-functions`, + ~55 autres hors lock).
