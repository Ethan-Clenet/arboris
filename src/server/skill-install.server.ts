import type { Lang } from '#/lib/catalog'
import { agentSkillPath, isAgentName } from '#/lib/agents'
import { installSkillToWorkspace } from '#/lib/skill-install-core'
import { needsInstallConfirm } from '#/lib/skillspector'
import { defaultSkillsDir, resolvePackageRoot } from '#/lib/package-root'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { prisma } from './db'

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
  acknowledgeRisk?: boolean
}): Promise<{ path: string }> {
  if (!isAgentName(input.agent)) throw new Error('unknown_agent')

  const skill = await prisma.skill.findUnique({
    where: { id: input.skillId },
    select: { score: true, bodyMd: true },
  })
  if (!skill) throw new Error('skill_not_found')

  if (needsInstallConfirm(skill.score) && !input.acknowledgeRisk) {
    throw new Error('security_blocked')
  }

  const root = workspaceRoot()
  const result = await installSkillToWorkspace({
    skillId: input.skillId,
    agent: input.agent,
    workspaceRoot: root,
    skillsDir: SKILLS_DIR,
    force: true,
  })

  if (result.ok) {
    return { path: result.path }
  }

  // Fallback serverless : pas de package disque → écrire bodyMd (avec frontmatter).
  if (result.error === 'skill_not_found' && skill.bodyMd?.trim()) {
    const relativePath = agentSkillPath(input.agent, input.skillId)
    const absolutePath = resolve(root, relativePath)
    await mkdir(dirname(absolutePath), { recursive: true })
    const content = skill.bodyMd.trim()
    await writeFile(absolutePath, content.endsWith('\n') ? content : `${content}\n`, 'utf-8')
    return { path: relativePath }
  }

  if (result.error === 'skill_not_found') throw new Error('skill_not_found')
  if (result.error === 'invalid_path') throw new Error('invalid_path')
  throw new Error('unknown_agent')
}
