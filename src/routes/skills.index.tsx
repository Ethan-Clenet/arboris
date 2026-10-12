import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import CliCommandBar from '#/components/CliCommandBar'
import PageShell from '#/components/PageShell'
import { AgentBadge, AgentCompatList, AgentLogoRow } from '#/components/AgentLogo'
import SecurityBadge from '#/components/SecurityBadge'
import PublisherLogo from '#/components/PublisherLogo'
import LangText from '#/components/LangText'
import { hasPublisherLogo, PUBLISHER_LOGO_COLOR } from '#/lib/publisher-logos'
import { useI18n } from '#/lib/i18n'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getSkillsListPage } from '#/server/functions'
import { hexToRgba, skillLabel, type Category } from '#/lib/catalog'
import {
  parseCompatFilter,
  parseSkillsSearch,
  skillsListPath,
  type SkillListItem,
  type SkillsSearch,
} from '#/lib/skills-list'
import type { SecurityRecommendation } from '#/lib/skillspector'
import { absoluteUrl, seoHead } from '#/lib/seo'

export const Route = createFileRoute('/skills/')({
  validateSearch: (search: Record<string, unknown>): SkillsSearch => parseSkillsSearch(search),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getSkillsListPage({ data: deps }),
  pendingMs: 0,
  pendingComponent: SkillsPending,
  head: ({ loaderData }) => {
    const extraLinks: Array<{ rel: string; href: string }> = []
    if (loaderData && loaderData.page > 1) {
      extraLinks.push({
        rel: 'prev',
        href: absoluteUrl(skillsListPath({ ...loaderData.search, page: loaderData.page - 1 })),
      })
    }
    if (loaderData && loaderData.page < loaderData.pageCount) {
      extraLinks.push({
        rel: 'next',
        href: absoluteUrl(skillsListPath({ ...loaderData.search, page: loaderData.page + 1 })),
      })
    }
    return seoHead({
      title: 'Catalogue complet des skills IA',
      path: loaderData?.path ?? '/skills',
      description:
        'Index complet des skills Arboris : filtre par catégorie, techno, agent compatible et score de sûreté.',
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Skills', path: '/skills' },
      ],
      extraLinks,
    })
  },
  component: SkillsPage,
})

const SKILL_TABLE_COLS =
  'grid grid-cols-[minmax(0,1.25fr)_minmax(0,1.6fr)_5.5rem_7.75rem] items-center gap-x-1.5'

const SKELETON_ROWS = 6

type SecurityFilter = 'all' | SecurityRecommendation

