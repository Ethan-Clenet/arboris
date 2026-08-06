import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { getCookie } from '@tanstack/react-start/server'
import {
  authenticateUser,
  createUser,
  findUserByEmail,
  findUserById,
  type AuthUser,
} from '#/server/auth.server'
import { SESSION_COOKIE, useAppSession } from '#/server/session'

type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string }

function invalidCredentials(): AuthResult {
  return { ok: false, error: 'invalid_credentials' }
}

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthUser | null> => {
    // Ne pas ouvrir de session anonyme : useSession pose un Set-Cookie à chaque
    // requête, ce qui empêche le cache CDN et peut freiner l’indexation Google
    // (« Explorée, actuellement non indexée »).
    if (!getCookie(SESSION_COOKIE)) return null

    const session = await useAppSession()
    const userId = session.data.userId
    if (!userId) return null
    return findUserById(userId)
  },
)

export const login = createServerFn({ method: 'POST' })
  .validator((data: { email: string; password: string; redirect?: string }) => data)
  .handler(async ({ data }): Promise<AuthResult> => {
    const user = await authenticateUser(data.email, data.password)
    if (!user) return invalidCredentials()

    const session = await useAppSession()
    await session.update({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    if (data.redirect) {
      throw redirect({ href: data.redirect })
    }

    return { ok: true, user }
  })

export const register = createServerFn({ method: 'POST' })
  .validator((data: { email: string; password: string; name: string; redirect?: string }) => data)
  .handler(async ({ data }): Promise<AuthResult> => {
    const email = data.email.toLowerCase().trim()
    const name = data.name.trim()

    if (!name) return { ok: false, error: 'name_required' }
    if (data.password.length < 8) return { ok: false, error: 'password_too_short' }

    const existing = await findUserByEmail(email)
    if (existing) return { ok: false, error: 'email_taken' }

    const user = await createUser({ email, password: data.password, name })

    const session = await useAppSession()
    await session.update({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    if (data.redirect) {
      throw redirect({ href: data.redirect })
    }

    return { ok: true, user }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  throw redirect({ to: '/' })
})
