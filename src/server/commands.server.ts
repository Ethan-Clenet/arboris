import { loadAllCommands, loadCommandFile } from '#/lib/command-file'
import { loadEmbeddedCommand, loadEmbeddedCommands } from '#/lib/commands-embedded'
import type { CommandDetail } from '#/lib/command-types'
import { defaultCommandsDir, resolvePackageRoot } from '#/lib/package-root'

const COMMANDS_DIR = defaultCommandsDir(resolvePackageRoot(import.meta.url))

/**
 * Bundle embarqué en priorité (Vercel n’a pas prisma/commands sur le FS),
 * sinon lecture disque (dev / fichiers pas encore régénérés).
 */
export async function resolveAllCommands(): Promise<CommandDetail[]> {
  const embedded = loadEmbeddedCommands()
  if (embedded.length > 0) return embedded
  return loadAllCommands(COMMANDS_DIR)
}

export async function resolveCommand(id: string): Promise<CommandDetail | null> {
  const embedded = loadEmbeddedCommand(id)
  if (embedded) return embedded
  return loadCommandFile(COMMANDS_DIR, id)
}
