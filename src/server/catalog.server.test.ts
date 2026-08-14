import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from './db'
import {
  invalidateCatalogCache,
  loadCatalog,
  loadCollection,
  loadCommand,
  loadSkill,
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
})
