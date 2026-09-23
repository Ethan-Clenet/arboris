import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import CollectionTile from '#/components/CollectionTile'
import PageShell from '#/components/PageShell'
import {
  collectionTheme,
  hexToRgba,
  isPremiumCollection,
  COLLECTION_THEME_ORDER,
  type CollectionSummary,
  type CollectionThemeKey,
} from '#/lib/catalog'
import { useI18n } from '#/lib/i18n'
import { getCatalog } from '#/server/functions'
import { seoHead } from '#/lib/seo'

export const Route = createFileRoute('/collections/')({
  loader: () => getCatalog(),
  head: () =>
    seoHead({
      title: 'Packs et collections de skills',
      path: '/collections',
      description:
        'Collections Arboris : packs de skills et commandes à installer d’un coup (starter, sécu, ops).',
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Collections', path: '/collections' },
      ],
    }),
  component: CollectionsPage,
})

type TypeFilter = 'all' | 'pack' | 'featured'
type ThemeFilter = 'all' | CollectionThemeKey

function CollectionsPage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const all = catalog.collections ?? []

  const [q, setQ] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [theme, setTheme] = useState<ThemeFilter>('all')

  const typeCounts = useMemo(() => {
    let pack = 0
    for (const c of all) if (c.kind === 'pack') pack += 1
    return { all: all.length, pack, featured: all.length - pack }
  }, [all])

  const themeCounts = useMemo(() => {
    const counts = new Map<CollectionThemeKey, number>()
    for (const c of all) {
      const key = collectionTheme(c)
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [all])

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase()
    return all.filter((c) => {
      if (type === 'pack' && c.kind !== 'pack') return false
      if (type === 'featured' && c.kind === 'pack') return false
      if (theme !== 'all' && collectionTheme(c) !== theme) return false
      if (ql) {
        const hay = `${c.id} ${c.label[lang]} ${c.brief[lang]}`.toLowerCase()
        if (!hay.includes(ql)) return false
      }
      return true
    })
  }, [all, q, type, theme, lang])

  const hasFilters = q.trim().length > 0 || type !== 'all' || theme !== 'all'
  const clearAll = () => {
    setQ('')
    setType('all')
    setTheme('all')
  }

  return (
    <main id="main-content" className="w-full">
      <PageShell as="div" className="pt-9">
        <div className="max-w-[640px]">
          <div className="mb-3 flex items-center gap-2.5 font-mono text-[11.5px] font-medium tracking-[0.02em] text-[var(--accent)]">
            <Icon name="stack" bold />
            <span>{t.collections.kicker}</span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="text-[var(--text-3)]">{all.length}</span>
          </div>
          <h1 className="mb-2.5 font-display text-[33px] font-semibold leading-[1.1] tracking-[-0.02em]">
            {t.collections.title}
          </h1>
          <p className="max-w-[540px] text-[15px] text-[var(--text-2)]">{t.collections.subtitle}</p>
        </div>
      </PageShell>

      <PageShell as="div" className="grid items-start gap-7 pt-6 pb-[70px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-[22px] lg:sticky lg:top-[78px] lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:pr-1">
          <div className="relative">
            <label htmlFor="collections-search" className="sr-only">
              {t.collections.searchPh}
            </label>
            <Icon
              name="magnifying-glass"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
            />
            <input
              id="collections-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.collections.searchPh}
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
              {t.collections.filterType}
            </div>
            <div className="flex flex-col gap-0.5">
              <FilterButton
                active={type === 'all'}
                icon="squares-four"
                label={t.collections.allTypes}
                count={typeCounts.all}
                onClick={() => setType('all')}
              />
              <FilterButton
                active={type === 'pack'}
                icon="package"
                label={t.collections.pack}
                count={typeCounts.pack}
                onClick={() => setType(type === 'pack' ? 'all' : 'pack')}
              />
              <FilterButton
                active={type === 'featured'}
                icon="star"
                label={t.collections.featured}
                count={typeCounts.featured}
                onClick={() => setType(type === 'featured' ? 'all' : 'featured')}
              />
            </div>
          </div>

          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.collections.filterTheme}
            </div>
            <div className="flex flex-col gap-0.5">
              <FilterButton
                active={theme === 'all'}
                icon="circles-four"
                label={t.collections.theme.all}
                count={all.length}
                onClick={() => setTheme('all')}
              />
              {COLLECTION_THEME_ORDER.filter((key) => (themeCounts.get(key) ?? 0) > 0).map((key) => (
                <FilterButton
                  key={key}
                  active={theme === key}
                  icon={THEME_ICON[key]}
                  color={THEME_COLOR[key]}
                  label={t.collections.theme[key]}
                  count={themeCounts.get(key) ?? 0}
                  onClick={() => setTheme(theme === key ? 'all' : key)}
                />
              ))}
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex cursor-pointer items-center gap-[7px] p-0.5 text-[13px] font-medium text-[var(--accent)]"
            >
              <Icon name="arrow-counter-clockwise" size={14} />
              {t.collections.clear}
            </button>
          )}
        </aside>

        <section>
          <h2 className="mb-3.5 font-display text-[18px] font-semibold text-[var(--text-1)]">
            {t.collections.listHeading}
          </h2>
          <div className="mb-4 text-[13.5px] text-[var(--text-2)]">
            <span className="font-semibold text-[var(--text-1)]">{t.collections.count(list.length)}</span>{' '}
            {t.collections.resultTail(all.length)}
          </div>

          {list.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((col) => (
                <CollectionCard key={col.id} collection={col} />
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-card)]">
              <div className="mx-auto mb-3.5 grid h-12 w-12 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--text-3)]">
                <Icon name="magnifying-glass" size={22} />
              </div>
              <div className="mb-1.5 font-display text-[17px] font-semibold">{t.collections.emptyTitle}</div>
              <div className="mb-4 text-[13.5px] text-[var(--text-2)]">{t.collections.emptyBody}</div>
              <Button variant="outline" size="sm" onClick={clearAll}>
                {t.collections.clear}
              </Button>
            </div>
          )}
        </section>
      </PageShell>
    </main>
  )
}

