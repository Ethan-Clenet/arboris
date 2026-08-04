import { absoluteUrl, pageTitle, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '#/lib/site'

type SeoInput = {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
  noIndex?: boolean
  image?: string
}

/** ~130 car. pour rester sous ~985 px SERP (approx. SF / Google). */
const META_MAX = 130
const META_MIN = 80

function truncateMeta(text: string, max = META_MAX): string {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1).trimEnd()}…`
}

function padMeta(text: string, filler: string): string {
  let out = text.trim().replace(/\s+/g, ' ')
  if (out.length >= META_MIN) return truncateMeta(out)
  const extra = ` ${filler}`.trim()
  out = `${out} ${extra}`.trim()
  return truncateMeta(out)
}

/** Meta description unique par entité (évite les doublons SF quand le tag est partagé). */
export function entityDescription(
  summary: string,
  kind: 'skill' | 'command' | 'collection',
  id: string,
): string {
  const base = summary.trim().replace(/\s+/g, ' ')
  const label =
    kind === 'skill' ? `Skill ${id}` : kind === 'command' ? `Commande /${id}` : `Collection ${id}`
  const suffix = `${label} sur Arboris — prêt pour Cursor, Claude, Codex et Copilot.`
  if (!base || base === '>' || base === '>-') return truncateMeta(suffix)
  const withId = base.toLowerCase().includes(id.toLowerCase()) ? base : `${base} — ${label}.`
  return padMeta(withId, 'Catalogue Arboris pour agents IA.')
}

/**
 * Fallback root-only (charset/viewport restent dans __root).
 * Pas de canonical ni og:url ici — sinon chaque page hérite d'un 2e canonical vers `/`
 * (les `links` ne sont pas dédupliqués par `rel` comme les meta).
 */
export function rootFallbackMeta() {
  return [
    { title: pageTitle() },
    { name: 'description', content: SITE_DESCRIPTION },
    { name: 'application-name', content: SITE_NAME },
  ]
}

/** Meta + links SEO / Open Graph / Twitter pour `route.head()`. */
export function seoHead(input: SeoInput = {}) {
  const title = input.title ? pageTitle(input.title) : pageTitle()
  const description = padMeta(input.description ?? SITE_DESCRIPTION, 'Catalogue Arboris pour agents IA.')
  const path = (input.path ?? '/').split('?')[0].split('#')[0] || '/'
  const url = absoluteUrl(path)
  const image = input.image ?? absoluteUrl('/og.png')
  const type = input.type ?? 'website'

  const meta: Array<Record<string, string>> = [
    { title },
    { name: 'description', content: description },
    { name: 'application-name', content: SITE_NAME },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:locale', content: 'fr_FR' },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ]

  if (input.noIndex) {
    meta.push({ name: 'robots', content: 'noindex, nofollow' })
  }

  return {
    meta,
    links: [{ rel: 'canonical', href: url }],
  }
}

export { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl, pageTitle }
