import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { installCommandToWorkspace } from './command-install-core'

let root: string
let commandsDir: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'arboris-ws-'))
  commandsDir = join(root, 'commands')
  await mkdir(commandsDir)
  await writeFile(
    join(commandsDir, 'commit.md'),
    `---
name: commit
description: Commit.
---

# Install me
`,
    'utf-8',
  )
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('installCommandToWorkspace', () => {
  it('écrit le corps dans le chemin Cursor', async () => {
    const result = await installCommandToWorkspace({
      commandId: 'commit',
      agent: 'Cursor',
      workspaceRoot: join(root, 'project'),
      commandsDir,
    })
    expect(result).toEqual({ ok: true, path: '.cursor/commands/commit.md', skipped: false })
    if (!result.ok) return
    const written = await readFile(join(root, 'project', result.path), 'utf-8')
    expect(written).toBe('# Install me\n')
    expect(written).not.toContain('name: commit')
  })

  it('skip si le fichier existe déjà, sauf force', async () => {
    const workspaceRoot = join(root, 'project')
    await installCommandToWorkspace({ commandId: 'commit', agent: 'Cursor', workspaceRoot, commandsDir })
    const again = await installCommandToWorkspace({
      commandId: 'commit',
      agent: 'Cursor',
      workspaceRoot,
      commandsDir,
    })
    expect(again).toMatchObject({ ok: true, skipped: true })

    const forced = await installCommandToWorkspace({
      commandId: 'commit',
      agent: 'Cursor',
      workspaceRoot,
      commandsDir,
      force: true,
    })
    expect(forced).toMatchObject({ ok: true, skipped: false })
  })

  it('échoue pour un agent inconnu ou une commande absente', async () => {
    const workspaceRoot = join(root, 'project')
    expect(
      await installCommandToWorkspace({
        commandId: 'commit',
        agent: 'Nope' as never,
        workspaceRoot,
        commandsDir,
      }),
    ).toEqual({ ok: false, error: 'unknown_agent' })
    expect(
      await installCommandToWorkspace({
        commandId: 'missing',
        agent: 'Cursor',
        workspaceRoot,
        commandsDir,
      }),
    ).toEqual({ ok: false, error: 'command_not_found' })
  })
})
