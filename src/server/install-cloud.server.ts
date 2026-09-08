import {
  agentCommandPath,
  agentSkillDir,
  agentSkillPath,
  isAgentName,
  type AgentName,
} from '#/lib/agents'
import { commandInstallContent } from '#/lib/command-types'
import { defaultSkillsDir, resolvePackageRoot } from '#/lib/package-root'
import {
  listSkillPackageFiles,
  skillPackageHasCompanions,
} from '#/lib/skill-package'
import { buildStoreZip, zipToBase64, type ZipEntry } from '#/lib/zip-store'
import { loadCollection, loadSkill } from '#/server/catalog.server'
import { resolveCommand } from '#/server/commands.server'
import { isWorkspaceInstallConfigured } from '#/server/install-auth.server'
import { MAX_ZIP_ENTRIES } from '#/server/rate-limit.server'
import { loadSkillCopyContent } from '#/server/skill-content.server'

const SKILLS_DIR = defaultSkillsDir(resolvePackageRoot(import.meta.url))

export { isWorkspaceInstallConfigured }

function assertZipBudget(entries: ZipEntry[]): void {
  if (entries.length > MAX_ZIP_ENTRIES) {
    throw new Error('zip_too_large')
  }
}

async function skillZipEntries(
  agent: AgentName,
  skillId: string,
  lang: 'fr' | 'en',
): Promise<ZipEntry[]> {
  const packageFiles = await listSkillPackageFiles(SKILLS_DIR, skillId)
  if (packageFiles && skillPackageHasCompanions(packageFiles)) {
    const dir = agentSkillDir(agent, skillId)
    return packageFiles.map((file) => ({
      path: `${dir}/${file.relativePath}`,
      content: file.content,
    }))
  }

  const content = await loadSkillCopyContent(skillId, lang)
  if (!content) return []
  return [{ path: agentSkillPath(agent, skillId), content }]
}

async function zipEntriesForAgent(input: {
  agent: AgentName
  skillIds: string[]
  commandIds: string[]
  lang: 'fr' | 'en'
}): Promise<ZipEntry[]> {
  const entries: ZipEntry[] = []

  for (const commandId of input.commandIds) {
    const cmd = await resolveCommand(commandId)
    if (!cmd) continue
    entries.push({
      path: agentCommandPath(input.agent, cmd.id),
      content: commandInstallContent(cmd),
    })
    assertZipBudget(entries)
  }

  for (const skillId of input.skillIds) {
    entries.push(...(await skillZipEntries(input.agent, skillId, input.lang)))
    assertZipBudget(entries)
  }

  return entries
}

export async function buildCollectionZip(input: {
  collectionId: string
  agent: string
  lang: 'fr' | 'en'
}): Promise<{ filename: string; base64: string; fileCount: number } | null> {
  if (!isAgentName(input.agent)) return null
  const collection = await loadCollection(input.collectionId)
  if (!collection) return null

  const entries = await zipEntriesForAgent({
    agent: input.agent,
    skillIds: collection.skillIds,
    commandIds: collection.commandIds,
    lang: input.lang,
  })
  if (entries.length === 0) return null

  const zip = buildStoreZip(entries)
  return {
    filename: `arboris-${collection.id}-${input.agent.toLowerCase()}.zip`,
    base64: zipToBase64(zip),
    fileCount: entries.length,
  }
}

export async function buildCommandZip(input: {
  commandId: string
  agent: string
  lang?: 'fr' | 'en'
}): Promise<{ filename: string; base64: string; fileCount: number } | null> {
  if (!isAgentName(input.agent)) return null
  const cmd = await resolveCommand(input.commandId)
  if (!cmd) return null
  const lang = input.lang ?? 'fr'
  const entries: ZipEntry[] = [
    {
      path: agentCommandPath(input.agent, cmd.id),
      content: commandInstallContent(cmd),
    },
  ]
  for (const skillId of cmd.skillIds ?? []) {
    entries.push(...(await skillZipEntries(input.agent, skillId, lang)))
    assertZipBudget(entries)
  }
  const zip = buildStoreZip(entries)
  return {
    filename: `arboris-command-${cmd.id}-${input.agent.toLowerCase()}.zip`,
    base64: zipToBase64(zip),
    fileCount: entries.length,
  }
}

export async function buildSkillZip(input: {
  skillId: string
  agent: string
  lang: 'fr' | 'en'
}): Promise<{ filename: string; base64: string; fileCount: number } | null> {
  if (!isAgentName(input.agent)) return null
  const skill = await loadSkill(input.skillId)
  if (!skill) return null
  const entries = await skillZipEntries(input.agent, skill.id, input.lang)
  if (entries.length === 0) return null
  assertZipBudget(entries)
  const zip = buildStoreZip(entries)
  return {
    filename: `arboris-skill-${skill.id}-${input.agent.toLowerCase()}.zip`,
    base64: zipToBase64(zip),
    fileCount: entries.length,
  }
}
