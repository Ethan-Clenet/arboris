import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL } from '#/lib/site'
import { buildWebInstallCommand } from '#/lib/web-install-command'

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
- [Premier pas](${SITE_URL}/getting-started): starters par techno (React, Node, FastAPI, Flutter, Kotlin, Swift, Docker…) et packs de garde
- [Skills](${SITE_URL}/skills): catalogue filtrable des skills (recherche, catégorie, éditeur, score de sûreté)
- [Commandes](${SITE_URL}/commands): slash commands prêtes à copier
- [Collections](${SITE_URL}/collections): packs de skills + commandes à installer d'un coup
- [Mentions légales](${SITE_URL}/mentions-legales): éditeur, hébergeur, propriété intellectuelle
- [Confidentialité](${SITE_URL}/confidentialite): politique de confidentialité (RGPD)

## Installation
- Collection: \`${buildWebInstallCommand({ kind: 'collection', id: '<collection-id>', os: 'unix' })}\`
- Skill: \`${buildWebInstallCommand({ kind: 'skill', id: '<skill-id>', os: 'unix' })}\`
- Commande: \`${buildWebInstallCommand({ kind: 'command', id: '<command-id>', os: 'unix' })}\`
- Variante Windows (PowerShell): \`${buildWebInstallCommand({ kind: 'skill', id: '<skill-id>', os: 'windows' })}\`
- Ou copie du Markdown depuis chaque fiche.

## Ressources
- Sitemap index: ${SITE_URL}/sitemap.xml
- Alias index: ${SITE_URL}/sitemap_index.xml
- Skills indexables: ${SITE_URL}/sitemap-skills.xml
- Commandes: ${SITE_URL}/sitemap-commands.xml
- Collections: ${SITE_URL}/sitemap-collections.xml
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
