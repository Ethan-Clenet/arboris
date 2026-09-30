import { createFileRoute } from '@tanstack/react-router'
import { urlsetXml, xmlResponse } from '#/lib/sitemap'

export const Route = createFileRoute('/sitemap-skills.xml')({
  server: {
    handlers: {
      GET: async () => {
        const { skillSitemapUrls } = await import('#/server/sitemap.server')
        return xmlResponse(urlsetXml(await skillSitemapUrls()))
      },
    },
  },
})
