import { Link } from '@tanstack/react-router'
import Icon from './Icon'
import LangSwitch from './LangSwitch'
import ThemeToggle from './ThemeToggle'
import { useI18n } from '#/lib/i18n'

const navBase = 'rounded-lg px-3 py-[7px] text-[13.5px] transition-colors'
const navInactive = { className: 'font-medium text-[var(--text-2)] hover:text-[var(--text-1)]' }
const navActive = { className: 'font-semibold text-[var(--text-1)] bg-[var(--surface-2)]' }

export default function Header() {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-[14px] backdrop-saturate-150">
      <div className="page-shell-header flex h-[60px] items-center gap-4 sm:gap-6">
        <Link to="/" className="flex flex-shrink-0 items-center gap-2.5 text-[var(--text-1)]">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-[var(--accent)] text-white shadow-[0_2px_8px_var(--accent-soft)]">
            <Icon name="tree" bold size={17} />
          </span>
          <span className="font-mono text-[16px] font-semibold tracking-tight">{t.nav.brand}</span>
        </Link>

        <nav className="ml-1 flex items-center gap-1">
          <Link to="/getting-started" className={navBase} activeProps={navActive} inactiveProps={navInactive}>
            {t.nav.start}
          </Link>
          <Link to="/skills" className={navBase} activeProps={navActive} inactiveProps={navInactive}>
            {t.nav.skills}
          </Link>
        </nav>

        <div className="flex-1" />

        <LangSwitch />
        <ThemeToggle />
      </div>
    </header>
  )
}
