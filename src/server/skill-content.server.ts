import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Lang, SkillDetail } from '#/lib/catalog'
import { buildSkillMarkdown } from '#/lib/catalog'
import { loadSkill } from './catalog.server'

const SKILLS_DIR = join(process.cwd(), 'prisma/skills')

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

async function readSkillFileByRef(ref: string): Promise<SkillFileMeta | null> {
  try {
    const content = await readFile(join(SKILLS_DIR, ref, 'SKILL.md'), 'utf-8')
    return content.trim() ? parseSkillFile(content) : null
  } catch {
    return null
  }
}

/** Lit le SKILL.md embarqué s'il existe pour ce skill. */
export async function tryLoadSkillFile(id: string): Promise<string | null> {
  const parsed = await readSkillFileByRef(id)
  return parsed?.raw ?? null
}

async function compileSkillFile(
  ref: string,
  seen = new Set<string>(),
): Promise<string | null> {
  if (seen.has(ref)) return null
  seen.add(ref)

  const parsed = await readSkillFileByRef(ref)
  if (!parsed) return null

  const sections = [parsed.body]
  for (const dep of parsed.dependsOn) {
    const compiled = await compileSkillFile(dep, seen)
    if (!compiled) continue
    sections.push(`## Included dependency: ${dep}\n\n${compiled}`)
  }

  return sections.filter(Boolean).join('\n\n')
}

/** Contenu à copier : SKILL.md compilé avec dépendances, sinon markdown généré. */
export async function loadSkillCopyContent(id: string, lang: Lang): Promise<string | null> {
  const file = await compileSkillFile(id)
  if (file) return file

  const skill = await loadSkill(id)
  if (!skill) return null
  return buildSkillMarkdown(skill, lang)
}

export async function loadSkillWithCopy(id: string, lang: Lang): Promise<{
  skill: SkillDetail
  copyContent: string
} | null> {
  const skill = await loadSkill(id)
  if (!skill) return null
  const file = await tryLoadSkillFile(id)
  return {
    skill,
    copyContent: file ?? buildSkillMarkdown(skill, lang),
  }
}
