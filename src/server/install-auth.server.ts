import { timingSafeEqual } from 'node:crypto'

/** Install FS locale : root + secret serveur tous deux requis. */
export function isWorkspaceInstallConfigured(): boolean {
  return Boolean(
    process.env.ARBORIS_WORKSPACE_ROOT?.trim() && process.env.ARBORIS_INSTALL_TOKEN?.trim(),
  )
}

/**
 * Compare le jeton client au secret serveur (fail closed).
 * À appeler uniquement quand une écriture workspace est demandée.
 */
export function assertInstallToken(provided: string | undefined): void {
  const expected = process.env.ARBORIS_INSTALL_TOKEN?.trim()
  if (!expected) throw new Error('install_unauthorized')

  const a = Buffer.from(provided ?? '', 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('install_unauthorized')
  }
}
