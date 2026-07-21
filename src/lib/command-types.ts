import type { Bilingual } from '#/lib/catalog'

export type CommandSummary = {
  id: string
  description: Bilingual
  /** Premières lignes du corps (aperçu). */
  preview: string
  compat: string[]
}

export type CommandDetail = CommandSummary & {
  /** Contenu Markdown complet à installer (sans frontmatter Arboris). */
  body: string
  /** Contenu fichier brut (avec frontmatter optionnel). */
  raw: string
}

/** Contenu installé : corps Markdown (les agents n’ont pas besoin du frontmatter Arboris). */
export function commandInstallContent(parsed: { body: string; raw: string }): string {
  return parsed.body.trim() ? `${parsed.body.trim()}\n` : parsed.raw
}

export function toCommandSummary(cmd: CommandDetail): CommandSummary {
  return {
    id: cmd.id,
    description: cmd.description,
    preview: cmd.preview,
    compat: cmd.compat,
  }
}
