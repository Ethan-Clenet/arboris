import { absoluteUrl } from '#/lib/site'

export type SitemapUrl = {
  path: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: string
  lastmod?: string
}

export type SitemapIndexEntry = {
  loc: string
  lastmod?: string
}

export const SITEMAP_CHILDREN = [
  { path: '/sitemap-static.xml', key: 'static' },
  { path: '/sitemap-commands.xml', key: 'commands' },
  { path: '/sitemap-collections.xml', key: 'collections' },
  { path: '/sitemap-skills.xml', key: 'skills' },
] as const

export const SITEMAP_XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=21600, s-maxage=21600',
} as const

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function toLastmod(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined
  const iso = value instanceof Date ? value.toISOString() : value
  const day = iso.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : undefined
}

function urlEntry(entry: SitemapUrl): string {
  const loc = xmlEscape(absoluteUrl(entry.path))
  const changefreq = entry.changefreq ?? 'weekly'
  const priority = entry.priority ?? '0.7'
  const lastmod = entry.lastmod ? `\n    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : ''
  return `  <url>
    <loc>${loc}</loc>${lastmod}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export function urlsetXml(entries: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join('\n')}
</urlset>
`
}

export function sitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>` : ''
      return `  <sitemap>
    <loc>${xmlEscape(entry.loc)}</loc>${lastmod}
  </sitemap>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</sitemapindex>
`
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, { headers: { ...SITEMAP_XML_HEADERS } })
}

export function sitemapIndexDocument(lastmodByChild: Partial<Record<(typeof SITEMAP_CHILDREN)[number]['key'], string>> = {}) {
  const today = new Date().toISOString().slice(0, 10)
  return sitemapIndexXml(
    SITEMAP_CHILDREN.map((child) => ({
      loc: absoluteUrl(child.path),
      lastmod: lastmodByChild[child.key] ?? today,
    })),
  )
}

export type SitemapKind = 'index' | 'urlset'

function fallbackXml(kind: SitemapKind): string {
  switch (kind) {
    case 'index':
      return sitemapIndexDocument()
    case 'urlset':
      return urlsetXml([])
    default: {
      const _exhaustive: never = kind
      void _exhaustive
      return urlsetXml([])
    }
  }
}

/**
 * Handler GET sitemap : jamais de 500. Un throw (Prisma, timeout Neon, import)
 * renvoie un XML valide (index synchrone ou urlset vide).
 */
export function sitemapHandler(
  kind: SitemapKind,
  build: () => string | Promise<string>,
): () => Promise<Response> {
  return async () => {
    try {
      return xmlResponse(await build())
    } catch (err) {
      console.error('[sitemap]', kind, err)
      return xmlResponse(fallbackXml(kind))
    }
  }
}
