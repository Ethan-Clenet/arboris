import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { CATEGORIES, STACKS, type CategorySeed, type SkillSeed, type StackSeed } from './catalog-data'
import { riskToSafetyScore, type SkillSecurityReport } from '../src/lib/skillspector'

const SKILLS_DIR = join(process.cwd(), 'prisma/skills')
const REPORTS_DIR = join(process.cwd(), 'prisma/skillspector-reports')

async function loadSecurityReport(skillId: string): Promise<SkillSecurityReport | null> {
  try {
    const raw = await readFile(join(REPORTS_DIR, `${skillId}.json`), 'utf-8')
    return JSON.parse(raw) as SkillSecurityReport
  } catch {
    return null
  }
}

type ParsedSkill = {
  id: string
  description: string
  body: string
  /** Éditeur / auteur (metadata.origin du SKILL.md). */
  publisher: string | null
}

/** Extrait `description` YAML (ligne seule, quotes, ou bloc `>` / `|`). */
function parseYamlDescription(frontmatter: string): string | undefined {
  const multi = frontmatter.match(
    /^description:\s*[>|][-+]?\s*\r?\n((?:[ \t]+.+\r?\n?)*)/m,
  )
  if (multi) {
    const folded = multi[1]
      .split(/\r?\n/)
      .map((line) => line.replace(/^[ \t]+/, '').trimEnd())
      .filter((line) => line.length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    return folded || undefined
  }

  let description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim()
  if (!description) return undefined
  // Ignore les marqueurs de bloc orphelins (`>`, `>-`, …)
  if (/^[>|][-+]?$/.test(description)) return undefined
  if (
    (description.startsWith('"') && description.endsWith('"')) ||
    (description.startsWith("'") && description.endsWith("'"))
  ) {
    description = description.slice(1, -1)
  }
  return description.trim() || undefined
}

/** Normalise metadata.origin → label éditeur (ex. ECC). */
export function normalizePublisher(raw: string): string {
  let value = raw.trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim()
  }
  if (!value) return value

  const lower = value.toLowerCase()
  if (lower === 'ecc' || lower === 'ecc-community' || lower.startsWith('ecc ')) return 'ECC'
  if (lower === 'community') return 'Community'
  // Contributeurs / origines diverses → Community
  if (
    lower.startsWith('health1') ||
    lower.includes('health1 super speciality') ||
    lower.includes('ronald skelton') ||
    lower.includes('rapportscore') ||
    lower === 'skill-sonar' ||
    lower === 'skill sonar' ||
    lower === 'skillsonar'
  ) {
    return 'Community'
  }
  if (lower === 'flox') return 'Flox'
  if (lower === 'brave' || lower.startsWith('brave ')) return 'Brave'
  if (lower === 'angular' || lower.startsWith('angular ')) return 'Angular'
  if (lower === 'anthropic' || lower === 'anthropics' || lower.startsWith('anthropic ')) return 'Anthropic'
  if (lower === 'apollo' || lower === 'apollographql' || lower.startsWith('apollo ')) return 'Apollo'
  if (lower === 'better auth' || lower === 'better-auth' || lower === 'betterauth') return 'Better Auth'
  if (lower === 'auth0') return 'Auth0'
  if (lower === 'browserbase') return 'Browserbase'
  if (lower === 'cloudflare') return 'Cloudflare'
  if (lower === 'coderabbit' || lower === 'coderabbitai') return 'CodeRabbit'
  if (lower === 'cypress' || lower === 'cypress-io') return 'Cypress'
  if (lower === 'gemini' || lower === 'google-gemini') return 'Gemini'
  if (lower === 'stitch' || lower === 'google-labs-code' || lower.startsWith('stitch ')) return 'Stitch'
  if (lower === 'google workspace' || lower === 'googleworkspace' || lower === 'gws') {
    return 'Google Workspace'
  }
  if (lower === 'vercel' || lower === 'next.js' || lower === 'nextjs') return 'Vercel'
  if (lower === 'neon' || lower === 'neondatabase') return 'Neon'
  if (lower === 'flutter' || lower === 'dart') return 'Flutter'
  if (lower === 'figma') return 'Figma'
  if (value.includes('/')) {
    const tail = value.split('/').pop()?.trim()
    if (tail) return normalizePublisher(tail)
  }
  return value
}

