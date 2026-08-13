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
]

export function findCollectionSeed(id: string): CollectionSeed | undefined {
  return COLLECTIONS.find((c) => c.id === id)
}
