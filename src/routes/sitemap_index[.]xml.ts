import { createFileRoute } from '@tanstack/react-router'
import { sitemapIndexDocument, xmlResponse } from '#/lib/sitemap'

/**
 * Alias de `/sitemap.xml` (même index). Search Console peut rester collée
 * sur l’URL historiquement soumise.
 */
export const Route = createFileRoute('/sitemap_index.xml')({
  server: {
    handlers: {
      GET: async () => {
        const { sitemapIndexLastmods } = await import('#/server/sitemap.server')
        const lastmods = await sitemapIndexLastmods()
        return xmlResponse(sitemapIndexDocument(lastmods))
      },
    },
  },
})
