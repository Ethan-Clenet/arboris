import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listSkillPackageFiles, skillPackageHasCompanions } from './skill-package'

let skillsDir: string

beforeEach(async () => {
  skillsDir = await mkdtemp(join(tmpdir(), 'arboris-pkg-'))
})

afterEach(async () => {
  await rm(skillsDir, { recursive: true, force: true })
})

describe('listSkillPackageFiles', () => {
  it('liste SKILL.md et les compagnons', async () => {
    const root = join(skillsDir, 'pack')
    await mkdir(join(root, 'preflight'), { recursive: true })
    await writeFile(join(root, 'SKILL.md'), '# skill\n', 'utf-8')
    await writeFile(join(root, 'preflight', 'guard.md'), '# guard\n', 'utf-8')

    const files = await listSkillPackageFiles(skillsDir, 'pack')
    expect(files?.map((f) => f.relativePath)).toEqual(
      expect.arrayContaining(['SKILL.md', 'preflight/guard.md']),
    )
    expect(files).toHaveLength(2)
    expect(skillPackageHasCompanions(files!)).toBe(true)
  })

  it('renvoie null si le dossier n’existe pas', async () => {
    expect(await listSkillPackageFiles(skillsDir, 'missing')).toBeNull()
  })
})

describe('skillPackageHasCompanions', () => {
  it('est faux s’il n’y a que SKILL.md', () => {
    expect(skillPackageHasCompanions([{ relativePath: 'SKILL.md', content: '' }])).toBe(false)
  })
})
