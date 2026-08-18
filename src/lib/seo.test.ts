import { describe, expect, it } from 'vitest'
import {
  breadcrumbJsonLd,
  collectionSeoTitle,
  commandSeoTitle,
  entityDescription,
  rootFallbackMeta,
  seoHead,
  skillSeoTitle,
} from './seo'
import { SITE_NAME, SITE_URL } from './site'

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

  it('retire canonical et noindex les pages privées', () => {
    const head = seoHead({ path: '/auth', noIndex: true })
    expect(head.links).toEqual([])
    expect(head.meta.some((m) => m.name === 'robots' && m.content === 'noindex')).toBe(true)
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
