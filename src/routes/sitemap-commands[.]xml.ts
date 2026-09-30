import { createFileRoute } from '@tanstack/react-router'
import { sitemapHandler, urlsetXml } from '#/lib/sitemap'
import { commandSitemapUrls } from '#/lib/sitemap-sources'

export const Route = createFileRoute('/sitemap-commands.xml')({
  server: {
    handlers: {
      GET: sitemapHandler('urlset', () => urlsetXml(commandSitemapUrls())),
    },
  },
})
