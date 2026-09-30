import { describe, expect, it } from 'vitest'
import { SITE_URL } from './site'
import {
  sitemapIndexDocument,
  SITEMAP_CHILDREN,
  toLastmod,
  urlsetXml,
  xmlEscape,
} from './sitemap'

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
  it('liste les 4 sitemaps enfants avec loc absolue', () => {
    const xml = sitemapIndexDocument({ skills: '2026-09-30' })
    expect(xml).toContain('<sitemapindex')
    for (const child of SITEMAP_CHILDREN) {
      expect(xml).toContain(`<loc>${SITE_URL}${child.path}</loc>`)
    }
    expect(xml).toContain('<lastmod>2026-09-30</lastmod>')
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
