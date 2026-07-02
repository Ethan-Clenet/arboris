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
}

async function main() {
  const seeds = await loadSkillSeeds()
  const skillsByStack: Record<string, string[]> = {}

  for (const stack of STACKS) {
    skillsByStack[stack.id] = []
  }

  for (const skill of seeds) {
    for (const stackId of skill.stacks) {
      if (!skillsByStack[stackId]) skillsByStack[stackId] = []
      skillsByStack[stackId].push(skill.id)
    }
  }

  for (const stackId of Object.keys(skillsByStack)) {
    skillsByStack[stackId].sort((a, b) => a.localeCompare(b))
  }

  const manifest: CliManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    stacks: STACKS.map((stack) => ({ id: stack.id, label: stack.label })),
    skills: seeds.map((skill) => skill.id).sort((a, b) => a.localeCompare(b)),
    skillsByStack,
  }

  const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'cli', 'manifest.json')
  await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')

  const totalLinks = Object.values(skillsByStack).reduce((sum, ids) => sum + ids.length, 0)
  console.log(`✅ Manifest CLI écrit: ${outPath}`)
  console.log(`   ${STACKS.length} technos, ${seeds.length} skills, ${totalLinks} associations`)
}

main().catch((error) => {
  console.error('❌ Génération manifest échouée:', error)
  process.exit(1)
})
