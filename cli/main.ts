import { resolve, join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { isAgentName, type AgentName } from '../src/lib/agents.ts'
import { defaultCommandsDir, defaultSkillsDir, resolvePackageRoot } from '../src/lib/package-root.ts'
import { installSkillToWorkspace, installStackToWorkspace } from '../src/lib/skill-install-core.ts'
import { installCommandToWorkspace } from '../src/lib/command-install-core.ts'
import { listCommandIds, loadCommandFile } from '../src/lib/command-file.ts'
import { findCollectionSeed, COLLECTIONS } from '../src/lib/collections-data.ts'
import { needsInstallConfirm, riskToSafetyScore } from '../src/lib/skillspector.ts'
import {
  formatPublisherList,
  formatStackList,
  hasSkillId,
  loadCliManifest,
  resolvePublisherId,
  resolveStackId,
} from './stack-resolve.ts'

const PACKAGE_ROOT = resolvePackageRoot(import.meta.url)
const SKILLS_DIR = defaultSkillsDir(PACKAGE_ROOT)
const COMMANDS_DIR = defaultCommandsDir(PACKAGE_ROOT)
const REPORTS_DIR = join(PACKAGE_ROOT, 'prisma', 'skillspector-reports')

async function loadSafetyScore(skillId: string): Promise<number | null> {
  try {
    const raw = JSON.parse(await readFile(join(REPORTS_DIR, `${skillId}.json`), 'utf-8')) as {
      riskScore?: number
    }
    if (typeof raw.riskScore === 'number') return riskToSafetyScore(raw.riskScore)
  } catch {
    // rapport absent
  }
  return null
}

async function assertSecurityOk(skillId: string, options: CliOptions) {
  if (options.skipSecurityCheck) return
  const score = await loadSafetyScore(skillId)
  if (!needsInstallConfirm(score)) return
  console.error(
    `⚠ SkillSpector: « ${skillId} » a un score de sûreté bas (${score}/100). Relance avec --skip-security-check pour forcer.`,
  )
  process.exit(1)
}

type CliOptions = {
  agent: AgentName
  cwd: string
  dryRun: boolean
  force: boolean
  help: boolean
  skipSecurityCheck: boolean
}

function printHelp() {
  console.log(`arboris-cli — installe les skills et commandes IA

Usage:
  npx arboris-cli <techno> [options]
  npx arboris-cli install <skill-id> [options]
  npx arboris-cli command <command-id> [options]
  npx arboris-cli collection <collection-id> [options]
  npx arboris-cli publisher <éditeur> [options]
  npx arboris-cli list
  npx arboris-cli list-commands
  npx arboris-cli list-collections
  npx arboris-cli list-publishers

Exemples:
  npx arboris-cli node
  npx arboris-cli install fastapi-patterns
  npx arboris-cli command review-pr --agent cursor
  npx arboris-cli command sonar --agent cursor
  npx arboris-cli collection sonar --agent cursor
  npx arboris-cli collection command-starter --agent cursor
  npx arboris-cli collection react-ts-starter --agent cursor
  npx arboris-cli collection node-api-starter --agent cursor
  npx arboris-cli collection prisma-postgres-starter --agent cursor
  npx arboris-cli publisher affaan-m
  npx arboris-cli publisher brave --agent cursor
  npx arboris-cli typescript --force

Technos (alias acceptés: node.js, k8s, spring, postgres…):
  node, js, ts, fastapi, react, angular, java, spring-boot,
  docker, k9, postgresql, mysql, prisma

Options:
  --agent <name>            Agent cible: cursor | claude | codex | copilot (défaut: cursor)
  --cwd <path>              Projet cible (défaut: répertoire courant)
  --force                   Écrase les fichiers déjà installés
  --dry-run                 Affiche sans écrire
  --skip-security-check     Ignore l’avertissement SkillSpector (score < 50)
  -h, --help                Aide

Après installation d’une commande, tape /nom dans le chat de l’agent.
`)
}

function parseArgs(argv: string[]): {
  command: string | null
  target: string | null
  options: CliOptions
} {
  const options: CliOptions = {
    agent: 'Cursor',
    cwd: process.cwd(),
    dryRun: false,
    force: false,
    help: false,
    skipSecurityCheck: false,
  }

  const positional: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '-h' || arg === '--help') {
      options.help = true
      continue
    }
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }
    if (arg === '--force') {
      options.force = true
      continue
    }
    if (arg === '--skip-security-check') {
      options.skipSecurityCheck = true
      continue
    }
    if (arg === '--agent') {
      const value = argv[++i]
      if (!value) throw new Error('Option --agent requiert une valeur.')
      const normalized =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      if (!isAgentName(normalized)) {
        throw new Error(`Agent inconnu: ${value}. Utilise cursor, claude, codex ou copilot.`)
      }
      options.agent = normalized
      continue
    }
    if (arg === '--cwd') {
      const value = argv[++i]
      if (!value) throw new Error('Option --cwd requiert un chemin.')
      options.cwd = resolve(value)
      continue
    }
    if (arg.startsWith('-')) {
      throw new Error(`Option inconnue: ${arg}`)
    }
    positional.push(arg)
  }

  return { command: positional[0] ?? null, target: positional[1] ?? null, options }
}

