# Déploiement Vercel — Arboris

## Prérequis

1. Compte [Vercel](https://vercel.com)
2. Base **PostgreSQL** (Neon via l’intégration Vercel, ou Vercel Postgres)

## Variables d’environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL (pooler Neon recommandé) |

Optionnel : `SITE_URL` / `VITE_SITE_URL`.

### Install workspace (écriture disque)

**Ne pas** définir sur le déploiement public :

- `ARBORIS_WORKSPACE_ROOT`
- `ARBORIS_INSTALL_TOKEN`
- `VITE_ARBORIS_INSTALL_TOKEN`

Sur le site public, l’UI propose ZIP + CLI. L’écriture FS est réservée au
`npm run dev` / Cloud Agent local, avec root + jeton dans `.env` (voir `.env.example`).

## Déploiement CLI

```bash
npm install --legacy-peer-deps
npx vercel login
npx vercel link
# Ajouter DATABASE_URL dans le dashboard ou :
npx vercel env add DATABASE_URL production
npx vercel --prod
```

Après le premier déploiement, peupler le catalogue :

```bash
npx vercel env pull .env.production.local
DATABASE_URL="..." npm run db:seed
```

Ou depuis le dashboard Vercel → Settings → run une commande one-off avec `npx prisma db seed`.

## Build

- `vercel-build` : `prisma migrate deploy` puis `vite build` (Nitro → preset Vercel auto)
- `postinstall` : `prisma generate`
