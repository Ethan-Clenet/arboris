import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from './db'
import {
  invalidateCatalogCache,
  loadCatalog,
  loadCollection,
  loadCommand,
  loadCommandsIndex,
  loadCollectionsIndex,
  loadHomeCatalog,
  loadSkill,
  loadSkillPageContext,
  loadSkillsListPage,
} from './catalog.server'

vi.mock('./db', () => ({
  prisma: {
    category: { findMany: vi.fn(), findUnique: vi.fn() },
    stack: { findMany: vi.fn() },
    skill: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn() },
    collection: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}))

const skillRow = {
  id: 'gateguard',
  categoryId: 'security',
  icon: 'shield-check',
  score: 90,
  securityRecommendation: 'SAFE',
  scannedAt: new Date('2026-01-01T00:00:00.000Z'),
  publisher: 'ECC',
  techJson: '["ts"]',
  compatJson: '["Cursor"]',
  tagFr: 'Garde',
  tagEn: 'Guard',
  actFr: 'filtre',
  actEn: 'filters',
  stacks: [{ id: 'ts' }],
}

beforeEach(() => {
  invalidateCatalogCache()
  vi.mocked(prisma.category.findMany).mockReset()
  vi.mocked(prisma.category.findUnique).mockReset()
  vi.mocked(prisma.stack.findMany).mockReset()
  vi.mocked(prisma.skill.findMany).mockReset()
  vi.mocked(prisma.skill.findUnique).mockReset()
  vi.mocked(prisma.skill.count).mockReset()
  vi.mocked(prisma.collection.findMany).mockReset()
  vi.mocked(prisma.collection.findUnique).mockReset()
})

describe('loadCatalog', () => {
  it('assemble le catalogue et met en cache', async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 'security', labelFr: 'Sécu', labelEn: 'Sec', color: '#0D9488', icon: 'shield', sort: 0 },
    ] as never)
    vi.mocked(prisma.stack.findMany).mockResolvedValue([
      {
        id: 'ts',
        label: 'TypeScript',
        icon: 'code',
        color: '#3178C6',
        briefFr: 'ts',
        briefEn: 'ts',
        sort: 0,
        skills: [{ id: 'gateguard' }],
      },
    ] as never)
    vi.mocked(prisma.skill.findMany).mockResolvedValue([skillRow] as never)
    vi.mocked(prisma.collection.findMany).mockResolvedValue([] as never)

    const catalog = await loadCatalog()
    expect(catalog.skills[0]).toMatchObject({ id: 'gateguard', tech: ['ts'], stacks: ['ts'] })
    expect(catalog.categories[0]?.id).toBe('security')
    expect(catalog.commands.length).toBeGreaterThan(0)

    const again = await loadCatalog()
    expect(again).toBe(catalog)
    expect(prisma.skill.findMany).toHaveBeenCalledTimes(1)
  })
})

describe('loadHomeCatalog', () => {
  it('retourne un payload réduit (pas tout le catalogue)', async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 'security', labelFr: 'Sécu', labelEn: 'Sec', color: '#0D9488', icon: 'shield', sort: 0 },
    ] as never)
    vi.mocked(prisma.skill.count).mockResolvedValue(42 as never)
    vi.mocked(prisma.skill.findMany).mockResolvedValue([skillRow] as never)

    const home = await loadHomeCatalog()
    expect(home.skillTotal).toBe(42)
    expect(home.popular).toHaveLength(1)
    expect(home.trending).toHaveLength(1)
    expect(home.recent).toHaveLength(1)
    expect(home.categories[0]?.id).toBe('security')
    expect(prisma.skill.findMany).toHaveBeenCalledTimes(3)
  })

  it('dérive depuis le cache full catalog quand disponible', async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 'security', labelFr: 'Sécu', labelEn: 'Sec', color: '#0D9488', icon: 'shield', sort: 0 },
    ] as never)
    vi.mocked(prisma.stack.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.skill.findMany).mockResolvedValue([skillRow] as never)
    vi.mocked(prisma.collection.findMany).mockResolvedValue([] as never)

    await loadCatalog()
    vi.mocked(prisma.skill.findMany).mockClear()
    vi.mocked(prisma.skill.count).mockClear()

    const home = await loadHomeCatalog()
    expect(home.skillTotal).toBe(1)
    expect(home.popular[0]?.id).toBe('gateguard')
    expect(prisma.skill.findMany).not.toHaveBeenCalled()
    expect(prisma.skill.count).not.toHaveBeenCalled()
  })
})

describe('loadSkill', () => {
  it('détaille un skill ou null', async () => {
    vi.mocked(prisma.skill.findUnique).mockResolvedValue({
      ...skillRow,
      doesFrJson: '["a"]',
      doesEnJson: '["a"]',
      triggersFrJson: 'not-json',
      triggersEnJson: '[]',
      securityReportJson: null,
    } as never)
    const skill = await loadSkill('gateguard')
    expect(skill).toMatchObject({ id: 'gateguard', does: { fr: ['a'] }, triggers: { fr: [] } })

    vi.mocked(prisma.skill.findUnique).mockResolvedValue({
      ...skillRow,
      techJson: '{"not":"array"}',
      compatJson: '[]',
      doesFrJson: '[]',
      doesEnJson: '[]',
      triggersFrJson: '[]',
      triggersEnJson: '[]',
      securityReportJson: null,
      securityRecommendation: null,
      score: 40,
    } as never)
    const parsed = await loadSkill('gateguard')
    expect(parsed?.tech).toEqual([])
    expect(parsed?.securityRecommendation).toBe('UNSAFE')

    vi.mocked(prisma.skill.findUnique).mockResolvedValue(null)
    expect(await loadSkill('missing')).toBeNull()
  })
})

