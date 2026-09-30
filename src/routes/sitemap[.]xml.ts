import { createFileRoute } from '@tanstack/react-router'
import { sitemapIndexDocument, xmlResponse } from '#/lib/sitemap'

async function sitemapIndexResponse() {
  const { sitemapIndexLastmods } = await import('#/server/sitemap.server')
  const lastmods = await sitemapIndexLastmods()
  return xmlResponse(sitemapIndexDocument(lastmods))
}

/** Index des sitemaps enfants (static, commands, collections, skills). */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: sitemapIndexResponse,
    },
  },
})
