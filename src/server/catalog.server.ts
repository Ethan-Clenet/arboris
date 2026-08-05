import type {
  Catalog,
  Category,
  CollectionDetail,
  CollectionSummary,
  SkillDetail,
  SkillSummary,
  Stack,
} from '#/lib/catalog'
import { COMPAT_ORDER } from '#/lib/catalog'
import {
  normalizeRecommendation,
  parseSecurityReport,
  type SecurityRecommendation,
} from '#/lib/skillspector'
import { toCommandSummary } from '#/lib/command-file'
import { COLLECTIONS } from '#/lib/collections-data'
import { resolveAllCommands, resolveCommand } from '#/server/commands.server'
import { prisma } from './db'

/** TTL cache catalogue (réduit les hits Neon sous trafic / crawls / preloads). */
const CATALOG_TTL_MS = 180_000

let catalogCache: { value: Catalog; expiresAt: number } | null = null
let catalogInflight: Promise<Catalog> | null = null

export function invalidateCatalogCache() {
  catalogCache = null
  catalogInflight = null
}

function parseList(json: string): string[] {
  try {
    const value = JSON.parse(json)
    return Array.isArray(value) ? (value as string[]) : []
  } catch {
    return []
  }
}

/** Champs summary uniquement — exclut bodyMd / securityReportJson (lourds). */
const skillSummarySelect = {
  id: true,
  categoryId: true,
  icon: true,
  score: true,
  securityRecommendation: true,
  scannedAt: true,
  techJson: true,
  compatJson: true,
  tagFr: true,
  tagEn: true,
  actFr: true,
  actEn: true,
  stacks: { select: { id: true } },
} as const

type SkillRow = {
  id: string
  categoryId: string
  icon: string
  score: number | null
  securityRecommendation: string | null
  scannedAt: Date | null
  techJson: string
  compatJson: string
  tagFr: string
  tagEn: string
  actFr: string
  actEn: string
  stacks: { id: string }[]
}

function toSummary(row: SkillRow): SkillSummary {
  const recommendation: SecurityRecommendation | null = row.securityRecommendation
    ? normalizeRecommendation(row.securityRecommendation)
    : row.score != null
      ? normalizeRecommendation(row.score >= 70 ? 'SAFE' : row.score >= 50 ? 'CAUTION' : 'UNSAFE')
      : null

  return {
    id: row.id,
    categoryId: row.categoryId,
    icon: row.icon,
    score: row.score,
    securityRecommendation: recommendation,
    scannedAt: row.scannedAt ? row.scannedAt.toISOString() : null,
    tech: parseList(row.techJson),
    compat: parseList(row.compatJson),
    stacks: row.stacks.map((s) => s.id),
    tag: { fr: row.tagFr, en: row.tagEn },
    act: { fr: row.actFr, en: row.actEn },
  }
}

function seedCollections(): CollectionSummary[] {
  return COLLECTIONS.map((c) => ({
    id: c.id,
    icon: c.icon,
    color: c.color,
    kind: c.kind,
    label: { fr: c.labelFr, en: c.labelEn },
    brief: { fr: c.briefFr, en: c.briefEn },
    skillIds: c.skillIds.slice(),
    commandIds: c.commandIds.slice(),
  }))
}

async function loadCollectionsFromDb(): Promise<CollectionSummary[]> {
  try {
    const rows = await prisma.collection.findMany({
      orderBy: { sort: 'asc' },
      include: { skills: { select: { id: true }, orderBy: { sort: 'asc' } } },
    })
    if (rows.length === 0) return seedCollections()
    return rows.map((c) => ({
      id: c.id,
      icon: c.icon,
      color: c.color,
      kind: c.kind,
      label: { fr: c.labelFr, en: c.labelEn },
      brief: { fr: c.briefFr, en: c.briefEn },
      skillIds: c.skills.map((s) => s.id),
      commandIds: parseList(c.commandIdsJson),
    }))
  } catch {
    // Table absente avant migrate — fallback seed.
    return seedCollections()
  }
}

async function fetchCatalog(): Promise<Catalog> {
  const [categories, stacks, skills, commands, collections] = await Promise.all([
    prisma.category.findMany({ orderBy: { sort: 'asc' } }),
    prisma.stack.findMany({
      orderBy: { sort: 'asc' },
      include: { skills: { select: { id: true }, orderBy: { sort: 'asc' } } },
    }),
    prisma.skill.findMany({
      orderBy: { sort: 'asc' },
      select: skillSummarySelect,
    }),
    resolveAllCommands(),
    loadCollectionsFromDb(),
  ])

  return {
    categories: categories.map(
      (c): Category => ({
        id: c.id,
        label: { fr: c.labelFr, en: c.labelEn },
        color: c.color,
        icon: c.icon,
      }),
    ),
    stacks: stacks.map(
      (s): Stack => ({
        id: s.id,
        label: s.label,
        icon: s.icon,
        color: s.color,
        brief: { fr: s.briefFr, en: s.briefEn },
        skillIds: s.skills.map((sk) => sk.id),
      }),
    ),
    skills: skills.map(toSummary),
    commands: commands.map(toCommandSummary),
    collections,
    compatOrder: [...COMPAT_ORDER],
  }
}

