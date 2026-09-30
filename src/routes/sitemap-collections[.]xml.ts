import { createFileRoute } from '@tanstack/react-router'
import { urlsetXml, xmlResponse } from '#/lib/sitemap'

export const Route = createFileRoute('/sitemap-collections.xml')({
  server: {
    handlers: {
      GET: async () => {
        const { collectionSitemapUrls } = await import('#/server/sitemap.server')
        return xmlResponse(urlsetXml(await collectionSitemapUrls()))
      },
    },
  },
})
