import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Icon from '#/components/Icon'
import { ButtonLink } from '#/components/Button'
import { ShimmerButtonLink } from '#/components/ui/shimmer-button'
import PageShell from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getCatalog } from '#/server/functions'
import { AgentCompatList, AgentLogoRow } from '#/components/AgentLogo'
import SecurityBadge from '#/components/SecurityBadge'
import { seoHead } from '#/lib/seo'
import {
  hexToRgba,
  type Category,
  type SkillSummary,
} from '#/lib/catalog'

export const Route = createFileRoute('/')({
  loader: () => getCatalog(),
  head: () =>
    seoHead({
      path: '/',
      description:
        'Arboris — index des skills et slash commands pour Cursor, Claude, Codex et Copilot. Zéro config.',
    }),
  component: HomePage,
})

type TabMode = 'popular' | 'trending' | 'recent'

const TABLE_COLS =
  'grid grid-cols-[minmax(168px,1.2fr)_minmax(120px,0.9fr)_minmax(118px,128px)_56px_minmax(148px,160px)] items-center gap-x-5'

const HOME_INDEX_LIMIT = 10

function HomePage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<TabMode>('popular')

  const catById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of catalog.categories) map.set(c.id, c)
    return map
  }, [catalog.categories])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog.skills
    return catalog.skills.filter((s) => {
      const cat = catById.get(s.categoryId)
      const hay = `${s.id} ${s.tag[lang]} ${s.tech.join(' ')} ${cat ? cat.label[lang] : ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, catalog.skills, catById, lang])

  const rows = useMemo(() => {
    const list = [...filtered]
    let sorted: SkillSummary[]
    if (tab === 'popular') {
      sorted = list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.id.localeCompare(b.id))
    } else if (tab === 'trending') {
      sorted = list.sort(
        (a, b) => b.stacks.length - a.stacks.length || (b.score ?? -1) - (a.score ?? -1) || a.id.localeCompare(b.id),
      )
    } else {
      sorted = list.sort((a, b) => a.id.localeCompare(b.id))
    }
    return sorted.slice(0, HOME_INDEX_LIMIT)
  }, [filtered, tab])

  const tabs: { id: TabMode; label: string; icon: string }[] = [
    { id: 'popular', label: t.home.tabPopular, icon: 'star' },
    { id: 'trending', label: t.home.tabTrending, icon: 'chart-line-up' },
    { id: 'recent', label: t.home.tabRecent, icon: 'clock' },
  ]

  return (
    <PageShell>
      {/* Hero */}
      <section className="grid items-center gap-11 pt-14 pb-8 lg:grid-cols-[1fr_470px]">
        <div className="rise-in">
          <div className="mb-[22px] inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 font-mono text-[11.5px] leading-none text-[var(--accent)]">
            <span className="grid size-[13px] shrink-0 place-items-center">
              <Icon name="leaf" bold size={13} />
            </span>
            <span>{t.home.eyebrow}</span>
          </div>
          <h1 className="mb-[18px] max-w-[560px] whitespace-pre-line font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[52px]">
            {t.home.title}
          </h1>
          <p className="mb-7 max-w-[460px] text-[17px] text-[var(--text-2)]">{t.home.sub}</p>

          <div className="flex flex-wrap items-center gap-2.5">
            <ShimmerButtonLink to="/skills" className="px-4 py-2.5 text-sm">
              <Icon name="list-magnifying-glass" size={16} />
              {t.home.openIndex}
            </ShimmerButtonLink>
            <ButtonLink to="/skills/$id" params={{ id: 'fastapi-patterns' }} variant="secondary" size="lg">
              {t.home.example}
            </ButtonLink>
          </div>

          <div className="mt-[30px] flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)]">
              {t.home.worksWith}
            </span>
            <AgentLogoRow agents={catalog.compatOrder} size={16} />
          </div>
        </div>

        {/* Terminal mockup */}
        <div className="rise-in overflow-hidden rounded-[14px] border border-[#20242c] bg-[#0d1117] shadow-[0_22px_60px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-[7px] border-b border-[#20242c] bg-[#161b22] px-3.5 py-[11px]">
            <span className="h-[11px] w-[11px] rounded-full bg-[#ED6A5E]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#F4BF4F]" />
            <span className="h-[11px] w-[11px] rounded-full bg-[#61C554]" />
            <span className="ml-2 font-mono text-[11.5px] text-[#6B7280]">agent — zsh</span>
          </div>
          <div className="p-5 font-mono text-[13.5px] leading-[1.95] text-[#C9D1D9]">
            <div>
              <span className="text-[#30A46C]">$</span> npm i <span className="text-[#9BCB3C]">arboris-cli</span>
            </div>
            <div className="text-[#3ECF8E]">✓ {t.home.termInstallOk}</div>
            <div className="mt-1">
              <span className="text-[#30A46C]">$</span> npx <span className="text-[#9BCB3C]">arboris-cli</span> list
            </div>
            <div className="text-[#6B7280]">{t.home.termListLine1}</div>
            <div className="text-[#6B7280]">{t.home.termListLine2}</div>
            <div className="text-[#3ECF8E]">
              {t.home.termListMore}
              <span className="ml-[5px] inline-block h-4 w-2 -translate-y-[2px] bg-[#3ECF8E] align-middle [animation:sp-blink_1.1s_steps(1)_infinite]" />
            </div>
          </div>
        </div>
      </section>

      {/* Index tableau */}
      <section className="pt-6 pb-[70px]">
        <h2 className="mb-3 font-display text-[18px] font-semibold text-[var(--text-1)]">
          {t.home.listHeading}
        </h2>
        <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-2)] px-3 pt-2 sm:px-4">
            <div className="flex flex-wrap items-end gap-0.5" role="tablist" aria-label={t.home.indexTitle}>
              {tabs.map((item) => {
                const active = tab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(item.id)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-t-[10px] border px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                      active
                        ? 'relative z-[1] -mb-px border-[var(--border)] border-b-[var(--surface)] bg-[var(--surface)] text-[var(--text-1)]'
                        : 'border-transparent text-[var(--text-3)] hover:text-[var(--text-2)]'
                    }`}
                  >
                    <Icon name={item.icon} size={14} bold={active} />
                    {item.label}
                  </button>
                )
              })}
            </div>
            <div className="relative mb-2 w-full min-w-[200px] max-w-[260px] sm:mb-2.5">
              <label htmlFor="home-search" className="sr-only">
                {t.a11y.filterSkills}
              </label>
              <Icon
                name="magnifying-glass"
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
              />
              <input
                id="home-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.home.searchPh}
                className="h-9 w-full rounded-[9px] border border-[var(--border)] bg-[var(--surface)] pl-[34px] pr-3 font-mono text-[12px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </div>
          </div>

          <div className="scroll-x">
            <div className="min-w-[720px]">
              <div
                className={`${TABLE_COLS} border-b border-[var(--border)] px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[var(--text-3)] sm:px-5`}
              >
                <div />
                <div>{t.home.colCategory}</div>
                <div>{t.skills.colSecurity}</div>
                <div className="text-center">{t.home.colStacks}</div>
                <div className="border-l border-[var(--border)] pl-5">{t.home.colCompat}</div>
              </div>

              {rows.map((skill) => (
                <HomeTableRow
                  key={skill.id}
                  skill={skill}
                  category={catById.get(skill.categoryId)}
                  copied={copiedKey === skill.id}
                  onCopy={() => copySkill({ id: skill.id, lang, announceMsg: t.home.copied })}
                />
              ))}

              {rows.length === 0 ? (
                <div className="px-6 py-14 text-center text-[13.5px] text-[var(--text-3)]">{t.home.empty}</div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 sm:px-5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.home.footerCount(catalog.skills.length)}
            </span>
            <Link
              to="/skills"
              className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)] transition-colors hover:text-[var(--accent)]"
            >
              {t.home.footerLink}
              <Icon name="arrow-right" size={12} />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function HomeTableRow({
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
  const { t } = useI18n()
  const color = category?.color ?? 'var(--text-3)'
  const badgeLabels = {
    unscanned: t.skills.securityUnscanned,
    safe: t.skills.securitySafe,
    caution: t.skills.securityCaution,
    unsafe: t.skills.securityUnsafe,
    score: t.skills.securityScore,
  }

  return (
    <div
      className={`group ${TABLE_COLS} border-b border-[var(--border)] px-4 py-3 transition-colors last:border-b-0 hover:bg-[var(--surface-hover)] sm:px-5`}
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
        <Link
          to="/skills/$id"
          params={{ id: skill.id }}
          className="min-w-0 cursor-pointer truncate font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-press)]"
        >
          {skill.id}
        </Link>
        <SecurityBadge
          score={skill.score}
          recommendation={skill.securityRecommendation}
          compact
          labels={badgeLabels}
        />
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? t.home.copied : t.home.copy}
          title={copied ? t.home.copied : t.home.copy}
          className={`grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md border text-[var(--text-3)] opacity-0 transition-all group-hover:opacity-100 ${
            copied
              ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] opacity-100'
              : 'border-[var(--border)] hover:border-[var(--border-2)] hover:text-[var(--text-1)]'
          }`}
        >
          <Icon name={copied ? 'check' : 'copy'} size={12} />
        </button>
      </div>

      <div className="flex min-w-0 items-center gap-2 text-[var(--text-3)]">
        <span
          className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px]"
          style={{ background: category ? hexToRgba(category.color, 0.14) : 'var(--surface-2)', color }}
        >
          <Icon name={category?.icon ?? 'folder'} size={11} />
        </span>
        <span className="truncate font-mono text-[12px]">/{category?.id ?? skill.categoryId}</span>
      </div>

      <div className="flex items-center">
        <SecurityBadge
          score={skill.score}
          recommendation={skill.securityRecommendation}
          labels={badgeLabels}
        />
      </div>

      <div className="text-center font-mono text-[13px] tabular-nums text-[var(--text-2)]">
        {skill.stacks.length || '—'}
      </div>

      <div className="flex min-w-[148px] items-center border-l border-[var(--border)] pl-5">
        <AgentCompatList agents={skill.compat} size={15} />
      </div>
    </div>
  )
}
