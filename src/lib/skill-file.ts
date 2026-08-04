import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

type SkillFileMeta = {
  dependsOn: string[]
  body: string
  raw: string
  /** Bloc YAML d’ouverture (`---…---`) s’il existe. */
  frontmatterBlock: string | null
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
  const match = raw.match(/^(---\r?\n[\s\S]*?\r?\n---)(\r?\n)?([\s\S]*)$/)
  if (!match) {
    return { dependsOn: [], body: raw.trim(), raw, frontmatterBlock: null }
  }

  const [, frontmatterBlock, , body = ''] = match
  const frontmatter = frontmatterBlock.replace(/^---\r?\n/, '').replace(/\r?\n---$/, '')
  return {
    dependsOn: parseDependsOn(frontmatter),
    body: body.trim(),
    raw,
    frontmatterBlock,
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

/** Compile uniquement le corps (sans frontmatter) — pour dépendances incluses. */
async function compileSkillBody(
  skillsDir: string,
  ref: string,
  seen: Set<string>,
): Promise<string | null> {
  if (seen.has(ref)) return null
  seen.add(ref)

  const parsed = await readSkillFileByRef(skillsDir, ref)
  if (!parsed) return null

  const sections = [parsed.body]
  for (const dep of parsed.dependsOn) {
    const compiled = await compileSkillBody(skillsDir, dep, seen)
    if (!compiled) continue
    sections.push(`## Included dependency: ${dep}\n\n${compiled}`)
  }

  return sections.filter(Boolean).join('\n\n')
}

/**
 * Compile un SKILL.md prêt à installer.
 * Conserve le frontmatter YAML du skill racine (name, description, metadata…).
 */
export async function compileSkillFile(
  skillsDir: string,
  ref: string,
  seen = new Set<string>(),
): Promise<string | null> {
  if (seen.has(ref)) return null
  seen.add(ref)

  const parsed = await readSkillFileByRef(skillsDir, ref)
  if (!parsed) return null

  // Cas courant : pas de dépendances → fichier brut intact.
  if (parsed.dependsOn.length === 0) {
    return parsed.raw.trim()
  }

  const sections = [parsed.body]
  for (const dep of parsed.dependsOn) {
    const compiled = await compileSkillBody(skillsDir, dep, seen)
    if (!compiled) continue
    sections.push(`## Included dependency: ${dep}\n\n${compiled}`)
  }

  const body = sections.filter(Boolean).join('\n\n')
  if (parsed.frontmatterBlock) {
    return `${parsed.frontmatterBlock}\n\n${body}`.trim()
  }
  return body
}

/** Lit le SKILL.md brut s'il existe. */
export async function tryLoadSkillFile(skillsDir: string, id: string): Promise<string | null> {
  const parsed = await readSkillFileByRef(skillsDir, id)
  return parsed?.raw ?? null
}

/** Contenu prêt à installer (frontmatter conservé). */
export async function loadSkillFileContent(
  skillsDir: string,
  id: string,
): Promise<string | null> {
  return compileSkillFile(skillsDir, id)
}
