/**
 * Commandes embarquées (bundle généré) — fallback quand prisma/commands
 * n’est pas disponible sur le FS (Vercel / serverless).
 */
import type { CommandDetail } from '#/lib/command-types'
import { parseCommandMarkdown } from '#/lib/command-parse'
import { COMMANDS_RAW } from '#/generated/commands-bundle'

function toDetail(id: string, raw: string): CommandDetail | null {
  const parsed = parseCommandMarkdown(raw, id)
  if (!parsed) return null
  const preview = parsed.body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(' ')
    .slice(0, 220)

  return {
    id: parsed.id,
    description: { fr: parsed.description, en: parsed.description },
    preview: preview || parsed.description,
    compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
    body: parsed.body,
    raw: parsed.raw,
  }
}

let cache: CommandDetail[] | null = null

export function loadEmbeddedCommands(): CommandDetail[] {
  if (cache) return cache
  const list: CommandDetail[] = []
  for (const [id, raw] of Object.entries(COMMANDS_RAW)) {
    const cmd = toDetail(id, raw)
    if (cmd) list.push(cmd)
  }
  cache = list.sort((a, b) => a.id.localeCompare(b.id))
  return cache
}

export function loadEmbeddedCommand(id: string): CommandDetail | null {
  return loadEmbeddedCommands().find((c) => c.id === id) ?? null
}
