import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState, type ReactNode } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import PageShell from '#/components/PageShell'
import { AgentBadge, AgentCompatList, AgentLogoRow } from '#/components/AgentLogo'
import SecurityBadge from '#/components/SecurityBadge'
import PublisherLogo from '#/components/PublisherLogo'
import { hasPublisherLogo, PUBLISHER_LOGO_COLOR } from '#/lib/publisher-logos'
import { useI18n } from '#/lib/i18n'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getCatalog } from '#/server/functions'
import {
  hexToRgba,
  type Category,
  type SkillSummary,
} from '#/lib/catalog'
import type { SecurityRecommendation } from '#/lib/skillspector'
import { seoHead } from '#/lib/seo'

export const Route = createFileRoute('/skills/')({
  loader: () => getCatalog(),
  head: () =>
    seoHead({
      title: 'Catalogue complet des skills IA',
      path: '/skills',
      description:
        'Index complet des skills Arboris : filtre par catégorie, techno, agent compatible et score de sûreté.',
    }),
  component: SkillsPage,
})

const SKILL_TABLE_COLS =
  'grid grid-cols-[minmax(0,1.25fr)_minmax(0,1.4fr)_minmax(0,1fr)_5.5rem_7.75rem] items-center gap-x-1.5'

type SecurityFilter = 'all' | SecurityRecommendation

function publisherMeta(name: string): { icon: string; color?: string; logo?: boolean } {
  const known: Record<string, { icon: string; color: string }> = {
    ECC: { icon: 'tree', color: '#1f8a50' },
    Community: { icon: 'users', color: '#4F8FF7' },
    Flox: { icon: 'package', color: '#7C3AED' },
    Brave: { icon: 'shield', color: PUBLISHER_LOGO_COLOR.Brave },
  }
  const base = known[name] ?? { icon: 'buildings', color: '#8a909b' }
  return { ...base, logo: hasPublisherLogo(name) }
}

