// Server functions TanStack Start.
// Le corps des `.handler(...)` est retiré du bundle client par le compilateur ;
// l'import dynamique de `./catalog.server` (qui charge Prisma) reste donc
// strictement côté serveur.
import { createServerFn } from '@tanstack/react-start'
import type { Catalog, SkillDetail } from '#/lib/catalog'

export const getCatalog = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Catalog> => {
    const { loadCatalog } = await import('./catalog.server')
    return loadCatalog()
  },
)

export const getSkill = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<SkillDetail | null> => {
    const { loadSkill } = await import('./catalog.server')
    return loadSkill(data.id)
  })

export const getSkillPageContext = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { loadSkillPageContext } = await import('./catalog.server')
    return loadSkillPageContext(data.id)
  })

export const getSkillCopyContent = createServerFn({ method: 'GET' })
  .validator((data: { id: string; lang: 'fr' | 'en' }) => data)
  .handler(async ({ data }): Promise<string | null> => {
    const { loadSkillCopyContent } = await import('./skill-content.server')
    return loadSkillCopyContent(data.id, data.lang)
  })

export const getSkillFileContent = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<string | null> => {
    const { tryLoadSkillFile } = await import('./skill-content.server')
    return tryLoadSkillFile(data.id)
  })

export type InstallSkillError =
  | 'workspace_not_configured'
  | 'install_unauthorized'
  | 'unknown_agent'
  | 'skill_not_found'
  | 'invalid_path'
  | 'security_blocked'
  | 'rate_limited'
  | 'generic'

export type InstallSkillResult =
  | { ok: true; path: string }
  | { ok: false; error: InstallSkillError }

export const installSkill = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      skillId: string
      agent: string
      lang: 'fr' | 'en'
      acknowledgeRisk?: boolean
      installToken?: string
    }) => data,
  )
  .handler(async ({ data }): Promise<InstallSkillResult> => {
    try {
      const { assertRateLimit, INSTALL_RATE_LIMIT } = await import('./rate-limit.server')
      assertRateLimit('install:skill', INSTALL_RATE_LIMIT)
      const { installSkillForAgent } = await import('./skill-install.server')
      const result = await installSkillForAgent(data)
      return { ok: true, path: result.path }
    } catch (err) {
      const code =
        err instanceof Error &&
        (err.message === 'workspace_not_configured' ||
          err.message === 'install_unauthorized' ||
          err.message === 'unknown_agent' ||
          err.message === 'skill_not_found' ||
          err.message === 'invalid_path' ||
          err.message === 'security_blocked' ||
          err.message === 'rate_limited')
          ? (err.message as InstallSkillError)
          : 'generic'
      return { ok: false, error: code }
    }
  })

export type InstallCommandError =
  | 'workspace_not_configured'
  | 'install_unauthorized'
  | 'unknown_agent'
  | 'command_not_found'
  | 'invalid_path'
  | 'rate_limited'
  | 'generic'

export type InstallCommandResult =
  | { ok: true; path: string }
  | { ok: false; error: InstallCommandError }

export const getCommand = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { loadCommand } = await import('./catalog.server')
    return loadCommand(data.id)
  })

export const getCollection = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { loadCollection } = await import('./catalog.server')
    return loadCollection(data.id)
  })

export const getWorkspaceInstallAvailable = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ available: boolean }> => {
    const { isWorkspaceInstallConfigured } = await import('./install-cloud.server')
    return { available: isWorkspaceInstallConfigured() }
  },
)

export type DownloadZipResult =
  | { ok: true; filename: string; base64: string; fileCount: number }
  | {
      ok: false
      error: 'not_found' | 'unknown_agent' | 'empty' | 'rate_limited' | 'too_large' | 'generic'
    }

export const downloadCollectionZip = createServerFn({ method: 'POST' })
  .validator((data: { collectionId: string; agent: string; lang: 'fr' | 'en' }) => data)
  .handler(async ({ data }): Promise<DownloadZipResult> => {
    try {
      const { assertRateLimit, ZIP_RATE_LIMIT } = await import('./rate-limit.server')
      assertRateLimit('zip:collection', ZIP_RATE_LIMIT)
      const { buildCollectionZip } = await import('./install-cloud.server')
      const zip = await buildCollectionZip(data)
      if (!zip) return { ok: false, error: 'not_found' }
      return { ok: true, ...zip }
    } catch (err) {
      if (err instanceof Error && err.message === 'rate_limited') {
        return { ok: false, error: 'rate_limited' }
      }
      if (err instanceof Error && err.message === 'zip_too_large') {
        return { ok: false, error: 'too_large' }
      }
      return { ok: false, error: 'generic' }
    }
  })

export const downloadCommandZip = createServerFn({ method: 'POST' })
  .validator((data: { commandId: string; agent: string; lang?: 'fr' | 'en' }) => data)
  .handler(async ({ data }): Promise<DownloadZipResult> => {
    try {
      const { assertRateLimit, ZIP_RATE_LIMIT } = await import('./rate-limit.server')
      assertRateLimit('zip:command', ZIP_RATE_LIMIT)
      const { buildCommandZip } = await import('./install-cloud.server')
      const zip = await buildCommandZip({
        commandId: data.commandId,
        agent: data.agent,
        lang: data.lang ?? 'fr',
      })
      if (!zip) return { ok: false, error: 'not_found' }
      return { ok: true, ...zip }
    } catch (err) {
      if (err instanceof Error && err.message === 'rate_limited') {
        return { ok: false, error: 'rate_limited' }
      }
      if (err instanceof Error && err.message === 'zip_too_large') {
        return { ok: false, error: 'too_large' }
      }
      return { ok: false, error: 'generic' }
    }
  })

export const downloadSkillZip = createServerFn({ method: 'POST' })
  .validator((data: { skillId: string; agent: string; lang: 'fr' | 'en' }) => data)
  .handler(async ({ data }): Promise<DownloadZipResult> => {
    try {
      const { assertRateLimit, ZIP_RATE_LIMIT } = await import('./rate-limit.server')
      assertRateLimit('zip:skill', ZIP_RATE_LIMIT)
      const { buildSkillZip } = await import('./install-cloud.server')
      const zip = await buildSkillZip(data)
      if (!zip) return { ok: false, error: 'not_found' }
      return { ok: true, ...zip }
    } catch (err) {
      if (err instanceof Error && err.message === 'rate_limited') {
        return { ok: false, error: 'rate_limited' }
      }
      if (err instanceof Error && err.message === 'zip_too_large') {
        return { ok: false, error: 'too_large' }
      }
      return { ok: false, error: 'generic' }
    }
  })

export const installCommand = createServerFn({ method: 'POST' })
  .validator(
    (data: { commandId: string; agent: string; lang: 'fr' | 'en'; installToken?: string }) => data,
  )
  .handler(async ({ data }): Promise<InstallCommandResult> => {
    try {
      const { assertRateLimit, INSTALL_RATE_LIMIT } = await import('./rate-limit.server')
      assertRateLimit('install:command', INSTALL_RATE_LIMIT)
      const { installCommandForAgent } = await import('./command-install.server')
      const result = await installCommandForAgent(data)
      return { ok: true, path: result.path }
    } catch (err) {
      const code =
        err instanceof Error &&
        (err.message === 'workspace_not_configured' ||
          err.message === 'install_unauthorized' ||
          err.message === 'unknown_agent' ||
          err.message === 'command_not_found' ||
          err.message === 'invalid_path' ||
          err.message === 'rate_limited')
          ? (err.message as InstallCommandError)
          : 'generic'
      return { ok: false, error: code }
    }
  })
