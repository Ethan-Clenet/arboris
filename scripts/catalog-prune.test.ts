import { describe, expect, it } from 'vitest'
import {
  CATALOG_PRUNE_MAX_ABS,
  CATALOG_PRUNE_MIN_SOURCE,
  planCatalogPrune,
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

  it('refuse si le volume d’orphelins dépasse le plafond (erreur source)', () => {
    const source = ids('src', CATALOG_PRUNE_MIN_SOURCE)
    const orphans = ids('gone', CATALOG_PRUNE_MAX_ABS + 1)
    const plan = planCatalogPrune(source, [...source, ...orphans])
    expect(plan).toMatchObject({
      action: 'skip',
      reason: 'too-many-orphans',
      orphanCount: CATALOG_PRUNE_MAX_ABS + 1,
    })
  })

  it('supprime les orphelins ciblés quand la source est saine', () => {
    const source = ids('src', CATALOG_PRUNE_MIN_SOURCE)
    const orphans = [
      'author-auth0-skill',
      'cypress-author',
      'cypress-docs',
      'cypress-explain',
      'gemini-interactions-api',
      'ito-basket-compare',
      'ito-data-atlas-agent',
      'ito-market-intelligence',
      'ito-trade-planner',
      'motion-ui',
      'sandbox-sdk',
    ]
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