function truncateListing(text: string, max = 140): string {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1).trimEnd()}…`
}

function SkillsPage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy()

  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  /** Filtre unique sur l’éditeur (metadata.origin), ex. ECC. */
  const [publisher, setPublisher] = useState<string>('all')
  const [compat, setCompat] = useState<string[]>([])
  const [security, setSecurity] = useState<SecurityFilter>('all')

  const catById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of catalog.categories) map.set(c.id, c)
    return map
  }, [catalog.categories])

  const otherPublisher = t.skills.publisherOther

  const publisherList = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of catalog.skills) {
      const key = s.publisher ?? otherPublisher
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
  }, [catalog.skills, otherPublisher])

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
      if (publisher !== 'all') {
        const skillPublisher = s.publisher ?? otherPublisher
        if (skillPublisher !== publisher) return false
      }
      if (compat.length && !compat.every((x) => s.compat.includes(x))) return false
      if (security !== 'all') {
        const tone = s.securityRecommendation ?? 'UNKNOWN'
        if (tone !== security) return false
      }
      if (ql) {
        const c = catById.get(s.categoryId)
        const hay = `${s.id} ${s.tag[lang]} ${s.tech.join(' ')} ${s.publisher ?? ''} ${
          c ? c.label[lang] : ''
        }`.toLowerCase()
        if (!hay.includes(ql)) return false
      }
      return true
    }
    const list = catalog.skills.filter(match)
    return [...list].sort(
      (a, b) => (b.score ?? -1) - (a.score ?? -1) || a.id.localeCompare(b.id),
    )
  }, [q, cat, publisher, compat, security, catalog.skills, catById, lang, otherPublisher])

  const securityCounts = useMemo(() => {
    const counts = { SAFE: 0, CAUTION: 0, UNSAFE: 0, UNKNOWN: 0 }
    for (const s of catalog.skills) {
      const tone = s.securityRecommendation ?? 'UNKNOWN'
      counts[tone]++
    }
    return counts
  }, [catalog.skills])

  const hasFilters =
    cat !== 'all' || publisher !== 'all' || compat.length > 0 || security !== 'all' || q.trim().length > 0
  const clearAll = () => {
    setQ('')
    setCat('all')
    setPublisher('all')
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
        <aside className="flex flex-col gap-[22px] lg:sticky lg:top-[78px] lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1">
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
                className="absolute right-2 top-1/2 grid h-[22px] w-[22px] -translate-y-1/2 cursor-pointer place-items-center text-[var(--text-3)] hover:text-[var(--text-1)]"
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
              {t.skills.publishers}
            </div>
            <div className="flex flex-col gap-0.5">
              <CategoryButton
                active={publisher === 'all'}
                icon="buildings"
                label={t.skills.allPublishers}
                count={catalog.skills.length}
                onClick={() => setPublisher('all')}
              />
              {publisherList.map((p) => {
                const meta = publisherMeta(p.id)
                return (
                  <CategoryButton
                    key={p.id}
                    active={publisher === p.id}
                    icon={meta.icon}
                    color={meta.color}
                    logo={meta.logo ? <PublisherLogo name={p.id} size={13} /> : undefined}
                    label={p.id}
                    count={p.count}
                    onClick={() => setPublisher(publisher === p.id ? 'all' : p.id)}
                  />
                )
              })}
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex cursor-pointer items-center gap-[7px] p-0.5 text-[13px] font-medium text-[var(--accent)]"
            >
              <Icon name="arrow-counter-clockwise" size={14} />
              {t.skills.clear}
            </button>
          )}
        </aside>

        <section>
          <h2 className="mb-3.5 font-display text-[18px] font-semibold text-[var(--text-1)]">
            {t.skills.listHeading}
          </h2>
          <div className="mb-3.5 text-[13.5px] text-[var(--text-2)]">
            <span className="font-semibold text-[var(--text-1)]">{rows.length}</span> {resultLabel}
          </div>

          <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <div className="scroll-x">
              <div className="min-w-[720px]">
                <div className={`${SKILL_TABLE_COLS} border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-[11px] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)] sm:px-[18px]`}>
                  <div>{t.skills.colSkill}</div>
                  <div>{t.skills.colDesc}</div>
                  <div className="min-w-0">{t.skills.colTech}</div>
                  <div className="border-l border-[var(--border)] pl-2">{t.skills.colCompat}</div>
                  <div className="text-right">{t.skills.copy}</div>
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
  logo,
  label,
  count,
  onClick,
}: {
  active: boolean
  icon: string
  color?: string
  logo?: ReactNode
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] border px-2.5 py-2 text-left text-[13.5px] transition-colors ${
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
        {logo ?? <Icon name={icon} size={13} />}
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
      <Link to="/skills/$id" params={{ id: skill.id }} className="flex min-w-0 cursor-pointer items-center gap-[11px] text-[var(--text-1)]">
        <span
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px]"
          style={{ background: category ? hexToRgba(category.color, 0.13) : 'var(--surface-2)', color }}
        >
          <Icon name={skill.icon} bold size={17} />
        </span>
        <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <span className="min-w-0 overflow-hidden">
            <span className="block truncate font-mono text-[13.5px] font-semibold leading-tight">{skill.id}</span>
            <span className="block truncate text-[11.5px] leading-tight text-[var(--text-3)]">
              {category ? category.label[lang] : ''}
            </span>
          </span>
          <SecurityBadge
            score={skill.score}
            recommendation={skill.securityRecommendation}
            compact
            labels={badgeLabels}
          />
        </span>
      </Link>

      <div className="min-w-0 overflow-hidden line-clamp-2 self-center text-[13px] leading-[1.4] text-[var(--text-2)]" title={skill.tag[lang]}>
        {truncateListing(skill.tag[lang], 140)}
      </div>

      <div className="flex min-w-0 items-center overflow-hidden" title={skill.tech.join(', ')}>
        {skill.tech.length > 0 ? (
          <div className="flex h-[22px] min-w-0 max-w-full items-center gap-1.5">
            <span className="min-w-0 truncate rounded-md border border-[var(--border)] px-[7px] py-0.5 font-mono text-[10.5px] leading-none text-[var(--text-2)]">
              {skill.tech[0]}
            </span>
            {skill.tech.length > 1 ? (
              <span className="inline-flex h-[22px] w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] font-mono text-[10.5px] leading-none text-[var(--text-3)]">
                +{skill.tech.length - 1}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-[var(--text-3)]">—</span>
        )}
      </div>

      <div className="flex items-center border-l border-[var(--border)] pl-2">
        <AgentCompatList agents={skill.compat} size={14} />
      </div>

      <div className="flex items-center justify-end">
        <Button variant="copy" size="sm" copied={copied} onClick={onCopy}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? t.skills.copied : t.skills.copy}
        </Button>
      </div>
    </div>
  )
}
