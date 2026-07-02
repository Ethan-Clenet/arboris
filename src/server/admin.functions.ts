import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/server/db'
import { findUserById } from '#/server/auth.server'
import { useAppSession } from '#/server/session'

async function requireAdmin() {
  const session = await useAppSession()
  const userId = session.data.userId
  if (!userId) return null
  const user = await findUserById(userId)
  if (!user || user.role !== 'ADMIN') return null
  return user
}

export const getAdminDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const admin = await requireAdmin()
  if (!admin) return { ok: false as const, error: 'forbidden' as const }

  const [userCount, skillCount, categoryCount, stackCount, users] = await Promise.all([
    prisma.user.count(),
    prisma.skill.count(),
    prisma.category.count(),
    prisma.stack.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ])

  return {
    ok: true as const,
    stats: { userCount, skillCount, categoryCount, stackCount },
    users,
  }
})
