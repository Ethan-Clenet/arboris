import { createFileRoute } from '@tanstack/react-router'
import { urlsetXml, xmlResponse } from '#/lib/sitemap'

export const Route = createFileRoute('/sitemap-commands.xml')({
  server: {
    handlers: {
      GET: async () => {
        const { commandSitemapUrls } = await import('#/server/sitemap.server')
        return xmlResponse(urlsetXml(commandSitemapUrls()))
      },
    },
  },
})
