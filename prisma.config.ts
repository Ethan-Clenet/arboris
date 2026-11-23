import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/** URL CLI (migrate / seed). Préfère l’URL directe Neon, sinon la poolée, sinon Docker local. */
function cliDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    'postgresql://arboris:arboris@127.0.0.1:5433/arboris'
  )
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: cliDatabaseUrl(),
  },
})
