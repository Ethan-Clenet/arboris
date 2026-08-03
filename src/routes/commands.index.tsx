import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Icon from '#/components/Icon'
import PageShell from '#/components/PageShell'
import { AgentCompatList } from '#/components/AgentLogo'
import { useI18n } from '#/lib/i18n'
import { getCatalog } from '#/server/functions'
import type { CommandSummary } from '#/lib/command-types'
import { seoHead } from '#/lib/seo'

export const Route = createFileRoute('/commands/')({
  loader: () => getCatalog(),
  head: () =>
    seoHead({
      title: 'Slash commands du catalogue',
      path: '/commands',
      description:
        'Slash commands Arboris installables dans ton agent : commit, rebase, revue PR, audit deps…',
    }),
  component: CommandsPage,
})

function CommandsPage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase()
    const list = catalog.commands ?? []
    if (!ql) return list
    return list.filter((c) => {
      const hay = `${c.id} ${c.description[lang]} ${c.preview}`.toLowerCase()
      return hay.includes(ql)
    })
  }, [catalog.commands, q, lang])

  return (
    <main id="main-content" className="w-full">
      <PageShell as="div" className="pt-9 pb-[70px]">
        <div className="mb-8 max-w-[640px]">
          <div className="mb-3 flex items-center gap-2.5 font-mono text-[11.5px] font-medium tracking-[0.02em] text-[var(--accent)]">
            <Icon name="terminal-window" bold />
            <span>{t.commands.kicker}</span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="text-[var(--text-3)]">{catalog.commands.length} commands</span>
          </div>
          <h1 className="mb-2.5 font-display text-[33px] font-semibold leading-[1.1] tracking-[-0.02em]">
            {t.commands.title}
          </h1>
          <p className="max-w-[540px] text-[15px] text-[var(--text-2)]">{t.commands.subtitle}</p>
          <p className="mt-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-[13px] text-[var(--text-2)]">
            <Icon name="info" size={14} className="mr-1.5 inline text-[var(--accent)]" />
            {t.commands.usageBanner}
          </p>
        </div>

        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-[18px] font-semibold text-[var(--text-1)]">
            {t.commands.listHeading}
          </h2>
          <div className="relative max-w-[360px] flex-1">
            <label htmlFor="commands-search" className="sr-only">
              {t.commands.searchPh}
            </label>
            <Icon
              name="magnifying-glass"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
            />
            <input
              id="commands-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.commands.searchPh}
              className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          {rows.map((cmd) => (
            <CommandRow key={cmd.id} command={cmd} />
          ))}
          {rows.length === 0 ? (
            <div className="px-6 py-14 text-center text-[13.5px] text-[var(--text-3)]">{t.commands.empty}</div>
          ) : null}
        </div>
      </PageShell>
    </main>
  )
}

function CommandRow({ command }: { command: CommandSummary }) {
  const { t, lang } = useI18n()
  return (
    <Link
      to="/commands/$id"
      params={{ id: command.id }}
      className="flex cursor-pointer flex-col gap-2 border-b border-[var(--border)] px-4 py-4 transition-colors last:border-b-0 hover:bg-[var(--surface-hover)] sm:flex-row sm:items-center sm:gap-6 sm:px-[18px]"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon name="terminal-window" bold size={17} />
        </span>
        <span className="min-w-0">
          <span className="mb-0.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13.5px] font-semibold text-[var(--text-1)]">/{command.id}</span>
            <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-3)]">
              {t.commands.slash}
            </span>
          </span>
          <span className="line-clamp-2 text-[13px] text-[var(--text-2)]">{command.description[lang]}</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center pl-11 sm:pl-0">
        <AgentCompatList agents={command.compat} size={15} />
      </div>
    </Link>
  )
}
