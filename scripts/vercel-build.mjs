import { execSync } from 'node:child_process'

/**
 * Sur Vercel : migrations + sync catalogue (best-effort), puis build.
 * Si Neon est injoignable / quota dépassé, on logue et on continue le build
 * pour ne pas bloquer le déploiement du code.
 */
function isDbUnreachable(text) {
  return (
    /P1001|Can't reach database server|exceeded the data transfer quota|ECONNREFUSED|ETIMEDOUT|ENOTFOUND/i.test(
      text,
    )
  )
}

const migrateUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!migrateUrl) {
  console.warn('[vercel-build] DATABASE_URL manquante — migrations/sync ignorés.')
} else {
  const env = { ...process.env, DATABASE_URL: migrateUrl }
  let status = ''
  try {
    status = execSync('npx prisma migrate status', { env, encoding: 'utf8' })
  } catch (error) {
    // Code ≠ 0 quand des migrations sont en attente — ou DB down.
    status = `${error.stdout ?? ''}\n${error.stderr ?? ''}\n${error.message ?? ''}`
  }

  if (isDbUnreachable(status)) {
    console.warn(
      '[vercel-build] Base injoignable (réseau / quota Neon) — migrations et sync ignorés, build continue.',
    )
    console.warn(status.slice(0, 500))
  } else {
    const needsMigrate =
      /have not yet been applied/i.test(status) ||
      /following migrations have not/i.test(status) ||
      /database schema is not in sync/i.test(status) ||
      /The following migration\(s\) are applied to the database but missing from the local/i.test(status)

    try {
      if (needsMigrate) {
        console.log('[vercel-build] Migrations en attente — prisma migrate deploy…')
        execSync('npx prisma migrate deploy', { env, stdio: 'inherit' })
      } else if (
        /Database schema is up to date/i.test(status) ||
        /No pending migrations/i.test(status)
      ) {
        console.log('[vercel-build] Schéma à jour — migrations ignorées.')
      } else {
        console.warn('[vercel-build] Statut migrate ambigu — tentative de prisma migrate deploy…')
        console.warn(status.slice(0, 800))
        execSync('npx prisma migrate deploy', { env, stdio: 'inherit' })
      }

      // Sync catalogue : production seulement (ou SYNC_CATALOG=1).
      // Les previews consommaient beaucoup de transfer Neon pour un gain faible.
      const shouldSync =
        process.env.SYNC_CATALOG === '1' ||
        process.env.VERCEL_ENV === 'production' ||
        (!process.env.VERCEL_ENV && process.env.NODE_ENV !== 'development')

      if (shouldSync) {
        console.log('[vercel-build] Sync catalogue…')
        execSync('npx tsx scripts/sync-catalog.ts', { env, stdio: 'inherit' })
      } else {
        console.log(
          `[vercel-build] Sync catalogue ignoré (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'n/a'}). ` +
            'Force avec SYNC_CATALOG=1.',
        )
      }    } catch (error) {
      const msg = `${error.stdout ?? ''}\n${error.stderr ?? ''}\n${error.message ?? ''}`
      if (isDbUnreachable(msg)) {
        console.warn(
          '[vercel-build] DB indisponible pendant migrate/sync — build continue sans bloquer le deploy.',
        )
        console.warn(msg.slice(0, 500))
      } else {
        throw error
      }
    }
  }
}

execSync('npm run build', { stdio: 'inherit' })
