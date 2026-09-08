import { PrismaClient } from '@prisma/client'
import { CATEGORIES, STACKS } from './catalog-data'
import { COLLECTIONS } from './collections-data'
import { loadSkillSeeds } from './catalog-from-skills'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Arboris…')
  const SKILLS = await loadSkillSeeds()
  const skillIdSet = new Set(SKILLS.map((s) => s.id))

  await prisma.skill.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.stack.deleteMany()
  await prisma.category.deleteMany()

  await prisma.category.createMany({
    data: CATEGORIES.map((c, i) => ({
      id: c.id,
      labelFr: c.labelFr,
      labelEn: c.labelEn,
      color: c.color,
      icon: c.icon,
      sort: i,
    })),
  })

  await prisma.stack.createMany({
    data: STACKS.map((s, i) => ({
      id: s.id,
      label: s.label,
      icon: s.icon,
      color: s.color,
      briefFr: s.briefFr,
      briefEn: s.briefEn,
      sort: i,
    })),
  })

  let withSecurity = 0
  for (const [i, skill] of SKILLS.entries()) {
    if (skill.score != null) withSecurity++
    await prisma.skill.create({
      data: {
        id: skill.id,
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
        category: { connect: { id: skill.cat } },
        stacks: { connect: skill.stacks.map((id) => ({ id })) },
      },
    })
  }
  if (withSecurity > 0) {
    console.log(`🛡  Scores SkillSpector réinjectés : ${withSecurity}/${SKILLS.length}`)
  }

  for (const col of COLLECTIONS) {
    const skillIds = col.skillIds.filter((id) => skillIdSet.has(id))
    await prisma.collection.create({
      data: {
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
        skills: skillIds.length ? { connect: skillIds.map((id) => ({ id })) } : undefined,
      },
    })
  }

  const [cats, stacks, skills, collections] = await Promise.all([
    prisma.category.count(),
    prisma.stack.count(),
    prisma.skill.count(),
    prisma.collection.count(),
  ])
  console.log(
    `✅ Seed terminé : ${cats} catégories, ${stacks} stacks, ${skills} skills, ${collections} collections.`,
  )
}

main()
  .catch((e) => {
    console.error('❌ Seed échoué :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
