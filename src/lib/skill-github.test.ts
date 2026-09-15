import { describe, expect, it } from 'vitest'
import { resolveSkillGithubUrl } from './skill-github'

describe('resolveSkillGithubUrl', () => {
  it('résout un skill du lock vers le blob GitHub exact', () => {
    const src = resolveSkillGithubUrl('supabase')
    expect(src.kind).toBe('upstream')
    expect(src.repo).toBe('supabase/agent-skills')
    expect(src.url).toBe(
      'https://github.com/supabase/agent-skills/blob/HEAD/skills/supabase/SKILL.md',
    )
  })

  it('résout un skill vendor vers une recherche GitHub dans le bon repo', () => {
    const src = resolveSkillGithubUrl(
      'create-table-hook__tanstack-table__packages-react-table-skills-686c19936c82',
    )
    expect(src.kind).toBe('upstream')
    expect(src.repo).toBe('TanStack/table')
    expect(src.url).toContain('github.com/search')
    expect(decodeURIComponent(src.url)).toContain('repo:TanStack/table')
    expect(decodeURIComponent(src.url)).toContain('create-table-hook')
  })

  it('infère org/repo pour un vendor hors liste SOURCES', () => {
    const src = resolveSkillGithubUrl(
      '1password__nousresearch-hermes-agent__optional-skills-security-8c6b9c4182d0',
    )
    expect(src.kind).toBe('upstream')
    expect(src.repo).toBe('NousResearch/hermes-agent')
  })

  it('bascule sur le miroir Arboris pour un skill local sans source', () => {
    const src = resolveSkillGithubUrl('agent-eval')
    expect(src.kind).toBe('mirror')
    expect(src.repo).toBe('ThePheniX974/arboris')
    expect(src.url).toContain('/prisma/skills/agent-eval')
  })
})
