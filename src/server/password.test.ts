import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('hashPassword / verifyPassword', () => {
  it('vérifie un mot de passe correct', async () => {
    const stored = await hashPassword('s3cret!')
    expect(stored).toMatch(/^[a-f0-9]+:[a-f0-9]+$/)
    expect(await verifyPassword('s3cret!', stored)).toBe(true)
  })

  it('rejette un mot de passe incorrect ou un hash invalide', async () => {
    const stored = await hashPassword('s3cret!')
    expect(await verifyPassword('nope', stored)).toBe(false)
    expect(await verifyPassword('s3cret!', 'not-a-hash')).toBe(false)
    expect(await verifyPassword('s3cret!', '')).toBe(false)
  })
})
