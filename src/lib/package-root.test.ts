import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { pathToFileURL } from 'node:url'
import {
  defaultCommandsDir,
  defaultManifestPath,
  defaultSkillsDir,
  resolvePackageRoot,
} from './package-root'

describe('default*Dir', () => {
  it('pointe vers prisma/skills et prisma/commands', () => {
    expect(defaultSkillsDir('/pkg')).toBe(join('/pkg', 'prisma', 'skills'))
    expect(defaultCommandsDir('/pkg')).toBe(join('/pkg', 'prisma', 'commands'))
  })
})

describe('resolvePackageRoot / defaultManifestPath', () => {
  let dir = ''

  afterEach(async () => {
    if (dir) await rm(dir, { recursive: true, force: true })
  })

  it('remonte jusqu’au package.json + prisma/skills', async () => {
    dir = await mkdtemp(join(tmpdir(), 'arboris-pkg-root-'))
    await writeFile(join(dir, 'package.json'), '{}', 'utf-8')
    await mkdir(join(dir, 'prisma', 'skills'), { recursive: true })
    const nested = join(dir, 'src', 'lib')
    await mkdir(nested, { recursive: true })
    const from = pathToFileURL(join(nested, 'fake.ts')).href
    expect(resolvePackageRoot(from)).toBe(dir)
  })

  it('préfère manifest.json à la racine', async () => {
    dir = await mkdtemp(join(tmpdir(), 'arboris-manifest-'))
    await writeFile(join(dir, 'manifest.json'), '{}', 'utf-8')
    expect(defaultManifestPath(dir)).toBe(join(dir, 'manifest.json'))
  })

  it('replie sur cli/manifest.json', async () => {
    dir = await mkdtemp(join(tmpdir(), 'arboris-manifest-cli-'))
    expect(defaultManifestPath(dir)).toBe(join(dir, 'cli', 'manifest.json'))
  })
})
