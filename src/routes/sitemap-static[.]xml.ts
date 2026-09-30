import { createFileRoute } from '@tanstack/react-router'
import { urlsetXml, xmlResponse } from '#/lib/sitemap'

export const Route = createFileRoute('/sitemap-static.xml')({
  server: {
    handlers: {
      GET: async () => {
        const { staticSitemapUrls } = await import('#/server/sitemap.server')
        return xmlResponse(urlsetXml(staticSitemapUrls()))
      },
    },
  },
})
