import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

type SkillFileMeta = {
  dependsOn: string[]
  body: string
  raw: string
}

function parseDependsOn(frontmatter: string): string[] {
  const lines = frontmatter.split(/\r?\n/)
  const deps: string[] = []
  let inDepends = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!inDepends) {
      if (trimmed === 'depends_on:' || trimmed === 'dependencies:') {
        inDepends = true
      }
      continue
    }

    if (!trimmed) continue
    if (/^[A-Za-z0-9_-]+:/.test(trimmed)) break
    const match = trimmed.match(/^-\s+(.+)$/)
    if (!match) break
    deps.push(match[1].trim())
  }

  return deps
}

function parseSkillFile(raw: string): SkillFileMeta {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { dependsOn: [], body: raw.trim(), raw }
  }

  const [, frontmatter, body] = match
  return {
    dependsOn: parseDependsOn(frontmatter),
    body: body.trim(),
    raw,
  }
}

async function readSkillFileByRef(
  skillsDir: string,
  ref: string,
): Promise<SkillFileMeta | null> {
  try {
    const content = await readFile(join(skillsDir, ref, 'SKILL.md'), 'utf-8')
    return content.trim() ? parseSkillFile(content) : null
  } catch {
    return null
  }
}

/** Compile un SKILL.md et ses dépendances `depends_on`. */
export async function compileSkillFile(
  skillsDir: string,
  ref: string,
  seen = new Set<string>(),
): Promise<string | null> {
  if (seen.has(ref)) return null
  seen.add(ref)

  const parsed = await readSkillFileByRef(skillsDir, ref)
  if (!parsed) return null

  const sections = [parsed.body]
  for (const dep of parsed.dependsOn) {
    const compiled = await compileSkillFile(skillsDir, dep, seen)
    if (!compiled) continue
    sections.push(`## Included dependency: ${dep}\n\n${compiled}`)
  }

  return sections.filter(Boolean).join('\n\n')
}

/** Lit le SKILL.md brut s'il existe. */
export async function tryLoadSkillFile(skillsDir: string, id: string): Promise<string | null> {
  const parsed = await readSkillFileByRef(skillsDir, id)
  return parsed?.raw ?? null
}

/** Contenu prêt à installer (fichier compilé). */
export async function loadSkillFileContent(
  skillsDir: string,
  id: string,
): Promise<string | null> {
  return compileSkillFile(skillsDir, id)
}
