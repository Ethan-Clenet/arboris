import { createFileRoute } from '@tanstack/react-router'
import { isAgentName, type AgentName } from '#/lib/agents'
import { buildCollectionZip } from '#/server/install-cloud.server'
import { assertRateLimit, ZIP_RATE_LIMIT } from '#/server/rate-limit.server'

/**
 * ZIP public pour la CLI / npx (sans auth) :
 *   GET /cli/collection-zip/ux-ui-pro?agent=Cursor
 */
export const Route = createFileRoute('/cli/collection-zip/$id')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url)
        const agentRaw = url.searchParams.get('agent') || 'Cursor'
        const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'fr'
        if (!isAgentName(agentRaw)) {
          return Response.json({ error: 'unknown_agent' }, { status: 400 })
        }
        const agent = agentRaw as AgentName
        try {
          assertRateLimit('zip:collection-cli', ZIP_RATE_LIMIT)
          const zip = await buildCollectionZip({
            collectionId: params.id,
            agent,
            lang,
          })
          if (!zip) return Response.json({ error: 'not_found' }, { status: 404 })
          const bytes = Buffer.from(zip.base64, 'base64')
          return new Response(bytes, {
            status: 200,
            headers: {
              'content-type': 'application/zip',
              'content-disposition': `attachment; filename="${zip.filename}"`,
              'cache-control': 'public, max-age=300',
            },
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'error'
          const status = msg === 'rate_limited' ? 429 : msg === 'zip_too_large' ? 413 : 500
          return Response.json({ error: msg }, { status })
        }
      },
    },
  },
})
