import { createFileRoute } from '@tanstack/react-router'
import { sitemapHandler, sitemapIndexDocument } from '#/lib/sitemap'

/** Index des sitemaps enfants — synchrone, sans Prisma / Neon. */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: sitemapHandler('index', () => sitemapIndexDocument()),
    },
  },
})
