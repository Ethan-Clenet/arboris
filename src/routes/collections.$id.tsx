import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import CloudInstallPanel from '#/components/CloudInstallPanel'
import Icon from '#/components/Icon'
import PageShell from '#/components/PageShell'
import { hexToRgba } from '#/lib/catalog'
import { useI18n } from '#/lib/i18n'
import { getCollection } from '#/server/functions'
import { collectionSeoTitle, entityDescription, seoHead } from '#/lib/seo'

export const Route = createFileRoute('/collections/$id')({
  loader: async ({ params }) => {
    const collection = await getCollection({ data: { id: params.id } })
    if (!collection) throw notFound()
    return { collection }
  },
  head: ({ loaderData }) => {
    const collection = loaderData?.collection
    if (!collection) return seoHead({ title: 'Collection', path: '/collections' })
    return seoHead({
      title: collectionSeoTitle(collection.label.fr),
      path: `/collections/${collection.id}`,
      description: entityDescription(collection.brief.fr, 'collection', collection.id),
      type: 'article',
    })
  },
  component: CollectionDetailPage,
})

function CollectionDetailPage() {
  const { collection } = Route.useLoaderData()
  const { t, lang } = useI18n()
  const kindLabel = collection.kind === 'pack' ? t.collections.pack : t.collections.featured
  const count = collection.skillIds.length + collection.commandIds.length

  return (
    <main id="main-content" className="w-full">
      <PageShell as="div" className="pt-8 pb-[70px]">
        <Link
          to="/collections"
          className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-[13px] text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
        >
          <Icon name="arrow-left" size={14} />
          {t.collections.back}
        </Link>

        <div className="mb-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="mb-4 flex items-start gap-3.5">
              <span
                className="grid h-14 w-14 flex-none place-items-center rounded-[14px]"
                style={{ background: hexToRgba(collection.color, 0.14), color: collection.color }}
              >
                <Icon name={collection.icon} bold size={26} />
              </span>
              <div>
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-[var(--text-1)]">
                    {collection.label[lang]}
                  </h1>
                  <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-3)]">
                    {kindLabel}
                  </span>
                </div>
                <p className="max-w-[520px] text-[15px] text-[var(--text-2)]">{collection.brief[lang]}</p>
                <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-[var(--text-2)]">
                  {t.collections.detailAbout}
                </p>
                <p className="mt-2 font-mono text-[12px] text-[var(--text-3)]">
                  {t.collections.items(count)}
                </p>
              </div>
            </div>

            {collection.commands.length > 0 ? (
              <section className="mb-6">
                <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
                  {t.collections.commandsHeading(collection.id)}
                </h2>
                <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)]">
                  {collection.commands.map((cmd) => (
                    <Link
                      key={cmd.id}
                      to="/commands/$id"
                      params={{ id: cmd.id }}
                      className="flex cursor-pointer items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name="terminal-window" size={16} className="text-[var(--accent)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[13px] font-semibold">/{cmd.id}</span>
                        <span className="block truncate text-[12.5px] text-[var(--text-2)]">
                          {cmd.description[lang]}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {collection.skills.length > 0 ? (
              <section>
                <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
                  {t.collections.skillsHeading(collection.id)}
                </h2>
                <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)]">
                  {collection.skills.map((skill) => (
                    <Link
                      key={skill.id}
                      to="/skills/$id"
                      params={{ id: skill.id }}
                      className="flex cursor-pointer items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0 hover:bg-[var(--surface-hover)]"
                    >
                      <Icon name={skill.icon} size={16} className="text-[var(--accent)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[13px] font-semibold">{skill.id}</span>
                        <span className="block truncate text-[12.5px] text-[var(--text-2)]">
                          {skill.tag[lang]}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside>
            <CloudInstallPanel
              mode="collection"
              targetId={collection.id}
              lang={lang}
              cliArgs={`collection ${collection.id}`}
              t={{
                cloudTitle: t.collections.cloudTitle,
                cloudHint: t.collections.cloudHint,
                downloadZip: t.collections.downloadZip,
                downloading: t.collections.downloading,
                downloaded: t.collections.downloaded,
                copyCli: t.collections.copyCli,
                copiedCli: t.collections.copiedCli,
                localTitle: t.collections.localTitle,
                zipError: t.collections.zipError,
              }}
            />
          </aside>
        </div>
      </PageShell>
    </main>
  )
}
