import { describe, expect, it } from 'vitest'
import { robotsDocument } from './robots'
import { SITE_URL } from './site'

describe('robotsDocument', () => {
  it('déclare un seul sitemap index', () => {
    const body = robotsDocument(SITE_URL)
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`)
    expect(body).not.toContain('sitemap_index.xml')
    expect(body.match(/^Sitemap:/gm)?.length).toBe(1)
  })
})
