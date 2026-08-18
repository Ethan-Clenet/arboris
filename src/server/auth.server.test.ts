import { beforeEach, describe, expect, it, vi } from 'vitest'
import { hashPassword } from './password'
import { authenticateUser, createUser, findUserByEmail, findUserById } from './auth.server'

vi.mock('#/server/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { prisma } from '#/server/db'

const userRow = {
  id: 'u1',
  email: 'ada@example.com',
  name: 'Ada',
  role: 'ADMIN' as const,
}

beforeEach(() => {
  vi.mocked(prisma.user.findUnique).mockReset()
  vi.mocked(prisma.user.create).mockReset()
})

describe('findUserByEmail / findUserById', () => {
  it('normalise l’email et projette l’utilisateur', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...userRow, passwordHash: 'x' } as never)
    await findUserByEmail('Ada@Example.com')
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'ada@example.com' },
    })

    vi.mocked(prisma.user.findUnique).mockResolvedValue(userRow as never)
    expect(await findUserById('u1')).toEqual(userRow)
  })
})

describe('createUser', () => {
  it('hash le mot de passe et trim les champs', async () => {
    vi.mocked(prisma.user.create).mockResolvedValue(userRow as never)
    const created = await createUser({
      email: 'Ada@Example.com ',
      password: 'secret-secret',
      name: ' Ada ',
    })
    expect(created).toEqual(userRow)
    const data = vi.mocked(prisma.user.create).mock.calls[0]?.[0]?.data as {
      email: string
      name: string
      passwordHash: string
    }
    expect(data.email).toBe('ada@example.com')
    expect(data.name).toBe('Ada')
    expect(data.passwordHash).toContain(':')
  })
})

describe('authenticateUser', () => {
  it('accepte un mot de passe valide et refuse le reste', async () => {
    const passwordHash = await hashPassword('correct-horse')
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...userRow,
      passwordHash,
    } as never)

    const ok = await authenticateUser('ADA@example.com', 'correct-horse')
    expect(ok).toMatchObject({ id: 'u1', email: 'ada@example.com', role: 'ADMIN' })

    expect(await authenticateUser('ada@example.com', 'wrong')).toBeNull()

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    expect(await authenticateUser('missing@example.com', 'x')).toBeNull()
  })
})
