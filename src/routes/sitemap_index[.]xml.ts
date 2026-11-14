import { createFileRoute } from '@tanstack/react-router'
import { sitemapIndexRedirectResponse } from '#/lib/sitemap'

/**
 * Ancien alias de `/sitemap.xml`. Redirige en 308 pour ne garder
 * qu’un index déclaré (robots.txt + Search Console).
 */
export const Route = createFileRoute('/sitemap_index.xml')({
  server: {
    handlers: {
      GET: async () => sitemapIndexRedirectResponse(),
    },
  },
})
