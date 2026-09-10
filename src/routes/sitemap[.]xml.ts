import { createFileRoute } from '@tanstack/react-router'
import { COLLECTIONS } from '#/lib/collections-data'
import { loadEmbeddedCommands } from '#/lib/commands-embedded'
import { isIndexableSkill, SITEMAP_INCLUDE_SKILL_PAGES } from '#/lib/seo'
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
        const today = new Date().toISOString().slice(0, 10)

        const staticPages = [
          urlEntry('/', { changefreq: 'daily', priority: '1.0', lastmod: today }),
          urlEntry('/getting-started', { changefreq: 'weekly', priority: '0.9', lastmod: today }),
          urlEntry('/skills', { changefreq: 'daily', priority: '0.9', lastmod: today }),
          urlEntry('/commands', { changefreq: 'weekly', priority: '0.8', lastmod: today }),
          urlEntry('/collections', { changefreq: 'weekly', priority: '0.8', lastmod: today }),
        ]

        // Collections & commandes : sources statiques (seed / bundle), aucune
        // requête base de données. Le sitemap reste ainsi rapide et fiable pour
        // les robots (pas de cold start Postgres → plus de « Impossible de
        // récupérer le sitemap » côté Search Console).
        const collectionPages = COLLECTIONS.map((c) =>
          urlEntry(`/collections/${encodeURIComponent(c.id)}`, {
            changefreq: 'weekly',
            priority: '0.7',
            lastmod: today,
          }),
        )

        const commandPages = loadEmbeddedCommands().map((c) =>
          urlEntry(`/commands/${encodeURIComponent(c.id)}`, {
            changefreq: 'weekly',
            priority: '0.6',
            lastmod: today,
          }),
        )

        // Fiches skills : désactivées par défaut (sitemap hub-first). On ne
        // touche la base que si elles sont réactivées, et jamais au point de
        // faire échouer le sitemap (fallback silencieux).
        let skillPages: string[] = []
        if (SITEMAP_INCLUDE_SKILL_PAGES) {
          try {
            const { loadCatalog } = await import('#/server/catalog.server')
            const catalog = await loadCatalog()
            skillPages = catalog.skills.filter(isIndexableSkill).map((s) =>
              urlEntry(`/skills/${encodeURIComponent(s.id)}`, {
                changefreq: 'weekly',
                priority: '0.6',
                lastmod: s.scannedAt?.slice(0, 10) ?? today,
              }),
            )
          } catch {
            skillPages = []
          }
        }

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