describe('loadCommand / loadCollection', () => {
  it('résout une commande embarquée', async () => {
    const cmd = await loadCommand('commit')
    expect(cmd?.id).toBe('commit')
  })

  it('replie sur le seed si la table collections est vide/absente', async () => {
    vi.mocked(prisma.collection.findUnique).mockRejectedValue(new Error('no table'))
    vi.mocked(prisma.skill.findMany).mockResolvedValue([skillRow] as never)
    const col = await loadCollection('sonar')
    expect(col?.id).toBe('sonar')
    expect(col?.commandIds).toContain('sonar')
    expect(await loadCollection('__nope__')).toBeNull()
  })

  it('mappe une collection Prisma quand la ligne existe', async () => {
    vi.mocked(prisma.collection.findUnique).mockResolvedValue({
      id: 'sonar',
      icon: 'broadcast',
      color: '#0D9488',
      kind: 'pack',
      labelFr: 'Sonar',
      labelEn: 'Sonar',
      briefFr: 'b',
      briefEn: 'b',
      commandIdsJson: '["commit","missing-cmd"]',
      skills: [skillRow],
    } as never)
    const col = await loadCollection('sonar')
    expect(col).toMatchObject({ id: 'sonar', skillIds: ['gateguard'] })
    expect(col?.commands.some((c) => c.id === 'commit')).toBe(true)
  })
})

describe('loadSkillPageContext', () => {
  it('retourne null ou assemble catégorie + skills liés', async () => {
    vi.mocked(prisma.skill.findUnique).mockResolvedValue(null)
    expect(await loadSkillPageContext('missing')).toBeNull()

    vi.mocked(prisma.skill.findUnique).mockResolvedValue({
      ...skillRow,
      doesFrJson: '[]',
      doesEnJson: '[]',
      triggersFrJson: '[]',
      triggersEnJson: '[]',
      securityReportJson: null,
    } as never)
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      id: 'security',
      labelFr: 'Sécu',
      labelEn: 'Sec',
      color: '#0D9488',
      icon: 'shield',
    } as never)
    vi.mocked(prisma.skill.findMany)
      .mockResolvedValueOnce([{ ...skillRow, id: 'safety-guard' }] as never)
      .mockResolvedValueOnce([{ ...skillRow, id: 'other', categoryId: 'ops' }] as never)

    const ctx = await loadSkillPageContext('gateguard')
    expect(ctx?.category?.id).toBe('security')
    expect(ctx?.related.map((s) => s.id)).toEqual(['safety-guard', 'other'])

    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.skill.findMany)
      .mockResolvedValueOnce([
        { ...skillRow, id: 'a' },
        { ...skillRow, id: 'b' },
        { ...skillRow, id: 'c' },
      ] as never)
      .mockResolvedValueOnce([{ ...skillRow, id: 'd' }] as never)
    const full = await loadSkillPageContext('gateguard')
    expect(full?.category).toBeNull()
    expect(full?.related).toHaveLength(3)
  })
})

describe('loadSkillsListPage / index légers', () => {
  function mockFullCatalog(skillCount: number) {
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: 'security', labelFr: 'Sécu', labelEn: 'Sec', color: '#0D9488', icon: 'shield', sort: 0 },
    ] as never)
    vi.mocked(prisma.stack.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.collection.findMany).mockResolvedValue([] as never)
    const rows = Array.from({ length: skillCount }, (_, i) => ({
      ...skillRow,
      id: `skill-${String(i).padStart(3, '0')}`,
      score: 100 - i,
    }))
    vi.mocked(prisma.skill.findMany).mockResolvedValue(rows as never)
  }

  it('ne sérialise que 40 skills et des facettes', async () => {
    mockFullCatalog(45)
    const page = await loadSkillsListPage({})
    expect(page.skills).toHaveLength(40)
    expect(page.total).toBe(45)
    expect(page.totalUnfiltered).toBe(45)
    expect(page.pageCount).toBe(2)
    expect(page.path).toBe('/skills')
    expect(page.skills[0]).not.toHaveProperty('act')
    expect(JSON.stringify(page).length).toBeLessThan(80_000)

    const page2 = await loadSkillsListPage({ page: 2 })
    expect(page2.skills).toHaveLength(5)
    expect(page2.path).toBe('/skills?page=2')
  })

  it('filtre côté serveur sans renvoyer tout le catalogue', async () => {
    mockFullCatalog(3)
    const page = await loadSkillsListPage({ q: 'skill-001' })
    expect(page.total).toBe(1)
    expect(page.skills[0]?.id).toBe('skill-001')
  })

  it('charge commandes et collections sans skills', async () => {
    mockFullCatalog(12)
    const commands = await loadCommandsIndex()
    const collections = await loadCollectionsIndex()
    expect(commands.commands.length).toBeGreaterThan(0)
    expect(commands).not.toHaveProperty('skills')
    expect(collections.collections.length).toBeGreaterThan(0)
    expect(collections).not.toHaveProperty('skills')
  })
})
