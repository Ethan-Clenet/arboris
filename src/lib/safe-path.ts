import { isAbsolute, resolve, sep } from 'node:path'

/**
 * ID catalogue sûr : pas de `..`, pas de chemin absolu, segments alphanumériques
 * (les skills vendored utilisent `__`, `-`, `@`, etc. ; `/` autorisé pour sous-dossiers).
 */
const SAFE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._@+-]*(?:\/[A-Za-z0-9][A-Za-z0-9._@+-]*)*$/

export function isSafeCatalogId(id: string): boolean {
  if (!id || id.length > 256) return false
  if (id.includes('\0') || id.includes('\\')) return false
  if (isAbsolute(id)) return false
  if (!SAFE_ID_RE.test(id)) return false
  return !id.split('/').some((seg) => seg === '.' || seg === '..')
}

/** Résout `root/rel…` et vérifie que le résultat reste sous `root`. */
export function resolveInsideRoot(root: string, ...relParts: string[]): string | null {
  if (relParts.some((p) => !p || p.includes('\0'))) return null
  const normalizedRoot = resolve(root)
  const target = resolve(normalizedRoot, ...relParts)
  if (target === normalizedRoot) return target
  const prefix = normalizedRoot.endsWith(sep) ? normalizedRoot : `${normalizedRoot}${sep}`
  if (!target.startsWith(prefix)) return null
  return target
}

/** Join sécurisé d’un ID catalogue sous un dossier racine. */
export function resolveCatalogPath(root: string, id: string, ...extra: string[]): string | null {
  if (!isSafeCatalogId(id)) return null
  return resolveInsideRoot(root, id, ...extra)
}
