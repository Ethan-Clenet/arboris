// Accès base de données (Prisma) — CÔTÉ SERVEUR UNIQUEMENT.
// Transforme les lignes Prisma en objets sérialisables consommés par l'UI.
import type {
  Catalog,
  Category,
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
import { prisma } from './db'

function parseList(json: string): string[] {
  try {
    const value = JSON.parse(json)
    return Array.isArray(value) ? (value as string[]) : []
  } catch {
    return []
  }
}

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

export async function loadCatalog(): Promise<Catalog> {
  const [categories, stacks, skills] = await Promise.all([
    prisma.category.findMany({ orderBy: { sort: 'asc' } }),
    prisma.stack.findMany({
      orderBy: { sort: 'asc' },
      include: { skills: { select: { id: true }, orderBy: { sort: 'asc' } } },
    }),
    prisma.skill.findMany({
      orderBy: { sort: 'asc' },
      include: { stacks: { select: { id: true } } },
    }),
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
    compatOrder: [...COMPAT_ORDER],
  }
}

export async function loadSkill(id: string): Promise<SkillDetail | null> {
  const row = await prisma.skill.findUnique({
    where: { id },
    include: { stacks: { select: { id: true } } },
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
