import { useSession } from '@tanstack/react-start/server'

export type AppSessionData = {
  userId?: string
  email?: string
  name?: string
}

export const SESSION_COOKIE = 'arboris-session'

function sessionPassword() {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters long')
  }
  return secret
}

export function useAppSession() {
  return useSession<AppSessionData>({
    name: SESSION_COOKIE,
    password: sessionPassword(),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  })
}
