// Singleton PrismaClient — CÔTÉ SERVEUR UNIQUEMENT.
// Ce module ne doit jamais être importé depuis du code client : il est chargé
// dynamiquement (import()) à l'intérieur des handlers de server functions, donc
// il ne finit jamais dans le bundle navigateur.
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('[db] DATABASE_URL manquante — impossible d’ouvrir PrismaPg')
  }
  // Pool pg : timeout de connexion 5 s (défaut Prisma 6), idle 30 s, max 10.
  const adapter = new PrismaPg({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30_000,
  })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
