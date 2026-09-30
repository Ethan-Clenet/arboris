import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const body = `User-agent: *
Allow: /

# Indexation : soumettre le sitemap index dans Google Search Console
# https://search.google.com/search-console
# Enfants : /sitemap-static.xml, /sitemap-commands.xml,
# /sitemap-collections.xml, /sitemap-skills.xml

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap_index.xml
`
        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
