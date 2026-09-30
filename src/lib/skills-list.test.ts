import { describe, expect, it } from 'vitest'
import type { Category, SkillSummary } from './catalog'
import {
  SKILLS_PAGE_SIZE,
  computeSkillFacets,
  filterAndSortSkills,
  paginateSkills,
  parseSkillsSearch,
  skillsListPath,
  toSkillListItem,
} from './skills-list'

const category = (id: string, label = id): Category => ({
  id,
  label: { fr: label, en: label },
  color: '#0D9488',
  icon: 'shield',
})

const skill = (over: Partial<SkillSummary> & { id: string }): SkillSummary => ({
  categoryId: 'security',
  icon: 'shield-check',
  score: 90,
  securityRecommendation: 'SAFE',
  scannedAt: null,
  publisher: 'Arboris',
  tech: ['ts'],
  compat: ['Cursor'],
  stacks: ['ts'],
  tag: { fr: 'Garde', en: 'Guard' },
  act: { fr: 'filtre', en: 'filters' },
  ...over,
})

describe('parseSkillsSearch', () => {
  it('omet les valeurs par défaut', () => {
    expect(parseSkillsSearch({ page: '1', cat: 'all', q: '  ' })).toEqual({})
  })

  it('conserve filtres et page > 1', () => {
    expect(
      parseSkillsSearch({
        page: '2',
        q: ' react ',
        cat: 'frontend',
        publisher: 'Vercel',
        security: 'SAFE',
        compat: 'Cursor,Claude',
      }),
    ).toEqual({
      page: 2,
      q: 'react',
      cat: 'frontend',
      publisher: 'Vercel',
      security: 'SAFE',
      compat: 'Cursor,Claude',
    })
  })
})

describe('skillsListPath', () => {
  it('produit une URL crawlable sans page=1', () => {
    expect(skillsListPath({})).toBe('/skills')
    expect(skillsListPath({ page: 1 })).toBe('/skills')
    expect(skillsListPath({ page: 2, cat: 'frontend' })).toBe('/skills?cat=frontend&page=2')
  })
})

describe('filterAndSortSkills / paginateSkills', () => {
  const skills = [
    skill({ id: 'b-skill', score: 80, publisher: 'Community', categoryId: 'frontend', tag: { fr: 'UI', en: 'UI' } }),
    skill({ id: 'a-skill', score: 95, publisher: 'Vercel', compat: ['Claude', 'Cursor'] }),
    skill({
      id: 'c-skill',
      score: 40,
      securityRecommendation: 'UNSAFE',
      publisher: 'Microsoft',
      tech: ['python'],
    }),
  ]
  const categories = [category('security'), category('frontend', 'Front')]

  it('filtre et trie par score puis id', () => {
    const all = filterAndSortSkills(skills, categories, {})
    expect(all.map((s) => s.id)).toEqual(['a-skill', 'b-skill', 'c-skill'])
    expect(filterAndSortSkills(skills, categories, { cat: 'frontend' }).map((s) => s.id)).toEqual(['b-skill'])
    expect(filterAndSortSkills(skills, categories, { publisher: 'Community' }).map((s) => s.id)).toEqual([
      'b-skill',
    ])
    expect(filterAndSortSkills(skills, categories, { security: 'UNSAFE' }).map((s) => s.id)).toEqual(['c-skill'])
    expect(filterAndSortSkills(skills, categories, { compat: 'Claude' }).map((s) => s.id)).toEqual(['a-skill'])
    expect(filterAndSortSkills(skills, categories, { q: 'python' }).map((s) => s.id)).toEqual(['c-skill'])
  })

  it('paginate à 40 et borne la page', () => {
    const many = Array.from({ length: 45 }, (_, i) => skill({ id: `s-${String(i).padStart(3, '0')}`, score: 50 }))
    const page1 = paginateSkills(many, 1)
    expect(page1.page).toBe(1)
    expect(page1.pageCount).toBe(2)
    expect(page1.slice).toHaveLength(SKILLS_PAGE_SIZE)
    const page2 = paginateSkills(many, 99)
    expect(page2.page).toBe(2)
    expect(page2.slice).toHaveLength(5)
  })
})

describe('computeSkillFacets / toSkillListItem', () => {
  it('agrège sans sérialiser le Markdown', () => {
    const skills = [
      skill({ id: 'a', publisher: 'ECC', categoryId: 'security' }),
      skill({ id: 'b', publisher: null, categoryId: 'frontend', securityRecommendation: null }),
    ]
    const facets = computeSkillFacets(skills)
    expect(facets.total).toBe(2)
    expect(facets.byCategory.security).toBe(1)
    expect(facets.byPublisher.find((p) => p.id === 'affaan-m')?.count).toBe(1)
    expect(facets.byPublisher.find((p) => p.id === 'Community')?.count).toBe(1)
    expect(facets.bySecurity.UNKNOWN).toBe(1)
    const item = toSkillListItem(skills[0])
    expect(item).not.toHaveProperty('act')
    expect(item).not.toHaveProperty('tech')
    expect(item).not.toHaveProperty('stacks')
  })
})
