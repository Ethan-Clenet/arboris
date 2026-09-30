import { Link } from '@tanstack/react-router'
import Icon from './Icon'
import { useI18n } from '#/lib/i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-[var(--border)] py-[22px]">
      <div className="page-shell flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[12.5px] text-[var(--text-3)]">
            <span className="grid h-[22px] w-[22px] place-items-center rounded-md bg-[var(--accent)] text-white">
              <Icon name="tree" bold size={12} />
            </span>
            {t.home.footer}
          </div>
          <Link to="/skills" className="cursor-pointer text-[12.5px] text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
            {t.home.browseAll} →
          </Link>
          <Link to="/commands" className="cursor-pointer text-[12.5px] text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
            {t.nav.commands} →
          </Link>
          <Link to="/collections" className="cursor-pointer text-[12.5px] text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
            {t.nav.collections} →
          </Link>
        </div>
        <nav
          className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--border)] pt-3 text-[12px] text-[var(--text-3)]"
          aria-label={t.a11y.legalNav}
        >
          <span className="font-medium text-[var(--text-3)]">{t.a11y.legalNav}</span>
          <Link
            to="/mentions-legales"
            className="cursor-pointer text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
          >
            {t.legal.mentions}
          </Link>
          <Link
            to="/confidentialite"
            className="cursor-pointer text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
          >
            {t.legal.privacy}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
