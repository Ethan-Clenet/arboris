import { describe, expect, it } from 'vitest'
import {
  CATALOG_EXPLICIT_REMOVALS,
  CATALOG_PRUNE_MIN_SOURCE,
  planCatalogPrune,
  planExplicitRemovals,
} from './catalog-prune'

function ids(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}-${String(i).padStart(4, '0')}`)
}

describe('planCatalogPrune', () => {
  it('ne supprime rien si la source est vide (évite de vider le catalogue)', () => {
    const plan = planCatalogPrune([], ['cypress-author', 'sandbox-sdk'])
    expect(plan).toMatchObject({
      action: 'skip',
      reason: 'empty-source',
      sourceCount: 0,
      orphanCount: 2,
    })
  })

  it('refuse de pruner si trop peu de skills source (chargement partiel)', () => {
    const source = ids('src', CATALOG_PRUNE_MIN_SOURCE - 1)
    const plan = planCatalogPrune(source, [...source, 'orphan-a'])
    expect(plan).toMatchObject({
      action: 'skip',
      reason: 'source-too-small',
      sourceCount: CATALOG_PRUNE_MIN_SOURCE - 1,
      orphanCount: 1,
    })
  })

  it('refuse si la source a perdu plus de 30 % des ids en base', () => {
    const source = ids('src', CATALOG_PRUNE_MIN_SOURCE)
    const orphans = ids('gone', CATALOG_PRUNE_MIN_SOURCE)
    const plan = planCatalogPrune(source, [...source, ...orphans])
    expect(plan).toMatchObject({
      action: 'skip',
      reason: 'too-many-orphans',
      orphanCount: CATALOG_PRUNE_MIN_SOURCE,
    })
  })

  it('supprime un volume d’orphelins historiques si la source reste majoritaire', () => {
    const source = ids('src', 2000)
    const orphans = ids('gone', 80)
    const plan = planCatalogPrune(source, [...source, ...orphans])
    expect(plan).toEqual({
      action: 'delete',
      sourceCount: 2000,
      ids: orphans,
    })
  })

  it('supprime les retraits validés quand la source est saine', () => {
    const source = ids('src', CATALOG_PRUNE_MIN_SOURCE)
    const orphans = [...CATALOG_EXPLICIT_REMOVALS]
    const plan = planCatalogPrune(source, [...source, ...orphans])
    expect(plan).toEqual({
      action: 'delete',
      sourceCount: CATALOG_PRUNE_MIN_SOURCE,
      ids: [...orphans].sort((a, b) => a.localeCompare(b)),
    })
  })

  it('ne fait rien s’il n’y a pas d’orphelin', () => {
    const source = ids('src', CATALOG_PRUNE_MIN_SOURCE)
    expect(planCatalogPrune(source, source)).toEqual({
      action: 'none',
      sourceCount: CATALOG_PRUNE_MIN_SOURCE,
    })
  })
})

describe('planExplicitRemovals', () => {
  it('ne cible que les ids encore en base et absents de la source', () => {
    const source = ['firebase-basics', 'cypress-author']
    const db = ['firebase-basics', 'cypress-author', 'sandbox-sdk', 'motion-ui', 'other']
    expect(planExplicitRemovals(source, db)).toEqual(['motion-ui', 'sandbox-sdk'])
  })

  it('ne retire rien si la liste explicite n’est plus en base', () => {
    expect(planExplicitRemovals(['a'], ['a', 'b'])).toEqual([])
  })

  it('inclut les retraits Neon indexés de la veille 09/11', () => {
    expect(CATALOG_EXPLICIT_REMOVALS).toEqual(
      expect.arrayContaining(['neon-postgres-branches', 'neon-postgres-egress-optimizer']),
    )
  })
})
