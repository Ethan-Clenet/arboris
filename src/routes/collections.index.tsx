import { createFileRoute, Link } from '@tanstack/react-router'
import Icon from '#/components/Icon'
import PageShell from '#/components/PageShell'
import { hexToRgba, type CollectionSummary } from '#/lib/catalog'
import { useI18n } from '#/lib/i18n'
import { getCatalog } from '#/server/functions'

export const Route = createFileRoute('/collections/')({
  loader: () => getCatalog(),
  component: CollectionsPage,
})

function CollectionsPage() {
  const catalog = Route.useLoaderData()
  const { t } = useI18n()
  const list = catalog.collections ?? []

  return (
    <main id="main-content" className="w-full">
      <PageShell as="div" className="pt-9 pb-[70px]">
        <div className="mb-8 max-w-[640px]">
          <div className="mb-3 flex items-center gap-2.5 font-mono text-[11.5px] font-medium tracking-[0.02em] text-[var(--accent)]">
            <Icon name="stack" bold />
            <span>{t.collections.kicker}</span>
            <span className="text-[var(--text-3)]">·</span>
            <span className="text-[var(--text-3)]">{list.length}</span>
          </div>
          <h1 className="mb-2.5 font-display text-[33px] font-semibold leading-[1.1] tracking-[-0.02em]">
            {t.collections.title}
          </h1>
          <p className="max-w-[540px] text-[15px] text-[var(--text-2)]">{t.collections.subtitle}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
        {list.length === 0 ? (
          <div className="rounded-[14px] border border-[var(--border)] px-6 py-14 text-center text-[13.5px] text-[var(--text-3)]">
            {t.collections.empty}
          </div>
        ) : null}
      </PageShell>
    </main>
  )
}

function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const { t, lang } = useI18n()
  const count = collection.skillIds.length + collection.commandIds.length
  const kindLabel = collection.kind === 'pack' ? t.collections.pack : t.collections.featured

  return (
    <Link
      to="/collections/$id"
      params={{ id: collection.id }}
      className="flex flex-col rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] transition-colors hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]"
    >
      <div className="mb-3 flex items-start gap-3">
        <span
          className="grid h-11 w-11 flex-none place-items-center rounded-[11px]"
          style={{ background: hexToRgba(collection.color, 0.14), color: collection.color }}
        >
          <Icon name={collection.icon} bold size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-display text-[17px] font-semibold text-[var(--text-1)]">
              {collection.label[lang]}
            </span>
            <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-3)]">
              {kindLabel}
            </span>
          </div>
          <p className="text-[13px] leading-[1.45] text-[var(--text-2)]">{collection.brief[lang]}</p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-3 pt-2 font-mono text-[11.5px] text-[var(--text-3)]">
        <span>{t.collections.items(count)}</span>
        {collection.commandIds.length > 0 ? (
          <span>
            {collection.commandIds.length} {t.collections.commands.toLowerCase()}
          </span>
        ) : null}
        {collection.skillIds.length > 0 ? (
          <span>
            {collection.skillIds.length} {t.collections.skills.toLowerCase()}
          </span>
        ) : null}
      </div>
    </Link>
  )
}
