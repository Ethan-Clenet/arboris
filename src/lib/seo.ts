import { absoluteUrl, pageTitle, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '#/lib/site'

type SeoInput = {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
  noIndex?: boolean
  image?: string
}

/** Meta + links SEO / Open Graph / Twitter pour `route.head()`. */
export function seoHead(input: SeoInput = {}) {
  const title = input.title ? pageTitle(input.title) : pageTitle()
  const description = input.description ?? SITE_DESCRIPTION
  const url = absoluteUrl(input.path ?? '/')
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
