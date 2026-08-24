import { SECURITY_WARN_SCORE } from '#/lib/skillspector'
import { absoluteUrl, pageTitle, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '#/lib/site'

export type BreadcrumbItem = {
  name: string
  path: string
}

type SeoInput = {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
  noIndex?: boolean
  image?: string
  /** Fil d’Ariane (≥ 2 items) — résultat enrichi Search Console. */
  breadcrumbs?: BreadcrumbItem[]
}

/** Bornes SERP (approx. Screaming Frog / Google). */
const META_MAX_CHARS = 130
const META_MIN_CHARS = 80
const META_MAX_PX = 960
/** Titre final avec « — Arboris » (~10 car.) : viser 30–60 car. / ≤561 px. */
const TITLE_CORE_MAX = 45
/** Core min pour que `pageTitle` (≥ +10 car. « — Arboris ») atteigne 30 car. SERP. */
const TITLE_CORE_MIN = 22

/** Approx. largeur SERP : CJK ~2× latin. */
function estimateMetaPixels(text: string): number {
  let px = 0
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0
    if (code > 0x2e80) px += 14
    else if (ch === ' ' || ch === '·' || ch === '—' || ch === '-') px += 4
    else px += 8
  }
  return px
}

function truncateMeta(text: string, maxChars = META_MAX_CHARS, maxPx = META_MAX_PX): string {
  let out = text.trim().replace(/\s+/g, ' ')
  if (out.length > maxChars) {
    out = `${out.slice(0, maxChars - 1).trimEnd()}…`
  }
  while (out.length > 40 && estimateMetaPixels(out) > maxPx) {
    out = `${out.slice(0, Math.max(20, out.length - 8)).trimEnd()}…`
  }
  return out
}

function padMeta(text: string, filler: string): string {
  let out = text.trim().replace(/\s+/g, ' ')
  if (out.length >= META_MIN_CHARS) return truncateMeta(out)
  out = `${out} ${filler}`.trim()
  return truncateMeta(out)
}

/**
 * Titre skill : assez long pour les ids courts (≥30 avec suffixe site),
 * assez court pour les ids longs (≤60 car. / ≤561 px avec suffixe site).
 */
export function skillSeoTitle(id: string): string {
  const long = `${id} · Skill IA pour agents`
  if (long.length <= TITLE_CORE_MAX) return long
  const mid = `${id} · Skill IA`
  if (mid.length <= TITLE_CORE_MAX) return mid
  const short = `${id} · Skill`
  if (short.length <= TITLE_CORE_MAX) return short
  if (id.length <= TITLE_CORE_MAX) return id
  return `${id.slice(0, TITLE_CORE_MAX - 1)}…`
}

/** Titre commande slash — même budget caractère/pixel. */
export function commandSeoTitle(id: string): string {
  const long = `/${id} · Commande slash IA`
  if (long.length <= TITLE_CORE_MAX) return long
  const mid = `/${id} · Commande`
  if (mid.length <= TITLE_CORE_MAX) return mid
  const short = `/${id}`
  if (short.length <= TITLE_CORE_MAX) return short
  return `${short.slice(0, TITLE_CORE_MAX - 1)}…`
}

/** Titre collection — sans « Arboris » (ajouté par pageTitle). */
export function collectionSeoTitle(label: string): string {
  const candidates = [
    `${label} · Collection de skills`,
    `${label} · Pack collection`,
    `${label} · Collection`,
    label,
  ]
  for (const candidate of candidates) {
    if (candidate.length >= TITLE_CORE_MIN && candidate.length <= TITLE_CORE_MAX) {
      return candidate
    }
  }
  const padded = candidates[0]
  if (padded.length < TITLE_CORE_MIN) {
    return `${padded}${' · catalogue'.slice(0, TITLE_CORE_MIN - padded.length)}`
  }
  if (label.length <= TITLE_CORE_MAX) return label
  return `${label.slice(0, TITLE_CORE_MAX - 1)}…`
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

/** Aligné sur le seuil « SAFE » SkillSpector (score de sûreté Arboris). */
export const SEO_INDEX_MIN_SCORE = SECURITY_WARN_SCORE

/**
 * Éditeurs dont les fiches peuvent entrer dans l’index (marques / first-party).
 * Community et contributeurs isolés restent noindex.
 */
export const SEO_PREMIUM_PUBLISHERS = new Set([
  'Angular',
  'Anthropic',
  'Apollo',
  'Arboris',
  'Auth0',
  'Better Auth',
  'Brave',
  'Browserbase',
  'Cloudflare',
  'CodeRabbit',
  'Cypress',
  'ECC',
  'Figma',
  'Flox',
  'Flutter',
  'Gemini',
  'Google Workspace',
  'Microsoft',
  'Neon',
  'Stitch',
  'Vercel',
])

export type SkillIndexInput = {
  id: string
  score: number | null
  publisher: string | null
}

/** Ids issus de l’import vendor (`base__repo__path-hash`), trop pauvres pour la SERP. */
export function isHashedVendorSkillId(id: string): boolean {
  return id.includes('__')
}

export function isPremiumPublisher(publisher: string | null | undefined): boolean {
  const value = publisher?.trim()
  if (!value) return true
  return SEO_PREMIUM_PUBLISHERS.has(value)
}

/**
 * Fiche skill indexable : URL propre, score ≥ 70, éditeur premium (ou origin vide).
 * Le catalogue interne reste complet ; le noindex ne cache rien dans l’UI.
 */
export function isIndexableSkill(skill: SkillIndexInput): boolean {
  if (isHashedVendorSkillId(skill.id)) return false
  if (skill.score == null || skill.score < SEO_INDEX_MIN_SCORE) return false
  return isPremiumPublisher(skill.publisher)
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

/** JSON-LD WebSite + Organization + CLI (marque / Knowledge Graph). */
export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: ['fr', 'en'],
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: absoluteUrl('/favicon.svg'),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#cli`,
        name: 'arboris-cli',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Linux, macOS, Windows',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        url: SITE_URL,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }
}

/** Fil d’Ariane — type de résultat enrichi détecté par l’inspection d’URL. */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
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
    { property: 'og:locale:alternate', content: 'en_US' },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ]

  if (input.noIndex) {
    meta.push({ name: 'robots', content: 'noindex, follow' })
    meta.push({ name: 'googlebot', content: 'noindex, follow' })
  } else {
    meta.push({ name: 'robots', content: 'index, follow, max-image-preview:large' })
    meta.push({ name: 'googlebot', content: 'index, follow' })
  }

  // Pas de canonical sur les pages noindex : évite « Canonisé » + « Version canonique non indexable »
  // quand des query params (/auth?mode=…) pointent vers une cible noindex.
  const scripts: Array<{ type: string; children: string }> = []
  if (!input.noIndex && path === '/') {
    scripts.push({ type: 'application/ld+json', children: JSON.stringify(siteJsonLd()) })
  }
  const crumbs = input.breadcrumbs?.filter((item) => item.name && item.path) ?? []
  if (!input.noIndex && crumbs.length >= 2) {
    scripts.push({ type: 'application/ld+json', children: JSON.stringify(breadcrumbJsonLd(crumbs)) })
  }

  return {
    meta,
    links: input.noIndex ? [] : [{ rel: 'canonical', href: url }],
    ...(scripts.length ? { scripts } : {}),
  }
}

export { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl, pageTitle }
