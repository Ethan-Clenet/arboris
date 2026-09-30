import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from './db'
import { collectionSitemapUrls, skillSitemapUrls, skillSitemapWhere } from './sitemap.server'
import { SEO_INDEX_MIN_SCORE, SEO_PREMIUM_PUBLISHERS } from '#/lib/seo'

vi.mock('./db', () => ({
  prisma: {
    skill: { findMany: vi.fn() },
    collection: { findMany: vi.fn() },
  },
}))

beforeEach(() => {
  vi.mocked(prisma.skill.findMany).mockReset()
  vi.mocked(prisma.collection.findMany).mockReset()
})

describe('skillSitemapWhere', () => {
  it('filtre score et éditeurs premium côté SQL (pas de LIKE joker `_`)', () => {
    const where = skillSitemapWhere()
    expect(where.score).toEqual({ gte: SEO_INDEX_MIN_SCORE })
    expect(where).not.toHaveProperty('NOT')
    expect(JSON.stringify(where)).not.toContain("'__'")
    expect(where.OR).toEqual(
      expect.arrayContaining([
        { publisher: null },
        { publisher: '' },
        { publisher: { in: expect.arrayContaining([...SEO_PREMIUM_PUBLISHERS]) } },
      ]),
    )
  })
})

describe('skillSitemapUrls', () => {
  it('n’inclut que les fiches indexables, avec lastmod DB', async () => {
    vi.mocked(prisma.skill.findMany).mockResolvedValue([
      {
        id: 'fastapi-patterns',
        score: 90,
        publisher: 'FastAPI',
        updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      },
      {
        id: 'community-thing',
        score: 90,
        publisher: 'Community',
        updatedAt: new Date('2026-08-02T00:00:00.000Z'),
      },
      {
        id: 'hashed__microsoft-foo__path-aaaaaaaaaaaa',
        score: 100,
        publisher: 'Microsoft',
        updatedAt: new Date('2026-08-03T00:00:00.000Z'),
      },
    ] as never)

    const urls = await skillSitemapUrls()
    expect(prisma.skill.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: skillSitemapWhere() }),
    )
    expect(urls.map((u) => u.path)).toEqual(['/skills/fastapi-patterns'])
    expect(urls[0]?.lastmod).toBe('2026-08-01')
  })

  it('reste vide si la base est indisponible', async () => {
    vi.mocked(prisma.skill.findMany).mockRejectedValue(new Error('db down'))
    await expect(skillSitemapUrls()).resolves.toEqual([])
  })

  it('reste vide si Prisma/Neon dépasse le timeout', async () => {
    vi.mocked(prisma.skill.findMany).mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 80)) as never,
    )
    await expect(skillSitemapUrls(20)).resolves.toEqual([])
  })
})

describe('collectionSitemapUrls', () => {
  it('utilise updatedAt Prisma', async () => {
    vi.mocked(prisma.collection.findMany).mockResolvedValue([
      { id: 'sonar', updatedAt: new Date('2026-07-15T00:00:00.000Z') },
    ] as never)
    const urls = await collectionSitemapUrls()
    expect(urls).toEqual([
      expect.objectContaining({ path: '/collections/sonar', lastmod: '2026-07-15' }),
    ])
  })

  it('retombe sur le seed si la requête timeoute', async () => {
    vi.mocked(prisma.collection.findMany).mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 80)) as never,
    )
    const urls = await collectionSitemapUrls(20)
    expect(urls.length).toBeGreaterThan(0)
    expect(urls.every((u) => u.path.startsWith('/collections/'))).toBe(true)
  })
})
