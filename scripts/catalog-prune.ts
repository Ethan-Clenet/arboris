/**
 * Plan de suppression des skills orphelins (présents en base, absents du disque).
 * Garde-fous : ne jamais vider le catalogue si la source est vide, trop petite,
 * ou si elle a perdu plus de 30 % des ids déjà en base (chargement partiel).
 * Les retraits validés sont toujours appliqués dès que la source est saine.
 */

export const CATALOG_PRUNE_MIN_SOURCE = 500
/** La source doit représenter au moins 70 % de la base, sinon on refuse le prune global. */
export const CATALOG_PRUNE_MIN_SOURCE_RATIO = 0.7

/**
 * Ids retirés du disque (veille 10/10 + orphelins #65 + veille 19/10 + veille 26/10) —
 * toujours supprimés s’ils restent en base et absents de la source, même si
 * le prune global est ignoré.
 */
export const CATALOG_EXPLICIT_REMOVALS = [
  'audit-claude-settings__vinta-hal-9000__skills-f0ce6934a890',
  'author-auth0-skill',
  'cypress-author',
  'cypress-docs',
  'cypress-explain',
  'gemini-interactions-api',
  'get-search-view-results__microsoft-vscode__extensions-copilot-assets-prompts-skills-b03785026979',
  'install-vscode-extension__microsoft-vscode__extensions-copilot-assets-prompts-skills-2e7104cc5ce9',
  'ito-basket-compare',
  'ito-data-atlas-agent',
  'ito-market-intelligence',
  'ito-trade-planner',
  'motion-ui',
  'openclaw-migration__nousresearch-hermes-agent__optional-skills-migration-fe317e719177',
  'refactor-claude-md__vinta-hal-9000__skills-02c1d0c985be',
  'sandbox-sdk',
  'stories__storybookjs-storybook__code-lib-claude-plugin-skills-37800384acf4',
  'stories__storybookjs-storybook__code-lib-codex-plugin-plugins-storybook-skills-0d4224554f40',
  'update-playbooks__vinta-hal-9000__claude-skills-5cff35ed98e7',
] as const

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

export function planExplicitRemovals(
  sourceIds: readonly string[],
  dbIds: readonly string[],
): string[] {
  const source = new Set(sourceIds)
  const db = new Set(dbIds)
  return CATALOG_EXPLICIT_REMOVALS.filter((id) => db.has(id) && !source.has(id))
}

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

  const coverage = source.size / Math.max(dbIds.length, 1)
  if (coverage < CATALOG_PRUNE_MIN_SOURCE_RATIO) {
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