const THEME_ICON: Record<CollectionThemeKey, string> = {
  frontend: 'browser',
  backend: 'hexagon',
  data: 'database',
  ops: 'gear-six',
  security: 'shield-check',
}

const THEME_COLOR: Record<CollectionThemeKey, string> = {
  frontend: '#38BDF8',
  backend: '#43A047',
  data: '#8b5cf6',
  ops: '#f59e0b',
  security: '#2E7D32',
}

function FilterButton({
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
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] border px-2.5 py-2 text-left text-[13.5px] transition-colors ${
        active
          ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--text-1)]'
          : 'border-transparent text-[var(--text-2)] hover:bg-[var(--surface-hover)]'
      }`}
    >
      <span
        className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md"
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

function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const { t, lang } = useI18n()
  const kindLabel = collection.kind === 'pack' ? t.collections.pack : t.collections.featured
  const themeKey = collectionTheme(collection)
  const premium = isPremiumCollection(collection)

  return (
    <Link
      to="/collections/$id"
      params={{ id: collection.id }}
      className={`group relative flex cursor-pointer flex-col rounded-[14px] border bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition-[border-color,background-color,box-shadow] ${
        premium
          ? 'border-[#C9A227]/55 hover:border-[#D4AF37] hover:bg-[var(--surface-hover)] hover:shadow-[0_0_0_1px_rgba(212,175,55,0.25),0_8px_24px_rgba(201,162,39,0.12)]'
          : 'border-[var(--border)] hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]'
      }`}
    >
      {premium ? (
        <span
          className="pointer-events-none absolute inset-x-0 top-2.5 z-10 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        >
          <span className="rounded-full border border-[#C9A227]/55 bg-[rgba(20,16,8,0.92)] px-2.5 py-0.5 text-[10.5px] font-semibold tracking-[0.04em] text-[#E8C547] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
            {t.collections.skillsPremium}
          </span>
        </span>
      ) : null}
      <div className="mb-3 flex items-start gap-3">
        <CollectionTile collection={collection} box="h-11 w-11 rounded-[11px]" glyph={20} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-display text-[17px] font-semibold text-[var(--text-1)]">
              {collection.label[lang]}
            </span>
            <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-3)]">
              {kindLabel}
            </span>
          </div>
          <p className="line-clamp-2 text-[13px] leading-[1.45] text-[var(--text-2)]">
            {collection.brief[lang]}
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
        {themeKey ? (
          <span
            className="rounded-full border px-2 py-0.5 text-[11px] font-medium"
            style={{
              borderColor: hexToRgba(THEME_COLOR[themeKey], 0.35),
              color: THEME_COLOR[themeKey],
              background: hexToRgba(THEME_COLOR[themeKey], 0.08),
            }}
          >
            {t.collections.theme[themeKey]}
          </span>
        ) : null}
        {collection.commandIds.length > 0 ? (
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-2)]">
            {collection.commandIds.length} {t.collections.commands.toLowerCase()}
          </span>
        ) : null}
        {collection.skillIds.length > 0 ? (
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-2)]">
            {collection.skillIds.length} {t.collections.skills.toLowerCase()}
          </span>
        ) : null}
      </div>
    </Link>
  )
}
