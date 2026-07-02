import { readFile } from 'node:fs/promises'
import { defaultManifestPath, resolvePackageRoot } from '../src/lib/package-root.ts'

export type CliManifest = {
  version: 1
  generatedAt: string
  stacks: Array<{ id: string; label: string }>
  skillsByStack: Record<string, string[]>
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
