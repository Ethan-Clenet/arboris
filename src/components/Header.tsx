import { Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import Icon from './Icon'
import LangSwitch from './LangSwitch'
import ThemeToggle from './ThemeToggle'
import { ButtonLink } from './Button'
import { useI18n } from '#/lib/i18n'
import { logout } from '#/server/auth.functions'
import { Route as RootRoute } from '#/routes/__root'

const navBase = 'rounded-lg px-3 py-[7px] text-[13.5px] transition-colors'
const navInactive = { className: 'font-medium text-[var(--text-2)] hover:text-[var(--text-1)]' }
const navActive = { className: 'font-semibold text-[var(--text-1)] bg-[var(--surface-2)]' }

export default function Header() {
  const { t } = useI18n()
  const { auth } = RootRoute.useRouteContext()
  const router = useRouter()
  const logoutFn = useServerFn(logout)

  const handleLogout = async () => {
    await logoutFn()
    await router.invalidate()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-[14px] backdrop-saturate-150">
      <div className="page-shell-header flex h-[60px] items-center gap-4 sm:gap-6">
        <Link to="/" className="flex flex-shrink-0 items-center gap-2.5 text-[var(--text-1)]">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-[var(--accent)] text-white shadow-[0_2px_8px_var(--accent-soft)]">
            <Icon name="tree" bold size={17} />
          </span>
          <span className="font-mono text-[16px] font-semibold tracking-tight">{t.nav.brand}</span>
        </Link>

        <nav className="ml-1 flex items-center gap-1" aria-label={t.a11y.mainNav}>
          <Link to="/getting-started" className={navBase} activeProps={navActive} inactiveProps={navInactive}>
            {t.nav.start}
          </Link>
          <Link to="/skills" className={navBase} activeProps={navActive} inactiveProps={navInactive}>
            {t.nav.skills}
          </Link>
        </nav>

        <div className="flex-1" />

        {auth.user ? (
          <div className="hidden items-center gap-2 sm:flex">
            {auth.user.role === 'ADMIN' ? (
              <ButtonLink to="/admin" variant="secondary" size="sm" className="gap-1.5">
                <Icon name="shield-check" size={14} />
                {t.nav.admin}
              </ButtonLink>
            ) : null}
            <span className="max-w-[140px] truncate font-mono text-[12px] text-[var(--text-2)]">
              {auth.user.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
            >
              {t.nav.signOut}
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            search={{ mode: 'login', redirect: '/' }}
            className="hidden rounded-md border border-[var(--border)] px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--text-1)] transition-colors hover:border-[var(--border-2)] sm:inline-flex"
          >
            {t.nav.signIn}
          </Link>
        )}

        <LangSwitch />
        <ThemeToggle />
      </div>
    </header>
  )
}
