import { describe, expect, it } from 'vitest'
import { buildStoreZip, zipToBase64 } from './zip-store'

describe('buildStoreZip', () => {
  it('produit un zip store avec signatures PK', () => {
    const zip = buildStoreZip([{ path: 'SKILL.md', content: '# hello\n' }])
    expect(zip[0]).toBe(0x50) // P
    expect(zip[1]).toBe(0x4b) // K
    expect(zip[2]).toBe(0x03)
    expect(zip[3]).toBe(0x04)
    const asText = Buffer.from(zip).toString('latin1')
    expect(asText).toContain('SKILL.md')
    expect(asText).toContain('# hello')
  })

  it('encode en base64 round-trip', () => {
    const zip = buildStoreZip([{ path: 'a.txt', content: 'x' }])
    const b64 = zipToBase64(zip)
    expect(Buffer.from(b64, 'base64')).toEqual(Buffer.from(zip))
  })
})
