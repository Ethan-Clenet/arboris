import { describe, expect, it } from 'vitest'
import { COLLECTIONS } from './collections-data'

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
  })
})
