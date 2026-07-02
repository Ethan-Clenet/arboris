import { prisma } from '#/server/db'
import { hashPassword, verifyPassword } from '#/server/password'
import type { UserRole } from '@prisma/client'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } })
}

export async function findUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  })
  return user
}

export async function createUser(input: {
  email: string
  password: string
  name: string
}): Promise<AuthUser> {
  const passwordHash = await hashPassword(input.password)
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true },
  })
  return user
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const user = await findUserByEmail(email.toLowerCase().trim())
  if (!user) return null
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) return null
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}
