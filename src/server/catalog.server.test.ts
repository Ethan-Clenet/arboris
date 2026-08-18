import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from './db'
import {
  invalidateCatalogCache,
  loadCatalog,
  loadCollection,
  loadCommand,
  loadSkill,
  loadSkillPageContext,
} from './catalog.server'

vi.mock('./db', () => ({
  prisma: {
    category: { findMany: vi.fn(), findUnique: vi.fn() },
    stack: { findMany: vi.fn() },
    skill: { findMany: vi.fn(), findUnique: vi.fn() },
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
