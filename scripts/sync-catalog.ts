/**
 * Sync idempotent du catalogue (upsert) — sans wipe.
 * Skip les updates si le contenu n’a pas changé (économise le transfer Neon).
 */
import { createHash } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import { CATEGORIES, STACKS } from '../prisma/catalog-data'
import { COLLECTIONS } from '../prisma/collections-data'
import { loadSkillSeeds } from '../prisma/catalog-from-skills'

const prisma = new PrismaClient()

function contentFingerprint(parts: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex')
}

async function ensureCategories() {
  for (const [i, c] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        labelFr: c.labelFr,
        labelEn: c.labelEn,
        color: c.color,
        icon: c.icon,
        sort: i,
      },
      update: {
        labelFr: c.labelFr,
        labelEn: c.labelEn,
        color: c.color,
        icon: c.icon,
        sort: i,
      },
    })
  }
}

async function ensureStacks() {
  for (const [i, s] of STACKS.entries()) {
    await prisma.stack.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        label: s.label,
        icon: s.icon,
        color: s.color,
        briefFr: s.briefFr,
        briefEn: s.briefEn,
        sort: i,
      },
      update: {
        label: s.label,
        icon: s.icon,
        color: s.color,
        briefFr: s.briefFr,
        briefEn: s.briefEn,
        sort: i,
      },
    })
  }
}

async function syncSkills() {
  const skills = await loadSkillSeeds()
  let created = 0
  let updated = 0
  let skipped = 0

  for (const [i, skill] of skills.entries()) {
    const existing = await prisma.skill.findUnique({
      where: { id: skill.id },
      select: {
        icon: true,
        score: true,
        securityRecommendation: true,
        securityReportJson: true,
        scannedAt: true,
        scanMode: true,
        tagFr: true,
        tagEn: true,
        actFr: true,
        actEn: true,
        techJson: true,
        compatJson: true,
        doesFrJson: true,
        doesEnJson: true,
        triggersFrJson: true,
        triggersEnJson: true,
        bodyMd: true,
        publisher: true,
        sort: true,
        categoryId: true,
        stacks: { select: { id: true } },
      },
    })

    const data = {
      icon: skill.icon,
      score: skill.score,
      securityRecommendation: skill.securityRecommendation ?? null,
      securityReportJson: skill.securityReportJson ?? 'null',
      scannedAt: skill.scannedAt ? new Date(skill.scannedAt) : null,
      scanMode: skill.scanMode ?? null,
      tagFr: skill.tag.fr,
      tagEn: skill.tag.en,
      actFr: skill.act.fr,
      actEn: skill.act.en,
      techJson: JSON.stringify(skill.tech),
      compatJson: JSON.stringify(skill.compat),
      doesFrJson: JSON.stringify(skill.does.fr),
      doesEnJson: JSON.stringify(skill.does.en),
      triggersFrJson: JSON.stringify(skill.triggers.fr),
      triggersEnJson: JSON.stringify(skill.triggers.en),
      bodyMd: skill.bodyMd ?? null,
      publisher: skill.publisher ?? null,
      sort: i,
      categoryId: skill.cat,
    }

    const stackIds = [...skill.stacks].sort()

    if (existing) {
      const existingFp = contentFingerprint({
        icon: existing.icon,
        score: existing.score,
        securityRecommendation: existing.securityRecommendation,
        securityReportJson: existing.securityReportJson,
        scannedAt: existing.scannedAt?.toISOString() ?? null,
        scanMode: existing.scanMode,
        tagFr: existing.tagFr,
        tagEn: existing.tagEn,
        actFr: existing.actFr,
        actEn: existing.actEn,
        techJson: existing.techJson,
        compatJson: existing.compatJson,
        doesFrJson: existing.doesFrJson,
        doesEnJson: existing.doesEnJson,
        triggersFrJson: existing.triggersFrJson,
        triggersEnJson: existing.triggersEnJson,
        bodyMd: existing.bodyMd,
        publisher: existing.publisher,
        sort: existing.sort,
        categoryId: existing.categoryId,
        stacks: existing.stacks.map((s) => s.id).sort(),
      })
      const nextFp = contentFingerprint({
        ...data,
        scannedAt: data.scannedAt?.toISOString() ?? null,
        stacks: stackIds,
      })

      if (existingFp === nextFp) {
        skipped++
        continue
      }

      await prisma.skill.update({
        where: { id: skill.id },
        data: {
          ...data,
          stacks: { set: skill.stacks.map((id) => ({ id })) },
        },
      })
      updated++
    } else {
      await prisma.skill.create({
        data: {
          id: skill.id,
          ...data,
          stacks: { connect: skill.stacks.map((id) => ({ id })) },
        },
      })
      created++
    }
  }

  return { total: skills.length, created, updated, skipped }
}

async function syncCollections(skillIds: Set<string>) {
  let upserted = 0
  for (const col of COLLECTIONS) {
    const ids = col.skillIds.filter((id) => skillIds.has(id))
    await prisma.collection.upsert({
      where: { id: col.id },
      create: {
        id: col.id,
        icon: col.icon,
        color: col.color,
        labelFr: col.labelFr,
        labelEn: col.labelEn,
        briefFr: col.briefFr,
        briefEn: col.briefEn,
        kind: col.kind,
        commandIdsJson: JSON.stringify(col.commandIds),
        sort: col.sort,
        skills: ids.length ? { connect: ids.map((id) => ({ id })) } : undefined,
      },
      update: {
        icon: col.icon,
        color: col.color,
        labelFr: col.labelFr,
        labelEn: col.labelEn,
        briefFr: col.briefFr,
        briefEn: col.briefEn,
        kind: col.kind,
        commandIdsJson: JSON.stringify(col.commandIds),
        sort: col.sort,
        skills: { set: ids.map((id) => ({ id })) },
      },
    })
    upserted++
  }
  return upserted
}

async function main() {
  console.log('[sync-catalog] Upsert catalogue…')
  await ensureCategories()
  await ensureStacks()
  const skills = await syncSkills()
  const skillIdSet = new Set(
    (await prisma.skill.findMany({ select: { id: true } })).map((s) => s.id),
  )
  const collections = await syncCollections(skillIdSet)
  console.log(
    `[sync-catalog] OK — skills ${skills.total} (créés ${skills.created}, maj ${skills.updated}, inchangés ${skills.skipped}), collections ${collections}.`,
  )
}

main()
  .catch((error) => {
    console.error('[sync-catalog] Échec:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
