import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CommandDetail, CommandSummary } from '#/lib/command-types'
import { parseCommandMarkdown } from '#/lib/command-parse'

export type { CommandDetail, CommandSummary }
export { toCommandSummary } from '#/lib/command-types'

function toDetail(parsed: {
  id: string
  description: string
  body: string
  raw: string
}): CommandDetail {
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

export async function listCommandIds(commandsDir: string): Promise<string[]> {
  try {
    const entries = await readdir(commandsDir, { withFileTypes: true })
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => e.name.replace(/\.md$/i, ''))
      .sort()
  } catch {
    return []
  }
}

export async function loadCommandFile(
  commandsDir: string,
  commandId: string,
): Promise<CommandDetail | null> {
  try {
    const raw = await readFile(join(commandsDir, `${commandId}.md`), 'utf-8')
    const parsed = parseCommandMarkdown(raw, commandId)
    if (!parsed) return null
    return toDetail(parsed)
  } catch {
    return null
  }
}

export async function loadAllCommands(commandsDir: string): Promise<CommandDetail[]> {
  const ids = await listCommandIds(commandsDir)
  const commands: CommandDetail[] = []
  for (const id of ids) {
    const cmd = await loadCommandFile(commandsDir, id)
    if (cmd) commands.push(cmd)
  }
  return commands.sort((a, b) => a.id.localeCompare(b.id))
}
