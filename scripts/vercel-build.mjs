import { execSync } from 'node:child_process'

const migrateUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!migrateUrl) {
  console.warn('[vercel-build] DATABASE_URL manquante — migrations ignorées.')
} else {
  const env = { ...process.env, DATABASE_URL: migrateUrl }
  const status = execSync('npx prisma migrate status', { env, encoding: 'utf8' })
  const needsMigrate =
    status.includes('have not yet been applied') ||
    status.includes('following migrations have not') ||
    status.includes('Your database schema is not in sync')

  if (needsMigrate) {
    console.log('[vercel-build] Migrations en attente — prisma migrate deploy…')
    execSync('npx prisma migrate deploy', { env, stdio: 'inherit' })
  } else {
    console.log('[vercel-build] Schéma à jour — migrations ignorées.')
  }
}

execSync('npm run build', { stdio: 'inherit' })
