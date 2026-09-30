import { isIndexableSkill, SEO_INDEX_MIN_SCORE, SEO_PREMIUM_PUBLISHERS, SITEMAP_INCLUDE_SKILL_PAGES } from '#/lib/seo'
import { collectionSeedSitemapUrls, todayLastmod } from '#/lib/sitemap-sources'
import { toLastmod, type SitemapUrl } from '#/lib/sitemap'

/** Délai max Prisma/Neon pour un sitemap enfant (sous le timeout serverless). */
export const SITEMAP_DB_TIMEOUT_MS = 4_000

export function skillSitemapWhere() {
  return {
    score: { gte: SEO_INDEX_MIN_SCORE },
    NOT: { id: { contains: '__' } },
    OR: [{ publisher: null }, { publisher: '' }, { publisher: { in: [...SEO_PREMIUM_PUBLISHERS] } }],
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`sitemap db timeout after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer)
    void promise.catch(() => undefined)
  })
}

async function loadPrisma(timeoutMs: number) {
  return withTimeout(import('./db').then((mod) => mod.prisma), timeoutMs)
}

export async function collectionSitemapUrls(timeoutMs = SITEMAP_DB_TIMEOUT_MS): Promise<SitemapUrl[]> {
  try {
    const prisma = await loadPrisma(timeoutMs)
    const rows = await withTimeout(
      prisma.collection.findMany({
        select: { id: true, updatedAt: true },
      }),
      timeoutMs,
    )
    if (rows.length > 0) {
      const day = todayLastmod()
      return rows.map((row) => ({
        path: `/collections/${encodeURIComponent(row.id)}`,
        changefreq: 'weekly' as const,
        priority: '0.7',
        lastmod: toLastmod(row.updatedAt) ?? day,
      }))
    }
  } catch {
    // cold start Neon / table absente — fallback seed (pas de 500)
  }
  return collectionSeedSitemapUrls()
}

export async function skillSitemapUrls(timeoutMs = SITEMAP_DB_TIMEOUT_MS): Promise<SitemapUrl[]> {
  if (!SITEMAP_INCLUDE_SKILL_PAGES) return []
  const day = todayLastmod()
  try {
    const prisma = await loadPrisma(timeoutMs)
    const rows = await withTimeout(
      prisma.skill.findMany({
        where: skillSitemapWhere(),
        select: { id: true, score: true, publisher: true, updatedAt: true },
      }),
      timeoutMs,
    )
    return rows.filter(isIndexableSkill).map((row) => ({
      path: `/skills/${encodeURIComponent(row.id)}`,
      changefreq: 'weekly' as const,
      priority: '0.6',
      lastmod: toLastmod(row.updatedAt) ?? day,
    }))
  } catch {
    return []
  }
}
