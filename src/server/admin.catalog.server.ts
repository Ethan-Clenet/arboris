import { prisma } from '#/server/db'
import { invalidateCatalogCache } from '#/server/catalog.server'

function listJson(values: string[]): string {
  return JSON.stringify(values)
}

function defaultAct(tagFr: string, tagEn: string) {
  const fr = tagFr.trim()
  const en = tagEn.trim() || fr
  return {
    actFr: fr.length > 120 ? `applique les bonnes pratiques du skill « ${fr.slice(0, 80)}… »` : `applique le skill : ${fr}`,
    actEn: en.length > 120 ? `apply the skill best practices for "${en.slice(0, 80)}…"` : `apply the skill: ${en}`,
  }
}

export async function createCategory(input: {
  id: string
  labelFr: string
  labelEn: string
  color: string
  icon: string
}) {
  const existing = await prisma.category.findUnique({ where: { id: input.id } })
  if (existing) throw new Error('category_exists')

  const maxSort = await prisma.category.aggregate({ _max: { sort: true } })
  await prisma.category.create({
    data: {
      id: input.id,
      labelFr: input.labelFr,
      labelEn: input.labelEn,
      color: input.color,
      icon: input.icon,
      sort: (maxSort._max.sort ?? -1) + 1,
    },
  })
  invalidateCatalogCache()
}

export async function deleteCategory(id: string) {
  const skillCount = await prisma.skill.count({ where: { categoryId: id } })
  if (skillCount > 0) throw new Error('category_has_skills')
  await prisma.category.delete({ where: { id } })
  invalidateCatalogCache()
}

export async function createStack(input: {
  id: string
  label: string
  icon: string
  color: string
  briefFr?: string
  briefEn?: string
}) {
  const existing = await prisma.stack.findUnique({ where: { id: input.id } })
  if (existing) throw new Error('stack_exists')

  const maxSort = await prisma.stack.aggregate({ _max: { sort: true } })
  const briefFr = input.briefFr?.trim() || input.label.trim()
  const briefEn = input.briefEn?.trim() || briefFr

  await prisma.stack.create({
    data: {
      id: input.id,
      label: input.label.trim(),
      icon: input.icon,
      color: input.color,
      briefFr,
      briefEn,
      sort: (maxSort._max.sort ?? -1) + 1,
    },
  })
  invalidateCatalogCache()
}

export async function deleteStack(id: string) {
  await prisma.stack.delete({ where: { id } })
  invalidateCatalogCache()
}

export async function upsertSkill(input: {
  id: string
  categoryId: string
  icon: string
  tagFr: string
  tagEn: string
  tech: string[]
  compat: string[]
  stackIds: string[]
  doesFr: string[]
  doesEn: string[]
  triggersFr: string[]
  triggersEn: string[]
  bodyMd: string
  editingId?: string
}) {
  const id = input.editingId ?? input.id
  const tagEn = input.tagEn.trim() || input.tagFr.trim()
  const stacks = input.stackIds.map((stackId) => ({ id: stackId }))
  const bodyMd = input.bodyMd.trim() || null

  const existing = await prisma.skill.findUnique({ where: { id } })
  const act = existing
    ? { actFr: existing.actFr, actEn: existing.actEn }
    : defaultAct(input.tagFr, tagEn)

  const contentData = {
    doesFrJson: listJson(input.doesFr),
    doesEnJson: listJson(input.doesEn.length ? input.doesEn : input.doesFr),
    triggersFrJson: listJson(input.triggersFr),
    triggersEnJson: listJson(input.triggersEn.length ? input.triggersEn : input.triggersFr),
    bodyMd,
  }

  if (existing) {
    await prisma.skill.update({
      where: { id },
      data: {
        categoryId: input.categoryId,
        icon: input.icon,
        tagFr: input.tagFr.trim(),
        tagEn,
        techJson: listJson(input.tech),
        compatJson: listJson(input.compat),
        stacks: { set: stacks },
        ...contentData,
      },
    })
    invalidateCatalogCache()
    return
  }

  const conflict = await prisma.skill.findUnique({ where: { id: input.id } })
  if (conflict) throw new Error('skill_exists')

  const maxSort = await prisma.skill.aggregate({ _max: { sort: true } })
  await prisma.skill.create({
    data: {
      id: input.id,
      categoryId: input.categoryId,
      icon: input.icon,
      tagFr: input.tagFr.trim(),
      tagEn,
      actFr: act.actFr,
      actEn: act.actEn,
      techJson: listJson(input.tech),
      compatJson: listJson(input.compat),
      ...contentData,
      sort: (maxSort._max.sort ?? -1) + 1,
      stacks: { connect: stacks },
    },
  })
  invalidateCatalogCache()
}

export async function loadSkillAdminForm(id: string) {
  const row = await prisma.skill.findUnique({
    where: { id },
    include: { stacks: { select: { id: true } } },
  })
  if (!row) return null

  let bodyMd = row.bodyMd?.trim() || ''
  if (!bodyMd) {
    try {
      const { tryLoadSkillFile } = await import('./skill-content.server')
      bodyMd = (await tryLoadSkillFile(id))?.trim() || ''
    } catch {
      bodyMd = ''
    }
  }

  const parse = (json: string): string[] => {
    try {
      const value = JSON.parse(json)
      return Array.isArray(value) ? (value as string[]) : []
    } catch {
      return []
    }
  }

  return {
    id: row.id,
    categoryId: row.categoryId,
    icon: row.icon,
    tagFr: row.tagFr,
    tagEn: row.tagEn,
    tech: parse(row.techJson),
    compat: parse(row.compatJson),
    stackIds: row.stacks.map((s) => s.id),
    doesFr: parse(row.doesFrJson),
    doesEn: parse(row.doesEnJson),
    triggersFr: parse(row.triggersFrJson),
    triggersEn: parse(row.triggersEnJson),
    bodyMd,
  }
}

export async function deleteSkill(id: string) {
  await prisma.skill.delete({ where: { id } })
  invalidateCatalogCache()
}

export async function toggleSkillStack(skillId: string, stackId: string) {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: { stacks: { select: { id: true } } },
  })
  if (!skill) throw new Error('skill_not_found')

  const stack = await prisma.stack.findUnique({ where: { id: stackId } })
  if (!stack) throw new Error('stack_not_found')

  const linked = skill.stacks.some((s) => s.id === stackId)
  await prisma.skill.update({
    where: { id: skillId },
    data: {
      stacks: linked ? { disconnect: { id: stackId } } : { connect: { id: stackId } },
    },
  })
  invalidateCatalogCache()
}
