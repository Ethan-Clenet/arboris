import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Lang } from '#/lib/catalog'
import { agentSkillPath, isAgentName, type AgentName } from '#/lib/agents'
import { loadSkillCopyContent } from './skill-content.server'

function workspaceRoot(): string {
  const root = process.env.ARBORIS_WORKSPACE_ROOT?.trim()
  if (!root) throw new Error('workspace_not_configured')
  return resolve(root)
}

function assertInsideWorkspace(root: string, target: string) {
  const normalizedRoot = resolve(root)
  const normalizedTarget = resolve(target)
  if (
    normalizedTarget !== normalizedRoot &&
    !normalizedTarget.startsWith(`${normalizedRoot}/`)
  ) {
    throw new Error('invalid_path')
  }
}

export async function installSkillForAgent(input: {
  skillId: string
  agent: string
  lang: Lang
}): Promise<{ path: string }> {
  if (!isAgentName(input.agent)) throw new Error('unknown_agent')

  const content = await loadSkillCopyContent(input.skillId, input.lang)
  if (!content) throw new Error('skill_not_found')

  const root = workspaceRoot()
  const relativePath = agentSkillPath(input.agent as AgentName, input.skillId)
  const absolutePath = resolve(root, relativePath)
  assertInsideWorkspace(root, absolutePath)

  await mkdir(dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, content, 'utf-8')

  return { path: relativePath }
}
