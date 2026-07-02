import type { Lang, SkillDetail } from '#/lib/catalog'
import { buildSkillMarkdown } from '#/lib/catalog'
import { tryLoadSkillFile as readSkillFile, loadSkillFileContent } from '#/lib/skill-file'
import { defaultSkillsDir, resolvePackageRoot } from '#/lib/package-root'
import { loadSkill } from './catalog.server'

const SKILLS_DIR = defaultSkillsDir(resolvePackageRoot(import.meta.url))

/** Lit le SKILL.md embarqué s'il existe pour ce skill. */
export async function tryLoadSkillFile(id: string): Promise<string | null> {
  return readSkillFile(SKILLS_DIR, id)
}

/** Contenu à copier : SKILL.md compilé avec dépendances, sinon markdown généré. */
export async function loadSkillCopyContent(id: string, lang: Lang): Promise<string | null> {
  const file = await loadSkillFileContent(SKILLS_DIR, id)
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
  const file = await readSkillFile(SKILLS_DIR, id)
  return {
    skill,
    copyContent: file ?? buildSkillMarkdown(skill, lang),
  }
}
