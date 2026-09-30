import { describe, expect, it } from 'vitest'
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  collectionSeoTitle,
  commandJsonLd,
  commandSeoTitle,
  entityDescription,
  frenchEntityDescription,
  isHashedVendorSkillId,
  isIndexableSkill,
  isPremiumPublisher,
  jsonLdAuthor,
  looksEnglish,
  SITEMAP_INCLUDE_SKILL_PAGES,
  rootFallbackMeta,
  SEO_INDEX_MIN_SCORE,
  seoHead,
  siteJsonLd,
  skillJsonLd,
  skillSeoTitle,
  webPageJsonLd,
  notFoundSeo,
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
    expect(isPremiumPublisher('FastAPI')).toBe(true)
    expect(isPremiumPublisher('Supabase')).toBe(true)
    expect(isPremiumPublisher('PyTorch')).toBe(true)
    expect(isPremiumPublisher('.NET')).toBe(true)
    expect(isPremiumPublisher('Storybook')).toBe(true)
    expect(isPremiumPublisher('Alibaba')).toBe(true)
    expect(isPremiumPublisher('Ansible')).toBe(true)
    expect(isPremiumPublisher('Prisma')).toBe(true)
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

describe('SITEMAP_INCLUDE_SKILL_PAGES', () => {
  it('inclut les fiches skills indexables dans le sitemap', () => {
    expect(SITEMAP_INCLUDE_SKILL_PAGES).toBe(true)
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
    expect(title.includes('…')).toBe(false)
    expect(title.endsWith('...')).toBe(false)
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
    const head = seoHead({ path: '/internal', noIndex: true })
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

  it('n’émet pas og:locale:alternate (pas d’URL EN dédiée)', () => {
    const head = seoHead({ path: '/' })
    expect(head.meta.some((m) => m.property === 'og:locale:alternate')).toBe(false)
    expect(head.meta.some((m) => m.property === 'og:locale' && m.content === 'fr_FR')).toBe(true)
  })

  it('ajoute prev/next et conserve la query dans le canonical', () => {
    const head = seoHead({
      path: '/skills?page=2',
      extraLinks: [{ rel: 'prev', href: `${SITE_URL}/skills` }],
    })
    expect(head.links).toEqual(
      expect.arrayContaining([
        { rel: 'canonical', href: `${SITE_URL}/skills?page=2` },
        { rel: 'prev', href: `${SITE_URL}/skills` },
      ]),
    )
  })

  it('injecte le JSON-LD supplémentaire sur une page indexable', () => {
    const head = seoHead({
      path: '/skills/fastapi-patterns',
      jsonLd: { '@type': 'SoftwareSourceCode', name: 'fastapi-patterns' },
    })
    expect(head.scripts?.some((s) => s.children.includes('SoftwareSourceCode'))).toBe(true)
  })

  it('indexe une page légale avec canonical et JSON-LD WebPage', () => {
    const head = seoHead({
      title: 'Mentions légales du site',
      path: '/mentions-legales',
      jsonLd: webPageJsonLd({
        path: '/mentions-legales',
        name: 'Mentions légales',
        description: 'Éditeur et hébergeur.',
        dateModified: '2026-09-30',
      }),
    })
    expect(head.links).toEqual([{ rel: 'canonical', href: `${SITE_URL}/mentions-legales` }])
    expect(head.meta.some((m) => m.name === 'robots' && m.content?.startsWith('index'))).toBe(true)
    expect(head.scripts?.some((s) => s.children.includes('"WebPage"') && s.children.includes('2026-09-30'))).toBe(
      true,
    )
  })

  it('ignore le JSON-LD supplémentaire si noIndex', () => {
    const head = seoHead({
      path: '/skills/x',
      noIndex: true,
      jsonLd: { '@type': 'SoftwareSourceCode', name: 'x' },
    })
    expect(head.scripts).toBeUndefined()
  })

  it('donne un titre et une description 404 distincts de l’accueil', () => {
    const head = notFoundSeo()
    expect(head.meta.some((m) => m.title === `Page introuvable — ${SITE_NAME}`)).toBe(true)
    expect(head.meta.some((m) => m.name === 'description' && m.content?.includes('n’existe pas'))).toBe(
      true,
    )
    expect(head.meta.some((m) => m.name === 'robots' && m.content === 'noindex, follow')).toBe(true)
    expect(head.links).toEqual([])
  })
})

describe('siteJsonLd', () => {
  it('aligne les URLs SoftwareApplication sur le canonical (slash final)', () => {
    const graph = siteJsonLd()
    const app = graph['@graph'].find((node) => node['@type'] === 'SoftwareApplication')
    expect(app?.url).toBe(`${SITE_URL}/`)
  })

  it('déclare uniquement le français (pas de version EN)', () => {
    const website = siteJsonLd()['@graph'].find((node) => node['@type'] === 'WebSite')
    expect(website?.inLanguage).toBe('fr')
  })
})

describe('skillJsonLd', () => {
  it('décrit une fiche skill en SoftwareSourceCode, toujours inLanguage fr', () => {
    const json = skillJsonLd({
      id: 'fastapi-patterns',
      label: 'FastAPI Patterns',
      description: 'FastAPI best practices covering project structure.',
      publisher: 'FastAPI',
      codeRepository: 'https://github.com/fastapi/fastapi',
    })
    expect(json).toMatchObject({
      '@type': 'SoftwareSourceCode',
      name: 'FastAPI Patterns',
      url: `${SITE_URL}/skills/fastapi-patterns`,
      author: { '@type': 'Organization', name: 'FastAPI' },
      inLanguage: 'fr',
      codeRepository: 'https://github.com/fastapi/fastapi',
    })
  })
})

describe('frenchEntityDescription', () => {
  it('garde un résumé français', () => {
    const desc = frenchEntityDescription('Garde les merges dangereux.', 'skill', 'Gate Guard')
    expect(desc).toContain('Garde les merges dangereux.')
  })

  it('remplace un résumé anglais par un texte FR basé sur le titre', () => {
    const desc = frenchEntityDescription(
      'FastAPI best practices covering project structure',
      'skill',
      'FastAPI Patterns',
    )
    expect(desc).toContain('FastAPI Patterns')
    expect(desc.toLowerCase()).not.toContain('best practices covering')
    expect(desc).not.toContain('…')
  })
})

describe('commandJsonLd / collectionJsonLd', () => {
  it('décrit une commande en SoftwareSourceCode', () => {
    const json = commandJsonLd({ id: 'adr', description: 'Rédige une ADR.' })
    expect(json).toMatchObject({
      '@type': 'SoftwareSourceCode',
      name: '/adr',
      url: `${SITE_URL}/commands/adr`,
      isAccessibleForFree: true,
      inLanguage: 'fr',
      author: { '@type': 'Organization', name: SITE_NAME },
    })
  })

  it('décrit une collection en CollectionPage + ItemList', () => {
    const json = collectionJsonLd({
      id: 'sonar',
      name: 'Sonar',
      description: 'Pack de garde.',
      skillIds: ['gateguard'],
      commandIds: ['sonar'],
    })
    expect(json['@type']).toBe('CollectionPage')
    const main = json.mainEntity as { '@type': string; itemListElement: Array<{ url: string }> }
    expect(main['@type']).toBe('ItemList')
    expect(main.itemListElement).toHaveLength(2)
    expect(main.itemListElement[0]?.url).toBe(`${SITE_URL}/skills/gateguard`)
  })
})

describe('jsonLdAuthor / looksEnglish', () => {
  it('mappe affaan-m en Person GitHub', () => {
    expect(jsonLdAuthor('affaan-m')).toEqual({
      '@type': 'Person',
      name: 'affaan-m',
      url: 'https://github.com/affaan-m',
    })
    expect(jsonLdAuthor('FastAPI')).toEqual({ '@type': 'Organization', name: 'FastAPI' })
  })

  it('détecte un résumé anglais', () => {
    expect(looksEnglish('FastAPI best practices covering project structure')).toBe(true)
    expect(looksEnglish('Garde les merges dangereux avant la revue.')).toBe(false)
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

describe('webPageJsonLd', () => {
  it('émet une WebPage indexable avec dateModified', () => {
    const json = webPageJsonLd({
      path: '/mentions-legales',
      name: 'Mentions légales',
      description: 'Éditeur et hébergeur.',
      dateModified: '2026-09-30',
    })
    expect(json).toMatchObject({
      '@type': 'WebPage',
      url: `${SITE_URL}/mentions-legales`,
      dateModified: '2026-09-30',
      inLanguage: 'fr',
    })
  })
})

describe('rootFallbackMeta', () => {
  it('expose titre et description du site', () => {
    const meta = rootFallbackMeta()
    expect(meta.some((m) => 'title' in m)).toBe(true)
    expect(meta.some((m) => m.name === 'description')).toBe(true)
  })
})
