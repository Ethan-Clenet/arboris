import { describe, expect, it } from 'vitest'
import { SITE_URL } from './site'
import {
  sitemapHandler,
  sitemapIndexDocument,
  sitemapIndexRedirectResponse,
  SITEMAP_CHILDREN,
  toLastmod,
  urlsetXml,
  xmlEscape,
} from './sitemap'
import { commandSitemapUrls, collectionSeedSitemapUrls, staticSitemapUrls } from './sitemap-sources'

describe('xmlEscape / toLastmod', () => {
  it('échappe les caractères XML', () => {
    expect(xmlEscape('a&b<c>"')).toBe('a&amp;b&lt;c&gt;&quot;')
  })

  it('normalise lastmod en YYYY-MM-DD', () => {
    expect(toLastmod('2026-09-30T12:00:00.000Z')).toBe('2026-09-30')
    expect(toLastmod(new Date('2026-01-02T00:00:00.000Z'))).toBe('2026-01-02')
    expect(toLastmod(null)).toBeUndefined()
  })
})

describe('sitemap index', () => {
  it('liste les 4 sitemaps enfants avec loc absolue, sans Prisma', () => {
    const xml = sitemapIndexDocument()
    expect(xml).toContain('<sitemapindex')
    for (const child of SITEMAP_CHILDREN) {
      expect(xml).toContain(`<loc>${SITE_URL}${child.path}</loc>`)
    }
    expect(xml.match(/<sitemap>/g)?.length).toBe(4)
  })
})

describe('urlsetXml', () => {
  it('émet loc, lastmod et n’ajoute pas de points de suspension', () => {
    const xml = urlsetXml([
      { path: '/skills/fastapi-patterns', lastmod: '2026-09-01', changefreq: 'weekly', priority: '0.6' },
    ])
    expect(xml).toContain('<urlset')
    expect(xml).toContain(`${SITE_URL}/skills/fastapi-patterns`)
    expect(xml).toContain('<lastmod>2026-09-01</lastmod>')
    expect(xml).not.toContain('…')
  })
})

describe('sources sitemap hors DB', () => {
  it('liste les pages statiques (hubs + légales)', () => {
    const paths = staticSitemapUrls().map((u) => u.path)
    expect(paths).toEqual([
      '/',
      '/getting-started',
      '/skills',
      '/commands',
      '/collections',
      '/mentions-legales',
      '/confidentialite',
    ])
  })

  it('liste les commandes embarquées sans Prisma', () => {
    const urls = commandSitemapUrls()
    expect(urls.length).toBeGreaterThan(0)
    expect(urls.every((u) => u.path.startsWith('/commands/'))).toBe(true)
  })

  it('fallback collections = seed embarqué', () => {
    const urls = collectionSeedSitemapUrls()
    expect(urls.length).toBeGreaterThan(0)
    expect(urls.every((u) => u.path.startsWith('/collections/'))).toBe(true)
    expect(urls.map((u) => u.path)).toContain('/collections/flutter-starter')
    expect(urls.map((u) => u.path)).toContain('/collections/kotlin-starter')
    expect(urls.map((u) => u.path)).toContain('/collections/swift-starter')
    expect(urls.map((u) => u.path)).toContain('/collections/huggingface-starter')
    expect(urls.map((u) => u.path)).toContain('/collections/google-workspace-starter')
  })
})

describe('sitemapIndexRedirectResponse', () => {
  it('redirige sitemap_index.xml vers /sitemap.xml en 308', () => {
    const res = sitemapIndexRedirectResponse()
    expect(res.status).toBe(308)
    expect(res.headers.get('Location')).toBe('/sitemap.xml')
  })
})

describe('sitemapHandler', () => {
  it('renvoie un index XML 200 si le builder throw', async () => {
    const res = await sitemapHandler('index', () => {
      throw new Error('prisma boom')
    })()
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('application/xml')
    const text = await res.text()
    expect(text).toContain('<sitemapindex')
    expect(text).toContain(`${SITE_URL}/sitemap-skills.xml`)
  })

  it('renvoie un urlset vide 200 si le builder throw', async () => {
    const res = await sitemapHandler('urlset', async () => {
      throw new Error('neon timeout')
    })()
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toContain('<urlset')
    expect(text).not.toContain('<url>')
  })
})