async function runList() {
  const manifest = await loadCliManifest()
  console.log('Technos disponibles:\n')
  console.log(formatStackList(manifest))
  console.log('\nExemple: npx arboris-cli node')
}

async function runListCommands() {
  const ids = await listCommandIds(COMMANDS_DIR)
  if (ids.length === 0) {
    console.log('Aucune commande dans prisma/commands/.')
    return
  }
  console.log('Commandes (slash) disponibles:\n')
  for (const id of ids) {
    const cmd = await loadCommandFile(COMMANDS_DIR, id)
    console.log(`  /${id}${cmd ? ` — ${cmd.description.fr}` : ''}`)
  }
  console.log('\nExemple: npx arboris-cli command review-pr')
  console.log('Puis tape /review-pr dans le chat de ton agent.')
}

async function runInstallCommand(commandId: string, options: CliOptions) {
  const cmd = await loadCommandFile(COMMANDS_DIR, commandId)
  if (!cmd) {
    console.error(`Commande inconnue: "${commandId}"`)
    console.error('Utilise: npx arboris-cli list-commands')
    process.exit(1)
  }

  const companions = cmd.skillIds ?? []
  console.log(
    `${options.dryRun ? '[dry-run] ' : ''}Installation de /${cmd.id} → ${options.agent} (${options.cwd})`,
  )
  if (companions.length > 0) {
    console.log(`  + ${companions.length} skill(s) compagnon(s): ${companions.join(', ')}`)
  }

  if (options.dryRun) {
    console.log(`  • /${cmd.id}`)
    for (const id of companions) console.log(`  • skill ${id}`)
    return
  }

  const result = await installCommandToWorkspace({
    commandId: cmd.id,
    agent: options.agent,
    workspaceRoot: options.cwd,
    commandsDir: COMMANDS_DIR,
    command: cmd,
    force: options.force,
  })

  if (!result.ok) {
    console.error(`Échec: ${result.error}`)
    process.exit(1)
  }

  if (result.skipped) {
    console.log(`⊘ Déjà présent: ${result.path}`)
  } else {
    console.log(`✓ ${result.path}`)
  }

  let skillOk = 0
  let skillSkipped = 0
  let skillFailed = 0
  for (const skillId of companions) {
    await assertSecurityOk(skillId, options)
    const skillResult = await installSkillToWorkspace({
      skillId,
      agent: options.agent,
      workspaceRoot: options.cwd,
      skillsDir: SKILLS_DIR,
      force: options.force,
    })
    if (!skillResult.ok) {
      console.log(`  ✗ ${skillId} (${skillResult.error})`)
      skillFailed++
      continue
    }
    if (skillResult.skipped) {
      console.log(`  ⊘ ${skillId}`)
      skillSkipped++
    } else {
      console.log(`  ✓ ${skillId} → ${skillResult.path}`)
      skillOk++
    }
  }

  if (companions.length > 0) {
    console.log(
      `\nSkills: ${skillOk} installés, ${skillSkipped} ignorés, ${skillFailed} échecs.`,
    )
  }
  console.log(`→ Dans le chat agent, tape /${cmd.id}`)
  if (skillFailed > 0) process.exit(1)
}

async function readCliVersion(): Promise<string> {
  const candidates = [
    join(PACKAGE_ROOT, 'package.json'),
    join(PACKAGE_ROOT, 'packages', 'arboris-cli', 'package.json'),
  ]
  for (const path of candidates) {
    try {
      const pkg = JSON.parse(await readFile(path, 'utf-8')) as {
        name?: string
        version?: string
      }
      if (pkg.name === 'arboris-cli' && pkg.version) return pkg.version
    } catch {
      // essayer le chemin suivant
    }
  }
  return 'dev'
}

async function runListCollections() {
  const version = await readCliVersion()
  console.log(`Collections disponibles (arboris-cli@${version}):\n`)
  for (const col of COLLECTIONS) {
    const n = col.commandIds.length + col.skillIds.length
    console.log(`  ${col.id} — ${col.labelFr} (${n} éléments, ${col.kind})`)
  }
  console.log('\nExemple: npx arboris-cli@latest collection prisma-postgres-starter')
}

