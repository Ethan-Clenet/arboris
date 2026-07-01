// Singleton PrismaClient — CÔTÉ SERVEUR UNIQUEMENT.
// Ce module ne doit jamais être importé depuis du code client : il est chargé
// dynamiquement (import()) à l'intérieur des handlers de server functions, donc
// il ne finit jamais dans le bundle navigateur.
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
