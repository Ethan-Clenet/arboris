import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CommandDetail, CommandSummary } from '#/lib/command-types'

export type { CommandDetail, CommandSummary }
export { toCommandSummary } from '#/lib/command-types'

type ParsedCommand = {
  id: string
  description: string
  body: string
  raw: string
}

function parseFrontmatter(raw: string, fallbackId: string): ParsedCommand | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    const body = raw.trim()
    if (!body) return null
    return {
      id: fallbackId,
      description: body.split(/\r?\n/).find((l) => l.trim())?.trim() ?? fallbackId,
      body,
      raw,
    }
  }

  const [, frontmatter, body] = match
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? fallbackId
  const description =
    frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() ??
    body.split(/\r?\n/).find((l) => l.trim())?.trim() ??
    name

  return {
    id: name,
    description,
    body: body.trim(),
    raw,
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
    const parsed = parseFrontmatter(raw, commandId)
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
