import { createFileRoute } from '@tanstack/react-router'
import { serveCliZip } from '#/server/cli-zip-http'

/**
 * ZIP public pour l’installateur web :
 *   GET /cli/collection-zip/ux-ui-pro?agent=Cursor
 */
export const Route = createFileRoute('/cli/collection-zip/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }) => serveCliZip('collection', params.id, request),
    },
  },
})
