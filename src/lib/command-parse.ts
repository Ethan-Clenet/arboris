export type ParsedCommandMarkdown = {
  id: string
  description: string
  body: string
  raw: string
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
