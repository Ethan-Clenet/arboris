import { access, mkdir, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { agentCommandPath, isAgentName, type AgentName } from '#/lib/agents'
import { commandInstallContent } from '#/lib/command-types'
import { loadCommandFile } from '#/lib/command-file'

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

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}

export type InstallCommandOptions = {
  commandId: string
  agent: AgentName
  workspaceRoot: string
  commandsDir: string
  force?: boolean
}

export type InstallCommandResult =
  | { ok: true; path: string; skipped: false }
  | { ok: true; path: string; skipped: true }
  | { ok: false; error: 'command_not_found' | 'unknown_agent' | 'invalid_path' }

export async function installCommandToWorkspace(
  input: InstallCommandOptions,
): Promise<InstallCommandResult> {
  if (!isAgentName(input.agent)) {
    return { ok: false, error: 'unknown_agent' }
  }

  const cmd = await loadCommandFile(input.commandsDir, input.commandId)
  if (!cmd) {
    return { ok: false, error: 'command_not_found' }
  }

  const root = resolve(input.workspaceRoot)
  const relativePath = agentCommandPath(input.agent, cmd.id)
  const absolutePath = resolve(root, relativePath)

  try {
    assertInsideWorkspace(root, absolutePath)
  } catch {
    return { ok: false, error: 'invalid_path' }
  }

  if (!input.force && (await fileExists(absolutePath))) {
    return { ok: true, path: relativePath, skipped: true }
  }

  await mkdir(dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, commandInstallContent(cmd), 'utf-8')

  return { ok: true, path: relativePath, skipped: false }
}
