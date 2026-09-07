import { describe, expect, it } from 'vitest'
import { COLLECTIONS, findCollectionSeed } from './collections-data'

describe('COLLECTIONS', () => {
  it('a des ids uniques et des champs requis', () => {
    const ids = COLLECTIONS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const collection of COLLECTIONS) {
      expect(collection.id).toBeTruthy()
      expect(collection.labelFr).toBeTruthy()
      expect(collection.labelEn).toBeTruthy()
      expect(['featured', 'pack']).toContain(collection.kind)
      expect(Array.isArray(collection.skillIds)).toBe(true)
      expect(Array.isArray(collection.commandIds)).toBe(true)
    }
  })

  it('embarque le pack Sonar attendu', () => {
    const sonar = COLLECTIONS.find((c) => c.id === 'sonar')
    expect(sonar?.commandIds).toContain('sonar')
    expect(sonar?.skillIds).toContain('skill-sonar')
    expect(findCollectionSeed('sonar')?.id).toBe('sonar')
    expect(findCollectionSeed('__nope__')).toBeUndefined()
  })

  it('embarque les packs Docker et n8n', () => {
    const docker = COLLECTIONS.find((c) => c.id === 'docker-ops-starter')
    expect(docker?.skillIds).toContain('docker-patterns')
    expect(docker?.commandIds).toContain('docker-rebuild')

    const n8n = COLLECTIONS.find((c) => c.id === 'n8n-starter')
    expect(n8n?.kind).toBe('pack')
    expect(n8n?.skillIds).toEqual(
      expect.arrayContaining(['n8n-patterns', 'docker-patterns', 'api-design', 'error-handling']),
    )
    expect(n8n?.commandIds).toContain('docker-rebuild')
    expect(findCollectionSeed('n8n-starter')?.id).toBe('n8n-starter')
  })
})
