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
  categoryId: string
  icon: string
  /** Score de sûreté SkillSpector 0–100 (null = non scanné). */
  score: number | null
  securityRecommendation: 'SAFE' | 'CAUTION' | 'UNSAFE' | 'UNKNOWN' | null
  scannedAt: string | null
  /** Éditeur / auteur (metadata.origin), ex. ECC. */
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

/** Regroupements de catégories (page Premier pas). */
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

/** Packs workflow mis en avant sur /getting-started (ordre d’affichage). */
export const START_PACK_IDS = ['sonar', 'command-starter', 'ship-safely'] as const

/** Packs « nouveau projet » par techno (section dédiée sur /getting-started). */
export const TECH_STARTER_PACK_IDS = [
  'react-ts-starter',
  'next-react-starter',
  'node-api-starter',
  'fastapi-starter',
  'angular-starter',
  'spring-boot-starter',
  'prisma-postgres-starter',
  'drizzle-starter',
  'supabase-starter',
  'firebase-starter',
  'convex-starter',
  'docker-ops-starter',
] as const

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
export function promptFor(skill: Pick<SkillSummary, 'id' | 'act'>, lang: Lang): string {
  return lang === 'fr'
    ? `Ajoute le skill « ${skill.id} » à mon projet et ${skill.act.fr}.`
    : `Add the "${skill.id}" skill to my project and ${skill.act.en}.`
}

/** Markdown copiable pour un agent : frontmatter + description + instructions. */
export function buildSkillMarkdown(skill: SkillDetail, lang: Lang): string {
  const tag = skill.tag[lang]
  const act = skill.act[lang]
  const does = skill.does[lang]
  const triggers = skill.triggers[lang]

  const lines = [
    '---',
    `name: ${skill.id}`,
    `description: ${tag.replace(/\n/g, ' ')}`,
    '---',
    '',
    `# ${skill.id}`,
    '',
    tag,
    '',
    lang === 'fr' ? `## Ce que fait ${skill.id}` : `## What ${skill.id} does`,
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

export function scoreColor(score: number | null): string {
  if (score == null) return 'var(--text-3)'
  if (score >= 70) return 'var(--success)'
  if (score >= 50) return '#E5A53B'
  return 'var(--danger, #E5484D)'
}
