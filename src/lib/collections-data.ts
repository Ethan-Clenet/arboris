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
      'Qualité et sécu avant merge : scan CVE (OSV), audits CWE/CAPEC du code, audit des dépendances, diff de sécurité, couverture de tests, revue owners et qualité de PR. Pack pour figer un gate de merge fiable dans ton agent.',
    briefEn:
      'Quality and security before merge: CVE scan (OSV), CWE/CAPEC source audits, dependency audit, security diff, test coverage, owners review and PR quality. A pack to lock a reliable merge gate into your agent.',
    kind: 'pack',
    skillIds: ['cve-scan', 'cwe-code-audit', 'capec-code-audit', 'security-review'],
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
      'Nouveau front React/TS : patterns UI, best practices Vercel, a11y, Tailwind/shadcn, Storybook, types avancés, tests — plus le loop git/PR.',
    briefEn:
      'New React/TS front: UI patterns, Vercel best practices, a11y, Tailwind/shadcn, Storybook, advanced types, tests — plus the git/PR loop.',
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
      'storybook-init__storybookjs-mcp__packages-claude-plugin-skills-a2bc33b421a7',
      'storybook-setup__storybookjs-mcp__packages-claude-plugin-skills-1177ad52aa1e',
      'stories__storybookjs-mcp__packages-claude-plugin-skills-3349d1fff05a',
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
      'API backend Node/TS : patterns API, NestJS, Prisma, erreurs, auth (better-auth), GateGuard — plus commit/PR et audit deps.',
    briefEn:
      'Node/TS backend API: API patterns, NestJS, Prisma, errors, auth (better-auth), GateGuard — plus commit/PR and dep audit.',
    kind: 'pack',
    skillIds: [
      'backend-patterns',
      'api-design',
      'nestjs-patterns',
      'error-handling',
      'better-auth-best-practices',
      'better-auth-create-auth',
      'gateguard',
      'prisma-patterns',
      'prisma-client-api__prisma-skills__666072967005',
      'prisma-database-setup__prisma-skills__84adae33e694',
      'prisma-postgres-setup__prisma-skills__a597e30d6752',
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
      'BaaS Supabase officiel : client, Postgres best practices, middleware Edge, serveur — sync env et loop PR inclus.',
    briefEn:
      'Official Supabase BaaS: client, Postgres best practices, Edge middleware, server — env sync and PR loop included.',
    kind: 'pack',
    skillIds: [
      'supabase__supabase-agent-skills__skills-10d811f18c48',
      'supabase-postgres-best-practices__supabase-agent-skills__skills-c56857f8a6dd',
      'supabase-middleware__supabase-middleware__skills-0ecdd475164e',
      'supabase-server__supabase-server__skills-3c7d3842e12d',
      'postgres-patterns',
      'backend-patterns',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'sync-env'],
    sort: 18,
  },
  {
    id: 'dotnet-starter',
    icon: 'code',
    color: '#512BD4',
    labelFr: '.NET',
    labelEn: '.NET',
    briefFr:
      'Stack .NET officielle : Web API, Blazor, auth, tests et data-driven ASP.NET — plus le loop git/PR.',
    briefEn:
      'Official .NET stack: Web API, Blazor, auth, tests and data-driven ASP.NET — plus the git/PR loop.',
    kind: 'pack',
    skillIds: [
      'dotnet-webapi__dotnet-skills__plugins-dotnet-aspnetcore-skills-980a8c0e5ab1',
      'create-blazor-project__dotnet-skills__plugins-dotnet-blazor-skills-905dac4cdbdc',
      'configure-auth__dotnet-skills__plugins-dotnet-blazor-skills-44ccaf0886cf',
      'create-datadriven-aspnetcore__dotnet-skills__plugins-dotnet-data-skills-20243398b6ad',
      'run-tests__dotnet-skills__plugins-dotnet-test-skills-cc92a5813bcc',
      'find-untested-sources__dotnet-skills__plugins-dotnet-test-skills-a09f7d2b9fbf',
      'platform-detection__dotnet-skills__plugins-dotnet-test-skills-964af918aeee',
      'dotnet-maui-doctor__dotnet-skills__plugins-dotnet-maui-skills-d3a82e0ff2fa',
    ],
    commandIds: [...DEV_LOOP_COMMANDS, 'test-coverage'],
    sort: 23,
  },
  {
    id: 'ansible-starter',
    icon: 'gear-six',
    color: '#EE0000',
    labelFr: 'Ansible',
    labelEn: 'Ansible',
    briefFr:
      'Automatisation Ansible : creator, lint, ade, contexte projet, revue PR et onboarding platform — avec le loop git/PR.',
    briefEn:
      'Ansible automation: creator, lint, ade, project context, PR review and platform onboarding — with the git/PR loop.',
    kind: 'pack',
    skillIds: [
      'td-ansible-creator__ansible-team-devtools__agents-skills-1312d9abdef1',
      'td-ansible-lint__ansible-team-devtools__agents-skills-ef110ba9bbdc',
      'td-ade__ansible-team-devtools__agents-skills-c4b175e686f1',
      'context__ansible-ansible__claude-skills-8f4e1e2f5c42',
      'review__ansible-ansible__claude-skills-9734495d581c',
      'platform-onboarding__ansible-ansible-platform__claude-skills-a970fda7a9f5',
    ],
    commandIds: [...DEV_LOOP_COMMANDS],
    sort: 24,
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
    skillIds: [
      'firebase-basics',
      'firebase-auth-basics',
      'firebase-firestore',
      'firebase-security-rules-auditor',
      'firestore-rules-creation',
    ],
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
    skillIds: ['convex', 'convex-quickstart', 'convex-auth', 'typescript-advanced-types', 'react-patterns'],
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

  // ── Créateurs SkillsMP ──────────────────────────────────────────────────

  {
    id: 'tanstack-starter',
    icon: 'atom',
    color: '#FF4154',
    labelFr: 'TanStack',
    labelEn: 'TanStack',
    briefFr:
      'L’écosystème TanStack pour ton agent : Router, Table, DB, AI, CLI, Devtools, Markdown et Charts — skills officiels pour des apps typées.',
    briefEn:
      'The TanStack ecosystem for your agent: Router, Table, DB, AI, CLI, Devtools, Markdown and Charts — official skills for typed apps.',
    kind: 'pack',
    skillIds: [
      'router-core__tanstack-router__packages-router-core-skills-328e4a02ccf4',
      'react-router__tanstack-router__packages-react-router-skills-b72f526e5a17',
      'getting-started__tanstack-table__packages-react-table-skills-d0a18e2e6b35',
      'db-core__tanstack-db__packages-db-skills-bf749623722c',
      'react-db__tanstack-db__packages-react-db-skills-1577437e7ffe',
      'ai-core__tanstack-ai__packages-ai-skills-7d55d561d2b9',
      'create-app-scaffold__tanstack-cli__packages-cli-skills-18a29568da8c',
      'devtools-app-setup__tanstack-devtools__packages-devtools-skills-95701495e0a5',
      'render-markdown__tanstack-markdown__skills-0187275deb8b',
      'design-a-chart__tanstack-charts__packages-charts-core-skills-0dfd76b25145',
    ],
    commandIds: [],
    sort: 25,
  },
  {
    id: 'cypress-testing',
    icon: 'flask',
    color: '#69D3A7',
    labelFr: 'Cypress',
    labelEn: 'Cypress',
    briefFr:
      'Tests E2E et composant avec Cypress : écrire, expliquer et corriger des tests, piloter la CLI cy-cloud et cypress tap, plus la doc officielle.',
    briefEn:
      'E2E and component testing with Cypress: write, explain and fix tests, drive the cy-cloud and cypress tap CLIs, plus official docs.',
    kind: 'pack',
    skillIds: [
      'cypress-author__cypress-io-ai-toolkit__skills-f7f2bc4eede4',
      'cypress-explain__cypress-io-ai-toolkit__skills-2bde5c2a7e66',
      'cypress-docs__cypress-io-ai-toolkit__skills-eb326601e05e',
      'cypress-tap__cypress-io-ai-toolkit__skills-4767aa6d491b',
      'cypress-cloud-cli__cypress-io-ai-toolkit__skills-2973b89d6fbe',
    ],
    commandIds: [],
    sort: 26,
  },
  {
    id: 'ux-ui-pro',
    icon: 'palette',
    color: '#A855F7',
    labelFr: 'UX / UI Pro',
    labelEn: 'UX / UI Pro',
    briefFr:
      'Design intelligence NextLevelBuilder (UI/UX Pro Max) : styles UI, design system, brand, slides, banners et styling — pack UX/UI prêt pour ton agent.',
    briefEn:
      'NextLevelBuilder design intelligence (UI/UX Pro Max): UI styles, design system, brand, slides, banners and styling — a UX/UI pack ready for your agent.',
    kind: 'pack',
    skillIds: [
      'ui-ux-pro-max__nextlevelbuilder-ui-ux-pro-max-skill__claude-skills-fa8b0c2ef9a4',
      'design__nextlevelbuilder-ui-ux-pro-max-skill__claude-skills-c488ca8fe826',
      'design-system__nextlevelbuilder-ui-ux-pro-max-skill__claude-skills-f0b90bc5992f',
      'ui-styling__nextlevelbuilder-ui-ux-pro-max-skill__claude-skills-2b213cb6cb18',
      'brand__nextlevelbuilder-ui-ux-pro-max-skill__claude-skills-5d741ed8256c',
      'slides__nextlevelbuilder-ui-ux-pro-max-skill__claude-skills-f9ed6474d872',
      'banner-design__nextlevelbuilder-ui-ux-pro-max-skill__claude-skills-e2a4f126c877',
    ],
    commandIds: [],
    sort: 27,
  },
  {
    id: 'yunt-docker',
    icon: 'shipping-container',
    color: '#0A0A0A',
    labelFr: 'Yunt — Docker',
    labelEn: 'Yunt — Docker',
    briefFr:
      'Cours Yunt Academy « Conteneuriser ses projets web avec Docker » : fondamentaux, conteneurs, images/Dockerfile, volumes/réseaux et Compose — 5 skills condensés avec autorisation du créateur.',
    briefEn:
      'Yunt Academy course “Containerize your web projects with Docker”: fundamentals, containers, images/Dockerfile, volumes/networks and Compose — 5 condensed skills with creator permission.',
    kind: 'pack',
    skillIds: [
      'yunt-docker-fundamentals',
      'yunt-docker-containers',
      'yunt-docker-images-build',
      'yunt-docker-volumes-networks',
      'yunt-docker-compose',
    ],
    commandIds: ['docker-rebuild'],
    sort: 28,
  },
]

export function findCollectionSeed(id: string): CollectionSeed | undefined {
  const raw = id.trim().toLowerCase()
  if (!raw) return undefined

  const exact = COLLECTIONS.find((c) => c.id === raw)
  if (exact) return exact

  if (raw === 'yunt' || raw === 'yunt-docker-course') {
    return COLLECTIONS.find((c) => c.id === 'yunt-docker')
  }

  // Alias court : `tanstack` → `tanstack-starter`, `react-ts` → `react-ts-starter`
  const withStarter = COLLECTIONS.find((c) => c.id === `${raw}-starter`)
  if (withStarter) return withStarter

  // Préfixe unique : `docker` → `docker-ops-starter` si un seul match
  // (exclure les ids déjà préfixés comme `yunt-docker` quand on cherche `docker`)
  const prefixed = COLLECTIONS.filter(
    (c) => c.id.startsWith(`${raw}-`) || (c.id.startsWith(raw) && c.id !== raw),
  )
  if (prefixed.length === 1) return prefixed[0]

  return undefined
}

