/** Données seed + CLI (sans DB). */
export type CollectionSeed = {
  id: string
  icon: string
  color: string
  labelFr: string
  labelEn: string
  briefFr: string
  briefEn: string
  /** featured = mise en avant · pack = pack prêt à installer */
  kind: 'featured' | 'pack'
  skillIds: string[]
  commandIds: string[]
  sort: number
}

/** Commandes git/PR de base incluses dans les starters techno. */
const DEV_LOOP_COMMANDS = ['commit', 'ready-pr', 'review-pr', 'explain-code'] as const

export const COLLECTIONS: CollectionSeed[] = [
  {
    id: 'sonar',
    icon: 'broadcast',
    color: '#0D9488',
    labelFr: 'Sonar',
    labelEn: 'Sonar',
    briefFr:
      'Pack Skill Sonar : commande /sonar + skills de garde (preflight/runtime, safety-guard, gateguard, security-scan).',
    briefEn:
      'Skill Sonar pack: /sonar command plus guard skills (preflight/runtime, safety-guard, gateguard, security-scan).',
    kind: 'pack',
    skillIds: ['skill-sonar', 'safety-guard', 'gateguard', 'security-scan'],
    commandIds: ['sonar'],
    sort: 0,
  },
  {
    id: 'command-starter',
    icon: 'terminal-window',
    color: '#43A047',
    labelFr: 'Command starter',
    labelEn: 'Command starter',
    briefFr:
      'Pack essentiel de slash commands : commit, rebase, PR, deps et revue — prêt pour ton agent.',
    briefEn:
      'Essential slash-command pack: commit, rebase, PR, deps and review — ready for your agent.',
    kind: 'pack',
    skillIds: [],
    commandIds: [
      'commit',
      'rebase',
      'ready-pr',
      'ncu',
      'review-pr',
      'explain-code',
      'changelog',
      'pr-quality',
    ],
    sort: 1,
  },
  {
    id: 'ship-safely',
    icon: 'shield-check',
    color: '#2E7D32',
    labelFr: 'Ship safely',
    labelEn: 'Ship safely',
    briefFr:
      'Qualité et sécu avant merge : scan CVE (OSV), audit des dépendances, diff de sécurité, couverture de tests, revue owners et qualité de PR. Pack pour figer un gate de merge fiable dans ton agent.',
    briefEn:
      'Quality and security before merge: CVE scan (OSV), dependency audit, security diff, test coverage, owners review and PR quality. A pack to lock a reliable merge gate into your agent.',
    kind: 'pack',
    skillIds: ['cve-scan', 'security-review'],
    commandIds: ['cve', 'audit-deps', 'security-diff', 'test-coverage', 'owners-review', 'pr-quality'],
    sort: 2,
  },
  {
    id: 'ops-day-two',
    icon: 'gear-six',
    color: '#1565C0',
    labelFr: 'Ops day-two',
    labelEn: 'Ops day-two',
    briefFr:
      'Le quotidien projet après le go-live : sync d’env, rebuild Docker, smoke migrations, hotfix et ADR. Pack ops day-two pour garder le rythme sans perdre le contexte.',
    briefEn:
      'Day-to-day ops after go-live: env sync, Docker rebuild, migration smoke, hotfix and ADR. A day-two ops pack to keep pace without losing context.',
    kind: 'featured',
    skillIds: [],
    commandIds: ['sync-env', 'docker-rebuild', 'db-migrate-smoke', 'hotfix', 'adr'],
    sort: 3,
  },

  // ── Starters « nouveau projet » par techno ──────────────────────────────

  {
    id: 'react-ts-starter',
    icon: 'atom',
    color: '#38BDF8',
    labelFr: 'React + TypeScript',
    labelEn: 'React + TypeScript',
    briefFr:
      'Nouveau front React/TS : patterns UI, best practices Vercel, a11y, Tailwind/shadcn, types avancés, tests — plus le loop git/PR.',
    briefEn:
      'New React/TS front: UI patterns, Vercel best practices, a11y, Tailwind/shadcn, advanced types, tests — plus the git/PR loop.',
    kind: 'pack',
    skillIds: [
      'react-patterns',
      'vercel-react-best-practices',
      'vercel-composition-patterns',
      'frontend-patterns',
      'frontend-a11y',
      'typescript-advanced-types',
      'tailwind-design-system',
      'shadcn',
      'react-testing',
      'coding-standards',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'ncu', 'lighthouse'],
    sort: 10,
  },
  {
    id: 'next-react-starter',
    icon: 'lightning',
    color: '#000000',
    labelFr: 'Next.js + React',
    labelEn: 'Next.js + React',
    briefFr:
      'App Next.js : boucle de dev, Turbopack, React/Vercel, a11y, TypeScript, shadcn — prêt pour démarrer un produit web.',
    briefEn:
      'Next.js app: dev loop, Turbopack, React/Vercel, a11y, TypeScript, shadcn — ready to kick off a web product.',
    kind: 'pack',
    skillIds: [
      'next-dev-loop',
      'nextjs-turbopack',
      'vercel-react-best-practices',
      'react-patterns',
      'frontend-a11y',
      'typescript-advanced-types',
      'shadcn',
      'coding-standards',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'ncu', 'lighthouse'],
    sort: 11,
  },
  {
    id: 'node-api-starter',
    icon: 'hexagon',
    color: '#43A047',
    labelFr: 'API Node / Nest',
    labelEn: 'Node / Nest API',
    briefFr:
      'API backend Node/TS : patterns API, NestJS, erreurs, auth (better-auth), GateGuard — plus commit/PR et audit deps.',
    briefEn:
      'Node/TS backend API: API patterns, NestJS, errors, auth (better-auth), GateGuard — plus commit/PR and dep audit.',
    kind: 'pack',
    skillIds: [
      'backend-patterns',
      'api-design',
      'nestjs-patterns',
      'error-handling',
      'better-auth-best-practices',
      'better-auth-create-auth',
      'gateguard',
      'coding-standards',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'audit-deps', 'test-coverage', 'ncu'],
    sort: 12,
  },
  {
    id: 'fastapi-starter',
    icon: 'lightning',
    color: '#009688',
    labelFr: 'FastAPI',
    labelEn: 'FastAPI',
    briefFr:
      'API Python FastAPI : patterns framework, design d’API, backend, standards et garde sécurité — avec le loop PR.',
    briefEn:
      'Python FastAPI: framework patterns, API design, backend, standards and security guards — with the PR loop.',
    kind: 'pack',
    skillIds: [
      'fastapi-patterns',
      'api-design',
      'backend-patterns',
      'coding-standards',
      'gateguard',
      'security-scan',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'test-coverage'],
    sort: 13,
  },
  {
    id: 'angular-starter',
    icon: 'shield',
    color: '#E5484D',
    labelFr: 'Angular',
    labelEn: 'Angular',
    briefFr:
      'Nouveau projet Angular : new-app, patterns développeur, UI/a11y, tests web et standards — plus git/PR.',
    briefEn:
      'New Angular project: new-app, developer patterns, UI/a11y, web tests and standards — plus git/PR.',
    kind: 'pack',
    skillIds: [
      'angular-new-app',
      'angular-developer',
      'frontend-patterns',
      'frontend-a11y',
      'webapp-testing',
      'coding-standards',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'ncu'],
    sort: 14,
  },
  {
    id: 'spring-boot-starter',
    icon: 'leaf',
    color: '#6DB33F',
    labelFr: 'Spring Boot',
    labelEn: 'Spring Boot',
    briefFr:
      'Backend Java Spring Boot : patterns, sécu, TDD, vérification, standards Java et design d’API.',
    briefEn:
      'Java Spring Boot backend: patterns, security, TDD, verification, Java standards and API design.',
    kind: 'pack',
    skillIds: [
      'springboot-patterns',
      'springboot-security',
      'springboot-tdd',
      'springboot-verification',
      'java-coding-standards',
      'api-design',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'test-coverage'],
    sort: 15,
  },
  {
    id: 'prisma-postgres-starter',
    icon: 'diamonds-four',
    color: '#2D3748',
    labelFr: 'Prisma + PostgreSQL',
    labelEn: 'Prisma + PostgreSQL',
    briefFr:
      'Couche data TS : Prisma, Postgres, migrations, Neon — idéal pour démarrer un backend typé avec une vraie DB.',
    briefEn:
      'TS data layer: Prisma, Postgres, migrations, Neon — ideal to start a typed backend with a real DB.',
    kind: 'pack',
    skillIds: [
      'prisma-patterns',
      'postgres',
      'postgres-patterns',
      'database-migrations',
      'neon-postgres',
      'backend-patterns',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'db-migrate-smoke'],
    sort: 16,
  },
  {
    id: 'drizzle-starter',
    icon: 'diamonds-four',
    color: '#C5F74F',
    labelFr: 'Drizzle ORM',
    labelEn: 'Drizzle ORM',
    briefFr:
      'ORM Drizzle type-safe + Postgres/migrations et patterns backend — alternative légère à Prisma.',
    briefEn:
      'Type-safe Drizzle ORM + Postgres/migrations and backend patterns — a light Prisma alternative.',
    kind: 'pack',
    skillIds: ['drizzle', 'postgres-patterns', 'database-migrations', 'backend-patterns', 'typescript-advanced-types'],
    commandIds: [...DEV_LOOP_COMMANDS, 'db-migrate-smoke'],
    sort: 17,
  },
  {
    id: 'supabase-starter',
    icon: 'database',
    color: '#3ECF8E',
    labelFr: 'Supabase',
    labelEn: 'Supabase',
    briefFr:
      'BaaS Supabase : client, best practices Postgres, auth better-auth si besoin — sync env et loop PR inclus.',
    briefEn:
      'Supabase BaaS: client, Postgres best practices, better-auth when needed — env sync and PR loop included.',
    kind: 'pack',
    skillIds: [
      'supabase',
      'supabase-postgres-best-practices',
      'postgres-patterns',
      'better-auth-best-practices',
      'backend-patterns',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'sync-env'],
    sort: 18,
  },
  {
    id: 'firebase-starter',
    icon: 'flame',
    color: '#FFCA28',
    labelFr: 'Firebase',
    labelEn: 'Firebase',
    briefFr:
      'Stack Firebase : bases plateforme, Auth et Firestore — pour démarrer une app Google cloud rapidement.',
    briefEn:
      'Firebase stack: platform basics, Auth and Firestore — to bootstrap a Google cloud app fast.',
    kind: 'pack',
    skillIds: ['firebase-basics', 'firebase-auth-basics', 'firebase-firestore'],
    commandIds: [...DEV_LOOP_COMMANDS, 'sync-env'],
    sort: 19,
  },
  {
    id: 'convex-starter',
    icon: 'hexagon',
    color: '#FF5C35',
    labelFr: 'Convex',
    labelEn: 'Convex',
    briefFr:
      'Backend réactif Convex : quickstart + auth, TypeScript — parfait pour une app full-stack TS sans ops DB.',
    briefEn:
      'Reactive Convex backend: quickstart + auth, TypeScript — great for a full-stack TS app without DB ops.',
    kind: 'pack',
    skillIds: ['convex-quickstart', 'convex-setup-auth', 'typescript-advanced-types', 'react-patterns'],
    commandIds: [...DEV_LOOP_COMMANDS],
    sort: 20,
  },
  {
    id: 'docker-ops-starter',
    icon: 'shipping-container',
    color: '#2496ED',
    labelFr: 'Docker & ops',
    labelEn: 'Docker & ops',
    briefFr:
      'Conteneurs et déploiement : patterns Docker/deploy + commandes rebuild, sync env, smoke migrate et hotfix.',
    briefEn:
      'Containers and deploy: Docker/deploy patterns plus rebuild, env sync, migrate smoke and hotfix commands.',
    kind: 'pack',
    skillIds: ['docker-patterns', 'deployment-patterns', 'architecture-decision-records'],
    commandIds: ['docker-rebuild', 'sync-env', 'db-migrate-smoke', 'hotfix', 'adr'],
    sort: 21,
  },
  {
    id: 'n8n-starter',
    icon: 'share-network',
    color: '#EA4B71',
    labelFr: 'n8n',
    labelEn: 'n8n',
    briefFr:
      'Automatisation n8n self-host : workflows, webhooks, credentials, filet d’erreur — plus Docker Compose et le loop git/PR.',
    briefEn:
      'Self-hosted n8n automation: workflows, webhooks, credentials, error handling — plus Docker Compose and the git/PR loop.',
    kind: 'pack',
    skillIds: ['n8n-patterns', 'docker-patterns', 'api-design', 'error-handling'],
    commandIds: [...DEV_LOOP_COMMANDS, 'docker-rebuild', 'sync-env'],
    sort: 22,
  },
]

export function findCollectionSeed(id: string): CollectionSeed | undefined {
  return COLLECTIONS.find((c) => c.id === id)
}
