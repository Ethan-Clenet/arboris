import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function hasPackageAssets(dir: string): boolean {
  if (!existsSync(join(dir, 'package.json'))) return false
  return (
    existsSync(join(dir, 'prisma', 'skills')) ||
    existsSync(join(dir, 'manifest.json'))
  )
}

/** Répertoire racine du package CLI (publish ou monorepo). */
export function resolvePackageRoot(fromModuleUrl: string): string {
  let dir = dirname(fileURLToPath(fromModuleUrl))
  for (let i = 0; i < 10; i++) {
    if (hasPackageAssets(dir)) return dir
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return dirname(fileURLToPath(fromModuleUrl))
}

export function defaultSkillsDir(packageRoot: string): string {
  return join(packageRoot, 'prisma', 'skills')
}

export function defaultCommandsDir(packageRoot: string): string {
  return join(packageRoot, 'prisma', 'commands')
}

export function defaultManifestPath(packageRoot: string): string {
  const atRoot = join(packageRoot, 'manifest.json')
  if (existsSync(atRoot)) return atRoot
  return join(packageRoot, 'cli', 'manifest.json')
}
