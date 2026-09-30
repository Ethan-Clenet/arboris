import { createFileRoute } from '@tanstack/react-router'
import { sitemapHandler, urlsetXml } from '#/lib/sitemap'

export const Route = createFileRoute('/sitemap-skills.xml')({
  server: {
    handlers: {
      GET: sitemapHandler('urlset', async () => {
        const { skillSitemapUrls } = await import('#/server/sitemap.server')
        return urlsetXml(await skillSitemapUrls())
      }),
    },
  },
})
