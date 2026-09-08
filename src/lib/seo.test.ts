import { describe, expect, it } from 'vitest'
import {
  breadcrumbJsonLd,
  collectionSeoTitle,
  commandSeoTitle,
  entityDescription,
  isHashedVendorSkillId,
  isIndexableSkill,
  isPremiumPublisher,
  rootFallbackMeta,
  SEO_INDEX_MIN_SCORE,
  seoHead,
  skillSeoTitle,
} from './seo'
import { SITE_NAME, SITE_URL } from './site'

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
    expect(isPremiumPublisher('affaan-m')).toBe(true)
    expect(isPremiumPublisher('ECC')).toBe(true)
    expect(isPremiumPublisher('Microsoft')).toBe(true)
    expect(isPremiumPublisher('Arboris')).toBe(true)
    expect(isPremiumPublisher('Hugging Face')).toBe(true)
    expect(isPremiumPublisher('Ollama')).toBe(true)
    expect(isPremiumPublisher('Nous Research')).toBe(true)
    expect(isPremiumPublisher('vinta')).toBe(true)
    expect(isPremiumPublisher('Context7')).toBe(true)
  })

  it('refuse Community', () => {
    expect(isPremiumPublisher('Community')).toBe(false)
  })
})

describe('isIndexableSkill', () => {
  it('indexe une fiche propre, sûre, premium', () => {
    expect(
      isIndexableSkill({ id: 'fastapi-patterns', score: SEO_INDEX_MIN_SCORE, publisher: 'affaan-m' }),
    ).toBe(true)
  })

  it('noindex si score trop bas ou absent', () => {
    expect(isIndexableSkill({ id: 'fastapi-patterns', score: 69, publisher: 'affaan-m' })).toBe(false)
    expect(isIndexableSkill({ id: 'fastapi-patterns', score: null, publisher: 'affaan-m' })).toBe(false)
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

describe('skillSeoTitle', () => {
  it('garde le titre long pour un id court', () => {
    expect(skillSeoTitle('sonar')).toBe('sonar · Skill IA pour agents')
  })

  it('raccourcit un id trop long', () => {
    const id = 'a'.repeat(80)
    const title = skillSeoTitle(id)
    expect(title.length).toBeLessThanOrEqual(45)
    expect(title.endsWith('…')).toBe(true)
  })
})

describe('commandSeoTitle', () => {
  it('préfixe le slash', () => {
    expect(commandSeoTitle('commit')).toMatch(/^\/commit/)
  })
})

describe('collectionSeoTitle', () => {
  it('reste dans le budget caractère', () => {
    const title = collectionSeoTitle('Sonar')
    expect(title.length).toBeGreaterThanOrEqual(22)
    expect(title.length).toBeLessThanOrEqual(45)
    expect(title).toContain('Sonar')
  })
})

describe('entityDescription', () => {
  it('produit un fallback si le résumé est vide', () => {
    const desc = entityDescription('  ', 'skill', 'gateguard')
    expect(desc.toLowerCase()).toContain('gateguard')
    expect(desc).toContain('Arboris')
  })

  it('conserve le résumé et ajoute le label si l’id est absent', () => {
    const desc = entityDescription('Garde les merges dangereux.', 'skill', 'gateguard')
    expect(desc).toContain('Garde les merges dangereux.')
    expect(desc).toContain('gateguard')
  })
})

describe('seoHead', () => {
  it('pose canonical et robots index sur une page publique', () => {
    const head = seoHead({ title: 'Skills', path: '/skills', description: 'Liste des skills Arboris pour agents IA.' })
    expect(head.links).toEqual([{ rel: 'canonical', href: `${SITE_URL}/skills` }])
    expect(head.meta.some((m) => m.name === 'robots' && m.content?.startsWith('index'))).toBe(true)
    expect(head.meta.some((m) => m.title === `Skills — ${SITE_NAME}`)).toBe(true)
  })

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

  it('retire canonical et noindex les pages privées', () => {
    const head = seoHead({ path: '/auth', noIndex: true })
    expect(head.links).toEqual([])
    expect(head.meta.some((m) => m.name === 'robots' && m.content === 'noindex, follow')).toBe(true)
    expect(head.scripts).toBeUndefined()
  })

  it('ajoute le JSON-LD fil d’Ariane à partir de 2 items', () => {
    const head = seoHead({
      path: '/skills/sonar',
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Skills', path: '/skills' },
      ],
    })
    expect(head.scripts?.some((s) => s.children.includes('BreadcrumbList'))).toBe(true)
  })
})

describe('breadcrumbJsonLd', () => {
  it('numérote les positions et absolutise les URLs', () => {
    const json = breadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      { name: 'Skills', path: '/skills' },
    ])
    expect(json.itemListElement).toHaveLength(2)
    expect(json.itemListElement[0]).toMatchObject({ position: 1, item: `${SITE_URL}/` })
  })
})

describe('rootFallbackMeta', () => {
  it('expose titre et description du site', () => {
    const meta = rootFallbackMeta()
    expect(meta.some((m) => 'title' in m)).toBe(true)
    expect(meta.some((m) => m.name === 'description')).toBe(true)
  })
})
