import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { installSkillToWorkspace, installStackToWorkspace } from './skill-install-core'

let root: string
let skillsDir: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'arboris-skill-ws-'))
  skillsDir = join(root, 'skills')
  await mkdir(join(skillsDir, 'gateguard', 'docs'), { recursive: true })
  await writeFile(join(skillsDir, 'gateguard', 'SKILL.md'), '---\nname: gateguard\n---\n\n# Gate\n', 'utf-8')
  await writeFile(join(skillsDir, 'gateguard', 'docs', 'note.md'), 'note', 'utf-8')
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('installSkillToWorkspace', () => {
  it('copie le package (SKILL.md + compagnons)', async () => {
    const workspaceRoot = join(root, 'project')
    const result = await installSkillToWorkspace({
      skillId: 'gateguard',
      agent: 'Cursor',
      workspaceRoot,
      skillsDir,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.skipped).toBe(false)
    expect(result.files).toEqual(
      expect.arrayContaining([
        '.cursor/skills/gateguard/SKILL.md',
        '.cursor/skills/gateguard/docs/note.md',
      ]),
    )
    const md = await readFile(join(workspaceRoot, '.cursor/skills/gateguard/SKILL.md'), 'utf-8')
    expect(md).toContain('name: gateguard')
  })

  it('skip si déjà installé', async () => {
    const workspaceRoot = join(root, 'project')
    await installSkillToWorkspace({ skillId: 'gateguard', agent: 'Cursor', workspaceRoot, skillsDir })
    const again = await installSkillToWorkspace({
      skillId: 'gateguard',
      agent: 'Cursor',
      workspaceRoot,
      skillsDir,
    })
    expect(again).toMatchObject({ ok: true, skipped: true })
  })

  it('échoue pour un skill ou agent inconnu', async () => {
    const workspaceRoot = join(root, 'project')
    expect(
      await installSkillToWorkspace({
        skillId: 'gateguard',
        agent: 'Nope' as never,
        workspaceRoot,
        skillsDir,
      }),
    ).toEqual({ ok: false, error: 'unknown_agent' })
    expect(
      await installSkillToWorkspace({
        skillId: 'missing',
        agent: 'Cursor',
        workspaceRoot,
        skillsDir,
      }),
    ).toEqual({ ok: false, error: 'skill_not_found' })
  })
})

describe('installStackToWorkspace', () => {
  it('résume installés / skipped / failed', async () => {
    const workspaceRoot = join(root, 'project')
    const first = await installStackToWorkspace({
      skillIds: ['gateguard', 'missing'],
      agent: 'Cursor',
      workspaceRoot,
      skillsDir,
    })
    expect(first.installed).toEqual(['gateguard'])
    expect(first.failed).toEqual([{ skillId: 'missing', error: 'skill_not_found' }])

    const second = await installStackToWorkspace({
      skillIds: ['gateguard'],
      agent: 'Cursor',
      workspaceRoot,
      skillsDir,
    })
    expect(second.skipped).toEqual(['gateguard'])
  })
})
