// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '#/lib/i18n'
import { AnnouncerProvider } from '#/lib/announcer'
import { testRouter } from '#/test/harness'
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
  it('affiche skip-link, header et footer', () => {
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
  it('affiche la navigation principale sans auth', () => {
    render(wrap(<Header />))
    expect(screen.getAllByRole('navigation', { name: /navigation principale/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Skills' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Connexion' })).toBeNull()
  })

  it('ouvre et ferme le menu mobile au clic', async () => {
    const user = userEvent.setup()
    render(wrap(<Header />))
    const toggle = screen.getByRole('button', { name: /ouvrir le menu/i })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.getElementById('mobile-nav')).toBeNull()
    await user.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById('mobile-nav')).toBeTruthy()
    expect(screen.getByRole('button', { name: /fermer le menu/i })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /fermer le menu/i }))
    expect(document.getElementById('mobile-nav')).toBeNull()
  })
})
