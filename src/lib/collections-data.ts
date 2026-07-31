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
    sort: 0,
  },
  {
    id: 'ship-safely',
    icon: 'shield-check',
    color: '#2E7D32',
    labelFr: 'Ship safely',
    labelEn: 'Ship safely',
    briefFr: 'Qualité et sécu avant merge : audit deps, diff sécu, couverture, owners.',
    briefEn: 'Quality and security before merge: dep audit, security diff, coverage, owners.',
    kind: 'pack',
    skillIds: [],
    commandIds: ['audit-deps', 'security-diff', 'test-coverage', 'owners-review', 'pr-quality'],
    sort: 1,
  },
  {
    id: 'ops-day-two',
    icon: 'gear-six',
    color: '#1565C0',
    labelFr: 'Ops day-two',
    labelEn: 'Ops day-two',
    briefFr: 'Le quotidien projet : sync env, docker rebuild, migrations, hotfix, ADR.',
    briefEn: 'Day-to-day ops: env sync, docker rebuild, migrations, hotfix, ADR.',
    kind: 'featured',
    skillIds: [],
    commandIds: ['sync-env', 'docker-rebuild', 'db-migrate-smoke', 'hotfix', 'adr'],
    sort: 2,
  },
]

export function findCollectionSeed(id: string): CollectionSeed | undefined {
  return COLLECTIONS.find((c) => c.id === id)
}
