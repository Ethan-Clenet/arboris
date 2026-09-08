/** Jeton d’install locale (Vite) — jamais déployer sur le site public. */
export function clientInstallToken(): string | undefined {
  const value = import.meta.env.VITE_ARBORIS_INSTALL_TOKEN
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}
