// Types partagés + helpers de présentation du catalogue Arboris.
// Ce module est *isomorphe* (client + serveur) : il ne contient aucun accès
// base de données, seulement des types et des fonctions pures.

import type { SkillSecurityReport } from '#/lib/skillspector'
import type { CommandSummary } from '#/lib/command-types'

export type Lang = 'fr' | 'en'

export interface Bilingual {
  fr: string
  en: string
}

export interface Category {
  id: string
  label: Bilingual
  color: string
  icon: string
}

export interface Stack {
  id: string
  label: string
  icon: string
  color: string
  brief: Bilingual
  /** Identifiants des skills recommandés pour cette stack. */
  skillIds: string[]
}

/** Version « résumé » d'un skill (listes/tableaux). */
export interface SkillSummary {
  id: string
  /** Nom affiché (skills Microsoft vendor : id hashé simplifié). Défaut = id. */
  title?: string
  categoryId: string
  icon: string
  /** Score de sûreté SkillSpector 0–100 (null = non scanné). */
  score: number | null
  securityRecommendation: 'SAFE' | 'CAUTION' | 'UNSAFE' | 'UNKNOWN' | null
  scannedAt: string | null
  /** Éditeur / auteur (metadata.origin), ex. affaan-m. */
  publisher: string | null
  tech: string[]
  compat: string[]
  stacks: string[]
  tag: Bilingual
  act: Bilingual
}

/** Version « détaillée » d'un skill (fiche). */
export interface SkillDetail extends SkillSummary {
  does: { fr: string[]; en: string[] }
  triggers: { fr: string[]; en: string[] }
  securityReport: SkillSecurityReport | null
}

export interface Catalog {
  categories: Category[]
  stacks: Stack[]
  skills: SkillSummary[]
  commands: CommandSummary[]
  collections: CollectionSummary[]
  compatOrder: string[]
}

export interface CollectionSummary {
  id: string
  icon: string
  color: string
  kind: 'featured' | 'pack' | string
  label: Bilingual
  brief: Bilingual
  skillIds: string[]
  commandIds: string[]
}

export interface CollectionDetail extends CollectionSummary {
  skills: SkillSummary[]
  commands: CommandSummary[]
}

/** Thèmes de collections (facette de filtre, présentation uniquement). */
export type CollectionThemeKey = 'frontend' | 'backend' | 'data' | 'ops' | 'security'

/** Ordre d'affichage des thèmes dans les filtres. */
export const COLLECTION_THEME_ORDER: CollectionThemeKey[] = [
  'frontend',
  'backend',
  'data',
  'ops',
  'security',
]

/** Classement thématique explicite par id de collection. */
const COLLECTION_THEME_BY_ID: Record<string, CollectionThemeKey> = {
  'react-ts-starter': 'frontend',
  'next-react-starter': 'frontend',
  'angular-starter': 'frontend',
  'tanstack-starter': 'frontend',
  'ux-ui-pro': 'frontend',
  'node-api-starter': 'backend',
  'fastapi-starter': 'backend',
  'spring-boot-starter': 'backend',
  'dotnet-starter': 'backend',
  'prisma-postgres-starter': 'data',
  'drizzle-starter': 'data',
  'supabase-starter': 'data',
  'firebase-starter': 'data',
  'convex-starter': 'data',
  'command-starter': 'ops',
  'ops-day-two': 'ops',
  'docker-ops-starter': 'ops',
  'n8n-starter': 'ops',
  'ansible-starter': 'ops',
  'cypress-testing': 'ops',
  sonar: 'security',
  'ship-safely': 'security',
}

/**
 * Thème d'une collection pour la facette de filtre. `null` si non classée
 * (elle reste visible sous « Tous » mais sans thème dédié).
 */
export function collectionTheme(collection: Pick<CollectionSummary, 'id'>): CollectionThemeKey | null {
  return COLLECTION_THEME_BY_ID[collection.id] ?? null
}

/** Ordre + couleurs de pastille des compatibilités (présentation, non stocké). */
export const COMPAT_ORDER = ['Claude', 'Cursor', 'Codex', 'Copilot'] as const

export const COMPAT_DOT: Record<string, string> = {
  Claude: '#D97757',
  Cursor: '#4F8FF7',
  Codex: '#10A37F',
  Copilot: '#8B7FF7',
}

export interface CategoryGroup {
  id: string
  label: Bilingual
  icon: string
  color: string
  categoryIds: readonly string[]
}

