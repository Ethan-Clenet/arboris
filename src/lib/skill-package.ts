import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import { resolveCatalogPath, resolveInsideRoot } from '#/lib/safe-path'

export type SkillPackageFile = {
  /** Chemin relatif dans le package (ex. `SKILL.md`, `preflight/preflight-guard.md`). */
  relativePath: string
  content: string
}

async function walkFiles(dir: string, packageRoot: string, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const rootResolved = resolve(packageRoot)
  const rootPrefix = rootResolved.endsWith(sep) ? rootResolved : `${rootResolved}${sep}`

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const abs = resolve(dir, entry.name)
    if (abs !== rootResolved && !abs.startsWith(rootPrefix)) continue
    if (entry.isDirectory()) {
      await walkFiles(abs, packageRoot, acc)
      continue
    }
    if (entry.isFile()) acc.push(abs)
  }
  return acc
}

/** Liste tous les fichiers d’un package skill sur disque (hors dossiers cachés). */
export async function listSkillPackageFiles(
  skillsDir: string,
  skillId: string,
): Promise<SkillPackageFile[] | null> {
  const root = resolveCatalogPath(skillsDir, skillId)
  if (!root) return null
  let absFiles: string[]
  try {
    absFiles = await walkFiles(root, root)
  } catch {
    return null
  }
  if (absFiles.length === 0) return null

  const files: SkillPackageFile[] = []
  for (const abs of absFiles) {
    const relativePath = relative(root, abs).split(sep).join('/')
    if (!relativePath || relativePath.startsWith('.') || relativePath.includes('..')) continue
    if (!resolveInsideRoot(root, ...relativePath.split('/'))) continue
    const content = await readFile(abs, 'utf-8')
    files.push({ relativePath, content })
  }

  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  return files.length ? files : null
}

export function skillPackageHasCompanions(files: SkillPackageFile[]): boolean {
  return files.some((f) => f.relativePath !== 'SKILL.md')
}
