import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

export type SkillPackageFile = {
  /** Chemin relatif dans le package (ex. `SKILL.md`, `preflight/preflight-guard.md`). */
  relativePath: string
  content: string
}

async function walkFiles(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walkFiles(abs, acc)
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
  const root = join(skillsDir, skillId)
  let absFiles: string[]
  try {
    absFiles = await walkFiles(root)
  } catch {
    return null
  }
  if (absFiles.length === 0) return null

  const files: SkillPackageFile[] = []
  for (const abs of absFiles) {
    const relativePath = relative(root, abs).split(sep).join('/')
    if (!relativePath || relativePath.startsWith('.')) continue
    const content = await readFile(abs, 'utf-8')
    files.push({ relativePath, content })
  }

  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath))
  return files.length ? files : null
}

export function skillPackageHasCompanions(files: SkillPackageFile[]): boolean {
  return files.some((f) => f.relativePath !== 'SKILL.md')
}