function publisherMeta(name: string): { icon: string; color?: string; logo?: boolean } {
  const known: Record<string, { icon: string; color: string }> = {
    ECC: { icon: 'tree', color: PUBLISHER_LOGO_COLOR.ECC },
    'affaan-m': { icon: 'tree', color: PUBLISHER_LOGO_COLOR['affaan-m'] },
    Arboris: { icon: 'tree', color: PUBLISHER_LOGO_COLOR.Arboris },
    Microsoft: { icon: 'squares-four', color: PUBLISHER_LOGO_COLOR.Microsoft },
    Community: { icon: 'users', color: '#4F8FF7' },
    Flox: { icon: 'package', color: '#7C3AED' },
    Brave: { icon: 'shield', color: PUBLISHER_LOGO_COLOR.Brave },
    Angular: { icon: 'code', color: PUBLISHER_LOGO_COLOR.Angular },
    Anthropic: { icon: 'sparkle', color: PUBLISHER_LOGO_COLOR.Anthropic },
    Apollo: { icon: 'share-network', color: PUBLISHER_LOGO_COLOR.Apollo },
    'Better Auth': { icon: 'lock-key', color: PUBLISHER_LOGO_COLOR['Better Auth'] },
    Auth0: { icon: 'shield-check', color: PUBLISHER_LOGO_COLOR.Auth0 },
    Browserbase: { icon: 'browser', color: PUBLISHER_LOGO_COLOR.Browserbase },
    Cloudflare: { icon: 'cloud', color: PUBLISHER_LOGO_COLOR.Cloudflare },
    CodeRabbit: { icon: 'git-pull-request', color: PUBLISHER_LOGO_COLOR.CodeRabbit },
    Cypress: { icon: 'flask', color: PUBLISHER_LOGO_COLOR.Cypress },
    Gemini: { icon: 'sparkle', color: PUBLISHER_LOGO_COLOR.Gemini },
    Stitch: { icon: 'palette', color: PUBLISHER_LOGO_COLOR.Stitch },
    'Google Workspace': { icon: 'google-logo', color: PUBLISHER_LOGO_COLOR['Google Workspace'] },
    Vercel: { icon: 'triangle', color: '#EDEDED' },
    Neon: { icon: 'database', color: PUBLISHER_LOGO_COLOR.Neon },
    Flutter: { icon: 'device-mobile', color: PUBLISHER_LOGO_COLOR.Flutter },
    Kotlin: { icon: 'code', color: PUBLISHER_LOGO_COLOR.Kotlin },
    Swift: { icon: 'device-mobile', color: PUBLISHER_LOGO_COLOR.Swift },
    Figma: { icon: 'pen-nib', color: PUBLISHER_LOGO_COLOR.Figma },
    'Hugging Face': { icon: 'robot', color: PUBLISHER_LOGO_COLOR['Hugging Face'] },
    'Nous Research': { icon: 'sparkle', color: PUBLISHER_LOGO_COLOR['Nous Research'] },
    TanStack: { icon: 'code', color: PUBLISHER_LOGO_COLOR.TanStack },
    Ollama: { icon: 'cpu', color: PUBLISHER_LOGO_COLOR.Ollama },
    vinta: { icon: 'code', color: PUBLISHER_LOGO_COLOR.vinta },
    Context7: { icon: 'book-open-text', color: PUBLISHER_LOGO_COLOR.Context7 },
    FastAPI: { icon: 'lightning', color: PUBLISHER_LOGO_COLOR.FastAPI },
    Supabase: { icon: 'database', color: PUBLISHER_LOGO_COLOR.Supabase },
    PyTorch: { icon: 'flame', color: PUBLISHER_LOGO_COLOR.PyTorch },
    '.NET': { icon: 'code', color: PUBLISHER_LOGO_COLOR['.NET'] },
    Storybook: { icon: 'book-open-text', color: PUBLISHER_LOGO_COLOR.Storybook },
    Alibaba: { icon: 'cloud', color: PUBLISHER_LOGO_COLOR.Alibaba },
    Ansible: { icon: 'gear-six', color: PUBLISHER_LOGO_COLOR.Ansible },
    Prisma: { icon: 'diamonds-four', color: PUBLISHER_LOGO_COLOR.Prisma },
    NextLevelBuilder: { icon: 'palette', color: PUBLISHER_LOGO_COLOR.NextLevelBuilder },
  }
  const base = known[name] ?? { icon: 'buildings', color: '#8a909b' }
  return { ...base, logo: hasPublisherLogo(name) }
}

function SkillsPending() {
  const { t } = useI18n()
  return (
    <main id="main-content" className="w-full" aria-busy="true" aria-label={t.skills.loadingMore}>
      <PageShell as="div" className="pt-9">
        <div className="max-w-[640px]">
          <div className="skel mb-3 h-3.5 w-40" />
          <div className="skel mb-2.5 h-9 w-[280px] max-w-full" />
          <div className="skel h-4 w-full max-w-[480px]" />
        </div>
      </PageShell>
      <PageShell as="div" className="grid items-start gap-7 pt-6 pb-[70px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3" aria-hidden>
          <div className="skel h-10 w-full rounded-[10px]" />
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skel h-9 w-full rounded-[9px]" />
          ))}
        </aside>
        <section>
          <div className="skel mb-3.5 h-5 w-64" />
          <div className="skel mb-3.5 h-4 w-32" />
          <SkillsTableSkeleton rows={SKELETON_ROWS} />
        </section>
      </PageShell>
    </main>
  )
}

