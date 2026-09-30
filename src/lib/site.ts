/** URL publique du site (SEO, sitemap, Open Graph). */
export const SITE_URL = (
  process.env.VITE_SITE_URL ??
  process.env.SITE_URL ??
  'https://arboristhree.xyz'
).replace(/\/$/, '')

export const SITE_NAME = 'Arboris'
export const SITE_TAGLINE = 'Catalogue de skills IA'
export const SITE_DESCRIPTION =
  "Catalogue de skills et slash commands prêts à l'emploi pour ton agent IA (Cursor, Claude, Codex, Copilot)."

/** Éditeur / directeur de la publication (LCEN, art. 1-1). */
export const EDITOR_NAME = 'Ethan Clenet'
export const CONTACT_EMAIL = 'ethan.clenet@outlook.fr'

/** Date ISO de dernière mise à jour des pages légales. */
export const LEGAL_UPDATED = '2026-09-30'

export const HOST_NAME = 'Vercel Inc.'
export const HOST_ADDRESS = '440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis'
export const HOST_URL = 'https://vercel.com'
export const HOST_PRIVACY_URL = 'https://vercel.com/legal/privacy-policy'
export const HOST_ANALYTICS_PRIVACY_URL = 'https://vercel.com/docs/analytics/privacy-policy'
export const HOST_ANALYTICS_PRICING_URL = 'https://vercel.com/docs/analytics/limits-and-pricing'
export const HOST_LOGS_URL = 'https://vercel.com/docs/logs/runtime'

/** Stockage du catalogue (LCEN art. 1-1 I 5°) — Neon, désormais Databricks. */
export const DB_HOST_NAME = 'Neon, LLC (Databricks, Inc.)'
export const DB_HOST_ADDRESS = '160 Spear Street, 15th Floor, San Francisco, CA 94105, États-Unis'
export const DB_HOST_PRIVACY_URL = 'https://neon.com/privacy-policy'

export const LEGAL_ROUTES = [
  { path: '/mentions-legales', title: 'Mentions légales' },
  { path: '/confidentialite', title: 'Confidentialité' },
] as const

export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function pageTitle(page?: string): string {
  if (!page) return `${SITE_NAME} — ${SITE_TAGLINE}`
  return `${page} — ${SITE_NAME}`
}

/** Affichage long de `LEGAL_UPDATED` (ex. « 30 septembre 2026 »). */
export function formatLegalDate(isoDate: string, locale = 'fr-FR'): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}
