// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '#/lib/i18n'
import { AnnouncerProvider } from '#/lib/announcer'
import { serverFns, testRouter } from '#/test/harness'
import AppShell from './AppShell'
import NotFoundPage from './NotFoundPage'
import ServerErrorPage from './ServerErrorPage'
import Header from './Header'

function wrap(ui: ReactNode) {
  return (
    <I18nProvider>
      <AnnouncerProvider>{ui}</AnnouncerProvider>
    </I18nProvider>
  )
}

describe('AppShell', () => {
  it('masque header/footer sur /auth et /admin', () => {
    testRouter.pathname = '/auth'
    const { rerender } = render(wrap(<AppShell>auth</AppShell>))
    expect(screen.queryByRole('banner')).toBeNull()
    expect(screen.getByText('auth')).toBeTruthy()

    testRouter.pathname = '/admin/skills'
    rerender(wrap(<AppShell>admin</AppShell>))
    expect(screen.queryByRole('banner')).toBeNull()
  })

  it('affiche skip-link, header et footer ailleurs', () => {
    testRouter.pathname = '/'
    render(wrap(<AppShell>page</AppShell>))
    expect(screen.getByRole('link', { name: /aller au contenu/i })).toBeTruthy()
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })
})

describe('NotFoundPage / ServerErrorPage', () => {
  it('affiche le 404 avec liens', () => {
    render(wrap(<NotFoundPage />))
    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /accueil/i })).toBeTruthy()
  })

  it('réessaie via invalidate sur une 500', async () => {
    const user = userEvent.setup()
    render(wrap(<ServerErrorPage error={new Error('boom')} reset={() => {}} />))
    expect(screen.getByText('500')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /réessayer/i }))
    expect(testRouter.invalidate).toHaveBeenCalled()
  })
})

describe('Header', () => {
  it('propose la connexion sans utilisateur', () => {
    render(wrap(<Header />))
    expect(screen.getByRole('link', { name: 'Connexion' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: /navigation principale/i })).toBeTruthy()
  })

  it('affiche admin + logout pour un ADMIN', async () => {
    const user = userEvent.setup()
    testRouter.authUser = {
      id: 'u1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'ADMIN',
    }
    render(wrap(<Header />))
    expect(screen.getByText('Ada Lovelace')).toBeTruthy()
    expect(screen.getByRole('link', { name: /admin/i })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Déconnexion' }))
    await waitFor(() => {
      expect(serverFns.logout).toHaveBeenCalled()
      expect(testRouter.invalidate).toHaveBeenCalled()
    })
  })
})
