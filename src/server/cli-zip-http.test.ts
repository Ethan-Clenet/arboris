import { describe, expect, it, vi } from 'vitest'

vi.mock('#/server/install-cloud.server', () => ({
  buildCollectionZip: vi.fn(),
  buildSkillZip: vi.fn(),
  buildCommandZip: vi.fn(),
}))

import { buildCollectionZip, buildCommandZip, buildSkillZip } from '#/server/install-cloud.server'
import { resetRateLimitBuckets } from '#/server/rate-limit.server'
import { serveCliZip } from './cli-zip-http'

function req(path: string): Request {
  return new Request(`https://arboristhree.xyz${path}`)
}

describe('serveCliZip', () => {
  it('refuse un agent inconnu', async () => {
    const res = await serveCliZip('skill', 'gateguard', req('/cli/skill-zip/gateguard?agent=Nope'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'unknown_agent' })
  })

  it('sert un ZIP skill et un ZIP commande avec compagnons', async () => {
    resetRateLimitBuckets()
    vi.mocked(buildSkillZip).mockResolvedValue({
      filename: 'arboris-skill-gateguard-cursor.zip',
      base64: Buffer.from('PK').toString('base64'),
      fileCount: 1,
    })
    const skillRes = await serveCliZip('skill', 'gateguard', req('/cli/skill-zip/gateguard?agent=Cursor'))
    expect(skillRes.status).toBe(200)
    expect(skillRes.headers.get('content-type')).toBe('application/zip')

    vi.mocked(buildCommandZip).mockResolvedValue({
      filename: 'arboris-command-sonar-cursor.zip',
      base64: Buffer.from('PK').toString('base64'),
      fileCount: 5,
    })
    const cmdRes = await serveCliZip('command', 'sonar', req('/cli/command-zip/sonar'))
    expect(cmdRes.status).toBe(200)
    expect(vi.mocked(buildCommandZip)).toHaveBeenCalledWith({
      commandId: 'sonar',
      agent: 'Cursor',
      lang: 'fr',
    })
  })

  it('renvoie 404 si la cible est inconnue', async () => {
    resetRateLimitBuckets()
    vi.mocked(buildCollectionZip).mockResolvedValue(null)
    const res = await serveCliZip(
      'collection',
      'missing',
      req('/cli/collection-zip/missing?agent=Claude&lang=en'),
    )
    expect(res.status).toBe(404)
    expect(vi.mocked(buildCollectionZip)).toHaveBeenCalledWith({
      collectionId: 'missing',
      agent: 'Claude',
      lang: 'en',
    })
  })
})
