import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import Icon from '#/components/Icon'
import PageShell from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import { formatLegalDate, LEGAL_UPDATED } from '#/lib/site'

export type LegalCrumb = {
  to: '/mentions-legales' | '/confidentialite'
  label: string
}

type LegalLayoutProps = {
  eyebrow: string
  icon: string
  title: string
  lead: string
  currentPath: LegalCrumb['to']
  children: ReactNode
}

export default function LegalLayout({
  eyebrow,
  icon,
  title,
  lead,
  currentPath,
  children,
}: LegalLayoutProps) {
  const { t } = useI18n()
  const updated = formatLegalDate(LEGAL_UPDATED)

  return (
    <PageShell className="pt-6 pb-20">
      <nav
        className="mb-[26px] flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-3)]"
        aria-label={t.a11y.breadcrumb}
      >
        <Link to="/" className="cursor-pointer text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
          {t.legal.homeCrumb}
        </Link>
        <Icon name="caret-right" size={12} />
        <span className="text-[var(--text-2)]" aria-current="page">
          {title}
        </span>
      </nav>

      <header className="max-w-[720px] pb-8">
        <div className="mb-5 inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 font-mono text-[11.5px] leading-none text-[var(--text-1)]">
          <span className="grid size-[13px] shrink-0 place-items-center">
            <Icon name={icon} bold size={13} />
          </span>
          <span>{eyebrow}</span>
        </div>
        <h1 className="mb-3.5 font-display text-[36px] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[40px]">
          {title}
        </h1>
        <p className="text-[17px] leading-relaxed text-[var(--text-2)]">{lead}</p>
        <p className="mt-4 font-mono text-[12px] text-[var(--text-3)]">{t.legal.updated(updated)}</p>
      </header>

      <article
        className="max-w-[720px] rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-8"
        data-legal-path={currentPath}
      >
        {children}
      </article>
    </PageShell>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="[&:not(:first-child)]:mt-8">
      <h2 className="mb-3 font-display text-[19px] font-semibold tracking-[-0.02em] text-[var(--text-1)]">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[var(--text-2)]">{children}</div>
    </section>
  )
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>
}

export function LegalLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  const external = href.startsWith('http') || href.startsWith('mailto:')
  return (
    <a
      href={href}
      className="cursor-pointer font-medium text-[var(--text-1)] underline decoration-[var(--border-2)] underline-offset-[3px] transition-colors hover:decoration-[var(--text-2)]"
      {...(external && !href.startsWith('mailto:')
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {children}
    </a>
  )
}
