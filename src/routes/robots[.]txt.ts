import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth

# Indexation : soumettre le sitemap dans Google Search Console
# https://search.google.com/search-console

Sitemap: ${SITE_URL}/sitemap.xml
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
