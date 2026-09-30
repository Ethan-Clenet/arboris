import { COLLECTIONS } from '#/lib/collections-data'
import { loadEmbeddedCommands } from '#/lib/commands-embedded'
import { LEGAL_ROUTES, LEGAL_UPDATED } from '#/lib/site'
import type { SitemapUrl } from '#/lib/sitemap'

/** Sources sitemap sans Prisma — sûres au cold start Vercel / Neon. */

export function todayLastmod(): string {
  return new Date().toISOString().slice(0, 10)
}

export function staticSitemapUrls(): SitemapUrl[] {
  const day = todayLastmod()
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
  const day = todayLastmod()
  return loadEmbeddedCommands().map((command) => ({
    path: `/commands/${encodeURIComponent(command.id)}`,
    changefreq: 'weekly' as const,
    priority: '0.6',
    lastmod: day,
  }))
}

export function collectionSeedSitemapUrls(): SitemapUrl[] {
  const day = todayLastmod()
  return COLLECTIONS.map((collection) => ({
    path: `/collections/${encodeURIComponent(collection.id)}`,
    changefreq: 'weekly' as const,
    priority: '0.7',
    lastmod: day,
  }))
}
