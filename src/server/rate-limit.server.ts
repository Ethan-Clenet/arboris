/**
 * Rate-limit en mémoire (par instance de process).
 * Suffisant pour freiner les abus ZIP/install sur un serveur Node ;
 * sur multi-instances Vercel, compléter idéalement au reverse-proxy.
 */

type HitWindow = number[]

const buckets = new Map<string, HitWindow>()

export type RateLimitOptions = {
  /** Nombre max de requêtes dans la fenêtre. */
  limit: number
  /** Fenêtre glissante en ms. */
  windowMs: number
}

export function assertRateLimit(key: string, opts: RateLimitOptions): void {
  const now = Date.now()
  const floor = now - opts.windowMs
  const prev = buckets.get(key) ?? []
  const hits = prev.filter((t) => t > floor)
  if (hits.length >= opts.limit) {
    buckets.set(key, hits)
    throw new Error('rate_limited')
  }
  hits.push(now)
  buckets.set(key, hits)
}

/** Limites par défaut — install FS (déjà tokenisé) un peu plus souple que ZIP public. */
export const ZIP_RATE_LIMIT: RateLimitOptions = { limit: 20, windowMs: 60_000 }
export const INSTALL_RATE_LIMIT: RateLimitOptions = { limit: 30, windowMs: 60_000 }

/** Plafond d’entrées dans un ZIP généré. */
export const MAX_ZIP_ENTRIES = 250

/** Tests uniquement. */
export function resetRateLimitBuckets(): void {
  buckets.clear()
}
