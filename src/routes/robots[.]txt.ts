import { createFileRoute } from '@tanstack/react-router'
import { robotsDocument } from '#/lib/robots'
import { SITE_URL } from '#/lib/site'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(robotsDocument(SITE_URL), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
