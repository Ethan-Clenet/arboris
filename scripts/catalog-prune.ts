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
 * Ids retirés du disque (veille 10/10 + orphelins #65 + veille 19/10 + veille 26/10 + veille 02/11 + veille 09/11) —
 * toujours supprimés s’ils restent en base et absents de la source, même si
 * le prune global est ignoré.
 */
export const CATALOG_EXPLICIT_REMOVALS = [
  'audiocraft-audio-generation__nousresearch-hermes-agent__optional-skills-creative-3347ca0db653',
  'audit-claude-settings__vinta-hal-9000__skills-f0ce6934a890',
  'author-auth0-skill',
  'clip__nousresearch-hermes-agent__optional-skills-mlops-a0801d3ca750',
  'cute-verify__pytorch-helion__claude-skills-5b17ace4dee2',
  'cypress-author',
  'cypress-docs',
  'cypress-explain',
  'docx__nousresearch-hermes-agent__skills-productivity-3ec8983f58df',
  'duckduckgo-search__nousresearch-hermes-agent__optional-skills-research-d44408f49308',
  'frontend-overlay__ansible-ansible-ui__claude-skills-592917b41bac',
  'frontend-playwright-e2e__ansible-ansible-ui__claude-skills-996f4ce3b4eb',
  'gemini-interactions-api',
  'get-search-view-results__microsoft-vscode__extensions-copilot-assets-prompts-skills-b03785026979',
  'guidance__nousresearch-hermes-agent__optional-skills-mlops-6dd335ed6f65',
  'honcho__nousresearch-hermes-agent__optional-skills-autonomous-ai-agents-996e893df65f',
  'huggingface-hub__nousresearch-hermes-agent__optional-skills-mlops-models-31740bee60f1',
  'huggingface-tokenizers__nousresearch-hermes-agent__optional-skills-mlops-450862a93950',
  'install-vscode-extension__microsoft-vscode__extensions-copilot-assets-prompts-skills-2e7104cc5ce9',
  'instructor__nousresearch-hermes-agent__optional-skills-mlops-63c53d7f2315',
  'ito-basket-compare',
  'ito-data-atlas-agent',
  'ito-market-intelligence',
  'ito-trade-planner',
  'llava__nousresearch-hermes-agent__optional-skills-mlops-d009f161373d',
  'motion-ui',
  'mpp-agent__nousresearch-hermes-agent__optional-skills-payments-7943e3cd50d1',
  'neon-postgres-branches',
  'neon-postgres-egress-optimizer',
  'openclaw-migration__nousresearch-hermes-agent__optional-skills-migration-fe317e719177',
  'outlines__nousresearch-hermes-agent__optional-skills-mlops-inference-2a0cea14b1ee',
  'pinecone-research__nousresearch-hermes-agent__optional-skills-research-ca8cc4dc1685',
  'pinecone__nousresearch-hermes-agent__optional-skills-mlops-b96e22fc8f42',
  'powerpoint__nousresearch-hermes-agent__skills-productivity-9dd70c272389',
  'qdrant__nousresearch-hermes-agent__optional-skills-mlops-e05b17a8a6f1',
  'refactor-claude-md__vinta-hal-9000__skills-02c1d0c985be',
  'sandbox-sdk',
  'searxng-search__nousresearch-hermes-agent__optional-skills-research-8efe93ddacc5',
  'shopify__nousresearch-hermes-agent__optional-skills-productivity-af9e1116cb10',
  'stable-diffusion__nousresearch-hermes-agent__optional-skills-mlops-df5a6f6fe26e',
  'stories__storybookjs-storybook__code-lib-claude-plugin-skills-37800384acf4',
  'stories__storybookjs-storybook__code-lib-codex-plugin-plugins-storybook-skills-0d4224554f40',
  'trl-fine-tuning__nousresearch-hermes-agent__optional-skills-mlops-training-ee033cb02786',
  'update-playbooks__vinta-hal-9000__claude-skills-5cff35ed98e7',
  'weights-and-biases__nousresearch-hermes-agent__optional-skills-mlops-evaluation-753b94e388bc',
  'whisper__nousresearch-hermes-agent__optional-skills-mlops-6e1572243c5f',
  'xlsx__nousresearch-hermes-agent__skills-productivity-7a88407e62d8',
  'yuanbao__nousresearch-hermes-agent__optional-skills-37c0ad287a36',
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