function parseYamlOrigin(frontmatter: string): string | null {
  const metaBlock = frontmatter.match(/^metadata:\s*\r?\n((?:[ \t]+.+\r?\n?)*)/m)
  if (metaBlock) {
    const fromMeta = metaBlock[1].match(/^[ \t]+origin:\s*(.+)$/m)?.[1]
    if (fromMeta) {
      const normalized = normalizePublisher(fromMeta)
      return normalized || null
    }
  }
  const topLevel = frontmatter.match(/^origin:\s*(.+)$/m)?.[1]
  if (!topLevel) return null
  const normalized = normalizePublisher(topLevel)
  return normalized || null
}

function parseFrontmatter(raw: string): ParsedSkill | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return null
  const [, frontmatter, body] = match
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim()
  const description = parseYamlDescription(frontmatter)
  if (!name || !description) return null
  return {
    id: name,
    description,
    body: body.trim(),
    publisher: parseYamlOrigin(frontmatter),
  }
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
  const wb = (...words: string[]) => new RegExp(`\\b(?:${words.join('|')})\\b`, 'i')

  // Overrides slug (évite les faux positifs « test » / « verification » dans la description)
  if (slug === 'shadcn') return 'frontend'
  if (slug === 'query') return 'data'
  if (slug === 'convex-setup-auth' || slug === 'firebase-auth-basics') return 'security'
  if (slug === 'skill-sonar' || slug === 'gateguard' || slug === 'safety-guard') return 'security'
  if (slug === 'delivery-gate') return 'verification'
  // Brave Search API skills
  if (
    slug === 'bx' ||
    slug === 'web-search' ||
    slug === 'news-search' ||
    slug === 'images-search' ||
    slug === 'videos-search' ||
    slug === 'answers' ||
    slug === 'suggest' ||
    slug === 'spellcheck' ||
    slug === 'llm-context' ||
    slug === 'local-pois' ||
    slug === 'local-descriptions'
  ) {
    return 'agents'
  }
  if (/^gws-/.test(slug)) return 'ops'
  if (/^figma-|^stitch-|^frontend-design|^canvas-design|^brand-guidelines/.test(slug)) return 'frontend'
  if (/^flutter-|^dart-/.test(slug)) return 'frontend'
  if (/^apollo-|^graphql-/.test(slug)) return 'backend'
  if (/^better-auth|^auth0$|^create-auth/.test(slug)) return 'security'
  if (/^neon-|^claimable-postgres|^cloudflare|^durable-objects|^wrangler/.test(slug)) return 'backend'
  if (/^cypress-|^browserbase-|^webapp-testing/.test(slug)) return 'tests'
  if (/^gemini-|^claude-api|^next-/.test(slug)) return 'agents'
  if (/^angular-/.test(slug)) return 'frontend'
  if (/^coderabbit-/.test(slug)) return 'verification'
  if (
    slug === 'supabase' ||
    slug === 'supabase-postgres-best-practices' ||
    slug === 'neon-postgres' ||
    slug === 'turso-db' ||
    slug === 'drizzle' ||
    /^firebase-/.test(slug) ||
    /^convex-/.test(slug)
  ) {
    return 'backend'
  }
  if (/^orch-/.test(slug)) return 'agents'
  if (/^agent-harness|^autonomous-agent-harness|^gan-style-harness/.test(slug)) return 'agents'
  if (slug === 'parallel-execution-optimizer' || slug === 'dynamic-workflow-mode' || slug === 'iterative-retrieval') {
    return 'agents'
  }
  if (slug === 'email-ops') return 'ops'
  if (slug === 'ui-demo') return 'frontend'
  if (/cisco-ios/.test(slug)) return 'ops'

  // Slug (le plus fiable)
  if (/security|auth|oauth|hipaa|compliance/.test(slug)) return 'security'

  // Vérification : schémas, gates, eval harness, *-verification
  if (
    /-verification$|^verification-|verification-loop|canary-watch|santa-method/.test(slug) ||
    /eval-harness|agent-eval|agent-self-evaluation|scholar-evaluation|healthcare-eval-harness/.test(slug) ||
    /zod|pydantic|joi|yup|typecheck|quality-gate|plankton-code-quality/.test(slug)
  ) {
    return 'verification'
  }

  // Tests : TDD, e2e, QA, frameworks de test (*-testing, *-tdd)
  if (
    /-testing$|-tdd$|browser-qa|e2e-testing|windows-desktop-e2e|^tdd-workflow|ai-regression-testing/.test(slug) ||
    (/\b(test|tdd|qa|e2e)\b/.test(slug) && !/verif/.test(slug))
  ) {
    return 'tests'
  }

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

  if (wb('security', 'oauth', 'hipaa', 'compliance', 'authentication', 'authorization').test(text)) return 'security'

  if (
    wb('zod', 'pydantic', 'joi', 'yup', 'json schema', 'schema validation', 'input validation', 'typecheck', 'lint gate').test(
      text,
    )
  ) {
    return 'verification'
  }
  if (wb('verification loop', 'eval harness', 'eval gate', 'quality gate', 'canary').test(text)) return 'verification'

  if (
    wb('unit test', 'integration test', 'e2e test', 'test-driven', 'tdd', 'playwright', 'vitest', 'jest', 'pytest', 'agilitest').test(
      text,
    )
  ) {
    return 'tests'
  }
  if (wb('testing', 'qa').test(text) && !wb('verification', 'validation').test(text)) return 'tests'

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
  const slug = id.toLowerCase()

  const overrideStacks: Record<string, string[]> = {
    'vercel-react-best-practices': ['react', 'js', 'ts'],
    'vercel-composition-patterns': ['react', 'js', 'ts'],
    shadcn: ['react', 'ts'],
    'webapp-testing': ['react', 'js', 'ts'],
    'typescript-advanced-types': ['react', 'ts', 'js'],
    'tailwind-design-system': ['react', 'ts', 'js'],
    'supabase-postgres-best-practices': ['postgresql', 'supabase'],
    supabase: ['supabase', 'postgresql', 'react', 'ts'],
    'firebase-basics': ['firebase', 'js', 'ts'],
    'firebase-auth-basics': ['firebase', 'js', 'ts'],
    'firebase-firestore': ['firebase', 'js', 'ts'],
    'convex-quickstart': ['convex', 'ts', 'react'],
    'convex-setup-auth': ['convex', 'ts'],
    'neon-postgres': ['neon', 'postgresql', 'prisma'],
    postgres: ['postgresql'],
    mysql: ['mysql'],
    'turso-db': ['turso', 'postgresql'],
    query: ['duckdb'],
    drizzle: ['drizzle', 'ts', 'postgresql', 'mysql', 'prisma'],
    // Contenu marketing/SEO — évite le faux positif « JavaScript-rendered »
    'ai-seo': [],
  }

  if (overrideStacks[slug]) return overrideStacks[slug]

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
    supabase: /\bsupabase\b/,
    firebase: /\bfirebase\b/,
    convex: /\bconvex\b/,
    neon: /\bneon\b/,
    turso: /\bturso\b|\blibsql\b/,
    duckdb: /\bduckdb\b/,
    drizzle: /\bdrizzle\b/,
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

    // L’id catalogue = nom du dossier (chemin d’install CLI / fichiers package).
    const id = entry.name
    const categoryId = inferCategory(id, parsed.description)
    const activationBullets = sectionBullets(parsed.body, 'When to Activate')
    const generalBullets = linesOfBullets(parsed.body)
    const does = (activationBullets.length ? activationBullets : generalBullets).slice(0, 4)
    const triggers = genericTriggers(id)
    const stacks = inferStacks(id, parsed.description, parsed.body, STACKS)
    const security = await loadSecurityReport(id)

    seeds.push({
      id,
      cat: categoryId,
      icon: inferIcon(categoryId),
      score: security ? riskToSafetyScore(security.riskScore) : null,
      securityRecommendation: security?.recommendation ?? null,
      securityReportJson: security ? JSON.stringify(security) : null,
      scannedAt: security?.scannedAt ?? null,
      scanMode: security?.scanMode ?? null,
      publisher: parsed.publisher,
      stacks,
      tech: stacks.length ? stacks.map((stackId) => STACKS.find((stack) => stack.id === stackId)?.label ?? stackId) : [slugTitle(id)],
      compat: ['Claude', 'Cursor', 'Codex', 'Copilot'],
      tag: {
        fr: parsed.description,
        en: parsed.description,
      },
      act: {
        fr: `applique le skill ${id} : ${parsed.description}`,
        en: `apply the ${id} skill: ${parsed.description}`,
      },
      does: {
        fr: does.length ? does : [`Applique les pratiques du skill ${id}.`],
        en: does.length ? does : [`Apply the ${id} skill practices.`],
      },
      triggers,
      bodyMd: raw.trim() || null,
    })
  }

  return seeds.sort((a, b) => a.id.localeCompare(b.id))
}
