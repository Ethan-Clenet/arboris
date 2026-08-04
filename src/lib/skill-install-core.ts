import { access, mkdir, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { agentSkillDir, agentSkillPath, isAgentName, type AgentName } from '#/lib/agents'
import { loadSkillFileContent } from '#/lib/skill-file'
import { listSkillPackageFiles } from '#/lib/skill-package'

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
  | { ok: true; path: string; skipped: false; files?: string[] }
  | { ok: true; path: string; skipped: true; files?: string[] }
  | { ok: false; error: 'skill_not_found' | 'unknown_agent' | 'invalid_path' }

export async function installSkillToWorkspace(
  input: InstallSkillOptions,
): Promise<InstallSkillResult> {
  if (!isAgentName(input.agent)) {
    return { ok: false, error: 'unknown_agent' }
  }

  const root = resolve(input.workspaceRoot)
  const skillMdRelative = agentSkillPath(input.agent, input.skillId)
  const skillMdAbsolute = resolve(root, skillMdRelative)
  const skillDirRelative = agentSkillDir(input.agent, input.skillId)
  const skillDirAbsolute = resolve(root, skillDirRelative)

  try {
    assertInsideWorkspace(root, skillMdAbsolute)
    assertInsideWorkspace(root, skillDirAbsolute)
  } catch {
    return { ok: false, error: 'invalid_path' }
  }

  if (!input.force && (await fileExists(skillMdAbsolute))) {
    return { ok: true, path: skillMdRelative, skipped: true, files: [skillMdRelative] }
  }

  // Copie disque préférée : conserve frontmatter + fichiers compagnons.
  const packageFiles = await listSkillPackageFiles(input.skillsDir, input.skillId)
  if (packageFiles?.length) {
    const written: string[] = []
    for (const file of packageFiles) {
      const relativePath = join(skillDirRelative, file.relativePath).replace(/\\/g, '/')
      const absolutePath = resolve(root, relativePath)
      try {
        assertInsideWorkspace(root, absolutePath)
      } catch {
        return { ok: false, error: 'invalid_path' }
      }
      await mkdir(dirname(absolutePath), { recursive: true })
      await writeFile(absolutePath, file.content, 'utf-8')
      written.push(relativePath)
    }
    return { ok: true, path: skillMdRelative, skipped: false, files: written }
  }

  // Fallback (skills sans dossier package) : compile avec frontmatter.
  const content = await loadSkillFileContent(input.skillsDir, input.skillId)
  if (!content) {
    return { ok: false, error: 'skill_not_found' }
  }

  await mkdir(dirname(skillMdAbsolute), { recursive: true })
  await writeFile(skillMdAbsolute, content.endsWith('\n') ? content : `${content}\n`, 'utf-8')

  return { ok: true, path: skillMdRelative, skipped: false, files: [skillMdRelative] }
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
