/**
 * Résolution d’URL GitHub pour un skill du catalogue.
 * Priorité : source Yunt Academy → skills-lock (repo source) → repo vendor → miroir Arboris.
 * Les sources upstream pointent vers la racine du dépôt (CTA « Ouvrir le dépôt »).
 */
import { VENDOR_GITHUB_REPOS } from '#/lib/vendor-github-repos'
import skillsLock from '../../skills-lock.json' with { type: 'json' }

export type SkillGithubSource = {
  /** URL ouverte dans un nouvel onglet. */
  url: string
  /** org/repo si connu (sans chemin fichier), ou hôte externe (ex. academy.yunt.fr). */
  repo: string | null
  /** upstream = source d’origine ; mirror = copie dans le dépôt Arboris ; site = page web (hors GitHub). */
  kind: 'upstream' | 'mirror' | 'site'
}

const ARBORIS_REPO = 'affaan-m/ECC'
const ARBORIS_SKILLS_TREE = `https://github.com/${ARBORIS_REPO}/tree/master/prisma/skills`
const YUNT_CATALOGUE_URL = 'https://academy.yunt.fr/dashboard/catalogue'

/** Préfixes d’org connus (slug → casing GitHub), du plus long au plus court. */
const VENDOR_ORG_PREFIXES: Array<{ slug: string; github: string }> = [
  { slug: 'cypress-io', github: 'cypress-io' },
  { slug: 'nousresearch', github: 'NousResearch' },
  { slug: 'storybookjs', github: 'storybookjs' },
  { slug: 'huggingface', github: 'huggingface' },
  { slug: 'microsoft', github: 'microsoft' },
  { slug: 'tanstack', github: 'TanStack' },
  { slug: 'supabase', github: 'supabase' },
  { slug: 'pytorch', github: 'pytorch' },
  { slug: 'alibaba', github: 'alibaba' },
  { slug: 'upstash', github: 'upstash' },
  { slug: 'fastapi', github: 'fastapi' },
  { slug: 'ansible', github: 'ansible' },
  { slug: 'prisma', github: 'prisma' },
  { slug: 'dotnet', github: 'dotnet' },
  { slug: 'ollama', github: 'ollama' },
  { slug: 'vinta', github: 'vinta' },
]

type LockEntry = {
  source: string
  sourceType?: string
  skillPath: string
  computedHash?: string
}

const lockSkills = (skillsLock as { skills: Record<string, LockEntry> }).skills

function slugifyRepo(input: string): string {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** slugify(org/repo) → org/repo (liste des imports vendors). */
const VENDOR_REPO_BY_SLUG: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const repo of VENDOR_GITHUB_REPOS) {
    map.set(slugifyRepo(repo), repo)
  }
  return map
})()

const VENDOR_HASH_SUFFIX = /(?:^|[-_/])[a-f0-9]{12}$/i

function parseVendorSkillId(id: string): { base: string; repoSlug: string } | null {
  if (!id.includes('__')) return null
  const [base, repoSlug] = id.split('__')
  if (!base || !repoSlug) return null
  if (!VENDOR_HASH_SUFFIX.test(id)) return null
  return { base, repoSlug }
}

/** Reconstruit org/repo depuis un slug `org-rest` quand le repo exact n’est pas listé. */
function inferRepoFromSlug(repoSlug: string): string | null {
  const known = VENDOR_REPO_BY_SLUG.get(repoSlug)
  if (known) return known

  for (const org of VENDOR_ORG_PREFIXES) {
    const prefix = `${org.slug}-`
    if (!repoSlug.startsWith(prefix)) continue
    const name = repoSlug.slice(prefix.length)
    if (!name) continue
    return `${org.github}/${name}`
  }
  return null
}

function arborisMirrorUrl(skillId: string): SkillGithubSource {
  return {
    url: `${ARBORIS_SKILLS_TREE}/${encodeURIComponent(skillId)}`,
    repo: ARBORIS_REPO,
    kind: 'mirror',
  }
}

/** Skills Yunt Academy → catalogue (pas le miroir affaan-m/ECC). */
function yuntCatalogueUrl(skillId: string): SkillGithubSource | null {
  if (!skillId.startsWith('yunt-')) return null
  return {
    url: YUNT_CATALOGUE_URL,
    repo: 'academy.yunt.fr',
    kind: 'site',
  }
}

function lockGithubUrl(skillId: string): SkillGithubSource | null {
  const entry = lockSkills[skillId]
  if (!entry?.source || !entry.skillPath) return null
  return {
    url: `https://github.com/${entry.source}`,
    repo: entry.source,
    kind: 'upstream',
  }
}

function vendorGithubUrl(skillId: string): SkillGithubSource | null {
  const parsed = parseVendorSkillId(skillId)
  if (!parsed) return null
  const repo = inferRepoFromSlug(parsed.repoSlug)
  if (!repo) return null
  return {
    url: `https://github.com/${repo}`,
    repo,
    kind: 'upstream',
  }
}

/** URL source la plus pertinente pour un skill (toujours non nulle). */
export function resolveSkillGithubUrl(skillId: string): SkillGithubSource {
  return (
    yuntCatalogueUrl(skillId) ??
    lockGithubUrl(skillId) ??
    vendorGithubUrl(skillId) ??
    arborisMirrorUrl(skillId)
  )
}
