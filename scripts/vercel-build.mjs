import { execSync } from 'node:child_process'

/**
 * Sur Vercel : appliquer les migrations puis build.
 * Attention : `prisma migrate status` sort en code 1 dès qu’il y a des
 * migrations en attente — il faut capturer stdout/stderr via try/catch,
 * sinon le build plante avant `migrate deploy`.
 */
const migrateUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!migrateUrl) {
  console.warn('[vercel-build] DATABASE_URL manquante — migrations ignorées.')
} else {
  const env = { ...process.env, DATABASE_URL: migrateUrl }
  let status = ''
  try {
    status = execSync('npx prisma migrate status', { env, encoding: 'utf8' })
  } catch (error) {
    // Code ≠ 0 quand des migrations sont en attente : on récupère quand même la sortie.
    status = `${error.stdout ?? ''}\n${error.stderr ?? ''}\n${error.message ?? ''}`
  }

  const needsMigrate =
    /have not yet been applied/i.test(status) ||
    /following migrations have not/i.test(status) ||
    /database schema is not in sync/i.test(status) ||
    /The following migration\(s\) are applied to the database but missing from the local/i.test(status)

  if (needsMigrate) {
    console.log('[vercel-build] Migrations en attente — prisma migrate deploy…')
    execSync('npx prisma migrate deploy', { env, stdio: 'inherit' })
  } else if (/Database schema is up to date/i.test(status) || /No pending migrations/i.test(status)) {
    console.log('[vercel-build] Schéma à jour — migrations ignorées.')
  } else {
    // Statut ambigu : tenter un deploy (idempotent) plutôt que bloquer le build.
    console.warn('[vercel-build] Statut migrate ambigu — tentative de prisma migrate deploy…')
    console.warn(status.slice(0, 800))
    try {
      execSync('npx prisma migrate deploy', { env, stdio: 'inherit' })
    } catch (deployError) {
      console.error('[vercel-build] migrate deploy a échoué:', deployError.message)
      throw deployError
    }
  }
}

execSync('npm run build', { stdio: 'inherit' })
