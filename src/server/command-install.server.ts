import type { Lang } from '#/lib/catalog'
import { installCommandToWorkspace } from '#/lib/command-install-core'
import { defaultCommandsDir, resolvePackageRoot } from '#/lib/package-root'
import { isAgentName } from '#/lib/agents'
import { resolveCommand } from '#/server/commands.server'
import { resolve } from 'node:path'

function workspaceRoot(): string {
  const root = process.env.ARBORIS_WORKSPACE_ROOT?.trim()
  if (!root) throw new Error('workspace_not_configured')
  return resolve(root)
}

const COMMANDS_DIR = defaultCommandsDir(resolvePackageRoot(import.meta.url))

export async function installCommandForAgent(input: {
  commandId: string
  agent: string
  lang: Lang
}): Promise<{ path: string }> {
  if (!isAgentName(input.agent)) throw new Error('unknown_agent')

  const command = await resolveCommand(input.commandId)
  if (!command) throw new Error('command_not_found')

  const result = await installCommandToWorkspace({
    commandId: input.commandId,
    agent: input.agent,
    workspaceRoot: workspaceRoot(),
    commandsDir: COMMANDS_DIR,
    command,
    force: true,
  })

  if (!result.ok) {
    if (result.error === 'command_not_found') throw new Error('command_not_found')
    if (result.error === 'invalid_path') throw new Error('invalid_path')
    throw new Error('unknown_agent')
  }

  return { path: result.path }
}
