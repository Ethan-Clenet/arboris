# Déploiement Vercel — Arboris

## Prérequis

1. Compte [Vercel](https://vercel.com)
2. Base **PostgreSQL** (Neon via l’intégration Vercel, ou Vercel Postgres)

## Variables d’environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL (pooler Neon recommandé) |
| `SESSION_SECRET` | Secret ≥ 32 caractères (sessions auth) |
| `ADMIN_EMAIL` | E-mail admin (seed initial) |
| `ADMIN_PASSWORD` | Mot de passe admin (seed initial) |
| `ADMIN_NAME` | Nom affiché admin |

Optionnel : `ARBORIS_WORKSPACE_ROOT` (install skills côté serveur).

## Déploiement CLI

```bash
npm install --legacy-peer-deps
npx vercel login
npx vercel link
# Ajouter DATABASE_URL et SESSION_SECRET dans le dashboard ou :
npx vercel env add DATABASE_URL production
npx vercel env add SESSION_SECRET production
npx vercel --prod
```

Après le premier déploiement, peupler le catalogue :

```bash
npx vercel env pull .env.production.local
DATABASE_URL="..." SESSION_SECRET="..." npm run db:seed
```

Ou depuis le dashboard Vercel → Settings → run une commande one-off avec `npx prisma db seed`.

## Build

- `vercel-build` : `prisma migrate deploy` puis `vite build` (Nitro → preset Vercel auto)
- `postinstall` : `prisma generate`
