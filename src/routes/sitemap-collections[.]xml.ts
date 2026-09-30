import { createFileRoute } from '@tanstack/react-router'
import { sitemapHandler, urlsetXml } from '#/lib/sitemap'

export const Route = createFileRoute('/sitemap-collections.xml')({
  server: {
    handlers: {
      GET: sitemapHandler('urlset', async () => {
        const { collectionSitemapUrls } = await import('#/server/sitemap.server')
        return urlsetXml(await collectionSitemapUrls())
      }),
    },
  },
})
