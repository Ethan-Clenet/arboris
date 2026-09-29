import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL } from '#/lib/site'

/**
 * `llms.txt` — résumé du site pour les agents IA / crawlers LLM.
 * Convention https://llmstxt.org. Généré sans requête base.
 */
export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: async () => {
        const body = `# Arboris

> Catalogue de skills et slash commands prêts à l'emploi pour agents IA (Cursor, Claude, Codex, Copilot). Copie le Markdown, colle-le dans ton agent : zéro config.

## Pages
- [Accueil](${SITE_URL}/): présentation et index rapide du catalogue
- [Premier pas](${SITE_URL}/getting-started): starters par techno (React, Node, FastAPI, Docker…) et packs de garde
- [Skills](${SITE_URL}/skills): catalogue filtrable des skills (recherche, catégorie, éditeur, score de sûreté)
- [Commandes](${SITE_URL}/commands): slash commands prêtes à copier
- [Collections](${SITE_URL}/collections): packs de skills + commandes à installer d'un coup

## Installation
- CLI: \`npx arboris-cli install <skill-id>\` — ou copie du Markdown depuis chaque fiche.

## Ressources
- Sitemap: ${SITE_URL}/sitemap.xml
- Index des sitemaps: ${SITE_URL}/sitemap_index.xml
`

        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=21600, s-maxage=21600',
          },
        })
      },
    },
  },
})
