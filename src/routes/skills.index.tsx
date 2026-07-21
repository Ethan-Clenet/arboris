import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import PageShell from '#/components/PageShell'
import { AgentBadge, AgentCompatList, AgentLogoRow } from '#/components/AgentLogo'
import SecurityBadge from '#/components/SecurityBadge'
import { useI18n } from '#/lib/i18n'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getCatalog } from '#/server/functions'
import {
  hexToRgba,
  type Category,
  type SkillSummary,
} from '#/lib/catalog'
import type { SecurityRecommendation } from '#/lib/skillspector'

export const Route = createFileRoute('/skills/')({
  loader: () => getCatalog(),
  component: SkillsPage,
})

const SKILL_TABLE_COLS =
  'grid grid-cols-[minmax(176px,1.05fr)_minmax(140px,1.3fr)_minmax(100px,120px)_minmax(110px,128px)_minmax(180px,auto)_minmax(108px,116px)] items-center gap-x-5'

type SecurityFilter = 'all' | SecurityRecommendation

function SkillsPage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy()

  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [techs, setTechs] = useState<string[]>([])
  const [compat, setCompat] = useState<string[]>([])
  const [security, setSecurity] = useState<SecurityFilter>('all')

  const catById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of catalog.categories) map.set(c.id, c)
    return map
  }, [catalog.categories])

  const techList = useMemo(() => {
    const seen: string[] = []
    for (const s of catalog.skills) for (const x of s.tech) if (!seen.includes(x)) seen.push(x)
    return seen
  }, [catalog.skills])

  const badgeLabels = {
    unscanned: t.skills.securityUnscanned,
    safe: t.skills.securitySafe,
    caution: t.skills.securityCaution,
    unsafe: t.skills.securityUnsafe,
    score: t.skills.securityScore,
  }

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase()
    const match = (s: SkillSummary) => {
      if (cat !== 'all' && s.categoryId !== cat) return false
      if (techs.length && !techs.every((x) => s.tech.includes(x))) return false
      if (compat.length && !compat.every((x) => s.compat.includes(x))) return false
      if (security !== 'all') {
        const tone = s.securityRecommendation ?? 'UNKNOWN'
        if (tone !== security) return false
      }
      if (ql) {
        const c = catById.get(s.categoryId)
        const hay = `${s.id} ${s.tag[lang]} ${s.tech.join(' ')} ${c ? c.label[lang] : ''}`.toLowerCase()
        if (!hay.includes(ql)) return false
      }
      return true
    }
    const list = catalog.skills.filter(match)
    return [...list].sort(
      (a, b) => (b.score ?? -1) - (a.score ?? -1) || a.id.localeCompare(b.id),
    )
  }, [q, cat, techs, compat, security, catalog.skills, catById, lang])

  const securityCounts = useMemo(() => {
    const counts = { SAFE: 0, CAUTION: 0, UNSAFE: 0, UNKNOWN: 0 }
    for (const s of catalog.skills) {
      const tone = s.securityRecommendation ?? 'UNKNOWN'
      counts[tone]++
    }
    return counts
  }, [catalog.skills])

  const hasFilters =
    cat !== 'all' || techs.length > 0 || compat.length > 0 || security !== 'all' || q.trim().length > 0
  const clearAll = () => {
    setQ('')
    setCat('all')
    setTechs([])
    setCompat([])
    setSecurity('all')
  }

  const resultLabel = `${rows.length > 1 ? t.skills.resMany : t.skills.resOne} ${t.skills.resTail(catalog.skills.length)}`

  return (
    <main id="main-content" className="w-full">
      <PageShell as="div" className="pt-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <div className="mb-3 flex items-center gap-2.5 font-mono text-[11.5px] font-medium tracking-[0.02em] text-[var(--accent)]">
              <Icon name="tree" bold />
              <span>{t.skills.kicker}</span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="text-[var(--text-3)]">{catalog.skills.length} skills</span>
            </div>
            <h1 className="mb-2.5 font-display text-[33px] font-semibold leading-[1.1] tracking-[-0.02em]">
              {t.skills.title}
            </h1>
            <p className="max-w-[540px] text-[15px] text-[var(--text-2)]">{t.skills.subtitle}</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skills.worksWith}
            </div>
            <AgentLogoRow agents={catalog.compatOrder} size={16} />
          </div>
        </div>
      </PageShell>

      <PageShell as="div" className="grid items-start gap-7 pt-6 pb-[70px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-[22px] lg:sticky lg:top-[78px]">
          <div className="relative">
            <label htmlFor="skills-search" className="sr-only">
              {t.a11y.searchSkills}
            </label>
            <Icon
              name="magnifying-glass"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
            />
            <input
              id="skills-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.skills.searchPh}
              className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-9 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
            {q.length > 0 && (
              <button
                type="button"
                onClick={() => setQ('')}
                aria-label={t.a11y.clearSearch}
                className="absolute right-2 top-1/2 grid h-[22px] w-[22px] -translate-y-1/2 place-items-center text-[var(--text-3)] hover:text-[var(--text-1)]"
              >
                <Icon name="x" size={13} />
              </button>
            )}
          </div>

          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skills.categories}
            </div>
            <div className="flex flex-col gap-0.5">
              <CategoryButton
                active={cat === 'all'}
                icon="squares-four"
                label={t.skills.allCats}
                count={catalog.skills.length}
                onClick={() => setCat('all')}
              />
              {catalog.categories.map((c) => (
                <CategoryButton
                  key={c.id}
                  active={cat === c.id}
                  icon={c.icon}
                  color={c.color}
                  label={c.label[lang]}
                  count={catalog.skills.filter((s) => s.categoryId === c.id).length}
                  onClick={() => setCat(cat === c.id ? 'all' : c.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skills.security}
            </div>
            <div className="flex flex-col gap-0.5">
              {(
                [
                  ['all', t.skills.securityAll, catalog.skills.length, 'shield'],
                  ['SAFE', t.skills.securitySafe, securityCounts.SAFE, 'shield-check'],
                  ['CAUTION', t.skills.securityCaution, securityCounts.CAUTION, 'warning'],
                  ['UNSAFE', t.skills.securityUnsafe, securityCounts.UNSAFE, 'shield-warning'],
                  ['UNKNOWN', t.skills.securityUnscanned, securityCounts.UNKNOWN, 'shield'],
                ] as const
              ).map(([id, label, count, icon]) => (
                <CategoryButton
                  key={id}
                  active={security === id}
                  icon={icon}
                  label={label}
                  count={count}
                  onClick={() => setSecurity(security === id ? 'all' : id)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skills.compat}
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {catalog.compatOrder.map((name) => {
                const active = compat.includes(name)
                return (
                  <AgentBadge
                    key={name}
                    agent={name}
                    active={active}
                    size={15}
                    onClick={() => setCompat(toggle(compat, name))}
                  />
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skills.tech}
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {techList.map((name) => {
                const active = techs.includes(name)
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTechs(toggle(techs, name))}
                    className={`rounded-md border px-[11px] py-[5px] font-mono text-[11.5px] font-medium transition-colors ${
                      active
                        ? 'border-[var(--border-2)] bg-[var(--text-1)] text-[var(--bg)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-2)]'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-[7px] p-0.5 text-[13px] font-medium text-[var(--accent)]"
            >
              <Icon name="arrow-counter-clockwise" size={14} />
              {t.skills.clear}
            </button>
          )}
        </aside>

        <section>
          <div className="mb-3.5 text-[13.5px] text-[var(--text-2)]">
            <span className="font-semibold text-[var(--text-1)]">{rows.length}</span> {resultLabel}
          </div>

          <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <div className="scroll-x">
              <div className="min-w-[980px]">
                <div className={`${SKILL_TABLE_COLS} border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-[11px] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)] sm:px-[18px]`}>
                  <div>{t.skills.colSkill}</div>
                  <div>{t.skills.colDesc}</div>
                  <div>{t.skills.colSecurity}</div>
                  <div className="min-w-0">{t.skills.colTech}</div>
                  <div className="shrink-0 border-l border-[var(--border)] pl-5">{t.skills.colCompat}</div>
                  <div />
                </div>

                {rows.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    category={catById.get(skill.categoryId)}
                    copied={copiedKey === skill.id}
                    badgeLabels={badgeLabels}
                    onCopy={() => copySkill({ id: skill.id, lang, announceMsg: t.skills.copied })}
                  />
                ))}
              </div>
            </div>

            {rows.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-3.5 grid h-12 w-12 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--text-3)]">
                  <Icon name="magnifying-glass" size={22} />
                </div>
                <div className="mb-1.5 font-display text-[17px] font-semibold">{t.skills.emptyTitle}</div>
                <div className="mb-4 text-[13.5px] text-[var(--text-2)]">{t.skills.emptyBody}</div>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  {t.skills.clear}
                </Button>
              </div>
            )}
          </div>
        </section>
      </PageShell>
    </main>
  )
}

function CategoryButton({
  active,
  icon,
  color,
  label,
  count,
  onClick,
}: {
  active: boolean
  icon: string
  color?: string
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2.5 rounded-[9px] border px-2.5 py-2 text-left text-[13.5px] transition-colors ${
        active
          ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--text-1)]'
          : 'border-transparent text-[var(--text-2)] hover:bg-[var(--surface-hover)]'
      }`}
    >
      <span
        className="grid h-[22px] w-[22px] place-items-center rounded-md"
        style={
          color
            ? { background: hexToRgba(color, 0.14), color }
            : { background: 'var(--surface-2)', color: 'var(--text-2)' }
        }
      >
        <Icon name={icon} size={13} />
      </span>
      <span className={`flex-1 truncate ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
      <span className="font-mono text-[11px] text-[var(--text-3)]">{count}</span>
    </button>
  )
}

function SkillRow({
  skill,
  category,
  copied,
  badgeLabels,
  onCopy,
}: {
  skill: SkillSummary
  category?: Category
  copied: boolean
  badgeLabels: {
    unscanned: string
    safe: string
    caution: string
    unsafe: string
    score: (n: number) => string
  }
  onCopy: () => void
}) {
  const { t, lang } = useI18n()
  const color = category?.color ?? 'var(--text-3)'

  return (
    <div className={`${SKILL_TABLE_COLS} border-b border-[var(--border)] px-4 py-3.5 transition-colors hover:bg-[var(--surface-hover)] sm:px-[18px]`}>
      <Link to="/skills/$id" params={{ id: skill.id }} className="flex min-w-0 items-center gap-[11px] text-[var(--text-1)]">
        <span
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px]"
          style={{ background: category ? hexToRgba(category.color, 0.13) : 'var(--surface-2)', color }}
        >
          <Icon name={skill.icon} bold size={17} />
        </span>
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-mono text-[13.5px] font-semibold">{skill.id}</span>
            <SecurityBadge
              score={skill.score}
              recommendation={skill.securityRecommendation}
              compact
              labels={badgeLabels}
            />
          </span>
          <span className="block text-[11.5px] text-[var(--text-3)]">{category ? category.label[lang] : ''}</span>
        </span>
      </Link>

      <div className="min-w-0 line-clamp-2 text-[13px] leading-[1.4] text-[var(--text-2)]">{skill.tag[lang]}</div>

      <div className="min-w-0">
        <SecurityBadge
          score={skill.score}
          recommendation={skill.securityRecommendation}
          labels={badgeLabels}
        />
      </div>

      <div className="min-w-0 overflow-hidden pr-2" title={skill.tech.join(', ')}>
        {skill.tech.length > 0 ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="max-w-full truncate rounded-md border border-[var(--border)] px-[7px] py-0.5 font-mono text-[10.5px] text-[var(--text-2)]">
              {skill.tech[0]}
            </span>
            {skill.tech.length > 1 ? (
              <span className="shrink-0 font-mono text-[10.5px] text-[var(--text-3)]">+{skill.tech.length - 1}</span>
            ) : null}
          </div>
        ) : (
          <span className="text-[var(--text-3)]">—</span>
        )}
      </div>

      <div className="flex shrink-0 items-center border-l border-[var(--border)] pl-5">
        <AgentCompatList agents={skill.compat} size={15} />
      </div>

      <div className="flex shrink-0 justify-end">
        <Button variant="copy" size="sm" copied={copied} onClick={onCopy}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? t.skills.copied : t.skills.copy}
        </Button>
      </div>
    </div>
  )
}
