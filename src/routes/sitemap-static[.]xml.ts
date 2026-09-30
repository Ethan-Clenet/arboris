import { createFileRoute } from '@tanstack/react-router'
import { sitemapHandler, urlsetXml } from '#/lib/sitemap'
import { staticSitemapUrls } from '#/lib/sitemap-sources'

export const Route = createFileRoute('/sitemap-static.xml')({
  server: {
    handlers: {
      GET: sitemapHandler('urlset', () => urlsetXml(staticSitemapUrls())),
    },
  },
})
