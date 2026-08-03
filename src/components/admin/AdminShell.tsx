import { Link, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import Icon from '#/components/Icon'
import LangSwitch from '#/components/LangSwitch'
import { Button } from '#/components/Button'
import type { AdminView } from '#/lib/admin-constants'
import { userInitials } from '#/lib/admin-constants'
import { useI18n } from '#/lib/i18n'
import { toggleTheme, useTheme } from '#/lib/theme'
import { logout } from '#/server/auth.functions'

const NAV_ITEMS: { id: AdminView; icon: string }[] = [
  { id: 'overview', icon: 'squares-four' },
  { id: 'skills', icon: 'stack' },
  { id: 'create', icon: 'plus-circle' },
  { id: 'cats', icon: 'tag' },
  { id: 'technos', icon: 'circuitry' },
]

interface AdminSidebarProps {
  view: AdminView
  expanded: boolean
  onHover: (hover: boolean) => void
  onNavigate: (view: AdminView) => void
  onStartCreate: () => void
}

export default function AdminSidebar({
  view,
  expanded,
  onHover,
  onNavigate,
  onStartCreate,
}: AdminSidebarProps) {
  const { t } = useI18n()
  const a = t.admin
  const router = useRouter()
  const logoutFn = useServerFn(logout)
  const theme = useTheme()
  const [themeBtn, setThemeBtn] = useState<HTMLButtonElement | null>(null)

  const showLabels = expanded
  const width = expanded ? 'w-[238px]' : 'w-[72px]'

  const handleLogout = async () => {
    await logoutFn()
    await router.invalidate()
  }

  return (
    <aside
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`sticky top-0 z-20 flex h-screen flex-none flex-col gap-1.5 overflow-hidden border-r border-[var(--border)] bg-[var(--bg-elev)] p-3 transition-[width] duration-[240ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${width}`}
    >
      <div className="mb-2 flex h-10 items-center gap-2.5 px-1.5">
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] bg-[var(--accent)] text-white">
          <Icon name="tree" bold size={19} />
        </span>
        <span
          className={`whitespace-nowrap font-mono text-[16px] font-semibold tracking-tight transition-opacity duration-[180ms] ${
            showLabels ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {t.nav.brand}
        </span>
      </div>

      <nav className="flex flex-col gap-0.5" aria-label={a.nav.overview}>
        {NAV_ITEMS.map((item) => {
          const active = view === item.id || (item.id === 'create' && view === 'create')
          const label = a.nav[item.id]
          const go = () => {
            if (item.id === 'create') onStartCreate()
            else onNavigate(item.id)
          }
          return (
            <button
              key={item.id}
              type="button"
              title={label}
              onClick={go}
              className={`relative flex h-[42px] cursor-pointer items-center gap-3 rounded-[10px] border-0 px-2.5 text-left transition-colors hover:bg-[var(--surface-hover)] ${
                active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-transparent text-[var(--text-2)]'
              }`}
            >
              <span
                className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-[3px]"
                style={{ background: active ? 'var(--accent)' : 'transparent' }}
              />
              <span className="grid h-6 w-6 flex-none place-items-center">
                <Icon name={item.icon} bold size={19} />
              </span>
              <span
                className={`whitespace-nowrap text-[14px] transition-opacity duration-[180ms] ${
                  active ? 'font-semibold' : 'font-medium'
                } ${showLabels ? 'opacity-100' : 'opacity-0'}`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      <span className="flex-1" />

      <div className="flex flex-col gap-0.5 border-t border-[var(--border)] pt-2">
        <button
          ref={setThemeBtn}
          type="button"
          title={a.theme}
          onClick={() => toggleTheme(themeBtn)}
          className="flex h-10 cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-2.5 text-[var(--text-2)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-1)]"
        >
          <span className="grid h-6 w-6 flex-none place-items-center">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
          </span>
          <span
            className={`whitespace-nowrap text-[14px] transition-opacity duration-[180ms] ${
              showLabels ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {a.theme}
          </span>
        </button>
        <Link
          to="/"
          title={a.viewSite}
          className="flex h-10 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 text-[var(--text-2)] no-underline transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-1)]"
        >
          <span className="grid h-6 w-6 flex-none place-items-center">
            <Icon name="arrow-square-out" bold size={18} />
          </span>
          <span
            className={`whitespace-nowrap text-[14px] transition-opacity duration-[180ms] ${
              showLabels ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {a.viewSite}
          </span>
        </Link>
        <button
          type="button"
          title={a.logout}
          onClick={handleLogout}
          className="flex h-10 cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-2.5 text-[var(--text-2)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
        >
          <span className="grid h-6 w-6 flex-none place-items-center">
            <Icon name="sign-out" bold size={18} />
          </span>
          <span
            className={`whitespace-nowrap text-[14px] transition-opacity duration-[180ms] ${
              showLabels ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {a.logout}
          </span>
        </button>
      </div>
    </aside>
  )
}

interface AdminHeaderProps {
  title: string
  subtitle: string
  userName: string
  onStartCreate: () => void
}

export function AdminHeader({ title, subtitle, userName, onStartCreate }: AdminHeaderProps) {
  const { t } = useI18n()
  const a = t.admin

  return (
    <header className="sticky top-0 z-[15] flex h-16 items-center gap-[18px] border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] px-7 backdrop-blur-[12px] backdrop-saturate-[140%]">
      <div className="min-w-0">
        <div className="font-[family-name:var(--font-display)] text-[18px] font-semibold leading-tight tracking-tight">
          {title}
        </div>
        <div className="text-[12.5px] text-[var(--text-3)]">{subtitle}</div>
      </div>
      <div className="flex-1" />
      <LangSwitch accent />
      <Button variant="primary" size="sm" onClick={onStartCreate} className="gap-1.5 rounded-[9px] px-3.5 py-2">
        <Icon name="plus" bold size={15} />
        {a.newSkill}
      </Button>
      <div className="flex items-center gap-2 border-l border-[var(--border)] pl-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent-soft)] font-mono text-[12px] font-semibold text-[var(--accent)]">
          {userInitials(userName)}
        </span>
      </div>
    </header>
  )
}