function SkillsPage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy()
  const [qDraft, setQDraft] = useState(search.q ?? '')

  useEffect(() => {
    setQDraft(search.q ?? '')
  }, [search.q])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = qDraft.trim()
      if ((search.q ?? '') === next) return
      void navigate({
        search: (prev) => parseSkillsSearch({ ...prev, q: next || undefined, page: undefined }),
        replace: true,
      })
    }, 300)
    return () => window.clearTimeout(handle)
  }, [qDraft, navigate, search.q])

  const patchSearch = (patch: Partial<SkillsSearch>) => {
    void navigate({
      search: (prev) => parseSkillsSearch({ ...prev, ...patch, page: undefined }),
      replace: true,
    })
  }

  const cat = search.cat ?? 'all'
  const publisher = search.publisher ?? 'all'
  const compat = parseCompatFilter(search.compat)
  const security = (search.security as SecurityFilter | undefined) ?? 'all'

  const catById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of data.categories) map.set(c.id, c)
    return map
  }, [data.categories])

  const badgeLabels = {
    unscanned: t.skills.securityUnscanned,
    safe: t.skills.securitySafe,
    caution: t.skills.securityCaution,
    unsafe: t.skills.securityUnsafe,
    score: t.skills.securityScore,
  }

  const toggleCompat = (name: string) => {
    const next = compat.includes(name) ? compat.filter((x) => x !== name) : [...compat, name]
    patchSearch({ compat: next.length ? next.join(',') : undefined })
  }

  const hasFilters =
    cat !== 'all' || publisher !== 'all' || compat.length > 0 || security !== 'all' || Boolean(search.q)
  const clearAll = () => {
    setQDraft('')
    void navigate({ search: {}, replace: true })
  }

  const resultLabel = `${data.total > 1 ? t.skills.resMany : t.skills.resOne} ${t.skills.resTail(data.totalUnfiltered)}`
  const publisherInstallCount =
    publisher === 'all' ? 0 : (data.facets.byPublisher.find((p) => p.id === publisher)?.count ?? 0)
  const showPublisherInstall = publisher !== 'all' && publisherInstallCount > 0

  return (
    <main id="main-content" className="w-full">
      <PageShell as="div" className="pt-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[640px]">
            <div className="mb-3 flex items-center gap-2.5 font-mono text-[11.5px] font-medium tracking-[0.02em] text-[var(--text-1)]">
              <Icon name="tree" bold />
              <span>{t.skills.kicker}</span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="text-[var(--text-3)]">{data.totalUnfiltered} skills</span>
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
            <AgentLogoRow agents={data.compatOrder} size={16} />
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
              value={qDraft}
              onChange={(e) => setQDraft(e.target.value)}
              placeholder={t.skills.searchPh}
              className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-9 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
            {qDraft.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQDraft('')
                  patchSearch({ q: undefined })
                }}
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
                count={data.facets.total}
                onClick={() => patchSearch({ cat: undefined })}
              />
              {data.categories.map((c) => (
                <CategoryButton
                  key={c.id}
                  active={cat === c.id}
                  icon={c.icon}
                  color={c.color}
                  label={c.label[lang]}
                  count={data.facets.byCategory[c.id] ?? 0}
                  onClick={() => patchSearch({ cat: cat === c.id ? undefined : c.id })}
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
                  ['all', t.skills.securityAll, data.facets.total, 'shield'],
                  ['SAFE', t.skills.securitySafe, data.facets.bySecurity.SAFE, 'shield-check'],
                  ['CAUTION', t.skills.securityCaution, data.facets.bySecurity.CAUTION, 'warning'],
                  ['UNSAFE', t.skills.securityUnsafe, data.facets.bySecurity.UNSAFE, 'shield-warning'],
                  ['UNKNOWN', t.skills.securityUnscanned, data.facets.bySecurity.UNKNOWN, 'shield'],
                ] as const
              ).map(([id, label, count, icon]) => (
                <CategoryButton
                  key={id}
                  active={security === id}
                  icon={icon}
                  label={label}
                  count={count}
                  onClick={() =>
                    patchSearch({
                      security: security === id || id === 'all' ? undefined : id,
                    })
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skills.compat}
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {data.compatOrder.map((name) => {
                const active = compat.includes(name)
                return (
                  <AgentBadge
                    key={name}
                    agent={name}
                    active={active}
                    size={15}
                    onClick={() => toggleCompat(name)}
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
                count={data.facets.total}
                onClick={() => patchSearch({ publisher: undefined })}
              />
              {data.facets.byPublisher.map((p) => {
                const meta = publisherMeta(p.id)
                return (
                  <CategoryButton
                    key={p.id}
                    active={publisher === p.id}
                    icon={meta.icon}
                    color={meta.color}
                    logo={meta.logo ? <PublisherLogo name={p.id} size={16} /> : undefined}
                    label={p.id}
                    count={p.count}
                    onClick={() => patchSearch({ publisher: publisher === p.id ? undefined : p.id })}
                  />
                )
              })}
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex cursor-pointer items-center gap-[7px] p-0.5 text-[13px] font-medium text-[var(--accent-text)]"
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
            <span className="font-semibold text-[var(--text-1)]">{data.total}</span> {resultLabel}
          </div>

          {showPublisherInstall ? (
            <div className="mb-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
              <div className="mb-1 flex items-center gap-2 text-[13px] font-semibold text-[var(--text-1)]">
                <Icon name="terminal-window" size={16} className="text-[var(--accent-text)]" />
                {t.skills.installAllTitle(publisher)}
              </div>
              <p className="mb-3 text-[12.5px] text-[var(--text-2)]">
                {t.skills.installAllHint(publisherInstallCount)}
              </p>
              <CliCommandBar
                args={`publisher ${publisher}`}
                copyLabel={t.skills.copyCli}
                copiedLabel={t.skills.copiedCli}
                className="max-w-none"
              />
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <div className="scroll-x">
              <div className="min-w-[640px]">
                <div className={`${SKILL_TABLE_COLS} border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-[11px] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)] sm:px-[18px]`}>
                  <div>{t.skills.colSkill}</div>
                  <div>{t.skills.colDesc}</div>
                  <div className="border-l border-[var(--border)] pl-2">{t.skills.colCompat}</div>
                  <div className="text-right">{t.skills.copy}</div>
                </div>

                {data.skills.map((skill) => (
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

            {data.total === 0 && (
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

          {data.pageCount > 1 ? (
            <nav
              className="mt-5 flex flex-wrap items-center justify-between gap-3"
              aria-label={t.skills.pageOf(data.page, data.pageCount)}
            >
              <p className="text-[13px] text-[var(--text-2)]">{t.skills.pageOf(data.page, data.pageCount)}</p>
              <div className="flex items-center gap-2">
                {data.page > 1 ? (
                  <Link
                    to="/skills"
                    search={{ ...search, page: data.page - 1 > 1 ? data.page - 1 : undefined }}
                    className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-[13px] font-medium text-[var(--text-1)] hover:bg-[var(--surface-hover)]"
                  >
                    {t.skills.pagePrev}
                  </Link>
                ) : (
                  <span className="inline-flex h-9 items-center rounded-lg border border-transparent px-3 text-[13px] text-[var(--text-3)]">
                    {t.skills.pagePrev}
                  </span>
                )}
                {data.page < data.pageCount ? (
                  <Link
                    to="/skills"
                    search={{ ...search, page: data.page + 1 }}
                    className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-[13px] font-medium text-[var(--text-1)] hover:bg-[var(--surface-hover)]"
                  >
                    {t.skills.pageNext}
                  </Link>
                ) : (
                  <span className="inline-flex h-9 items-center rounded-lg border border-transparent px-3 text-[13px] text-[var(--text-3)]">
                    {t.skills.pageNext}
                  </span>
                )}
              </div>
            </nav>
          ) : null}
        </section>
      </PageShell>
    </main>
  )
}

function SkillsTableSkeleton({ rows }: { rows: number }) {
  const { t } = useI18n()
  return (
    <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
      <div className="scroll-x">
        <div className="min-w-[640px]">
          <div className={`${SKILL_TABLE_COLS} border-b border-[var(--border)] bg-[var(--surface-2)] px-4 py-[11px] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)] sm:px-[18px]`}>
            <div>{t.skills.colSkill}</div>
            <div>{t.skills.colDesc}</div>
            <div className="border-l border-[var(--border)] pl-2">{t.skills.colCompat}</div>
            <div className="text-right">{t.skills.copy}</div>
          </div>
          {Array.from({ length: rows }, (_, i) => (
            <SkillRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SkillRowSkeleton() {
  return (
    <div
      className={`${SKILL_TABLE_COLS} border-b border-[var(--border)] px-4 py-3.5 sm:px-[18px]`}
      aria-hidden
    >
      <div className="flex min-w-0 items-center gap-[11px]">
        <span className="skel h-[34px] w-[34px] shrink-0 rounded-[9px]" />
        <span className="grid min-w-0 flex-1 gap-1.5">
          <span className="skel h-3.5 w-[72%] max-w-[160px]" />
          <span className="skel h-2.5 w-[48%] max-w-[100px]" />
        </span>
      </div>
      <div className="grid gap-1.5 self-center">
        <span className="skel h-3 w-full" />
        <span className="skel h-3 w-[78%]" />
      </div>
      <div className="flex items-center border-l border-[var(--border)] pl-2">
        <span className="skel h-4 w-14 rounded" />
      </div>
      <div className="flex items-center justify-end">
        <span className="skel h-8 w-[4.5rem] rounded-lg" />
      </div>
    </div>
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
        className={`grid h-[22px] w-[22px] shrink-0 place-items-center ${logo ? '' : 'rounded-md'}`}
        style={
          logo
            ? undefined
            : color
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
  skill: SkillListItem
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
  const publisher = skill.publisher
  const showPublisherLogo = Boolean(publisher && hasPublisherLogo(publisher))

  return (
    <div className={`${SKILL_TABLE_COLS} border-b border-[var(--border)] px-4 py-3.5 transition-colors hover:bg-[var(--surface-hover)] sm:px-[18px]`}>
      <Link to="/skills/$id" params={{ id: skill.id }} className="flex min-w-0 cursor-pointer items-center gap-[11px] text-[var(--text-1)]">
        <span
          className={`grid h-[34px] w-[34px] flex-none place-items-center ${
            showPublisherLogo ? '' : 'rounded-[9px]'
          }`}
          style={
            showPublisherLogo
              ? undefined
              : { background: category ? hexToRgba(category.color, 0.13) : 'var(--surface-2)', color }
          }
        >
          {showPublisherLogo && publisher ? (
            <PublisherLogo name={publisher} size={22} />
          ) : (
            <Icon name={skill.icon} bold size={17} />
          )}
        </span>
        <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <span className="min-w-0 overflow-hidden">
            <span className={`block truncate text-[13.5px] font-semibold leading-tight ${skillLabel(skill) === skill.id ? 'font-mono' : ''}`}>{skillLabel(skill)}</span>
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

      <div className="min-w-0 overflow-hidden line-clamp-2 self-center text-[13px] leading-[1.4] text-[var(--text-2)]">
        <LangText text={skill.tag[lang]} />
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
