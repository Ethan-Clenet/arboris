import { COLLECTIONS } from '#/lib/collections-data'
import { loadEmbeddedCommands } from '#/lib/commands-embedded'
import { isIndexableSkill, SITEMAP_INCLUDE_SKILL_PAGES } from '#/lib/seo'
import { LEGAL_ROUTES, LEGAL_UPDATED } from '#/lib/site'
import { toLastmod, type SitemapUrl } from '#/lib/sitemap'
import { prisma } from './db'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function staticSitemapUrls(): SitemapUrl[] {
  const day = today()
  return [
    { path: '/', changefreq: 'daily', priority: '1.0', lastmod: day },
    { path: '/getting-started', changefreq: 'weekly', priority: '0.9', lastmod: day },
    { path: '/skills', changefreq: 'daily', priority: '0.9', lastmod: day },
    { path: '/commands', changefreq: 'weekly', priority: '0.8', lastmod: day },
    { path: '/collections', changefreq: 'weekly', priority: '0.8', lastmod: day },
    ...LEGAL_ROUTES.map((page) => ({
      path: page.path,
      changefreq: 'yearly' as const,
      priority: '0.3',
      lastmod: LEGAL_UPDATED,
    })),
  ]
}

export function commandSitemapUrls(): SitemapUrl[] {
  const day = today()
  return loadEmbeddedCommands().map((command) => ({
    path: `/commands/${encodeURIComponent(command.id)}`,
    changefreq: 'weekly' as const,
    priority: '0.6',
    lastmod: day,
  }))
}

export async function collectionSitemapUrls(): Promise<SitemapUrl[]> {
  const day = today()
  try {
    const rows = await prisma.collection.findMany({
      select: { id: true, updatedAt: true },
    })
    if (rows.length > 0) {
      return rows.map((row) => ({
        path: `/collections/${encodeURIComponent(row.id)}`,
        changefreq: 'weekly' as const,
        priority: '0.7',
        lastmod: toLastmod(row.updatedAt) ?? day,
      }))
    }
  } catch {
    // table absente — fallback seed
  }
  return COLLECTIONS.map((collection) => ({
    path: `/collections/${encodeURIComponent(collection.id)}`,
    changefreq: 'weekly' as const,
    priority: '0.7',
    lastmod: day,
  }))
}

export async function skillSitemapUrls(): Promise<SitemapUrl[]> {
  if (!SITEMAP_INCLUDE_SKILL_PAGES) return []
  const day = today()
  try {
    const rows = await prisma.skill.findMany({
      select: { id: true, score: true, publisher: true, updatedAt: true },
    })
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

export async function sitemapIndexLastmods(): Promise<
  Partial<Record<'static' | 'commands' | 'collections' | 'skills', string>>
> {
  const day = today()
  const [collections, skills] = await Promise.all([collectionSitemapUrls(), skillSitemapUrls()])
  const maxLastmod = (urls: SitemapUrl[]) =>
    urls.reduce<string>((acc, url) => ((url.lastmod ?? '') > acc ? (url.lastmod as string) : acc), day)
  return {
    static: day,
    commands: day,
    collections: maxLastmod(collections),
    skills: skills.length > 0 ? maxLastmod(skills) : day,
  }
}
