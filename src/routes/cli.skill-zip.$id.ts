import { createFileRoute } from '@tanstack/react-router'
import { serveCliZip } from '#/server/cli-zip-http'

/**
 * ZIP public pour l’installateur web :
 *   GET /cli/skill-zip/gateguard?agent=Cursor
 */
export const Route = createFileRoute('/cli/skill-zip/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }) => serveCliZip('skill', params.id, request),
    },
  },
})
