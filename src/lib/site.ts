/** URL publique du site (SEO, sitemap, Open Graph). */
export const SITE_URL = (
  process.env.VITE_SITE_URL ??
  process.env.SITE_URL ??
  'https://arboris-three.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'Arboris'
export const SITE_TAGLINE = 'Catalogue de skills IA'
export const SITE_DESCRIPTION =
  "Catalogue de skills et slash commands prêts à l'emploi pour ton agent IA (Cursor, Claude, Codex, Copilot)."

export function absoluteUrl(path = '/'): string {
  if (!path || path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function pageTitle(page?: string): string {
  if (!page) return `${SITE_NAME} — ${SITE_TAGLINE}`
  return `${page} — ${SITE_NAME}`
}
