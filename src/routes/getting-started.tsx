import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Icon from '#/components/Icon'
import PageShell from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import { getCollectionsIndex } from '#/server/functions'
import { seoHead } from '#/lib/seo'
import { publicHtmlCacheHeaders } from '#/lib/http-cache'
import {
  collectionsInOrder,
  hexToRgba,
  packIdsForStartPath,
  type CollectionSummary,
  type GettingStartedPath,
} from '#/lib/catalog'

export const Route = createFileRoute('/getting-started')({
  headers: publicHtmlCacheHeaders,
  loader: () => getCollectionsIndex(),
  head: () =>
    seoHead({
      title: 'Premier pas — starter ou pack garde',
      path: '/getting-started',
      description:
        'Démarre un projet (React, Node, FastAPI, Flutter, Kotlin, Swift, Docker ou n8n) ou sécurise un agent avec Sonar. Un pack, une commande, puis le catalogue.',
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Premier pas', path: '/getting-started' },
      ],
    }),
  component: GettingStartedPage,
})

const PATHS: {
  id: GettingStartedPath
  icon: string
  titleKey: 'pathNewTitle' | 'pathSecureTitle'
  subKey: 'pathNewSub' | 'pathSecureSub'
}[] = [
  { id: 'new-project', icon: 'stack', titleKey: 'pathNewTitle', subKey: 'pathNewSub' },
  { id: 'secure-agent', icon: 'shield-check', titleKey: 'pathSecureTitle', subKey: 'pathSecureSub' },
]

function packsGridClass(path: GettingStartedPath): string {
  switch (path) {
    case 'new-project':
      return 'grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4'
    case 'secure-agent':
      return 'grid gap-3.5 sm:grid-cols-2 lg:max-w-[720px]'
    default: {
      const _exhaustive: never = path
      return _exhaustive
    }
  }
}

function GettingStartedPage() {
  const { collections } = Route.useLoaderData()
  const { t } = useI18n()
  const [path, setPath] = useState<GettingStartedPath | null>(null)

  const packs = useMemo(() => {
    if (!path) return []
    return collectionsInOrder(collections ?? [], packIdsForStartPath(path))
  }, [collections, path])

  const activePath = path ? PATHS.find((entry) => entry.id === path) : undefined

  return (
    <PageShell>
      <section className="max-w-[660px] pt-12 pb-2">
        <div className="mb-5 inline-flex h-7 items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 font-mono text-[11.5px] leading-none text-[var(--text-1)]">
          <span className="grid size-[13px] shrink-0 place-items-center">
            <Icon name="footprints" bold size={13} />
          </span>
          <span>{t.start.eyebrow}</span>
        </div>
        <h1 className="mb-3.5 font-display text-[40px] font-semibold leading-[1.06] tracking-[-0.025em]">
          {t.start.title}
        </h1>
        <p className="text-[17px] text-[var(--text-2)]">{t.start.sub}</p>
      </section>

      <section className="pt-8">
        <div role="radiogroup" aria-label={t.start.sub} className="grid gap-3.5 sm:grid-cols-2">
          {PATHS.map((entry) => {
            const selected = path === entry.id
            return (
              <button
                key={entry.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPath(entry.id)}
                className={`flex cursor-pointer items-start gap-3.5 rounded-[14px] border p-[18px] text-left shadow-[var(--shadow-card)] transition-colors ${
                  selected
                    ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]'
                }`}
              >
                <span className="grid h-11 w-11 flex-none place-items-center rounded-[11px] bg-[var(--surface)] text-[var(--accent-text)]">
                  <Icon name={entry.icon} bold size={20} />
                </span>
                <span className="min-w-0">
                  <span className="mb-1 block font-display text-[17px] font-semibold text-[var(--text-1)]">
                    {t.start[entry.titleKey]}
                  </span>
                  <span className="block text-[13.5px] leading-[1.5] text-[var(--text-2)]">
                    {t.start[entry.subKey]}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="pt-10 pb-[70px]">
        {path && activePath ? (
          <>
            <div className="mb-4">
              <h2 className="mb-1 font-display text-[22px] font-semibold">{t.start[activePath.titleKey]}</h2>
              <p className="text-[14px] text-[var(--text-2)]">{t.start[activePath.subKey]}</p>
            </div>
            {packs.length > 0 ? (
              <div className={packsGridClass(path)}>
                {packs.map((pack) => (
                  <CompactPackCard key={pack.id} pack={pack} />
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-[var(--text-3)]">{t.start.pickPrompt}</p>
            )}
          </>
        ) : (
          <p className="text-[14px] text-[var(--text-3)]">{t.start.pickPrompt}</p>
        )}

        <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-6 text-[14px]">
          <span className="text-[var(--text-2)]">{t.start.browseTitle}</span>
          <Link
            to="/skills"
            className="inline-flex cursor-pointer items-center gap-1 font-medium text-[var(--text-1)] underline-offset-4 hover:underline"
          >
            {t.nav.skills}
            <Icon name="arrow-up-right" size={13} />
          </Link>
          <Link
            to="/collections"
            className="inline-flex cursor-pointer items-center gap-1 font-medium text-[var(--text-1)] underline-offset-4 hover:underline"
          >
            {t.nav.collections}
            <Icon name="arrow-up-right" size={13} />
          </Link>
        </div>
      </section>
    </PageShell>
  )
}

function CompactPackCard({ pack }: { pack: CollectionSummary }) {
  const { t, lang } = useI18n()
  const itemCount = pack.skillIds.length + pack.commandIds.length

  return (
    <Link
      to="/collections/$id"
      params={{ id: pack.id }}
      className="flex cursor-pointer flex-col rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]"
    >
      <div className="mb-2.5 flex items-start gap-2.5">
        <span
          className="grid h-9 w-9 flex-none place-items-center rounded-[10px]"
          style={{ background: hexToRgba(pack.color, 0.14), color: pack.color }}
        >
          <Icon name={pack.icon} bold size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[15px] font-semibold leading-tight text-[var(--text-1)]">
            {pack.label[lang]}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-[var(--text-3)]">
            {t.collections.items(itemCount)}
          </div>
        </div>
      </div>
      <p className="mb-3 line-clamp-2 flex-1 text-[13px] leading-[1.45] text-[var(--text-2)]">
        {pack.brief[lang]}
      </p>
      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-1)]">
        {t.start.packsCta}
        <Icon name="arrow-up-right" size={13} />
      </span>
    </Link>
  )
}
