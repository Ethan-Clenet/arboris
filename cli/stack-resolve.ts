import { readFile } from 'node:fs/promises'
import { defaultManifestPath, resolvePackageRoot } from '../src/lib/package-root.ts'

export type CliManifest = {
  version: 1
  generatedAt: string
  stacks: Array<{ id: string; label: string }>
  skills?: string[]
  skillsByStack: Record<string, string[]>
  skillsByPublisher?: Record<string, string[]>
}

const PACKAGE_ROOT = resolvePackageRoot(import.meta.url)
const MANIFEST_PATH = defaultManifestPath(PACKAGE_ROOT)

let cached: CliManifest | null = null

export async function loadCliManifest(): Promise<CliManifest> {
  if (cached) return cached
  const raw = await readFile(MANIFEST_PATH, 'utf-8')
  cached = JSON.parse(raw) as CliManifest
  return cached
}

/** Normalise une entrée utilisateur (ex. "node.js", "TypeScript"). */
export function normalizeStackInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\.js$/i, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
}

const ALIASES: Record<string, string> = {
  nodejs: 'node',
  node: 'node',
  javascript: 'js',
  js: 'js',
  typescript: 'ts',
  ts: 'ts',
  fastapi: 'fastapi',
  react: 'react',
  angular: 'angular',
  java: 'java',
  spring: 'spring-boot',
  springboot: 'spring-boot',
  'spring-boot': 'spring-boot',
  docker: 'docker',
  n8n: 'n8n',
  kubernetes: 'k9',
  k8s: 'k9',
  k9s: 'k9',
  k9: 'k9',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  mysql: 'mysql',
  prisma: 'prisma',
}

export function resolveStackId(input: string, manifest: CliManifest): string | null {
  const normalized = normalizeStackInput(input)
  const alias = ALIASES[normalized]
  if (alias && manifest.skillsByStack[alias]) return alias

  if (manifest.skillsByStack[normalized]) return normalized

  const byLabel = manifest.stacks.find(
    (stack) => normalizeStackInput(stack.label) === normalized,
  )
  if (byLabel) return byLabel.id

  return null
}

export function formatStackList(manifest: CliManifest): string {
  return manifest.stacks
    .map((stack) => {
      const count = manifest.skillsByStack[stack.id]?.length ?? 0
      return `  ${stack.label.padEnd(14)} (${stack.id}) — ${count} skills`
    })
    .join('\n')
}

export function hasSkillId(manifest: CliManifest, skillId: string): boolean {
  if (manifest.skills?.includes(skillId)) return true
  return Object.values(manifest.skillsByStack).some((ids) => ids.includes(skillId))
}

/** Résout un éditeur (ex. ecc → ECC) via le manifest. */
export function resolvePublisherId(input: string, manifest: CliManifest): string | null {
  const byPublisher = manifest.skillsByPublisher ?? {}
  const keys = Object.keys(byPublisher)
  if (keys.length === 0) return null

  const trimmed = input.trim()
  if (!trimmed) return null
  if (byPublisher[trimmed]) return trimmed

  const lower = trimmed.toLowerCase()
  const byLower = keys.find((key) => key.toLowerCase() === lower)
  if (byLower) return byLower

  const aliases: Record<string, string> = {
    ecc: 'ECC',
    'ecc-community': 'ECC',
    community: 'Community',
    flox: 'Flox',
    brave: 'Brave',
    angular: 'Angular',
    anthropic: 'Anthropic',
    anthropics: 'Anthropic',
    apollo: 'Apollo',
    apollographql: 'Apollo',
    'better-auth': 'Better Auth',
    betterauth: 'Better Auth',
    auth0: 'Auth0',
    browserbase: 'Browserbase',
    cloudflare: 'Cloudflare',
    coderabbit: 'CodeRabbit',
    coderabbitai: 'CodeRabbit',
    cypress: 'Cypress',
    gemini: 'Gemini',
    stitch: 'Stitch',
    gws: 'Google Workspace',
    googleworkspace: 'Google Workspace',
    'google-workspace': 'Google Workspace',
    vercel: 'Vercel',
    nextjs: 'Vercel',
    'next.js': 'Vercel',
    neon: 'Neon',
    neondatabase: 'Neon',
    flutter: 'Flutter',
    dart: 'Flutter',
    figma: 'Figma',
    context7: 'Context7',
    ctx7: 'Context7',
    'context-7': 'Context7',
  }
  const alias = aliases[lower]
  if (alias && byPublisher[alias]) return alias

  // Phrases multi-mots
  if (lower === 'better auth' && byPublisher['Better Auth']) return 'Better Auth'
  if (lower === 'google workspace' && byPublisher['Google Workspace']) return 'Google Workspace'

  return null
}

export function formatPublisherList(manifest: CliManifest): string {
  const entries = Object.entries(manifest.skillsByPublisher ?? {}).sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]),
  )
  if (entries.length === 0) return '  (aucun éditeur)'
  return entries.map(([name, ids]) => `  ${name.padEnd(14)} — ${ids.length} skills`).join('\n')
}
