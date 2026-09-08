import { describe, expect, it } from 'vitest'
import { isSafeCatalogId, resolveCatalogPath, resolveInsideRoot } from './safe-path'
import { join } from 'node:path'

describe('isSafeCatalogId', () => {
  it('accepte les IDs catalogue courants', () => {
    expect(isSafeCatalogId('gateguard')).toBe(true)
    expect(isSafeCatalogId('add-cli-command__dotnet-sdk__github-skills-3793ff9ea58c')).toBe(true)
    expect(isSafeCatalogId('vendor/nested-skill')).toBe(true)
  })

  it('refuse traversal et chemins absolus', () => {
    expect(isSafeCatalogId('../etc')).toBe(false)
    expect(isSafeCatalogId('foo/../bar')).toBe(false)
    expect(isSafeCatalogId('/etc/passwd')).toBe(false)
    expect(isSafeCatalogId('..')).toBe(false)
    expect(isSafeCatalogId('a\\b')).toBe(false)
    expect(isSafeCatalogId('')).toBe(false)
  })
})

describe('resolveCatalogPath', () => {
  it('reste sous la racine', () => {
    const root = join('/tmp', 'skills-root')
    expect(resolveCatalogPath(root, 'pack', 'SKILL.md')).toBe(join(root, 'pack', 'SKILL.md'))
    expect(resolveCatalogPath(root, '../outside')).toBeNull()
    expect(resolveInsideRoot(root, '..', 'outside')).toBeNull()
  })
})
