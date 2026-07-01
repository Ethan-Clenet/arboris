import Icon from './Icon'
import { toggleTheme, useTheme } from '#/lib/theme'
import { useI18n } from '#/lib/i18n'

export default function ThemeToggle() {
  const theme = useTheme()
  const { t } = useI18n()

  return (
    <button
      type="button"
      title={t.nav.theme}
      aria-label={t.nav.theme}
      onClick={(e) => toggleTheme(e.currentTarget)}
      className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
    </button>
  )
}
