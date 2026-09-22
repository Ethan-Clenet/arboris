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

  it('résout les alias courts de collections', () => {
    expect(findCollectionSeed('tanstack')?.id).toBe('tanstack-starter')
    expect(findCollectionSeed('TanStack')?.id).toBe('tanstack-starter')
    expect(findCollectionSeed('prisma-postgres')?.id).toBe('prisma-postgres-starter')
    expect(findCollectionSeed('n8n')?.id).toBe('n8n-starter')
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

  it('embarque le pack Ship safely avec les audits CWE/CAPEC', () => {
    const pack = COLLECTIONS.find((c) => c.id === 'ship-safely')
    expect(pack?.kind).toBe('pack')
    expect(pack?.skillIds).toEqual(
      expect.arrayContaining(['cve-scan', 'cwe-code-audit', 'capec-code-audit', 'security-review']),
    )
    expect(findCollectionSeed('ship-safely')?.id).toBe('ship-safely')
  })

  it('embarque Ansible, .NET et Supabase officiels', () => {
    const ansible = COLLECTIONS.find((c) => c.id === 'ansible-starter')
    expect(ansible?.kind).toBe('pack')
    expect(ansible?.skillIds.some((id) => id.includes('td-ansible-creator'))).toBe(true)

    const dotnet = COLLECTIONS.find((c) => c.id === 'dotnet-starter')
    expect(dotnet?.kind).toBe('pack')
    expect(dotnet?.skillIds.some((id) => id.includes('dotnet-webapi'))).toBe(true)

    const supabase = COLLECTIONS.find((c) => c.id === 'supabase-starter')
    expect(supabase?.skillIds.some((id) => id.includes('supabase-agent-skills'))).toBe(true)
  })

  it('ajoute Prisma au pack Node et Storybook au pack React', () => {
    const node = COLLECTIONS.find((c) => c.id === 'node-api-starter')
    expect(node?.skillIds).toEqual(expect.arrayContaining(['prisma-patterns']))
    expect(node?.skillIds.some((id) => id.includes('prisma-client-api'))).toBe(true)

    const react = COLLECTIONS.find((c) => c.id === 'react-ts-starter')
    expect(react?.skillIds.some((id) => id.includes('storybook-init'))).toBe(true)
    expect(react?.skillIds.some((id) => id.includes('storybookjs-mcp'))).toBe(true)
  })
})
