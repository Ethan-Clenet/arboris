/**
 * Plan de suppression des skills orphelins (présents en base, absents du disque).
 * Garde-fous : ne jamais vider le catalogue si la source est vide, trop petite,
 * ou si le volume d’orphelins ressemble à une erreur de chargement.
 */

export const CATALOG_PRUNE_MIN_SOURCE = 500
export const CATALOG_PRUNE_MAX_ABS = 50
export const CATALOG_PRUNE_MAX_RATIO = 0.05

export type CatalogPruneSkipReason = 'empty-source' | 'source-too-small' | 'too-many-orphans'

export type CatalogPrunePlan =
  | { action: 'delete'; ids: string[]; sourceCount: number }
  | {
      action: 'skip'
      reason: CatalogPruneSkipReason
      sourceCount: number
      orphanCount: number
      orphanSample: string[]
    }
  | { action: 'none'; sourceCount: number }

export function planCatalogPrune(
  sourceIds: readonly string[],
  dbIds: readonly string[],
): CatalogPrunePlan {
  const source = new Set(sourceIds)
  const orphans = [...new Set(dbIds.filter((id) => !source.has(id)))].sort((a, b) =>
    a.localeCompare(b),
  )

  if (source.size === 0) {
    return {
      action: 'skip',
      reason: 'empty-source',
      sourceCount: 0,
      orphanCount: orphans.length,
      orphanSample: orphans.slice(0, 20),
    }
  }

  if (source.size < CATALOG_PRUNE_MIN_SOURCE) {
    return {
      action: 'skip',
      reason: 'source-too-small',
      sourceCount: source.size,
      orphanCount: orphans.length,
      orphanSample: orphans.slice(0, 20),
    }
  }

  if (orphans.length === 0) {
    return { action: 'none', sourceCount: source.size }
  }

  const ratio = orphans.length / Math.max(dbIds.length, 1)
  if (orphans.length > CATALOG_PRUNE_MAX_ABS || ratio > CATALOG_PRUNE_MAX_RATIO) {
    return {
      action: 'skip',
      reason: 'too-many-orphans',
      sourceCount: source.size,
      orphanCount: orphans.length,
      orphanSample: orphans.slice(0, 20),
    }
  }

  return { action: 'delete', ids: orphans, sourceCount: source.size }
}
