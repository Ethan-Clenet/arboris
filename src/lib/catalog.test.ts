import { describe, expect, it } from 'vitest'
import type { SkillDetail, SkillSummary, Stack } from './catalog'
import {
  buildSkillMarkdown,
  categoryIdsInGroup,
  compatDot,
  hexToRgba,
  packIdsForStartPath,
  promptFor,
  promptForStack,
  scoreColor,
  listingPublisher,
  COMMUNITY_PUBLISHER,
  skillMatchesStack,
  skillsForStackAndCategory,
  stackSupportsCategory,
  TECH_STARTER_PACK_IDS,
} from './catalog'

const skill = (over: Partial<SkillSummary> = {}): SkillSummary => ({
  id: 'gateguard',
  categoryId: 'security',
  icon: 'shield-check',
  score: 90,
  securityRecommendation: 'SAFE',
  scannedAt: null,
  publisher: null,
  tech: ['ts'],
  compat: ['Cursor'],
  stacks: ['ts'],
  tag: { fr: 'Garde', en: 'Guard' },
  act: { fr: 'bloque les merges risqués', en: 'blocks risky merges' },
  ...over,
})

describe('categoryIdsInGroup', () => {
  it('résout un groupe connu et un inconnu', () => {
    expect(categoryIdsInGroup('security')).toEqual(['security'])
    expect(categoryIdsInGroup('nope')).toEqual([])
  })
})

describe('stackSupportsCategory / skillMatchesStack', () => {
  it('filtre les catégories d’une techno', () => {
    expect(stackSupportsCategory('react', 'frontend')).toBe(true)
    expect(stackSupportsCategory('react', 'backend')).toBe(false)
    expect(stackSupportsCategory('unknown', 'frontend')).toBe(false)
    expect(stackSupportsCategory('n8n', 'ops')).toBe(true)
    expect(stackSupportsCategory('docker', 'ops')).toBe(true)
  })

  it('expose Docker et n8n dans les starters « nouveau projet »', () => {
    expect(TECH_STARTER_PACK_IDS).toContain('docker-ops-starter')
    expect(TECH_STARTER_PACK_IDS).toContain('n8n-starter')
    expect(packIdsForStartPath('new-project')).toEqual(TECH_STARTER_PACK_IDS)
  })

  it('un skill sans stack matche toutes les technos', () => {
    expect(skillMatchesStack(skill({ stacks: [] }), 'react')).toBe(true)
    expect(skillMatchesStack(skill({ stacks: ['ts'] }), 'react')).toBe(false)
    expect(skillMatchesStack(skill({ stacks: ['ts'] }), 'ts')).toBe(true)
  })
})

describe('skillsForStackAndCategory', () => {
  it('ne garde que la catégorie et la stack', () => {
    const skills = [
      skill(),
      skill({ id: 'other', categoryId: 'frontend', stacks: ['react'] }),
    ]
    expect(skillsForStackAndCategory(skills, 'ts', 'security').map((s) => s.id)).toEqual([
      'gateguard',
    ])
  })
})

describe('hexToRgba', () => {
  it('convertit #RRGGBB et #RGB', () => {
    expect(hexToRgba('#43A047', 0.5)).toBe('rgba(67,160,71,0.5)')
    expect(hexToRgba('#fff', 1)).toBe('rgba(255,255,255,1)')
  })
})

describe('prompts et markdown', () => {
  it('génère un prompt bilingue', () => {
    expect(promptFor(skill(), 'fr')).toContain('gateguard')
    expect(promptFor(skill(), 'en')).toContain('Add the "gateguard"')
  })

  it('compile un SKILL.md avec frontmatter', () => {
    const detail: SkillDetail = {
      ...skill(),
      does: { fr: ['filtre'], en: ['filters'] },
      triggers: { fr: ['avant merge'], en: ['before merge'] },
      securityReport: null,
    }
    const md = buildSkillMarkdown(detail, 'fr')
    expect(md).toContain('name: gateguard')
    expect(md).toContain('## Ce que fait gateguard')
    expect(md).toContain('- filtre')
    expect(md).toContain('## Technologies')
  })

  it('liste les skills d’une stack', () => {
    const stack: Stack = {
      id: 'ts',
      label: 'TypeScript',
      icon: 'code',
      color: '#3178C6',
      brief: { fr: '', en: '' },
      skillIds: ['a', 'b'],
    }
    expect(promptForStack(stack, 'fr')).toContain('a, b')
  })
})

describe('listingPublisher', () => {
  it('fusionne origin vide et Community', () => {
    expect(listingPublisher(null)).toBe(COMMUNITY_PUBLISHER)
    expect(listingPublisher('')).toBe(COMMUNITY_PUBLISHER)
    expect(listingPublisher('Community')).toBe(COMMUNITY_PUBLISHER)
    expect(listingPublisher('Microsoft')).toBe('Microsoft')
    expect(listingPublisher('ECC')).toBe('affaan-m')
    expect(listingPublisher('affaan-m')).toBe('affaan-m')
  })
})

describe('scoreColor / compatDot', () => {
  it('couleur selon le score', () => {
    expect(scoreColor(null)).toBe('var(--text-3)')
    expect(scoreColor(90)).toBe('var(--success)')
    expect(scoreColor(60)).toBe('#E5A53B')
    expect(scoreColor(10)).toContain('danger')
  })

  it('pastille de compat', () => {
    expect(compatDot('Cursor')).toBe('#4F8FF7')
    expect(compatDot('x')).toBe('var(--text-3)')
  })
})
