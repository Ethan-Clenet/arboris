/** Corps de /robots.txt — un seul sitemap index déclaré. */
export function robotsDocument(siteUrl: string): string {
  return `User-agent: *
Allow: /

# Indexation : soumettre le sitemap index dans Google Search Console
# https://search.google.com/search-console
# Enfants : /sitemap-static.xml, /sitemap-commands.xml,
# /sitemap-collections.xml, /sitemap-skills.xml

Sitemap: ${siteUrl}/sitemap.xml
`
}
