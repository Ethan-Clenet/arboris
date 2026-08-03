import { createFileRoute } from '@tanstack/react-router'

/** Fichier de vérification Google Search Console (méthode HTML file upload). */
const BODY = 'google-site-verification: google2d4e68e917b5f045.html'

export const Route = createFileRoute('/google2d4e68e917b5f045.html')({
  server: {
    handlers: {
      GET: async () =>
        new Response(BODY, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})
