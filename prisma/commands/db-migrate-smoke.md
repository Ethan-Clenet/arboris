---
name: db-migrate-smoke
description: Smoke test migration DB up puis down (Prisma / Sequelize / outil du repo).
---

# Smoke migrations

Vérifie que la **dernière migration** (ou celle du lot) monte et redescend proprement.

## Détection

- Prisma → `prisma migrate` / scripts `db:*` du `package.json`
- Sequelize → `sequelize-cli db:migrate` / `db:migrate:undo`
- Autre → scripts documentés du repo

## Procédure

1. Confirme l’URL de base (**dev / jetable** uniquement — jamais prod).
2. Applique la migration (`migrate deploy` / `migrate dev` / `db:migrate` selon contexte).
3. Undo de la dernière (ou rollback documenté).
4. Ré-applique pour laisser la base dans un état sain.
5. Si `down` / rollback échoue → documente le trou + correctif proposé.

Ne pas reset une base partagée sans accord explicite.