export async function loadCatalog(): Promise<Catalog> {
  const now = Date.now()
  if (catalogCache && catalogCache.expiresAt > now) {
    return catalogCache.value
  }
  if (catalogInflight) return catalogInflight

  catalogInflight = fetchCatalog()
    .then((value) => {
      catalogCache = { value, expiresAt: Date.now() + CATALOG_TTL_MS }
      return value
    })
    .finally(() => {
      catalogInflight = null
    })

  return catalogInflight
}

export async function loadSkill(id: string): Promise<SkillDetail | null> {
  const row = await prisma.skill.findUnique({
    where: { id },
    select: {
      ...skillSummarySelect,
      doesFrJson: true,
      doesEnJson: true,
      triggersFrJson: true,
      triggersEnJson: true,
      securityReportJson: true,
    },
  })
  if (!row) return null

  return {
    ...toSummary(row),
    does: { fr: parseList(row.doesFrJson), en: parseList(row.doesEnJson) },
    triggers: {
      fr: parseList(row.triggersFrJson),
      en: parseList(row.triggersEnJson),
    },
    securityReport: parseSecurityReport(row.securityReportJson),
  }
}

/** Contexte léger pour la fiche skill (évite un full catalog). */
export async function loadSkillPageContext(id: string): Promise<{
  skill: SkillDetail
  category: Category | null
  related: SkillSummary[]
} | null> {
  const skill = await loadSkill(id)
  if (!skill) return null

  const [categoryRow, sameCat, fillers] = await Promise.all([
    prisma.category.findUnique({ where: { id: skill.categoryId } }),
    prisma.skill.findMany({
      where: { categoryId: skill.categoryId, id: { not: id } },
      orderBy: { sort: 'asc' },
      take: 3,
      select: skillSummarySelect,
    }),
    prisma.skill.findMany({
      where: { id: { not: id }, NOT: { categoryId: skill.categoryId } },
      orderBy: { sort: 'asc' },
      take: 3,
      select: skillSummarySelect,
    }),
  ])

  const relatedMap = new Map<string, SkillSummary>()
  for (const row of sameCat) relatedMap.set(row.id, toSummary(row))
  for (const row of fillers) {
    if (relatedMap.size >= 3) break
    if (!relatedMap.has(row.id)) relatedMap.set(row.id, toSummary(row))
  }

  const category: Category | null = categoryRow
    ? {
        id: categoryRow.id,
        label: { fr: categoryRow.labelFr, en: categoryRow.labelEn },
        color: categoryRow.color,
        icon: categoryRow.icon,
      }
    : null

  return { skill, category, related: [...relatedMap.values()].slice(0, 3) }
}

export async function loadCommand(id: string) {
  return resolveCommand(id)
}

export async function loadCollection(id: string): Promise<CollectionDetail | null> {
  try {
    const row = await prisma.collection.findUnique({
      where: { id },
      include: {
        skills: {
          orderBy: { sort: 'asc' },
          select: skillSummarySelect,
        },
      },
    })

    if (row) {
      const commandIds = parseList(row.commandIdsJson)
      const commandDetails = (
        await Promise.all(commandIds.map((cid) => resolveCommand(cid)))
      ).filter((c): c is NonNullable<typeof c> => Boolean(c))

      return {
        id: row.id,
        icon: row.icon,
        color: row.color,
        kind: row.kind,
        label: { fr: row.labelFr, en: row.labelEn },
        brief: { fr: row.briefFr, en: row.briefEn },
        skillIds: row.skills.map((s) => s.id),
        commandIds,
        skills: row.skills.map(toSummary),
        commands: commandDetails.map(toCommandSummary),
      }
    }
  } catch {
    // fallback seed ci-dessous
  }

  const seed = COLLECTIONS.find((c) => c.id === id)
  if (!seed) return null

  const [skillRows, commands] = await Promise.all([
    prisma.skill.findMany({
      where: { id: { in: seed.skillIds } },
      select: skillSummarySelect,
    }),
    Promise.all(seed.commandIds.map((cid) => resolveCommand(cid))),
  ])

  const skillMap = new Map(skillRows.map((s) => [s.id, toSummary(s)]))
  const resolvedCommands = commands.filter(Boolean) as NonNullable<
    Awaited<ReturnType<typeof resolveCommand>>
  >[]

  return {
    id: seed.id,
    icon: seed.icon,
    color: seed.color,
    kind: seed.kind,
    label: { fr: seed.labelFr, en: seed.labelEn },
    brief: { fr: seed.briefFr, en: seed.briefEn },
    skillIds: seed.skillIds.slice(),
    commandIds: seed.commandIds.slice(),
    skills: seed.skillIds.map((sid) => skillMap.get(sid)).filter(Boolean) as SkillSummary[],
    commands: resolvedCommands.map(toCommandSummary),
  }
}
