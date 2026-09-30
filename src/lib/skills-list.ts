import {
  listingPublisher,
  skillLabel,
  type Category,
  type SkillSummary,
} from '#/lib/catalog'
import type { SecurityRecommendation } from '#/lib/skillspector'

/** Nombre de fiches rendues / sérialisées par page de catalogue (SSR + hydratation). */
export const SKILLS_PAGE_SIZE = 40

export type SkillsSearch = {
  page?: number
  q?: string
  cat?: string
  publisher?: string
  security?: string
  compat?: string
}

/** Ligne de liste : sans Markdown, sans `act` / `stacks` / `tech` (hors hydratation). */
export type SkillListItem = Pick<
  SkillSummary,
  | 'id'
  | 'title'
  | 'categoryId'
  | 'icon'
  | 'score'
  | 'securityRecommendation'
  | 'publisher'
  | 'compat'
  | 'tag'
>

export type SkillFacets = {
  total: number
  byCategory: Record<string, number>
  byPublisher: Array<{ id: string; count: number }>
  bySecurity: Record<SecurityRecommendation, number>
}

export type SkillsListPage = {
  categories: Category[]
  compatOrder: string[]
  facets: SkillFacets
  skills: SkillListItem[]
  page: number
  pageSize: number
  total: number
  totalUnfiltered: number
  pageCount: number
  /** Query normalisée (page effective) pour canonical / prev / next. */
  search: SkillsSearch
  path: string
}

const SECURITY_FILTERS = ['SAFE', 'CAUTION', 'UNSAFE', 'UNKNOWN'] as const

function isSecurityFilter(value: string): value is SecurityRecommendation {
  return (SECURITY_FILTERS as readonly string[]).includes(value)
}

/** Parse les query params `/skills` en omettant les valeurs par défaut (URL propre). */
export function parseSkillsSearch(search: Record<string, unknown>): SkillsSearch {
  const out: SkillsSearch = {}
  const page = Number(search.page)
  if (Number.isFinite(page) && page > 1) out.page = Math.floor(page)
  if (typeof search.q === 'string' && search.q.trim()) out.q = search.q.trim()
  if (typeof search.cat === 'string' && search.cat && search.cat !== 'all') out.cat = search.cat
  if (typeof search.publisher === 'string' && search.publisher && search.publisher !== 'all') {
    out.publisher = search.publisher
  }
  if (typeof search.security === 'string' && isSecurityFilter(search.security)) {
    out.security = search.security
  }
  if (typeof search.compat === 'string' && search.compat.trim()) {
    const agents = search.compat
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (agents.length) out.compat = agents.join(',')
  }
  return out
}

/** Chemin canonique crawlable (page 1 sans `page=`). */
export function skillsListPath(search: SkillsSearch): string {
  const params = new URLSearchParams()
  if (search.q) params.set('q', search.q)
  if (search.cat) params.set('cat', search.cat)
  if (search.publisher) params.set('publisher', search.publisher)
  if (search.security) params.set('security', search.security)
  if (search.compat) params.set('compat', search.compat)
  if (search.page && search.page > 1) params.set('page', String(search.page))
  const qs = params.toString()
  return qs ? `/skills?${qs}` : '/skills'
}

export function parseCompatFilter(compat: string | undefined): string[] {
  if (!compat) return []
  return compat
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function toSkillListItem(skill: SkillSummary): SkillListItem {
  return {
    id: skill.id,
    title: skill.title,
    categoryId: skill.categoryId,
    icon: skill.icon,
    score: skill.score,
    securityRecommendation: skill.securityRecommendation,
    publisher: skill.publisher,
    compat: skill.compat,
    tag: skill.tag,
  }
}

export function computeSkillFacets(
  skills: Array<
    Pick<SkillSummary, 'categoryId' | 'publisher' | 'securityRecommendation'>
  >,
): SkillFacets {
  const byCategory: Record<string, number> = {}
  const pubCounts = new Map<string, number>()
  const bySecurity: Record<SecurityRecommendation, number> = {
    SAFE: 0,
    CAUTION: 0,
    UNSAFE: 0,
    UNKNOWN: 0,
  }
  for (const skill of skills) {
    byCategory[skill.categoryId] = (byCategory[skill.categoryId] ?? 0) + 1
    const publisher = listingPublisher(skill.publisher)
    pubCounts.set(publisher, (pubCounts.get(publisher) ?? 0) + 1)
    const tone = skill.securityRecommendation ?? 'UNKNOWN'
    bySecurity[tone] += 1
  }
  const byPublisher = [...pubCounts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
  return { total: skills.length, byCategory, byPublisher, bySecurity }
}

export function filterAndSortSkills(
  skills: SkillSummary[],
  categories: Category[],
  search: SkillsSearch,
): SkillSummary[] {
  const catById = new Map(categories.map((category) => [category.id, category]))
  const q = search.q?.trim().toLowerCase() ?? ''
  const compat = parseCompatFilter(search.compat)
  const list = skills.filter((skill) => {
    if (search.cat && skill.categoryId !== search.cat) return false
    if (search.publisher && listingPublisher(skill.publisher) !== search.publisher) return false
    if (compat.length && !compat.every((agent) => skill.compat.includes(agent))) return false
    if (search.security) {
      const tone = skill.securityRecommendation ?? 'UNKNOWN'
      if (tone !== search.security) return false
    }
    if (q) {
      const category = catById.get(skill.categoryId)
      const hay = `${skill.id} ${skillLabel(skill)} ${skill.tag.fr} ${skill.tag.en} ${skill.tech.join(' ')} ${
        skill.publisher ?? ''
      } ${category ? `${category.label.fr} ${category.label.en}` : ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
  return [...list].sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.id.localeCompare(b.id))
}

export function paginateSkills(
  skills: SkillSummary[],
  pageInput: number | undefined,
  pageSize = SKILLS_PAGE_SIZE,
): { page: number; pageCount: number; slice: SkillSummary[] } {
  const pageCount = Math.max(1, Math.ceil(skills.length / pageSize))
  const page = Math.min(Math.max(1, pageInput ?? 1), pageCount)
  const start = (page - 1) * pageSize
  return { page, pageCount, slice: skills.slice(start, start + pageSize) }
}
