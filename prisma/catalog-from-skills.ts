import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CATEGORIES, STACKS, type CategorySeed, type SkillSeed, type StackSeed } from './catalog-data'

const SKILLS_DIR = join(process.cwd(), 'prisma/skills')

type ParsedSkill = {
  id: string
  description: string
  body: string
}

function parseFrontmatter(raw: string): ParsedSkill | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return null
  const [, frontmatter, body] = match
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim()
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim()
  if (!name || !description) return null
  return { id: name, description, body: body.trim() }
}

function slugTitle(id: string): string {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function linesOfBullets(body: string): string[] {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
    .filter(Boolean)
}

function sectionBullets(body: string, sectionTitle: string): string[] {
  const pattern = new RegExp(`##\\s+${sectionTitle}[\\s\\S]*?(?=\\n##\\s+|$)`, 'i')
  const match = body.match(pattern)
  if (!match) return []
  return linesOfBullets(match[0])
}

function inferCategory(id: string, description: string): CategorySeed['id'] {
  const text = `${id} ${description}`.toLowerCase()
  if (/(security|auth|oauth|hipaa|compliance|bounty|scan|review)/.test(text)) return 'security'
  if (/(test|testing|tdd|verification|qa|eval|harness|canary|browser-qa|e2e)/.test(text)) return 'testing'
  if (/(react|next|angular|vue|frontend|ui|swiftui|design|motion|remotion|video)/.test(text)) return 'frontend'
  if (/(api|backend|fastapi|nestjs|django|laravel|springboot|quarkus|postgres|mysql|redis|prisma|database|connector)/.test(text)) return 'backend'
  if (/(python|golang|rust|kotlin|java|csharp|fsharp|perl|dart|swift|nodejs|bun|typescript|javascript)/.test(text)) return 'language'
  if (/(data|research|scientific|scraper|benchmark|market|pubmed|uspto|atlas|ml|pytorch)/.test(text)) return 'data'
  if (/(git|github|deployment|docker|kubernetes|network|terminal|workspace|google-workspace|jira|homelab|mailtrap|browser)/.test(text)) return 'ops'
  if (/(document|article|writing|decision-record|rfc|brand-voice|literature|lookup)/.test(text)) return 'docs'
  if (/(product|brand|marketing|investor|growth|seo|social|customer|billing|finance|campaign)/.test(text)) return 'product'
  return 'agents'
}

function inferStacks(id: string, description: string, body: string, stacks: StackSeed[]): string[] {
  const text = `${id} ${description} ${body}`.toLowerCase()
  const keywords: Record<string, RegExp> = {
    node: /\bnode(\.js)?\b/,
    js: /\bjavascript\b/,
    ts: /\btypescript\b/,
    fastapi: /\bfastapi\b/,
    react: /\breact\b/,
    angular: /\bangular\b/,
    java: /\bjava\b/,
    'spring-boot': /\bspring\s?boot|springboot\b/,
    docker: /\bdocker\b/,
    k9: /\bk9\b|\bk9s\b|\bkubernetes\b|\bk8s\b/,
    postgresql: /\bpostgres|postgresql\b/,
    mysql: /\bmysql\b/,
    prisma: /\bprisma\b/,
  }

  const ids = stacks.map((stack) => stack.id).filter((stackId) => keywords[stackId]?.test(text))
  return ids.slice(0, 8)
}

function inferIcon(categoryId: CategorySeed['id']): string {
  return CATEGORIES.find((category) => category.id === categoryId)?.icon ?? 'sparkle'
}

function genericTriggers(id: string): { fr: string[]; en: string[] } {
  return {
    fr: [
      `Applique le skill ${id} à cette tâche`,
      `Utilise ${id} pour améliorer cette implémentation`,
      `Passe en revue ce sujet avec ${id}`,
    ],
    en: [
      `Apply the ${id} skill to this task`,
      `Use ${id} to improve this implementation`,
      `Review this topic with ${id}`,
    ],
  }
}

export async function loadSkillSeeds(): Promise<SkillSeed[]> {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true })
  const directories = entries.filter((entry) => entry.isDirectory() && entry.name !== 'shared')
  const seeds: SkillSeed[] = []

  for (const entry of directories) {
    const raw = await readFile(join(SKILLS_DIR, entry.name, 'SKILL.md'), 'utf-8')
    const parsed = parseFrontmatter(raw)
    if (!parsed) continue

    const categoryId = inferCategory(parsed.id, parsed.description)
    const activationBullets = sectionBullets(parsed.body, 'When to Activate')
    const generalBullets = linesOfBullets(parsed.body)
    const does = (activationBullets.length ? activationBullets : generalBullets).slice(0, 4)
    const triggers = genericTriggers(parsed.id)
    const stacks = inferStacks(parsed.id, parsed.description, parsed.body, STACKS)

    seeds.push({
      id: parsed.id,
      cat: categoryId,
      icon: inferIcon(categoryId),
      score: null,
      stacks,
      tech: stacks.length ? stacks.map((stackId) => STACKS.find((stack) => stack.id === stackId)?.label ?? stackId) : [slugTitle(parsed.id)],
      compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
      tag: {
        fr: parsed.description,
        en: parsed.description,
      },
      act: {
        fr: `applique le skill ${parsed.id} : ${parsed.description}`,
        en: `apply the ${parsed.id} skill: ${parsed.description}`,
      },
      does: {
        fr: does.length ? does : [`Applique les pratiques du skill ${parsed.id}.`],
        en: does.length ? does : [`Apply the ${parsed.id} skill practices.`],
      },
      triggers,
    })
  }

  return seeds.sort((a, b) => a.id.localeCompare(b.id))
}
