import type { ReactNode } from 'react'
import Icon from '#/components/Icon'
import PageShell from '#/components/PageShell'

interface StatusPageProps {
  code: string
  title: string
  body: string
  icon: string
  children?: ReactNode
}

export default function StatusPage({ code, title, body, icon, children }: StatusPageProps) {
  return (
    <PageShell className="flex min-h-[52vh] flex-col items-center justify-center py-24 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)] shadow-[var(--shadow-card)]">
        <Icon name={icon} size={28} />
      </div>
      <p className="mb-2 font-mono text-[12px] font-medium tracking-[0.14em] text-[var(--text-3)]">{code}</p>
      <h1 className="mb-3 max-w-[420px] font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[32px]">
        {title}
      </h1>
      <p className="mb-7 max-w-[460px] text-[15px] leading-relaxed text-[var(--text-2)]">{body}</p>
      {children ? <div className="flex flex-wrap items-center justify-center gap-2.5">{children}</div> : null}
    </PageShell>
  )
}
