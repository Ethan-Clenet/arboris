import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listCommandIds, loadAllCommands, loadCommandFile } from './command-file'

let commandsDir: string

beforeEach(async () => {
  commandsDir = await mkdtemp(join(tmpdir(), 'arboris-cmds-'))
})

afterEach(async () => {
  await rm(commandsDir, { recursive: true, force: true })
})

describe('loadCommandFile', () => {
  it('parse un markdown avec frontmatter', async () => {
    await writeFile(
      join(commandsDir, 'commit.md'),
      `---
name: commit
description: Commit propre.
---

# Corps
`,
      'utf-8',
    )
    const cmd = await loadCommandFile(commandsDir, 'commit')
    expect(cmd).toMatchObject({
      id: 'commit',
      description: { fr: 'Commit propre.', en: 'Commit propre.' },
      preview: '# Corps',
    })
    expect(cmd?.compat).toContain('Cursor')
  })

  it('renvoie null si absent', async () => {
    expect(await loadCommandFile(commandsDir, 'missing')).toBeNull()
  })
})

describe('listCommandIds / loadAllCommands', () => {
  it('ignore les non-.md et trie', async () => {
    await writeFile(join(commandsDir, 'b.md'), '---\nname: b\n---\n\nB\n', 'utf-8')
    await writeFile(join(commandsDir, 'a.md'), '---\nname: a\n---\n\nA\n', 'utf-8')
    await writeFile(join(commandsDir, 'notes.txt'), 'nope', 'utf-8')
    await mkdir(join(commandsDir, 'subdir'))

    expect(await listCommandIds(commandsDir)).toEqual(['a', 'b'])
    const all = await loadAllCommands(commandsDir)
    expect(all.map((c) => c.id)).toEqual(['a', 'b'])
  })

  it('renvoie [] si le dossier n’existe pas', async () => {
    expect(await listCommandIds(join(commandsDir, 'nope'))).toEqual([])
  })
})
