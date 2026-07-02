import { resolve } from 'node:path'
import { isAgentName, type AgentName } from '../src/lib/agents.ts'
import { defaultSkillsDir, resolvePackageRoot } from '../src/lib/package-root.ts'
import { installStackToWorkspace } from '../src/lib/skill-install-core.ts'
import { formatStackList, loadCliManifest, resolveStackId } from './stack-resolve.ts'

const PACKAGE_ROOT = resolvePackageRoot(import.meta.url)
const SKILLS_DIR = defaultSkillsDir(PACKAGE_ROOT)

type CliOptions = {
  agent: AgentName
  cwd: string
  dryRun: boolean
  force: boolean
  help: boolean
}

function printHelp() {
  console.log(`arboris — installe les skills IA recommandés pour une techno

Usage:
  npx arb <techno> [options]
  npx arboris-cli <techno> [options]
  npx @rubix0270/arboris <techno> [options]

Exemples:
  npx arb node
  npx arboris-cli node.js --agent cursor
  npx arb typescript --force

Technos (alias acceptés: node.js, k8s, spring, postgres…):
  node, js, ts, fastapi, react, angular, java, spring-boot,
  docker, k9, postgresql, mysql, prisma

Options:
  --agent <name>   Agent cible: cursor | claude | codex | copilot (défaut: cursor)
  --cwd <path>     Projet cible (défaut: répertoire courant)
  --force          Écrase les skills déjà installés
  --dry-run        Affiche sans écrire
  -h, --help       Aide
`)
}

function parseArgs(argv: string[]): { command: string | null; options: CliOptions } {
  const options: CliOptions = {
    agent: 'Cursor',
    cwd: process.cwd(),
    dryRun: false,
    force: false,
    help: false,
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

  return { command: positional[0] ?? null, options }
}

async function runList() {
  const manifest = await loadCliManifest()
  console.log('Technos disponibles:\n')
  console.log(formatStackList(manifest))
  console.log('\nExemple: npx arb node')
}

async function runInstall(stackInput: string, options: CliOptions) {
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
    const { command, options } = parseArgs(process.argv.slice(2))

    if (options.help || !command) {
      printHelp()
      process.exit(command ? 0 : 1)
    }

    if (command === 'list' || command === 'ls') {
      await runList()
      return
    }

    await runInstall(command, options)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

void main()