/** Regroupements de catégories (parcours catalogue). */
export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'development',
    label: { fr: 'Développement', en: 'Development' },
    icon: 'code',
    color: '#4F8FF7',
    categoryIds: ['frontend', 'backend', 'language'],
  },
  {
    id: 'security',
    label: { fr: 'Sécurité & garde', en: 'Security & guards' },
    icon: 'shield-check',
    color: '#0D9488',
    categoryIds: ['security'],
  },
  {
    id: 'devops',
    label: { fr: 'DevOps', en: 'DevOps' },
    icon: 'git-branch',
    color: '#F08A4B',
    categoryIds: ['ops'],
  },
  {
    id: 'quality',
    label: { fr: 'Qualité & Tests', en: 'Quality & Testing' },
    icon: 'flask',
    color: '#2DB8B0',
    categoryIds: ['tests', 'verification'],
  },
  {
    id: 'agents',
    label: { fr: 'IA & Agents', en: 'AI & Agents' },
    icon: 'magic-wand',
    color: '#46C2E8',
    categoryIds: ['agents'],
  },
  {
    id: 'data',
    label: { fr: 'Données', en: 'Data' },
    icon: 'database',
    color: '#9BCB3C',
    categoryIds: ['data'],
  },
  {
    id: 'product',
    label: { fr: 'Produit', en: 'Product' },
    icon: 'image',
    color: '#E5484D',
    categoryIds: ['product'],
  },
  {
    id: 'tools',
    label: { fr: 'Outils', en: 'Tools' },
    icon: 'wrench',
    color: '#F2789F',
    categoryIds: ['docs'],
  },
]

/** Packs garde mis en avant sur /getting-started (chemin « sécuriser l’agent »). */
export const GUARD_PACK_IDS = ['sonar', 'ship-safely'] as const

/** Starters techno sur /getting-started (chemin « nouveau projet »). */
export const TECH_STARTER_PACK_IDS = [
  'react-ts-starter',
  'next-react-starter',
  'node-api-starter',
  'fastapi-starter',
  'angular-starter',
  'spring-boot-starter',
  'prisma-postgres-starter',
  'docker-ops-starter',
  'n8n-starter',
] as const

export type GettingStartedPath = 'new-project' | 'secure-agent'

/** IDs de packs pour un chemin d’onboarding. */
export function packIdsForStartPath(path: GettingStartedPath): readonly string[] {
  switch (path) {
    case 'new-project':
      return TECH_STARTER_PACK_IDS
    case 'secure-agent':
      return GUARD_PACK_IDS
    default: {
      const _exhaustive: never = path
      return _exhaustive
    }
  }
}

/** Collections dans l’ordre des ids (ignore les ids absents). */
export function collectionsInOrder(
  collections: CollectionSummary[],
  ids: readonly string[],
): CollectionSummary[] {
  const byId = new Map(collections.map((c) => [c.id, c]))
  return ids.flatMap((id) => {
    const found = byId.get(id)
    return found ? [found] : []
  })
}

export function categoryIdsInGroup(groupId: string): readonly string[] {
  return CATEGORY_GROUPS.find((group) => group.id === groupId)?.categoryIds ?? []
}

/** Catégories pertinentes par techno (page Premier pas). */
export const STACK_CATEGORY_IDS: Record<string, readonly string[]> = {
  node: ['backend', 'language', 'tests', 'verification', 'ops', 'agents', 'security', 'data', 'product', 'docs'],
  js: ['frontend', 'language', 'tests', 'verification', 'agents', 'security', 'docs', 'product'],
  ts: ['frontend', 'backend', 'language', 'tests', 'verification', 'agents', 'security', 'data', 'docs', 'product'],
  fastapi: ['backend', 'language', 'tests', 'verification', 'security', 'data', 'agents', 'docs'],
  react: ['frontend', 'tests', 'verification', 'language', 'agents', 'security', 'docs', 'product'],
  angular: ['frontend', 'tests', 'verification', 'language', 'security', 'product'],
  java: ['backend', 'language', 'tests', 'verification', 'security', 'data', 'product'],
  'spring-boot': ['backend', 'language', 'tests', 'verification', 'security', 'data', 'product'],
  docker: ['ops', 'backend', 'tests', 'verification', 'agents', 'security', 'product'],
  n8n: ['ops', 'backend', 'agents', 'security', 'data', 'docs'],
  k9: ['ops', 'backend', 'tests', 'verification', 'security'],
  postgresql: ['backend', 'data', 'tests', 'verification', 'language', 'security', 'docs'],
  mysql: ['backend', 'data', 'tests', 'verification', 'security'],
  prisma: ['backend', 'data', 'tests', 'verification', 'language', 'security', 'docs'],
  supabase: ['backend', 'data', 'security', 'frontend', 'tests', 'verification'],
  firebase: ['backend', 'security', 'frontend', 'tests', 'verification'],
  convex: ['backend', 'security', 'frontend', 'tests', 'verification'],
  neon: ['backend', 'data', 'tests', 'verification', 'language', 'security'],
  turso: ['backend', 'data', 'tests', 'verification', 'security'],
  duckdb: ['data', 'backend', 'tests', 'verification', 'security'],
  drizzle: ['backend', 'data', 'language', 'tests', 'verification', 'security'],
}

