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
import { ConfidentialitePage } from '#/routes/confidentialite'
import { MentionsLegalesPage } from '#/routes/mentions-legales'

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

  it('expose les liens mentions légales et confidentialité', () => {
    render(wrap(<AppShell>page</AppShell>))
    const legal = screen.getByRole('navigation', { name: /informations légales/i })
    expect(legal.querySelector('a[href="/mentions-legales"]')?.textContent).toMatch(/mentions légales/i)
    expect(legal.querySelector('a[href="/confidentialite"]')?.textContent).toMatch(/confidentialité/i)
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

describe('pages légales', () => {
  it('présente l’éditeur et l’hébergeur', () => {
    render(wrap(<MentionsLegalesPage />))
    expect(screen.getByRole('heading', { name: 'Mentions légales' })).toBeTruthy()
    expect(screen.getAllByText(/Ethan Clenet/).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'ethan.clenet@outlook.fr' }).length).toBeGreaterThan(0)
    expect(screen.getByText(/Vercel Inc/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'politique de confidentialité' })).toBeTruthy()
  })

  it('décrit les traitements RGPD réellement en place', () => {
    render(wrap(<ConfidentialitePage />))
    expect(screen.getByRole('heading', { name: 'Confidentialité' })).toBeTruthy()
    expect(screen.getByText(/ne propose pas/i)).toBeTruthy()
    expect(screen.getByText(/@vercel\/analytics/)).toBeTruthy()
    expect(screen.getByText(/@vercel\/speed-insights/)).toBeTruthy()
    expect(screen.getByText(/sp-theme/)).toBeTruthy()
    expect(screen.getByText(/bandeau cookies/i)).toBeTruthy()
    expect(screen.getByRole('navigation', { name: /fil d’ariane/i })).toBeTruthy()
  })
})
