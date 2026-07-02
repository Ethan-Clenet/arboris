import { useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import Footer from '#/components/Footer'
import Header from '#/components/Header'
import { useI18n } from '#/lib/i18n'

/** Masque header/footer sur la page auth (layout plein écran). */
export default function AppShell({ children }: { children: ReactNode }) {
  const isFullscreen = useRouterState({
    select: (s) => s.location.pathname === '/auth' || s.location.pathname.startsWith('/admin'),
  })
  const { t } = useI18n()

  if (isFullscreen) {
    return <>{children}</>
  }

  return (
    <div className="app-shell bg-[var(--bg)] text-[var(--text-1)]">
      <a href="#main-content" className="skip-link">
        {t.a11y.skipToContent}
      </a>
      <Header />
      <div className="app-main">{children}</div>
      <Footer />
    </div>
  )
}
