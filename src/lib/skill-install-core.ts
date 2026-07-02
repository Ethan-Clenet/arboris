import { access, mkdir, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { agentSkillPath, isAgentName, type AgentName } from '#/lib/agents'
import { loadSkillFileContent } from '#/lib/skill-file'

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

export type InstallSkillOptions = {
  skillId: string
  agent: AgentName
  workspaceRoot: string
  skillsDir: string
  force?: boolean
}

export type InstallSkillResult =
  | { ok: true; path: string; skipped: false }
  | { ok: true; path: string; skipped: true }
  | { ok: false; error: 'skill_not_found' | 'unknown_agent' | 'invalid_path' }

export async function installSkillToWorkspace(
  input: InstallSkillOptions,
): Promise<InstallSkillResult> {
  if (!isAgentName(input.agent)) {
    return { ok: false, error: 'unknown_agent' }
  }

  const content = await loadSkillFileContent(input.skillsDir, input.skillId)
  if (!content) {
    return { ok: false, error: 'skill_not_found' }
  }

  const root = resolve(input.workspaceRoot)
  const relativePath = agentSkillPath(input.agent, input.skillId)
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
  await writeFile(absolutePath, content, 'utf-8')

  return { ok: true, path: relativePath, skipped: false }
}

export type InstallStackOptions = {
  skillIds: string[]
  agent: AgentName
  workspaceRoot: string
  skillsDir: string
  force?: boolean
  onProgress?: (info: {
    index: number
    total: number
    skillId: string
    result: InstallSkillResult
  }) => void
}

export type InstallStackSummary = {
  installed: string[]
  skipped: string[]
  failed: Array<{ skillId: string; error: string }>
}

export async function installStackToWorkspace(
  input: InstallStackOptions,
): Promise<InstallStackSummary> {
  const summary: InstallStackSummary = { installed: [], skipped: [], failed: [] }
  const total = input.skillIds.length

  for (const [index, skillId] of input.skillIds.entries()) {
    const result = await installSkillToWorkspace({
      skillId,
      agent: input.agent,
      workspaceRoot: input.workspaceRoot,
      skillsDir: input.skillsDir,
      force: input.force,
    })

    input.onProgress?.({ index: index + 1, total, skillId, result })

    if (!result.ok) {
      summary.failed.push({ skillId, error: result.error })
      continue
    }
    if (result.skipped) {
      summary.skipped.push(skillId)
    } else {
      summary.installed.push(skillId)
    }
  }

  return summary
}