async function runInstallCollection(collectionId: string, options: CliOptions) {
  const col = findCollectionSeed(collectionId)
  if (!col) {
    const version = await readCliVersion()
    console.error(`Collection inconnue: "${collectionId}"`)
    console.error(`arboris-cli@${version} — collections:`)
    for (const known of COLLECTIONS) {
      console.error(`  ${known.id}`)
    }
    console.error('Utilise: npx arboris-cli@latest list-collections')
    console.error(
      'Si le pack apparaît sur le site mais pas ici: npx arboris-cli@latest (évite un cache npx trop vieux).',
    )
    process.exit(1)
  }

  console.log(
    `${options.dryRun ? '[dry-run] ' : ''}Collection « ${col.labelFr} » → ${options.agent} (${options.cwd})`,
  )
  console.log(`  ${col.commandIds.length} commandes, ${col.skillIds.length} skills`)

  if (options.dryRun) {
    for (const id of col.commandIds) console.log(`  • /${id}`)
    for (const id of col.skillIds) console.log(`  • skill ${id}`)
    return
  }

  let ok = 0
  let skipped = 0
  let failed = 0

  for (const commandId of col.commandIds) {
    const cmd = await loadCommandFile(COMMANDS_DIR, commandId)
    if (!cmd) {
      console.log(`  ✗ /${commandId} (introuvable)`)
      failed++
      continue
    }
    const result = await installCommandToWorkspace({
      commandId: cmd.id,
      agent: options.agent,
      workspaceRoot: options.cwd,
      commandsDir: COMMANDS_DIR,
      command: cmd,
      force: options.force,
    })
    if (!result.ok) {
      console.log(`  ✗ /${commandId} (${result.error})`)
      failed++
      continue
    }
    if (result.skipped) {
      console.log(`  ⊘ /${commandId}`)
      skipped++
    } else {
      console.log(`  ✓ /${commandId} → ${result.path}`)
      ok++
    }
  }

  for (const skillId of col.skillIds) {
    await assertSecurityOk(skillId, options)
    const result = await installSkillToWorkspace({
      skillId,
      agent: options.agent,
      workspaceRoot: options.cwd,
      skillsDir: SKILLS_DIR,
      force: options.force,
    })
    if (!result.ok) {
      console.log(`  ✗ ${skillId} (${result.error})`)
      failed++
      continue
    }
    if (result.skipped) {
      console.log(`  ⊘ ${skillId}`)
      skipped++
    } else {
      console.log(`  ✓ ${skillId} → ${result.path}`)
      ok++
    }
  }

  console.log(`\nTerminé: ${ok} installés, ${skipped} ignorés, ${failed} échecs.`)
  if (col.commandIds.length > 0) {
    console.log(`→ Dans le chat agent, tape /${col.commandIds[0]} (etc.)`)
  }
  if (failed > 0) process.exit(1)
}

async function runListPublishers() {
  const manifest = await loadCliManifest()
  console.log('Éditeurs (créateurs) disponibles:\n')
  console.log(formatPublisherList(manifest))
  console.log('\nExemple: npx arboris-cli publisher affaan-m')
}

async function runInstallPublisher(publisherInput: string, options: CliOptions) {
  const manifest = await loadCliManifest()
  const publisher = resolvePublisherId(publisherInput, manifest)

  if (!publisher) {
    console.error(`Éditeur inconnu: "${publisherInput}"`)
    console.error('\nÉditeurs disponibles:\n')
    console.error(formatPublisherList(manifest))
    process.exit(1)
  }

  const skillIds = manifest.skillsByPublisher?.[publisher] ?? []
  if (skillIds.length === 0) {
    console.error(`Aucun skill associé à l’éditeur ${publisher}.`)
    process.exit(1)
  }

  console.log(
    `${options.dryRun ? '[dry-run] ' : ''}Installation de ${skillIds.length} skills « ${publisher} » → ${options.agent} (${options.cwd})`,
  )

  if (options.dryRun) {
    for (const skillId of skillIds) {
      console.log(`  • ${skillId}`)
    }
    return
  }

  for (const skillId of skillIds) {
    await assertSecurityOk(skillId, options)
  }

  const summary = await installStackToWorkspace({
    skillIds,
    agent: options.agent,
    workspaceRoot: options.cwd,
    skillsDir: SKILLS_DIR,
    force: options.force,
    onProgress: ({ index, total, skillId, result }) => {
      if (!result.ok) {
        process.stdout.write(`  [${index}/${total}] ✗ ${skillId} (${result.error})\n`)
        return
      }
      if (result.skipped) {
        process.stdout.write(`  [${index}/${total}] ⊘ ${skillId} (déjà présent)\n`)
        return
      }
      process.stdout.write(`  [${index}/${total}] ✓ ${skillId} → ${result.path}\n`)
    },
  })

  console.log(
    `\nTerminé: ${summary.installed.length} installés, ${summary.skipped.length} ignorés, ${summary.failed.length} échecs.`,
  )

  if (summary.failed.length > 0) {
    process.exit(1)
  }
}

