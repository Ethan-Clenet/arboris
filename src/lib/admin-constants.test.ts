import { describe, expect, it } from 'vitest'
import { slugify, userInitials } from './admin-constants'

describe('slugify', () => {
  it('normalise espaces et casse', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
  })

  it('retire les caractères non alphanumériques', () => {
    expect(slugify('React / Next.js!')).toBe('react-next-js')
  })

  it('renvoie vide pour une chaîne sans lettre ni chiffre', () => {
    expect(slugify('---')).toBe('')
    expect(slugify('   ')).toBe('')
  })
})

describe('userInitials', () => {
  it('prend les initiales prénom + nom', () => {
    expect(userInitials('Ada Lovelace')).toBe('AL')
  })

  it('tronque un nom unique à 2 lettres', () => {
    expect(userInitials('Ada')).toBe('AD')
  })

  it('renvoie ? si vide', () => {
    expect(userInitials('   ')).toBe('?')
  })
})
