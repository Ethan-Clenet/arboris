import { describe, expect, it } from 'vitest'
import { resolveSkillGithubUrl } from './skill-github'

describe('resolveSkillGithubUrl', () => {
  it('résout un skill du lock vers la racine du dépôt GitHub', () => {
    const src = resolveSkillGithubUrl('supabase')
    expect(src.kind).toBe('upstream')
    expect(src.repo).toBe('supabase/agent-skills')
    expect(src.url).toBe('https://github.com/supabase/agent-skills')
  })

  it('résout un skill vendor vers la racine du dépôt d’origine', () => {
    const src = resolveSkillGithubUrl(
      'create-table-hook__tanstack-table__packages-react-table-skills-686c19936c82',
    )
    expect(src.kind).toBe('upstream')
    expect(src.repo).toBe('TanStack/table')
    expect(src.url).toBe('https://github.com/TanStack/table')
  })

  it('pointe microsoft/aibast-agents-library (pas une recherche code)', () => {
    const src = resolveSkillGithubUrl(
      'abandonment-analysis__microsoft-aibast-agents-library__solutions-cart-abandonment-recovery-manual-skills-8c2a6bf4f120',
    )
    expect(src.kind).toBe('upstream')
    expect(src.repo).toBe('microsoft/aibast-agents-library')
    expect(src.url).toBe('https://github.com/microsoft/aibast-agents-library')
  })

  it('infère org/repo pour un vendor hors liste SOURCES', () => {
    const src = resolveSkillGithubUrl(
      '1password__nousresearch-hermes-agent__optional-skills-security-8c6b9c4182d0',
    )
    expect(src.kind).toBe('upstream')
    expect(src.repo).toBe('NousResearch/hermes-agent')
    expect(src.url).toBe('https://github.com/NousResearch/hermes-agent')
  })

  it('bascule sur le miroir Arboris pour un skill local sans source', () => {
    const src = resolveSkillGithubUrl('agent-eval')
    expect(src.kind).toBe('mirror')
    expect(src.repo).toBe('ThePheniX974/arboris')
    expect(src.url).toContain('/prisma/skills/agent-eval')
  })
})
