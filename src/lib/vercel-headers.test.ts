import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const vercel = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../vercel.json'), 'utf-8'),
) as {
  headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>
  redirects: Array<{ source: string; destination: string; permanent?: boolean }>
}

function header(source: string, key: string): string | undefined {
  const block = vercel.headers.find((entry) => entry.source === source)
  return block?.headers.find((h) => h.key === key)?.value
}

describe('en-têtes Vercel (cache, CSP, HSTS)', () => {
  it('cache le HTML anonyme des listes et fiches (ISR CDN)', () => {
    const htmlCache = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
    for (const source of ['/', '/skills(.*)', '/commands(.*)', '/collections(.*)', '/getting-started']) {
      expect(header(source, 'Cache-Control'), source).toBe(htmlCache)
      expect(header(source, 'CDN-Cache-Control'), source).toBe(htmlCache)
      expect(header(source, 'Vercel-CDN-Cache-Control'), source).toBe(htmlCache)
    }
  })

  it('redirige sitemap_index.xml vers l’index unique', () => {
    expect(vercel.redirects.find((entry) => entry.source === '/sitemap_index.xml')).toMatchObject({
      destination: '/sitemap.xml',
      permanent: true,
    })
  })

  it('cache plus longtemps les pages légales', () => {
    const legal = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400'
    expect(header('/mentions-legales', 'Cache-Control')).toBe(legal)
    expect(header('/confidentialite', 'Cache-Control')).toBe(legal)
  })

  it('redirige en 301 les skills Neon fusionnés vers neon-postgres', () => {
    const merged = [
      '/skills/neon-postgres-branches',
      '/skills/neon-postgres-egress-optimizer',
    ]
    for (const source of merged) {
      const rule = vercel.redirects.find((entry) => entry.source === source)
      expect(rule, source).toMatchObject({
        destination: '/skills/neon-postgres',
        permanent: true,
      })
    }
  })

  it('retire le domaine Analytics inutilisé et pose includeSubDomains', () => {
    const csp = header('/(.*)', 'Content-Security-Policy')
    expect(csp).toBeTruthy()
    expect(csp).not.toContain('va.vercel-scripts.com')
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
    expect(header('/(.*)', 'Strict-Transport-Security')).toBe('max-age=63072000; includeSubDomains')
  })
})
