import { isAgentName, type AgentName } from '#/lib/agents'
import {
  buildCollectionZip,
  buildCommandZip,
  buildSkillZip,
} from '#/server/install-cloud.server'
import { assertRateLimit, ZIP_RATE_LIMIT } from '#/server/rate-limit.server'

export type CliZipKind = 'collection' | 'skill' | 'command'

async function buildZip(
  kind: CliZipKind,
  id: string,
  agent: AgentName,
  lang: 'fr' | 'en',
): Promise<{ filename: string; base64: string; fileCount: number } | null> {
  switch (kind) {
    case 'collection':
      return buildCollectionZip({ collectionId: id, agent, lang })
    case 'skill':
      return buildSkillZip({ skillId: id, agent, lang })
    case 'command':
      return buildCommandZip({ commandId: id, agent, lang })
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

/** ZIP public pour les installateurs web (sans auth). */
export async function serveCliZip(
  kind: CliZipKind,
  id: string,
  request: Request,
): Promise<Response> {
  const url = new URL(request.url)
  const agentRaw = url.searchParams.get('agent') || 'Cursor'
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'fr'
  if (!isAgentName(agentRaw)) {
    return Response.json({ error: 'unknown_agent' }, { status: 400 })
  }
  const agent = agentRaw
  try {
    assertRateLimit(`zip:${kind}-cli`, ZIP_RATE_LIMIT)
    const zip = await buildZip(kind, id, agent, lang)
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
}
