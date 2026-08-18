import { describe, expect, it } from 'vitest'
import { parseCommandMarkdown } from './command-parse'

const SAMPLE = `---
name: commit
description: Prépare un commit git propre.
skills:
  - gateguard
  - 'safety-guard'
---

# Commit

Corps de la commande.
`

describe('parseCommandMarkdown', () => {
  it('lit le frontmatter, le corps et les skills', () => {
    const parsed = parseCommandMarkdown(SAMPLE, 'fallback')
    expect(parsed).toMatchObject({
      id: 'commit',
      description: 'Prépare un commit git propre.',
      skillIds: ['gateguard', 'safety-guard'],
    })
    expect(parsed?.body).toContain('# Commit')
  })

  it('utilise le fallback sans frontmatter', () => {
    const parsed = parseCommandMarkdown('# Hello\n\nWorld', 'hello')
    expect(parsed).toEqual({
      id: 'hello',
      description: '# Hello',
      body: '# Hello\n\nWorld',
      raw: '# Hello\n\nWorld',
      skillIds: [],
    })
  })

  it('renvoie null pour un fichier vide', () => {
    expect(parseCommandMarkdown('   \n', 'x')).toBeNull()
  })
})
