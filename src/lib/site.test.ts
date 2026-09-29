import { describe, expect, it } from 'vitest'
import { SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl, pageTitle } from './site'

describe('SITE_URL', () => {
  it('pointe vers le domaine de production', () => {
    expect(SITE_URL).toBe('https://arboristhree.xyz')
  })
})

describe('absoluteUrl', () => {
  it('ajoute un slash pour la racine', () => {
    expect(absoluteUrl()).toBe(`${SITE_URL}/`)
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`)
    expect(absoluteUrl('')).toBe(`${SITE_URL}/`)
  })

  it('préfixe un chemin relatif', () => {
    expect(absoluteUrl('skills')).toBe(`${SITE_URL}/skills`)
    expect(absoluteUrl('/skills/foo')).toBe(`${SITE_URL}/skills/foo`)
  })
})

describe('pageTitle', () => {
  it('utilise le tagline sans page', () => {
    expect(pageTitle()).toBe(`${SITE_NAME} — ${SITE_TAGLINE}`)
  })

  it('suffixe Arboris pour une page', () => {
    expect(pageTitle('Skills')).toBe(`Skills — ${SITE_NAME}`)
  })
})
