import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Répertoire racine du package Arboris (où se trouve package.json). */
export function resolvePackageRoot(fromModuleUrl: string): string {
  let dir = dirname(fileURLToPath(fromModuleUrl))
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, 'package.json')) && existsSync(join(dir, 'prisma', 'skills'))) {
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return dirname(fileURLToPath(fromModuleUrl))
}

export function defaultSkillsDir(packageRoot: string): string {
  return join(packageRoot, 'prisma', 'skills')
}