export function stackSupportsCategory(stackId: string, categoryId: string): boolean {
  return STACK_CATEGORY_IDS[stackId]?.includes(categoryId) ?? false
}

/** Skills sans stack explicite sont proposés pour toute techno compatible avec leur catégorie. */
export function skillMatchesStack(skill: Pick<SkillSummary, 'stacks'>, stackId: string): boolean {
  return skill.stacks.length === 0 || skill.stacks.includes(stackId)
}

export function skillsForStackAndCategory(
  skills: readonly SkillSummary[],
  stackId: string,
  categoryId: string,
): SkillSummary[] {
  return skills.filter((skill) => skill.categoryId === categoryId && skillMatchesStack(skill, stackId))
}

export function compatDot(name: string): string {
  return COMPAT_DOT[name] ?? 'var(--text-3)'
}

/** Convertit un hex (#RGB ou #RRGGBB) en rgba() avec l'alpha donné. */
export function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((x) => x + x)
      .join('')
  }
  const n = parseInt(h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

/** Prompt court (legacy) — préférer buildSkillMarkdown / SKILL.md pour la copie. */
export function promptFor(skill: Pick<SkillSummary, 'id' | 'title' | 'act'>, lang: Lang): string {
  const label = skillLabel(skill)
  return lang === 'fr'
    ? `Ajoute le skill « ${label} » à mon projet et ${skill.act.fr}.`
    : `Add the "${label}" skill to my project and ${skill.act.en}.`
}

/** Markdown copiable pour un agent : frontmatter + description + instructions. */
export function buildSkillMarkdown(skill: SkillDetail, lang: Lang): string {
  const tag = skill.tag[lang]
  const act = skill.act[lang]
  const does = skill.does[lang]
  const triggers = skill.triggers[lang]

  const label = skillLabel(skill)
  const lines = [
    '---',
    `name: ${skill.id}`,
    `description: ${tag.replace(/\n/g, ' ')}`,
    '---',
    '',
    `# ${label}`,
    '',
    tag,
    '',
    lang === 'fr' ? `## Ce que fait ${label}` : `## What ${label} does`,
    ...does.map((item) => `- ${item}`),
    '',
    lang === 'fr' ? '## Instructions' : '## Instructions',
    lang === 'fr'
      ? `Ajoute ce skill à mon projet (fichier \`.cursor/skills/${skill.id}/SKILL.md\` ou équivalent) et ${act}.`
      : `Add this skill to your project (e.g. \`.cursor/skills/${skill.id}/SKILL.md\`) and ${act}.`,
    '',
    lang === 'fr' ? '## Exemples de déclencheurs' : '## Example triggers',
    ...triggers.map((item) => `- ${item}`),
  ]

  if (skill.tech.length > 0) {
    lines.push('', lang === 'fr' ? '## Technologies' : '## Technologies', skill.tech.join(', '))
  }

  return lines.join('\n')
}

/** Prompt « tout copier » pour une stack (liste des skills recommandés). */
export function promptForStack(stack: Stack, lang: Lang): string {
  const ids = stack.skillIds.join(', ')
  return lang === 'fr'
    ? `Configure mon projet ${stack.label} avec les skills Arboris suivants et applique leurs bonnes pratiques : ${ids}.`
    : `Set up my ${stack.label} project with the following Arboris skills and apply their best practices: ${ids}.`
}

/** Éditeur affiché dans les filtres : Community absorbe l’ancien seau « Autres » (origin vide). */
export const COMMUNITY_PUBLISHER = 'Community'

export function listingPublisher(publisher: string | null | undefined): string {
  if (!publisher || publisher === COMMUNITY_PUBLISHER) return COMMUNITY_PUBLISHER
  if (publisher === 'ECC') return 'affaan-m'
  return publisher
}

// Hash technique (12 caractères hex) en fin d'id vendor, précédé d'un tiret,
// underscore, slash, ou collé au segment (`base__repo__<hash>`).
const VENDOR_HASH_SUFFIX = /(?:^|[-_/])[a-f0-9]{12}$/i
// Un token isolé qui est exactement un hash 12 caractères.
const HASH_TOKEN = /^[a-f0-9]{12}$/i
const PATH_NOISE = new Set([
  'solutions',
  'skills',
  'skill',
  'manual',
  'submissions',
  'packages',
  'plugins',
  'src',
  'vs',
  'assets',
  'examples',
  'docs',
])

function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseVendorSkillId(id: string): { base: string; repo: string; path: string } | null {
  if (!id.includes('__')) return null
  const [base, repo, ...rest] = id.split('__')
  if (!base || !repo) return null
  const path = rest.join('__').replace(VENDOR_HASH_SUFFIX, '')
  return { base, repo, path }
}

/**
 * Skill « vendor » importé : id structuré `base__repo__…` terminé par un hash
 * technique de 12 caractères (imports Microsoft, Hugging Face, Nous Research,
 * upstash, vinta, …). Ce sont ceux dont l'id brut est illisible.
 */
export function isVendorSkill(id: string, _publisher?: string | null): boolean {
  return id.includes('__') && VENDOR_HASH_SUFFIX.test(id)
}

function vendorCoreTitle(id: string): string | null {
  const parts = parseVendorSkillId(id)
  if (!parts) return null
  return `${humanizeSlug(parts.base)} ${humanizeSlug(parts.repo)}`.trim()
}

function vendorPathHint(id: string): string {
  const parts = parseVendorSkillId(id)
  if (!parts?.path) return ''
  const tokens = parts.path
    .split(/[-_/]+/)
    .filter((token) => {
      if (!token) return false
      if (PATH_NOISE.has(token.toLowerCase())) return false
      if (HASH_TOKEN.test(token)) return false
      return true
    })
  return humanizeSlug(tokens.join('-'))
}

/**
 * Titres uniques pour l’UI : skill vendor = « nom repo » sans hash ;
 * en cas de collision, suffixe le chemin (sans le hash 12 caractères).
 */
export function uniqueSkillTitles(
  skills: Array<{ id: string; publisher?: string | null }>,
): Map<string, string> {
  const out = new Map<string, string>()
  const groups = new Map<string, string[]>()

  for (const skill of skills) {
    if (!isVendorSkill(skill.id, skill.publisher)) {
      out.set(skill.id, skill.id)
      continue
    }
    const core = vendorCoreTitle(skill.id) ?? skill.id
    const list = groups.get(core) ?? []
    list.push(skill.id)
    groups.set(core, list)
  }

  for (const [core, ids] of groups) {
    if (ids.length === 1) {
      out.set(ids[0], core)
      continue
    }
    const used = new Set<string>()
    for (const id of ids) {
      const hint = vendorPathHint(id)
      let title = hint ? `${core} ${hint}` : core
      if (used.has(title)) {
        let n = 2
        const base = title
        while (used.has(title)) {
          title = `${base} ${n}`
          n += 1
        }
      }
      used.add(title)
      out.set(id, title)
    }
  }

  return out
}

export function withSkillTitles<T extends { id: string; publisher?: string | null; title?: string }>(
  skills: T[],
  universe: Array<{ id: string; publisher?: string | null }> = skills,
): T[] {
  const titles = uniqueSkillTitles(universe)
  return skills.map((skill) => ({ ...skill, title: titles.get(skill.id) ?? skill.id }))
}

export function skillLabel(skill: Pick<SkillSummary, 'id' | 'title'> | string): string {
  if (typeof skill === 'string') return skill
  const title = skill.title?.trim()
  return title || skill.id
}

export function scoreColor(score: number | null): string {
  if (score == null) return 'var(--text-3)'
  if (score >= 70) return 'var(--success)'
  if (score >= 50) return '#E5A53B'
  return 'var(--danger, #E5484D)'
}
