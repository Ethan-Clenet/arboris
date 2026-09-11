import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import Icon from './Icon'
import LangSwitch from './LangSwitch'
import ThemeToggle from './ThemeToggle'
import { useI18n } from '#/lib/i18n'

const navBase = 'cursor-pointer rounded-lg px-3 py-[7px] text-[13.5px] transition-colors'
const navInactive = { className: 'font-medium text-[var(--text-2)] hover:text-[var(--text-1)]' }
const navActive = { className: 'font-semibold text-[var(--text-1)] bg-[var(--surface-2)]' }

const NAV_LINKS = [
  { to: '/getting-started' as const, labelKey: 'start' as const },
  { to: '/skills' as const, labelKey: 'skills' as const },
  { to: '/commands' as const, labelKey: 'commands' as const },
  { to: '/collections' as const, labelKey: 'collections' as const },
]

export default function Header() {
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-[14px] backdrop-saturate-150">
      <div className="page-shell-header flex h-[60px] min-w-0 items-center gap-3 sm:gap-6">
        <Link to="/" className="flex min-w-0 flex-shrink-0 cursor-pointer items-center gap-2.5 text-[var(--text-1)]">
          <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-white shadow-[0_2px_8px_var(--accent-soft)]">
            <Icon name="tree" bold size={17} />
          </span>
          <span className="truncate font-mono text-[16px] font-semibold tracking-tight">{t.nav.brand}</span>
        </Link>

        <nav className="ml-1 hidden min-w-0 items-center gap-1 md:flex" aria-label={t.a11y.mainNav}>
          {NAV_LINKS.map(({ to, labelKey }) => (
            <Link
              key={to}
              to={to}
              className={navBase}
              activeProps={navActive}
              inactiveProps={navInactive}
            >
              {t.nav[labelKey]}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 flex-1" />

        <LangSwitch />
        <ThemeToggle />

        <button
          type="button"
          className="grid h-[34px] w-[34px] shrink-0 cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)] md:hidden"
          aria-label={mobileOpen ? t.a11y.closeMenu : t.a11y.openMenu}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <Icon name={mobileOpen ? 'x' : 'list'} size={17} />
        </button>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-[var(--border)] bg-[var(--bg-elev)] md:hidden"
          aria-label={t.a11y.mainNav}
        >
          <div className="page-shell-header flex flex-col gap-1 py-3">
            {NAV_LINKS.map(({ to, labelKey }) => (
              <Link
                key={to}
                to={to}
                className={`${navBase} w-full`}
                activeProps={navActive}
                inactiveProps={navInactive}
                onClick={() => setMobileOpen(false)}
              >
                {t.nav[labelKey]}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
