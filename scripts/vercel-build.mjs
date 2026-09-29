import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Vercel build: Prisma migrate, optional catalogue sync, then `npm run build`.
 *
 * Migrations:
 * - Production (`VERCEL_ENV === 'production'`): `prisma migrate status` / `deploy`
 *   MUST succeed. Missing `DATABASE_URL`, unreachable Neon, or a failed deploy
 *   fails the build, so we never ship code against an un-migrated schema.
 * - Preview / local: an unreachable database is a warning; the build continues.
 *
 * Catalogue sync stays best-effort everywhere (warning only, never fails the build).
 */

export class VercelBuildError extends Error {
  constructor(message, detail) {
    super(detail ? `${message}\n${String(detail).slice(0, 800)}` : message)
    this.name = 'VercelBuildError'
  }
}

export function isProductionEnv(env = process.env) {
  return env.VERCEL_ENV === 'production'
}

export function isDbUnreachable(text) {
  return (
    /P1001|Can't reach database server|exceeded the data transfer quota|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(
      text,
    )
  )
}

export function errorText(error) {
  return `${error.stdout ?? ''}\n${error.stderr ?? ''}\n${error.message ?? ''}`
}

export function shouldSyncCatalog(env = process.env) {
  return (
    env.SYNC_CATALOG === '1' ||
    env.VERCEL_ENV === 'production' ||
    (!env.VERCEL_ENV && env.NODE_ENV !== 'development')
  )
}

function warn(message, detail) {
  console.warn(message)
  if (detail) console.warn(String(detail).slice(0, 500))
}

function applyMigrations(status, exec, env) {
  const needsMigrate =
    /have not yet been applied/i.test(status) ||
    /following migrations have not/i.test(status) ||
    /database schema is not in sync/i.test(status) ||
    /The following migration\(s\) are applied to the database but missing from the local/i.test(status)

  if (needsMigrate) {
    console.log('[vercel-build] Migrations en attente — prisma migrate deploy…')
    exec('npx prisma migrate deploy', { env, stdio: 'inherit' })
    return
  }
  if (/Database schema is up to date/i.test(status) || /No pending migrations/i.test(status)) {
    console.log('[vercel-build] Schéma à jour — migrations ignorées.')
    return
  }
  console.warn('[vercel-build] Statut migrate ambigu — tentative de prisma migrate deploy…')
  console.warn(status.slice(0, 800))
  exec('npx prisma migrate deploy', { env, stdio: 'inherit' })
}

function syncCatalog(env, exec, dbEnv) {
  if (!shouldSyncCatalog(env)) {
    console.log(
      `[vercel-build] Sync catalogue ignoré (VERCEL_ENV=${env.VERCEL_ENV ?? 'n/a'}). ` +
        'Force avec SYNC_CATALOG=1.',
    )
    return
  }
  console.log('[vercel-build] Sync catalogue…')
  exec('npx tsx scripts/sync-catalog.ts', { env: dbEnv, stdio: 'inherit' })
}

export function runVercelBuild({ env = process.env, exec = execSync } = {}) {
  const production = isProductionEnv(env)
  const migrateUrl = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL

  if (!migrateUrl) {
    if (production) {
      throw new VercelBuildError(
        '[vercel-build] DATABASE_URL manquante en production — migrations impossibles, build stoppé.',
      )
    }
    warn('[vercel-build] DATABASE_URL manquante — migrations/sync ignorés.')
  } else {
    const dbEnv = { ...env, DATABASE_URL: migrateUrl }
    let status = ''
    try {
      status = exec('npx prisma migrate status', { env: dbEnv, encoding: 'utf8' })
    } catch (error) {
      // Code ≠ 0 quand des migrations sont en attente — ou DB down.
      status = errorText(error)
    }

    if (isDbUnreachable(status)) {
      const msg =
        '[vercel-build] Base injoignable (réseau / quota Neon) — migrations impossibles.'
      if (production) {
        throw new VercelBuildError(`${msg} Build production stoppé.`, status)
      }
      warn(`${msg} Preview/local : build continue.`, status)
    } else {
      try {
        applyMigrations(status, exec, dbEnv)
      } catch (error) {
        const msg = errorText(error)
        if (production) {
          throw new VercelBuildError(
            '[vercel-build] Échec des migrations en production — build stoppé.',
            msg,
          )
        }
        if (isDbUnreachable(msg)) {
          warn('[vercel-build] DB indisponible pendant migrate — build continue.', msg)
        } else {
          throw error
        }
      }

      try {
        syncCatalog(env, exec, dbEnv)
      } catch (error) {
        warn(
          '[vercel-build] Sync catalogue échoué — build continue (sync non bloquant).',
          errorText(error),
        )
      }
    }
  }

  exec('npm run build', { stdio: 'inherit', env })
}

const invokedDirectly =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (invokedDirectly) {
  try {
    runVercelBuild()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
