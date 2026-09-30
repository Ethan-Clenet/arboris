import { describe, expect, it } from 'vitest'
import { SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl, pageTitle, EDITOR_NAME, CONTACT_EMAIL, LEGAL_UPDATED, LEGAL_ROUTES, formatLegalDate } from './site'

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

describe('constantes légales', () => {
  it('identifie l’éditeur et la date de mise à jour', () => {
    expect(EDITOR_NAME).toBe('Ethan Clenet')
    expect(CONTACT_EMAIL).toBe('ethan.clenet@outlook.fr')
    expect(LEGAL_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(LEGAL_ROUTES.map((r) => r.path)).toEqual(['/mentions-legales', '/confidentialite'])
  })

  it('formate la date légale en français', () => {
    expect(formatLegalDate('2026-09-30')).toBe('30 septembre 2026')
  })
})
