import {
  agentCommandPath,
  agentSkillPath,
  isAgentName,
  type AgentName,
} from '#/lib/agents'
import { commandInstallContent } from '#/lib/command-types'
import { buildStoreZip, zipToBase64, type ZipEntry } from '#/lib/zip-store'
import { loadCollection, loadSkill } from '#/server/catalog.server'
import { resolveCommand } from '#/server/commands.server'
import { loadSkillCopyContent } from '#/server/skill-content.server'

export function isWorkspaceInstallConfigured(): boolean {
  return Boolean(process.env.ARBORIS_WORKSPACE_ROOT?.trim())
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
  }

  for (const skillId of input.skillIds) {
    const content = await loadSkillCopyContent(skillId, input.lang)
    if (!content) continue
    entries.push({
      path: agentSkillPath(input.agent, skillId),
      content,
    })
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
}): Promise<{ filename: string; base64: string; fileCount: number } | null> {
  if (!isAgentName(input.agent)) return null
  const cmd = await resolveCommand(input.commandId)
  if (!cmd) return null
  const entries: ZipEntry[] = [
    {
      path: agentCommandPath(input.agent, cmd.id),
      content: commandInstallContent(cmd),
    },
  ]
  const zip = buildStoreZip(entries)
  return {
    filename: `arboris-command-${cmd.id}-${input.agent.toLowerCase()}.zip`,
    base64: zipToBase64(zip),
    fileCount: 1,
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
  const content = await loadSkillCopyContent(input.skillId, input.lang)
  if (!content) return null
  const entries: ZipEntry[] = [
    {
      path: agentSkillPath(input.agent, skill.id),
      content,
    },
  ]
  const zip = buildStoreZip(entries)
  return {
    filename: `arboris-skill-${skill.id}-${input.agent.toLowerCase()}.zip`,
    base64: zipToBase64(zip),
    fileCount: 1,
  }
}
