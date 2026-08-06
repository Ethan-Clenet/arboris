import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSkillSeeds } from '../prisma/catalog-from-skills.ts'
import { STACKS } from '../prisma/catalog-data.ts'

type CliManifest = {
  version: 1
  generatedAt: string
  stacks: Array<{ id: string; label: string }>
  skills: string[]
  skillsByStack: Record<string, string[]>
  skillsByPublisher: Record<string, string[]>
}

async function main() {
  const seeds = await loadSkillSeeds()
  const skillsByStack: Record<string, string[]> = {}
  const skillsByPublisher: Record<string, string[]> = {}

  for (const stack of STACKS) {
    skillsByStack[stack.id] = []
  }

  for (const skill of seeds) {
    for (const stackId of skill.stacks) {
      if (!skillsByStack[stackId]) skillsByStack[stackId] = []
      skillsByStack[stackId].push(skill.id)
    }
    if (skill.publisher) {
      if (!skillsByPublisher[skill.publisher]) skillsByPublisher[skill.publisher] = []
      skillsByPublisher[skill.publisher].push(skill.id)
    }
  }

  for (const stackId of Object.keys(skillsByStack)) {
    skillsByStack[stackId].sort((a, b) => a.localeCompare(b))
  }
  for (const publisher of Object.keys(skillsByPublisher)) {
    skillsByPublisher[publisher].sort((a, b) => a.localeCompare(b))
  }

  const manifest: CliManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    stacks: STACKS.map((stack) => ({ id: stack.id, label: stack.label })),
    skills: seeds.map((skill) => skill.id).sort((a, b) => a.localeCompare(b)),
    skillsByStack,
    skillsByPublisher,
  }

  const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'cli', 'manifest.json')
  await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')

  const totalLinks = Object.values(skillsByStack).reduce((sum, ids) => sum + ids.length, 0)
  const publisherCount = Object.keys(skillsByPublisher).length
  console.log(`✅ Manifest CLI écrit: ${outPath}`)
  console.log(
    `   ${STACKS.length} technos, ${seeds.length} skills, ${totalLinks} associations, ${publisherCount} éditeurs`,
  )
}

main().catch((error) => {
  console.error('❌ Génération manifest échouée:', error)
  process.exit(1)
})
