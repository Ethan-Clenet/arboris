import { createFileRoute } from '@tanstack/react-router'
import { serveCliZip } from '#/server/cli-zip-http'

/**
 * ZIP public pour l’installateur web :
 *   GET /cli/command-zip/sonar?agent=Cursor
 */
export const Route = createFileRoute('/cli/command-zip/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }) => serveCliZip('command', params.id, request),
    },
  },
})
