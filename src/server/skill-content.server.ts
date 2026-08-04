import type { Lang, SkillDetail } from '#/lib/catalog'
import { buildSkillMarkdown } from '#/lib/catalog'
import { tryLoadSkillFile as readSkillFile, loadSkillFileContent } from '#/lib/skill-file'
import { defaultSkillsDir, resolvePackageRoot } from '#/lib/package-root'
import { loadSkill } from './catalog.server'

const SKILLS_DIR = defaultSkillsDir(resolvePackageRoot(import.meta.url))

/** Contenu à copier : fichier disque (frontmatter inclus), sinon bodyMd DB, sinon markdown généré. */
export async function loadSkillCopyContent(id: string, lang: Lang): Promise<string | null> {
  const skill = await loadSkill(id)
  if (!skill) return null

  const fromDisk = await readSkillFile(SKILLS_DIR, id)
  if (fromDisk?.trim()) return fromDisk.trim()

  const { prisma } = await import('./db')
  const row = await prisma.skill.findUnique({ where: { id }, select: { bodyMd: true } })
  if (row?.bodyMd?.trim()) return row.bodyMd.trim()

  const file = await loadSkillFileContent(SKILLS_DIR, id)
  if (file) return file

  return buildSkillMarkdown(skill, lang)
}

/** Lit le SKILL.md embarqué s'il existe pour ce skill (fichier, sinon bodyMd DB). */
export async function tryLoadSkillFile(id: string): Promise<string | null> {
  const fromDisk = await readSkillFile(SKILLS_DIR, id)
  if (fromDisk?.trim()) return fromDisk

  const { prisma } = await import('./db')
  const row = await prisma.skill.findUnique({ where: { id }, select: { bodyMd: true } })
  return row?.bodyMd?.trim() || null
}

export async function loadSkillWithCopy(id: string, lang: Lang): Promise<{
  skill: SkillDetail
  copyContent: string
} | null> {
  const skill = await loadSkill(id)
  if (!skill) return null
  const copyContent = (await loadSkillCopyContent(id, lang)) ?? buildSkillMarkdown(skill, lang)
  return { skill, copyContent }
}
