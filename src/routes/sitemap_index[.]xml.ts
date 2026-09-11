import { createFileRoute } from '@tanstack/react-router'
import { absoluteUrl } from '#/lib/site'

/**
 * Index de sitemaps référençant `/sitemap.xml`.
 *
 * Utile pour Search Console : soumettre `sitemap_index.xml` fait repartir la
 * lecture sur une URL neuve, ce qui débloque un état « Impossible de lire »
 * resté collé sur l'URL initialement soumise. Généré sans requête base.
 */
export const Route = createFileRoute('/sitemap_index.xml')({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10)
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${absoluteUrl('/sitemap.xml')}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
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
