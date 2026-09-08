# 🌳 Arboris

**Catalogue de skills IA prêts à l'emploi.** Copie le prompt d'un skill, ton agent
(Cursor, Claude, Codex, Copilot…) l'ajoute au codebase et applique les bonnes
pratiques. Zéro config.

Application full-stack construite avec **TanStack Start** (React 19), **Prisma**
(PostgreSQL) et **Tailwind CSS v4**, entièrement typée en **TypeScript**.

## ✨ Fonctionnalités

- **Catalogue filtrable** — recherche, filtres par catégorie, compatibilité et technologie, tri par score ou nom.
- **Fiches détaillées** — prompt à copier, « ce que fait le skill », étapes, déclencheurs, skills liés.
- **Premier pas** — choisis ta stack (Node, TypeScript, React, Next.js…) et copie tous les skills recommandés d'un coup.
- **Authentification** — connexion / inscription (e-mail + mot de passe, sessions HTTP-only).
- **Bilingue FR / EN** — bascule instantanée, mémorisée.
- **Thème clair / sombre** — bascule animée (View Transitions API), sans flash au chargement.
- **Rendu côté serveur (SSR)** — les données viennent de la base via des *server functions* TanStack Start adossées à Prisma.

## 🧱 Stack technique

| Domaine        | Choix                                                      |
| -------------- | ---------------------------------------------------------- |
| Framework      | TanStack Start (React 19, routing fichiers, SSR)           |
| Server / RPC   | `createServerFn` (server functions, exécutées sur Node)    |
| ORM / Base     | Prisma 6 + PostgreSQL 16 (Docker)                          |
| Styles         | Tailwind CSS v4 + tokens de design (variables CSS)         |
| Icônes/Polices | Phosphor Icons, Space Grotesk / Hanken Grotesk / JetBrains Mono |
| Langage        | TypeScript                                                 |

## 🚀 Démarrage

> **Prérequis** : Node.js (recommandé **≥ 22.12**, fonctionne aussi en 20.19+), npm et **Docker**.

```bash
# 1. Installer les dépendances
npm install

# 2. Copier la config d'environnement
cp .env.example .env

# 3. Démarrer PostgreSQL (Docker) + migrations + seed
npm run db:up
npm run db:migrate      # applique les migrations et lance le seed

# 4. Lancer le serveur de développement
npm run dev
```

L'application démarre sur **http://localhost:3000** (bascule sur un autre port
si 3000 est occupé).

### PostgreSQL (Docker)

Le fichier `docker-compose.yml` lance Postgres sur le port **5433** (évite les
conflits avec une instance locale sur 5432) :

| Variable | Valeur par défaut |
| -------- | ----------------- |
| Utilisateur | `arboris` |
| Mot de passe | `arboris` |
| Base | `arboris` |
| Port hôte | `5433` |

Format `DATABASE_URL` dans `.env` :

```
postgresql://arboris:arboris@localhost:5433/arboris
```

Pour les boutons **Installer** (écriture locale), définir aussi dans `.env` :

```
ARBORIS_WORKSPACE_ROOT="/chemin/absolu/du/projet"
ARBORIS_INSTALL_TOKEN="…secret…"
VITE_ARBORIS_INSTALL_TOKEN="…même secret…"
```

Sur le site public (Vercel), ne pas définir ces variables : ZIP + CLI restent disponibles.

Commandes utiles :

```bash
npm run db:up      # docker compose up -d
npm run db:down    # docker compose down
npm run db:studio  # explorateur Prisma Studio
npm run db:reset   # réinitialise la base + reseed
```

## 📜 Scripts npm

| Script                  | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Serveur de développement (SSR + HMR)                   |
| `npm run build`         | Build de production                                    |
| `npm run start`         | Sert le build de production                            |
| `npm run typecheck`     | Vérification des types TypeScript                      |
| `npm run generate-routes` | Régénère l'arbre de routes TanStack (`routeTree.gen.ts`) |
| `npm run db:up`         | Démarre PostgreSQL via Docker Compose                  |
| `npm run db:down`       | Arrête le conteneur PostgreSQL                         |
| `npm run db:migrate`    | Crée/applique les migrations Prisma (puis seed)        |
| `npm run db:push`       | Synchronise le schéma sans migration (prototypage)     |
| `npm run db:seed`       | (Re)remplit la base avec le catalogue                  |
| `npm run db:studio`     | Ouvre Prisma Studio (explorateur de données)           |
| `npm run db:reset`      | Réinitialise la base puis reseed                       |

## 🗂️ Structure du projet

```
arboris/
├── docker-compose.yml       # PostgreSQL 16 (port 5433)
├── prisma/
│   ├── schema.prisma        # Modèles Category, Stack, Skill, Collection
│   ├── catalog-data.ts      # Données source du catalogue (pour le seed)
│   ├── seed.ts              # Script de seed (prisma db seed)
│   └── migrations/          # Historique des migrations PostgreSQL
├── src/
│   ├── routes/
│   │   ├── __root.tsx           # Shell HTML (head, providers, Header/Footer)
│   │   ├── index.tsx            # Accueil (hero + index rapide)
│   │   ├── skills.index.tsx     # /skills — catalogue filtrable
│   │   ├── skills.$id.tsx       # /skills/:id — fiche d'un skill
│   │   └── getting-started.tsx  # /getting-started — premier pas par stack
│   ├── server/
│   │   ├── db.ts                # Singleton PrismaClient (serveur uniquement)
│   │   ├── catalog.server.ts    # Requêtes Prisma → objets UI
│   │   └── functions.ts         # Server functions (getCatalog, getSkill)
│   ├── components/              # Header, Footer, ThemeToggle, LangSwitch, Icon
│   ├── lib/
│   │   ├── catalog.ts           # Types partagés + helpers (prompts, couleurs)
│   │   ├── i18n.tsx             # Contexte FR/EN + dictionnaires
│   │   ├── theme.ts             # Thème clair/sombre (View Transitions)
│   │   └── useCopy.ts           # Hook copie presse-papiers
│   └── styles.css               # Tailwind + tokens de design Arboris
└── vite.config.ts               # Plugins TanStack Start + Tailwind
```

## 🧠 Notes d'architecture

- **Accès base côté serveur uniquement.** Prisma n'est jamais importé côté client :
  `src/server/db.ts` est chargé *dynamiquement* à l'intérieur des handlers de
  server functions, donc il ne finit jamais dans le bundle navigateur. Les pages
  appellent ces fonctions via leur `loader`.
- **Modèle de données.** `Category (1) — (N) Skill`, `Skill (N) — (N) Stack`
  (relation many-to-many implicite). Les listes bilingues et les tableaux
  (`tech`, `compat`, `does`, `triggers`) sont stockés en JSON sérialisé
  (colonnes `*Json`) et désérialisés dans `catalog.server.ts`.
- **i18n sans flash de contenu.** Le serveur rend le français par défaut ; la
  langue mémorisée (localStorage) est appliquée au montage côté client.
- **Thème sans flash.** Un court script inline (`THEME_INIT_SCRIPT`) applique
  `data-theme` avant le premier paint.

---

Généré à partir du prototype « Catalogue de skills IA ».
