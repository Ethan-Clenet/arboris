import { describe, expect, it } from 'vitest'
import {
  isHashedVendorSkillId,
  isIndexableSkill,
  isPremiumPublisher,
  SEO_INDEX_MIN_SCORE,
  seoHead,
} from './seo'

describe('isHashedVendorSkillId', () => {
  it('détecte le suffixe d’import vendor', () => {
    expect(
      isHashedVendorSkillId(
        'commit__microsoft-vscode__src-vs-sessions-skills-990e11dbaf91',
      ),
    ).toBe(true)
  })

  it('laisse passer un id catalogue', () => {
    expect(isHashedVendorSkillId('fastapi-patterns')).toBe(false)
  })
})

describe('isPremiumPublisher', () => {
  it('accepte origin vide (first-party)', () => {
    expect(isPremiumPublisher(null)).toBe(true)
    expect(isPremiumPublisher('')).toBe(true)
  })

  it('accepte les éditeurs premium', () => {
    expect(isPremiumPublisher('Vercel')).toBe(true)
    expect(isPremiumPublisher('ECC')).toBe(true)
    expect(isPremiumPublisher('Microsoft')).toBe(true)
  })

  it('refuse Community', () => {
    expect(isPremiumPublisher('Community')).toBe(false)
  })
})

describe('isIndexableSkill', () => {
  it('indexe une fiche propre, sûre, premium', () => {
    expect(
      isIndexableSkill({ id: 'fastapi-patterns', score: SEO_INDEX_MIN_SCORE, publisher: 'ECC' }),
    ).toBe(true)
  })

  it('noindex si score trop bas ou absent', () => {
    expect(isIndexableSkill({ id: 'fastapi-patterns', score: 69, publisher: 'ECC' })).toBe(false)
    expect(isIndexableSkill({ id: 'fastapi-patterns', score: null, publisher: 'ECC' })).toBe(false)
  })

  it('noindex Community même avec un bon score', () => {
    expect(isIndexableSkill({ id: 'react-patterns', score: 90, publisher: 'Community' })).toBe(false)
  })

  it('noindex les ids hashés Microsoft même SAFE', () => {
    expect(
      isIndexableSkill({
        id: 'commit__microsoft-vscode__src-vs-sessions-skills-990e11dbaf91',
        score: 100,
        publisher: 'Microsoft',
      }),
    ).toBe(false)
  })
})

describe('seoHead noIndex', () => {
  it('émet noindex, follow sans canonical', () => {
    const head = seoHead({ title: 'Skill', path: '/skills/x', noIndex: true })
    expect(head.meta).toEqual(
      expect.arrayContaining([
        { name: 'robots', content: 'noindex, follow' },
        { name: 'googlebot', content: 'noindex, follow' },
      ]),
    )
    expect(head.links).toEqual([])
  })
})
