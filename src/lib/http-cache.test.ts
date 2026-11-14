import { describe, expect, it } from 'vitest'
import {
  HTML_S_MAXAGE,
  HTML_SWR,
  PRIVATE_NO_STORE,
  PUBLIC_HTML_CACHE_CONTROL,
  privateNoStoreHeaders,
  publicHtmlCacheHeaders,
} from './http-cache'

describe('publicHtmlCacheHeaders', () => {
  it('pose s-maxage et stale-while-revalidate pour le CDN', () => {
    const headers = publicHtmlCacheHeaders()
    expect(PUBLIC_HTML_CACHE_CONTROL).toContain(`s-maxage=${HTML_S_MAXAGE}`)
    expect(PUBLIC_HTML_CACHE_CONTROL).toContain(`stale-while-revalidate=${HTML_SWR}`)
    expect(headers['Cache-Control']).toBe(PUBLIC_HTML_CACHE_CONTROL)
    expect(headers['CDN-Cache-Control']).toBe(PUBLIC_HTML_CACHE_CONTROL)
    expect(headers['Vercel-CDN-Cache-Control']).toBe(PUBLIC_HTML_CACHE_CONTROL)
  })

  it('ne cache jamais les réponses privées', () => {
    expect(privateNoStoreHeaders()['Cache-Control']).toBe(PRIVATE_NO_STORE)
    expect(PRIVATE_NO_STORE).toContain('no-store')
  })
})
