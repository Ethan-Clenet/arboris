import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/server/db'
import { findUserById } from '#/server/auth.server'
import { useAppSession } from '#/server/session'
import {
  createCategory,
  createStack,
  deleteCategory,
  deleteSkill,
  deleteStack,
  loadSkillAdminForm,
  toggleSkillStack,
  upsertSkill,
} from '#/server/admin.catalog.server'

export type AdminMutationError =
  | 'forbidden'
  | 'category_exists'
  | 'category_has_skills'
  | 'stack_exists'
  | 'skill_exists'
  | 'skill_not_found'
  | 'stack_not_found'
  | 'generic'

export type AdminMutationResult = { ok: true } | { ok: false; error: AdminMutationError }

async function requireAdmin() {
  const session = await useAppSession()
  const userId = session.data.userId
  if (!userId) return null
  const user = await findUserById(userId)
  if (!user || user.role !== 'ADMIN') return null
  return user
}

function mapError(err: unknown): AdminMutationError {
  if (err instanceof Error) {
    const code = err.message as AdminMutationError
    if (
      code === 'category_exists' ||
      code === 'category_has_skills' ||
      code === 'stack_exists' ||
      code === 'skill_exists' ||
      code === 'skill_not_found' ||
      code === 'stack_not_found'
    ) {
      return code
    }
  }
  return 'generic'
}

async function guard(fn: () => Promise<void>): Promise<AdminMutationResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'forbidden' }
  try {
    await fn()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: mapError(err) }
  }
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

export const adminCreateCategory = createServerFn({ method: 'POST' })
  .validator(
    (data: { id: string; labelFr: string; labelEn: string; color: string; icon: string }) => data,
  )
  .handler(async ({ data }): Promise<AdminMutationResult> => {
    return guard(() => createCategory(data))
  })

export const adminDeleteCategory = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<AdminMutationResult> => {
    return guard(() => deleteCategory(data.id))
  })

export const adminCreateStack = createServerFn({ method: 'POST' })
  .validator(
    (data: { id: string; label: string; icon: string; color: string; briefFr?: string; briefEn?: string }) =>
      data,
  )
  .handler(async ({ data }): Promise<AdminMutationResult> => {
    return guard(() => createStack(data))
  })

export const adminDeleteStack = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<AdminMutationResult> => {
    return guard(() => deleteStack(data.id))
  })

export const adminUpsertSkill = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      id: string
      categoryId: string
      icon: string
      tagFr: string
      tagEn: string
      tech: string[]
      compat: string[]
      stackIds: string[]
      doesFr: string[]
      doesEn: string[]
      triggersFr: string[]
      triggersEn: string[]
      bodyMd: string
      editingId?: string
    }) => data,
  )
  .handler(async ({ data }): Promise<AdminMutationResult> => {
    return guard(() => upsertSkill(data))
  })

export const adminGetSkillForm = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const admin = await requireAdmin()
    if (!admin) return { ok: false as const, error: 'forbidden' as const }
    const form = await loadSkillAdminForm(data.id)
    if (!form) return { ok: false as const, error: 'skill_not_found' as const }
    return { ok: true as const, form }
  })

export const adminDeleteSkill = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<AdminMutationResult> => {
    return guard(() => deleteSkill(data.id))
  })

export const adminToggleSkillStack = createServerFn({ method: 'POST' })
  .validator((data: { skillId: string; stackId: string }) => data)
  .handler(async ({ data }): Promise<AdminMutationResult> => {
    return guard(() => toggleSkillStack(data.skillId, data.stackId))
  })
