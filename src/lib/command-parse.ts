export type ParsedCommandMarkdown = {
  id: string
  description: string
  body: string
  raw: string
  /** Skills compagnons installés avec la commande. */
  skillIds: string[]
}

function parseSkillsList(frontmatter: string): string[] {
  const lines = frontmatter.split(/\r?\n/)
  const skills: string[] = []
  let inSkills = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!inSkills) {
      if (trimmed === 'skills:') {
        inSkills = true
      }
      continue
    }
    if (!trimmed) continue
    if (/^[A-Za-z0-9_-]+:/.test(trimmed)) break
    const match = trimmed.match(/^-\s+(.+)$/)
    if (!match) break
    const id = match[1].trim().replace(/^['"]|['"]$/g, '')
    if (id) skills.push(id)
  }

  return skills
}

export function parseCommandMarkdown(raw: string, fallbackId: string): ParsedCommandMarkdown | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    const body = raw.trim()
    if (!body) return null
    return {
      id: fallbackId,
      description: body.split(/\r?\n/).find((l) => l.trim())?.trim() ?? fallbackId,
      body,
      raw,
      skillIds: [],
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
    skillIds: parseSkillsList(frontmatter),
  }
}
