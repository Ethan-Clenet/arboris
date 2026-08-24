import { createFileRoute } from '@tanstack/react-router'
import { isIndexableSkill } from '#/lib/seo'
import { absoluteUrl } from '#/lib/site'

function urlEntry(path: string, opts?: { changefreq?: string; priority?: string; lastmod?: string }) {
  const loc = absoluteUrl(path)
  const changefreq = opts?.changefreq ?? 'weekly'
  const priority = opts?.priority ?? '0.7'
  const lastmod = opts?.lastmod ? `\n    <lastmod>${opts.lastmod}</lastmod>` : ''
  return `  <url>
    <loc>${loc}</loc>${lastmod}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const { loadCatalog } = await import('#/server/catalog.server')
        const catalog = await loadCatalog()
        const today = new Date().toISOString().slice(0, 10)

        const staticPages = [
          urlEntry('/', { changefreq: 'daily', priority: '1.0', lastmod: today }),
          urlEntry('/getting-started', { changefreq: 'weekly', priority: '0.9', lastmod: today }),
          urlEntry('/skills', { changefreq: 'daily', priority: '0.9', lastmod: today }),
          urlEntry('/commands', { changefreq: 'weekly', priority: '0.8', lastmod: today }),
          urlEntry('/collections', { changefreq: 'weekly', priority: '0.8', lastmod: today }),
        ]

        const skillPages = catalog.skills
          .filter(isIndexableSkill)
          .map((s) =>
            urlEntry(`/skills/${encodeURIComponent(s.id)}`, {
              changefreq: 'weekly',
              priority: '0.6',
              lastmod: s.scannedAt?.slice(0, 10) ?? today,
            }),
          )

        const commandPages = catalog.commands.map((c) =>
          urlEntry(`/commands/${encodeURIComponent(c.id)}`, {
            changefreq: 'weekly',
            priority: '0.6',
            lastmod: today,
          }),
        )

        const collectionPages = (catalog.collections ?? []).map((c) =>
          urlEntry(`/collections/${encodeURIComponent(c.id)}`, {
            changefreq: 'weekly',
            priority: '0.7',
            lastmod: today,
          }),
        )

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...collectionPages, ...commandPages, ...skillPages].join('\n')}
</urlset>
`

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=21600, s-maxage=21600',
          },
        })
      },
    },
  },
})
