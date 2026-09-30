import { createFileRoute } from '@tanstack/react-router'
import { sitemapHandler, sitemapIndexDocument } from '#/lib/sitemap'

/**
 * Alias de `/sitemap.xml` (même index). Search Console peut rester collée
 * sur l’URL historiquement soumise. Sans Prisma / Neon.
 */
export const Route = createFileRoute('/sitemap_index.xml')({
  server: {
    handlers: {
      GET: sitemapHandler('index', () => sitemapIndexDocument()),
    },
  },
})
