import type { Lang } from '#/lib/catalog'
import { installCommandToWorkspace } from '#/lib/command-install-core'
import { installSkillToWorkspace } from '#/lib/skill-install-core'
import {
  defaultCommandsDir,
  defaultSkillsDir,
  resolvePackageRoot,
} from '#/lib/package-root'
import { isAgentName } from '#/lib/agents'
import { assertInstallToken } from '#/server/install-auth.server'
import { resolveCommand } from '#/server/commands.server'
import { resolve } from 'node:path'

function workspaceRoot(): string {
  const root = process.env.ARBORIS_WORKSPACE_ROOT?.trim()
  if (!root) throw new Error('workspace_not_configured')
  return resolve(root)
}

const PACKAGE_ROOT = resolvePackageRoot(import.meta.url)
const COMMANDS_DIR = defaultCommandsDir(PACKAGE_ROOT)
const SKILLS_DIR = defaultSkillsDir(PACKAGE_ROOT)

export async function installCommandForAgent(input: {
  commandId: string
  agent: string
  lang: Lang
  installToken?: string
}): Promise<{ path: string; skillPaths: string[] }> {
  if (!isAgentName(input.agent)) throw new Error('unknown_agent')

  const command = await resolveCommand(input.commandId)
  if (!command) throw new Error('command_not_found')

  assertInstallToken(input.installToken)
  const root = workspaceRoot()
  const result = await installCommandToWorkspace({
    commandId: input.commandId,
    agent: input.agent,
    workspaceRoot: root,
    commandsDir: COMMANDS_DIR,
    command,
    force: true,
  })

  if (!result.ok) {
    if (result.error === 'command_not_found') throw new Error('command_not_found')
    if (result.error === 'invalid_path') throw new Error('invalid_path')
    throw new Error('unknown_agent')
  }

  const skillPaths: string[] = []
  for (const skillId of command.skillIds ?? []) {
    const skillResult = await installSkillToWorkspace({
      skillId,
      agent: input.agent,
      workspaceRoot: root,
      skillsDir: SKILLS_DIR,
      force: true,
    })
    if (skillResult.ok) skillPaths.push(skillResult.path)
  }

  return { path: result.path, skillPaths }
}
