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
  const slug = id.toLowerCase()
  const text = `${id} ${description}`.toLowerCase()

  // Slug (le plus fiable)
  if (/security|auth|oauth|hipaa|compliance/.test(slug)) return 'security'
  if (/test|tdd|verification|qa|e2e|browser-qa|eval|harness|canary/.test(slug)) return 'testing'
  if (
    /^springboot|^quarkus|^fastapi|^nestjs|^django|^laravel|^jpa|^postgres|^mysql|^redis|^prisma|^api-|^backend/.test(
      slug,
    )
  ) {
    return 'backend'
  }
  if (/react|angular|vue|next|frontend|swiftui|tailwind|accessibility|motion|remotion/.test(slug)) return 'frontend'
  if (/docker|kubernetes|k8s|deployment|homelab|git-|github|network|terminal|workspace/.test(slug)) return 'ops'
  if (/benchmark|scraper|data-|ml-|pytorch|clickhouse|market-|research/.test(slug)) return 'data'
  if (/article|writing|document|brand-voice|rfc|decision-record/.test(slug)) return 'docs'
  if (/product|marketing|investor|growth|seo|customer|billing|brand-/.test(slug)) return 'product'
  if (/python|golang|java|kotlin|rust|csharp|swift|typescript|javascript|perl|dart|bun/.test(slug)) return 'language'
  if (/^agent/.test(slug)) return 'agents'

  const wb = (...words: string[]) => new RegExp(`\\b(?:${words.join('|')})\\b`, 'i')

  if (wb('security', 'oauth', 'hipaa', 'compliance', 'authentication', 'authorization').test(text)) return 'security'
  if (wb('testing', 'tdd', 'verification', 'qa', 'e2e', 'eval', 'harness', 'canary').test(text)) return 'testing'

  // Backend avant frontend (évite « design » / « reactive » mal classés)
  if (/\bspring\s?-?\s?boot\b|\bspringboot\b|\bquarkus\b|\bfastapi\b|\bnestjs\b|\bdjango\b|\blaravel\b/.test(text)) {
    return 'backend'
  }
  if (wb('jpa', 'hibernate', 'postgresql', 'postgres', 'mysql', 'redis', 'prisma', 'graphql', 'backend', 'microservice').test(text)) {
    return 'backend'
  }
  if (/\brest\s+api\b/.test(text)) return 'backend'

  if (wb('react', 'angular', 'vue', 'nextjs', 'frontend', 'swiftui', 'tailwind').test(text)) return 'frontend'
  if (/\bnext\.js\b/.test(text)) return 'frontend'
  if (/\bui\s+component\b|\buser\s+interface\b|\bdesign\s+system\b/.test(text)) return 'frontend'

  if (wb('python', 'golang', 'kotlin', 'rust', 'csharp', 'perl', 'dart', 'swift', 'typescript', 'javascript', 'nodejs', 'bun').test(text)) {
    return 'language'
  }
  if (/\bjava\b(?!script)/.test(text)) return 'language'

  if (wb('docker', 'kubernetes', 'deployment', 'homelab', 'network').test(text)) return 'ops'
  if (/\bk8s\b|\bk9s?\b/.test(text)) return 'ops'

  if (wb('research', 'scraper', 'benchmark', 'pytorch', 'clickhouse').test(text)) return 'data'
  if (wb('article', 'writing', 'documentation', 'literature').test(text)) return 'docs'
  if (wb('marketing', 'investor', 'product', 'seo', 'campaign').test(text)) return 'product'

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
    java: /\bjava\b(?!script)/,
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
