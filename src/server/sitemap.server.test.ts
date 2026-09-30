import { beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from './db'
import { collectionSitemapUrls, skillSitemapUrls } from './sitemap.server'

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
    expect(urls.map((u) => u.path)).toEqual(['/skills/fastapi-patterns'])
    expect(urls[0]?.lastmod).toBe('2026-08-01')
  })

  it('reste vide si la base est indisponible', async () => {
    vi.mocked(prisma.skill.findMany).mockRejectedValue(new Error('db down'))
    await expect(skillSitemapUrls()).resolves.toEqual([])
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
})
