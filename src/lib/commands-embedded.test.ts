import { describe, expect, it } from 'vitest'
import { loadEmbeddedCommand, loadEmbeddedCommands } from './commands-embedded'

describe('loadEmbeddedCommands', () => {
  it('charge et trie le bundle généré', () => {
    const all = loadEmbeddedCommands()
    expect(all.length).toBeGreaterThan(0)
    const ids = all.map((c) => c.id)
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)))
    expect(all[0]?.body).toBeTruthy()
    expect(all[0]?.compat).toContain('Cursor')
  })

  it('réutilise le cache', () => {
    expect(loadEmbeddedCommands()).toBe(loadEmbeddedCommands())
  })
})

describe('loadEmbeddedCommand', () => {
  it('trouve une commande connue', () => {
    const all = loadEmbeddedCommands()
    const first = all[0]!
    expect(loadEmbeddedCommand(first.id)?.id).toBe(first.id)
  })

  it('renvoie null si inconnue', () => {
    expect(loadEmbeddedCommand('__missing__')).toBeNull()
  })
})
