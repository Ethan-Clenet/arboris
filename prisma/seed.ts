import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/server/password'
import { CATEGORIES, STACKS } from './catalog-data'
import { loadSkillSeeds } from './catalog-from-skills'

const prisma = new PrismaClient()

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@arboris.local').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD ?? 'ArborisAdmin2026!'
  const name = process.env.ADMIN_NAME ?? 'Admin Arboris'

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: 'ADMIN',
      passwordHash: await hashPassword(password),
    },
    create: {
      email,
      name,
      role: 'ADMIN',
      passwordHash: await hashPassword(password),
    },
  })

  console.log(`✅ Admin : ${email}`)
}

async function main() {
  console.log('🌱 Seeding Arboris…')
  const SKILLS = await loadSkillSeeds()

  // Repartir d'une base propre (l'ordre respecte les contraintes de clés).
  await prisma.skill.deleteMany()
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

  for (const [i, skill] of SKILLS.entries()) {
    await prisma.skill.create({
      data: {
        id: skill.id,
        icon: skill.icon,
        score: skill.score,
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
        sort: i,
        category: { connect: { id: skill.cat } },
        stacks: { connect: skill.stacks.map((id) => ({ id })) },
      },
    })
  }

  const [cats, stacks, skills] = await Promise.all([
    prisma.category.count(),
    prisma.stack.count(),
    prisma.skill.count(),
  ])
  console.log(`✅ Seed terminé : ${cats} catégories, ${stacks} stacks, ${skills} skills.`)
  await seedAdmin()
}

main()
  .catch((e) => {
    console.error('❌ Seed échoué :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
