import { describe, expect, it } from 'vitest'
import { commandInstallContent, toCommandSummary } from './command-types'
import type { CommandDetail } from './command-types'

const detail: CommandDetail = {
  id: 'commit',
  description: { fr: 'Commit', en: 'Commit' },
  preview: 'Prépare un commit.',
  compat: ['Cursor'],
  skillIds: ['gateguard'],
  body: '# Commit\n',
  raw: '---\nname: commit\n---\n# Commit\n',
}

describe('commandInstallContent', () => {
  it('installe le corps Markdown, pas le frontmatter', () => {
    expect(commandInstallContent(detail)).toBe('# Commit\n')
  })

  it('replie sur raw si le corps est vide', () => {
    expect(commandInstallContent({ body: '  ', raw: 'RAW' })).toBe('RAW')
  })
})

describe('toCommandSummary', () => {
  it('copie les champs résumé sans le corps', () => {
    const summary = toCommandSummary(detail)
    expect(summary).toEqual({
      id: 'commit',
      description: { fr: 'Commit', en: 'Commit' },
      preview: 'Prépare un commit.',
      compat: ['Cursor'],
      skillIds: ['gateguard'],
    })
    expect(summary.skillIds).not.toBe(detail.skillIds)
  })
})
