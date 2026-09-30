import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const vercel = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../vercel.json'), 'utf-8'),
) as {
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>
}

function header(source: string, key: string): string | undefined {
  const block = vercel.headers.find((entry) => entry.source === source)
  return block?.headers.find((h) => h.key === key)?.value
}

describe('en-têtes Vercel (cache, CSP, HSTS)', () => {
  it('cache le HTML anonyme des listes et fiches', () => {
    const htmlCache = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
    expect(header('/', 'Cache-Control')).toBe(htmlCache)
    expect(header('/skills(.*)', 'Cache-Control')).toBe(htmlCache)
    expect(header('/commands(.*)', 'Cache-Control')).toBe(htmlCache)
    expect(header('/collections(.*)', 'Cache-Control')).toBe(htmlCache)
    expect(header('/getting-started', 'Cache-Control')).toBe(htmlCache)
  })

  it('cache plus longtemps les pages légales', () => {
    const legal = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'
    expect(header('/mentions-legales', 'Cache-Control')).toBe(legal)
    expect(header('/confidentialite', 'Cache-Control')).toBe(legal)
  })

  it('retire le domaine Analytics inutilisé et pose includeSubDomains', () => {
    const csp = header('/(.*)', 'Content-Security-Policy')
    expect(csp).toBeTruthy()
    expect(csp).not.toContain('va.vercel-scripts.com')
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
    expect(header('/(.*)', 'Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains')
  })
})
