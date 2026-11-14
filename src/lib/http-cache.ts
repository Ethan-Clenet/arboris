/** Cache CDN façon ISR pour le HTML public (identique pour tous les visiteurs). */

export const HTML_S_MAXAGE = 3600
export const HTML_SWR = 86400

/** Navigateur : revalider. CDN Vercel : 1 h frais, 24 h stale-while-revalidate. */
export const PUBLIC_HTML_CACHE_CONTROL = `public, max-age=0, s-maxage=${HTML_S_MAXAGE}, stale-while-revalidate=${HTML_SWR}`

export const PRIVATE_NO_STORE = 'private, no-store'

/**
 * `CDN-Cache-Control` / `Vercel-CDN-Cache-Control` : Vercel ne « mange » pas
 * `s-maxage` du `Cache-Control` client, donc l’en-tête reste mesurable.
 */
export function publicHtmlCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': PUBLIC_HTML_CACHE_CONTROL,
    'CDN-Cache-Control': PUBLIC_HTML_CACHE_CONTROL,
    'Vercel-CDN-Cache-Control': PUBLIC_HTML_CACHE_CONTROL,
  }
}

export function privateNoStoreHeaders(): Record<string, string> {
  return {
    'Cache-Control': PRIVATE_NO_STORE,
    'CDN-Cache-Control': PRIVATE_NO_STORE,
    'Vercel-CDN-Cache-Control': PRIVATE_NO_STORE,
  }
}
