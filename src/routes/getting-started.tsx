import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import PageShell from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import CliCommandBar from '#/components/CliCommandBar'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getCatalog } from '#/server/functions'
import {
  hexToRgba,
  type Category,
  type SkillSummary,
} from '#/lib/catalog'

export const Route = createFileRoute('/getting-started')({
  loader: () => getCatalog(),
  component: GettingStartedPage,
})

function GettingStartedPage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy(1700)
  const [stackId, setStackId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const catById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of catalog.categories) map.set(c.id, c)
    return map
  }, [catalog.categories])

  const skillsForStack = (id: string) => catalog.skills.filter((s) => s.stacks.includes(id))

  const active = stackId ? catalog.stacks.find((s) => s.id === stackId) : undefined
  const rows = active ? skillsForStack(active.id) : []
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((skill) => {
      const cat = catById.get(skill.categoryId)
      const haystack = `${skill.id} ${skill.tag[lang]} ${cat?.label[lang] ?? ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [catById, lang, query, rows])

  const pickStack = (id: string) => {
    setStackId(id)
    setQuery('')
  }

  return (
    <PageShell>
      <section className="max-w-[660px] pt-12 pb-2">
        <div className="mb-5 inline-flex items-center gap-[7px] rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-[13px] py-[5px] font-mono text-[11.5px] text-[var(--accent)]">
          <Icon name="seedling" bold size={13} />
          {t.start.eyebrow}
        </div>
        <h1 className="mb-3.5 font-display text-[40px] font-semibold leading-[1.06] tracking-[-0.025em]">
          {t.start.title}
        </h1>
        <p className="text-[17px] text-[var(--text-2)]">{t.start.sub}</p>
      </section>

      {/* 3 étapes */}
      <section className="pt-[26px] pb-1.5">
        <div className="grid gap-3.5 sm:grid-cols-3">
          {t.start.steps.map((s, i) => (
            <div
              key={s.t}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow-card)]"
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent-soft)] font-mono text-[13px] font-semibold text-[var(--accent)]">
                  {i + 1}
                </span>
                <Icon name={s.icon} bold size={18} className="text-[var(--text-3)]" />
              </div>
              <div className="mb-1 font-display text-[15.5px] font-semibold">{s.t}</div>
              <div className="text-[13.5px] leading-[1.5] text-[var(--text-2)]">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Choix de la stack */}
      <section className="pt-[34px]">
        <div className="mb-4">
          <h2 className="mb-1 font-display text-[22px] font-semibold">{t.start.pickTitle}</h2>
          <p className="text-[14px] text-[var(--text-2)]">{t.start.pickSub}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {catalog.stacks.map((k) => {
            const isActive = k.id === stackId
            const count = skillsForStack(k.id).length
            return (
              <button
                key={k.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => pickStack(k.id)}
                className={`flex items-center gap-2.5 rounded-md border py-2 pl-2.5 pr-3.5 text-sm font-medium text-[var(--text-1)] transition-colors ${
                  isActive
                    ? 'border-[var(--border-2)] bg-[var(--surface-hover)]'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]'
                }`}
              >
                <span
                  className="grid h-[30px] w-[30px] place-items-center rounded-lg"
                  style={{ background: hexToRgba(k.color, 0.15), color: k.color }}
                >
                  <Icon name={k.icon} bold size={17} />
                </span>
                <span className="flex flex-col items-start leading-[1.15]">
                  <span>{k.label}</span>
                  <span className="font-mono text-[10.5px] font-medium text-[var(--text-3)]">{count} skills</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Skills recommandés */}
      <section className="pt-6 pb-[70px]">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          {active ? (
            <>
              <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-[18px] lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-4">
                <div className="flex items-center gap-3.5 lg:justify-self-start">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl"
                    style={{ background: hexToRgba(active.color, 0.15), color: active.color }}
                  >
                    <Icon name={active.icon} bold size={23} />
                  </span>
                  <div>
                    <div className="font-display text-[18px] font-semibold">
                      {t.start.recFor} {active.label}
                    </div>
                    <div className="text-[13px] text-[var(--text-2)]">
                      {active.brief[lang]} ·{' '}
                      {query.trim()
                        ? `${filteredRows.length} / ${rows.length} ${t.start.skillsWord}`
                        : `${rows.length} ${t.start.skillsWord}`}
                    </div>
                  </div>
                </div>
                <CliCommandBar
                  args={active.id}
                  copyLabel={t.start.copyCommand}
                  copiedLabel={t.start.copied}
                  className="mx-auto lg:justify-self-center"
                />
                <div className="relative w-full min-w-[220px] sm:max-w-[280px] lg:justify-self-end">
                  <label htmlFor="stack-skills-search" className="sr-only">
                    {t.a11y.searchSkills}
                  </label>
                  <Icon
                    name="magnifying-glass"
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
                  />
                  <input
                    id="stack-skills-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.start.searchPh}
                    className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-9 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                  />
                  {query.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label={t.a11y.clearSearch}
                      className="absolute right-2 top-1/2 grid h-[22px] w-[22px] -translate-y-1/2 place-items-center text-[var(--text-3)] hover:text-[var(--text-1)]"
                    >
                      <Icon name="x" size={13} />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {filteredRows.map((skill) => (
                  <StackSkillCard
                    key={skill.id}
                    skill={skill}
                    category={catById.get(skill.categoryId)}
                    copied={copiedKey === skill.id}
                    onCopy={() => copySkill({ id: skill.id, lang, announceMsg: t.start.copied })}
                  />
                ))}
              </div>
              {filteredRows.length === 0 ? (
                <div className="border-t border-[var(--border)] px-6 py-12 text-center text-[14px] text-[var(--text-3)]">
                  {t.start.searchEmpty}
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-3.5 grid h-12 w-12 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--text-3)]">
                <Icon name="stack" size={22} />
              </div>
              <p className="max-w-[360px] text-[15px] text-[var(--text-2)]">{t.start.pickPrompt}</p>
            </div>
          )}
        </div>

        <div className="mt-3.5 flex items-center gap-2 text-[12.5px] text-[var(--text-3)]">
          <Icon name="info" size={14} />
          {t.start.footHint}
        </div>
      </section>
    </PageShell>
  )
}

function StackSkillCard({
  skill,
  category,
  copied,
  onCopy,
}: {
  skill: SkillSummary
  category?: Category
  copied: boolean
  onCopy: () => void
}) {
  const { t, lang } = useI18n()
  const color = category?.color ?? 'var(--text-3)'
  const tint = category ? hexToRgba(category.color, 0.14) : 'var(--surface-2)'

  return (
    <div className="flex flex-col gap-[11px] rounded-[13px] border border-[var(--border)] bg-[var(--bg)] p-[15px]">
      <div className="flex items-start gap-3">
        <Link
          to="/skills/$id"
          params={{ id: skill.id }}
          className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[10px]"
          style={{ background: tint, color }}
        >
          <Icon name={skill.icon} bold size={19} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to="/skills/$id"
            params={{ id: skill.id }}
            className="block truncate font-mono text-[13.5px] font-semibold text-[var(--text-1)]"
          >
            {skill.id}
          </Link>
          <div className="text-[11.5px] text-[var(--text-3)]">{category ? category.label[lang] : ''}</div>
        </div>
      </div>
      <p className="line-clamp-2 min-h-[39px] text-[13px] leading-[1.5] text-[var(--text-2)]">{skill.tag[lang]}</p>
      <div className="flex items-center gap-2">
        <Button variant="copy" size="sm" copied={copied} className="flex-1" onClick={onCopy}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? t.start.copied : t.start.copy}
        </Button>
        <Link
          to="/skills/$id"
          params={{ id: skill.id }}
          aria-label={t.start.detail}
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px] border border-[var(--border)] text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
        >
          <Icon name="arrow-up-right" bold size={14} />
        </Link>
      </div>
    </div>
  )
}
