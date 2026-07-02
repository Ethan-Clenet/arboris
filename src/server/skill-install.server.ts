import type { Lang } from '#/lib/catalog'
import { installSkillToWorkspace } from '#/lib/skill-install-core'
import { defaultSkillsDir, resolvePackageRoot } from '#/lib/package-root'
import { isAgentName } from '#/lib/agents'
import { resolve } from 'node:path'

function workspaceRoot(): string {
  const root = process.env.ARBORIS_WORKSPACE_ROOT?.trim()
  if (!root) throw new Error('workspace_not_configured')
  return resolve(root)
}

const SKILLS_DIR = defaultSkillsDir(resolvePackageRoot(import.meta.url))

export async function installSkillForAgent(input: {
  skillId: string
  agent: string
  lang: Lang
}): Promise<{ path: string }> {
  if (!isAgentName(input.agent)) throw new Error('unknown_agent')

  const result = await installSkillToWorkspace({
    skillId: input.skillId,
    agent: input.agent,
    workspaceRoot: workspaceRoot(),
    skillsDir: SKILLS_DIR,
    force: true,
  })

  if (!result.ok) {
    if (result.error === 'skill_not_found') throw new Error('skill_not_found')
    if (result.error === 'invalid_path') throw new Error('invalid_path')
    throw new Error('unknown_agent')
  }

  return { path: result.path }
}