async function runInstallSkill(skillId: string, options: CliOptions) {
  const manifest = await loadCliManifest()

  if (!hasSkillId(manifest, skillId)) {
    console.error(`Skill inconnu: "${skillId}"`)
    process.exit(1)
  }

  console.log(
    `${options.dryRun ? '[dry-run] ' : ''}Installation de ${skillId} → ${options.agent} (${options.cwd})`,
  )

  await assertSecurityOk(skillId, options)

  if (options.dryRun) return

  const result = await installSkillToWorkspace({
    skillId,
    agent: options.agent,
    workspaceRoot: options.cwd,
    skillsDir: SKILLS_DIR,
    force: options.force,
  })

  if (!result.ok) {
    console.error(`Échec: ${result.error}`)
    process.exit(1)
  }

  if (result.skipped) {
    console.log(`⊘ Déjà présent: ${result.path}`)
    return
  }

  console.log(`✓ ${result.path}`)
}

async function runInstallStack(stackInput: string, options: CliOptions) {
  const manifest = await loadCliManifest()
  const stackId = resolveStackId(stackInput, manifest)

  if (!stackId) {
    console.error(`Techno inconnue: "${stackInput}"`)
    console.error('\nTechnos disponibles:\n')
    console.error(formatStackList(manifest))
    process.exit(1)
  }

  const stack = manifest.stacks.find((s) => s.id === stackId)
  const skillIds = manifest.skillsByStack[stackId] ?? []

  if (skillIds.length === 0) {
    console.error(`Aucun skill associé à ${stack?.label ?? stackId}.`)
    process.exit(1)
  }

  console.log(
    `${options.dryRun ? '[dry-run] ' : ''}Installation de ${skillIds.length} skills pour ${stack?.label ?? stackId} → ${options.agent} (${options.cwd})`,
  )

  if (options.dryRun) {
    for (const skillId of skillIds) {
      console.log(`  • ${skillId}`)
    }
    return
  }

  for (const skillId of skillIds) {
    await assertSecurityOk(skillId, options)
  }

  const summary = await installStackToWorkspace({
    skillIds,
    agent: options.agent,
    workspaceRoot: options.cwd,
    skillsDir: SKILLS_DIR,
    force: options.force,
    onProgress: ({ index, total, skillId, result }) => {
      if (!result.ok) {
        process.stdout.write(`  [${index}/${total}] ✗ ${skillId} (${result.error})\n`)
        return
      }
      if (result.skipped) {
        process.stdout.write(`  [${index}/${total}] ⊘ ${skillId} (déjà présent)\n`)
        return
      }
      process.stdout.write(`  [${index}/${total}] ✓ ${skillId} → ${result.path}\n`)
    },
  })

  console.log(
    `\nTerminé: ${summary.installed.length} installés, ${summary.skipped.length} ignorés, ${summary.failed.length} échecs.`,
  )

  if (summary.failed.length > 0) {
    process.exit(1)
  }
}

async function main() {
  try {
    const { command, target, options } = parseArgs(process.argv.slice(2))

    if (options.help || !command) {
      printHelp()
      process.exit(command ? 0 : 1)
    }

    if (command === 'list' || command === 'ls') {
      await runList()
      return
    }

    if (command === 'list-commands' || command === 'commands') {
      await runListCommands()
      return
    }

    if (command === 'list-collections' || command === 'collections') {
      await runListCollections()
      return
    }

    if (command === 'list-publishers' || command === 'publishers' || command === 'creators') {
      await runListPublishers()
      return
    }

    if (command === 'collection' || command === 'pack') {
      if (!target) throw new Error('Usage: npx arboris-cli collection <collection-id>')
      await runInstallCollection(target, options)
      return
    }

    if (command === 'publisher' || command === 'creator') {
      if (!target) throw new Error('Usage: npx arboris-cli publisher <éditeur>')
      await runInstallPublisher(target, options)
      return
    }

    if (command === 'command' || command === 'cmd') {
      if (!target) throw new Error('Usage: npx arboris-cli command <command-id>')
      await runInstallCommand(target, options)
      return
    }

    if (command === 'install') {
      if (!target) throw new Error('Usage: npx arboris-cli install <skill-id>')
      await runInstallSkill(target, options)
      return
    }

    await runInstallStack(command, options)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

void main()
