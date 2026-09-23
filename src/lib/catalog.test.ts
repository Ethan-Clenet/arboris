import { describe, expect, it } from 'vitest'
import type { SkillDetail, SkillSummary, Stack } from './catalog'
import {
  buildSkillMarkdown,
  categoryIdsInGroup,
  collectionTheme,
  isPremiumCollection,
  COLLECTION_THEME_ORDER,
  compatDot,
  hexToRgba,
  packIdsForStartPath,
  promptFor,
  promptForStack,
  scoreColor,
  listingPublisher,
  COMMUNITY_PUBLISHER,
  skillLabel,
  uniqueSkillTitles,
  skillMatchesStack,
  skillsForStackAndCategory,
  stackSupportsCategory,
  TECH_STARTER_PACK_IDS,
} from './catalog'
import { COLLECTIONS } from './collections-data'

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

describe('uniqueSkillTitles (vendor)', () => {
  it('simplifie un id vendor Microsoft sans hash ni chemin', () => {
    const id =
      'abandonment-analysis__microsoft-aibast-agents-library__solutions-cart-abandonment-recovery-manual-skills-8c2a6bf4f120'
    const titles = uniqueSkillTitles([{ id, publisher: 'Microsoft' }])
    expect(titles.get(id)).toBe('abandonment analysis microsoft aibast agents library')
    expect(skillLabel({ id, title: titles.get(id) })).toBe(
      'abandonment analysis microsoft aibast agents library',
    )
  })

  it('simplifie un id vendor Hugging Face', () => {
    const id = 'agent-eval__huggingface-skills__skills-eval-b3d4f9a1c2e5'
    const titles = uniqueSkillTitles([{ id, publisher: 'Hugging Face' }])
    expect(titles.get(id)).toBe('agent eval huggingface skills')
  })

  it('simplifie un id vendor Nous Research (hash après tiret)', () => {
    const id =
      '1password__nousresearch-hermes-agent__optional-skills-security-8c6b9c4182d0'
    const titles = uniqueSkillTitles([{ id, publisher: 'Nous Research' }])
    expect(titles.get(id)).toBe('1password nousresearch hermes agent')
  })

  it('simplifie un id vendor dont le hash est le dernier segment (sans tiret)', () => {
    const id = 'skill__nousresearch-pokemon-agent__9c53c074d7ac'
    const titles = uniqueSkillTitles([{ id, publisher: 'Nous Research' }])
    expect(titles.get(id)).toBe('skill nousresearch pokemon agent')
  })

  it('simplifie un id vendor upstash/context7', () => {
    const id = 'context7-mcp__upstash-context7__skills-4bd9b07b8b1f'
    const titles = uniqueSkillTitles([{ id, publisher: 'Context7' }])
    expect(titles.get(id)).toBe('context7 mcp upstash context7')
  })

  it('laisse inchangé un id first-party (sans __ ni hash)', () => {
    const id = 'codebase-onboarding'
    const titles = uniqueSkillTitles([{ id, publisher: 'Arboris' }])
    expect(titles.get(id)).toBe(id)
  })

  it('désambiguïse les doublons via le chemin, sans le hash', () => {
    const a =
      'revenue-impact__microsoft-aibast-agents-library__solutions-win-loss-analysis-manual-skills-2e4bfc90bbff'
    const b =
      'revenue-impact__microsoft-aibast-agents-library__solutions-cross-selling-manual-skills-eb37b8239969'
    const titles = uniqueSkillTitles([
      { id: a, publisher: 'Microsoft' },
      { id: b, publisher: 'Microsoft' },
    ])
    expect(titles.get(a)).toBe('revenue impact microsoft aibast agents library win loss analysis')
    expect(titles.get(b)).toBe('revenue impact microsoft aibast agents library cross selling')
    expect(titles.get(a)).not.toBe(titles.get(b))
    expect(new Set(titles.values()).size).toBe(2)
  })
})

describe('collectionTheme', () => {
  it('classe les collections connues', () => {
    expect(collectionTheme({ id: 'react-ts-starter' })).toBe('frontend')
    expect(collectionTheme({ id: 'node-api-starter' })).toBe('backend')
    expect(collectionTheme({ id: 'prisma-postgres-starter' })).toBe('data')
    expect(collectionTheme({ id: 'docker-ops-starter' })).toBe('ops')
    expect(collectionTheme({ id: 'ship-safely' })).toBe('security')
  })

  it('renvoie null pour un id inconnu', () => {
    expect(collectionTheme({ id: 'unknown-collection' })).toBeNull()
  })

  it('classe toutes les collections du seed (map synchronisée)', () => {
    for (const c of COLLECTIONS) {
      const theme = collectionTheme(c)
      expect(theme, `collection ${c.id} sans thème`).not.toBeNull()
      expect(COLLECTION_THEME_ORDER).toContain(theme)
    }
  })
})

describe('isPremiumCollection', () => {
  it('marque yunt-docker comme premium', () => {
    expect(isPremiumCollection('yunt-docker')).toBe(true)
    expect(isPremiumCollection({ id: 'yunt-docker' })).toBe(true)
  })

  it('laisse les autres collections hors premium', () => {
    expect(isPremiumCollection('docker-ops-starter')).toBe(false)
    expect(isPremiumCollection({ id: 'sonar' })).toBe(false)
  })
})
