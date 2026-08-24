import { describe, expect, it } from 'vitest'
import type { Catalog } from './catalog'
import {
  catalogToAdminState,
  emptyForm,
  formFromLoadedSkill,
  formFromSkill,
  formToSkill,
  linesToText,
  newCatRecord,
  newStackRecord,
  textToLines,
} from './admin-state'

const catalog: Catalog = {
  categories: [{ id: 'security', label: { fr: 'Sécurité', en: 'Security' }, color: '#0D9488', icon: 'shield' }],
  stacks: [],
  skills: [
    {
      id: 'gateguard',
      categoryId: 'security',
      icon: 'shield-check',
      score: 88,
      securityRecommendation: 'SAFE',
      scannedAt: null,
      publisher: null,
      tech: ['ts'],
      compat: ['Cursor'],
      stacks: [],
      tag: { fr: 'Garde', en: 'Guard' },
      act: { fr: 'x', en: 'x' },
    },
  ],
  commands: [],
  collections: [],
  compatOrder: ['Cursor'],
}

describe('catalogToAdminState', () => {
  it('projette skills et catégories', () => {
    const { skills, cats } = catalogToAdminState(catalog)
    expect(cats[0]?.id).toBe('security')
    expect(skills[0]).toMatchObject({ id: 'gateguard', cat: 'security', score: 88 })
  })
})

describe('linesToText / textToLines', () => {
  it('est réversible sur des puces', () => {
    const lines = ['alpha', '- beta']
    const text = linesToText(lines)
    expect(text).toBe('- alpha\n- beta')
    expect(textToLines(text)).toEqual(['alpha', 'beta'])
  })
})

describe('formulaire admin', () => {
  it('préremplit depuis un skill', () => {
    const { skills } = catalogToAdminState(catalog)
    const form = formFromSkill(skills[0]!)
    expect(form.descFr).toBe('Garde')
    expect(form.tech).toBe('ts')
  })

  it('préremplit depuis le détail chargé', () => {
    const form = formFromLoadedSkill({
      id: 'gateguard',
      categoryId: 'security',
      icon: 'shield-check',
      tagFr: 'Garde',
      tagEn: 'Guard',
      tech: ['ts'],
      compat: ['Cursor'],
      stackIds: ['ts'],
      doesFr: ['filtre'],
      doesEn: ['filters'],
      triggersFr: ['merge'],
      triggersEn: ['merge'],
      bodyMd: '# body',
    })
    expect(form.doesFr).toBe('- filtre')
    expect(form.bodyMd).toBe('# body')
  })

  it('refuse un formulaire sans id ou description', () => {
    const base = emptyForm([{ id: 'security', fr: 'S', en: 'S', color: '#000', icon: 'x' }])
    expect(formToSkill(base)).toBeNull()
    expect(formToSkill({ ...base, id: 'ok', descFr: '  ' })).toBeNull()
  })

  it('slugifie l’id et recopie l’anglais si vide', () => {
    const base = emptyForm([])
    const skill = formToSkill({ ...base, id: 'Hello World', descFr: 'Bonjour', descEn: '', tech: 'ts, react' })
    expect(skill).toMatchObject({
      id: 'hello-world',
      tag: { fr: 'Bonjour', en: 'Bonjour' },
      tech: ['ts', 'react'],
    })
  })
})

describe('newCatRecord / newStackRecord', () => {
  it('crée un enregistrement slugifié', () => {
    expect(newCatRecord('Qualité', '#fff', 'flask')).toMatchObject({ id: 'qualit', fr: 'Qualité' })
    expect(newStackRecord('TypeScript', '#3178C6', 'code')).toMatchObject({
      id: 'typescript',
      label: 'TypeScript',
    })
  })

  it('refuse un nom vide', () => {
    expect(newCatRecord('  ', '#fff', 'x')).toBeNull()
    expect(newStackRecord('', '#fff', 'x')).toBeNull()
  })
})
