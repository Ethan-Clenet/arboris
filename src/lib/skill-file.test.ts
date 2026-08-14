import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { compileSkillFile, tryLoadSkillFile } from './skill-file'

let skillsDir: string

beforeEach(async () => {
  skillsDir = await mkdtemp(join(tmpdir(), 'arboris-skills-'))
})

afterEach(async () => {
  await rm(skillsDir, { recursive: true, force: true })
})

async function writeSkill(id: string, content: string) {
  const dir = join(skillsDir, id)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'SKILL.md'), content, 'utf-8')
}

describe('compileSkillFile', () => {
  it('renvoie le fichier brut sans dépendances', async () => {
    const raw = '---\nname: solo\n---\n\n# Solo\n'
    await writeSkill('solo', raw)
    expect(await compileSkillFile(skillsDir, 'solo')).toBe(raw.trim())
  })

  it('inclut les dépendances dans le corps', async () => {
    await writeSkill(
      'root',
      `---
name: root
depends_on:
  - child
---

# Root
`,
    )
    await writeSkill(
      'child',
      `---
name: child
---

# Child body
`,
    )
    const compiled = await compileSkillFile(skillsDir, 'root')
    expect(compiled).toContain('name: root')
    expect(compiled).toContain('# Root')
    expect(compiled).toContain('## Included dependency: child')
    expect(compiled).toContain('# Child body')
  })

  it('casse les cycles de dépendances', async () => {
    await writeSkill(
      'a',
      `---
name: a
depends_on:
  - b
---

# A
`,
    )
    await writeSkill(
      'b',
      `---
name: b
depends_on:
  - a
---

# B
`,
    )
    const compiled = await compileSkillFile(skillsDir, 'a')
    expect(compiled).toContain('# A')
    expect(compiled).toContain('# B')
  })

  it('renvoie null si le skill est absent', async () => {
    expect(await compileSkillFile(skillsDir, 'missing')).toBeNull()
    expect(await tryLoadSkillFile(skillsDir, 'missing')).toBeNull()
  })
})
