import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import PageShell from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import CliCommandBar from '#/components/CliCommandBar'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getCatalog } from '#/server/functions'
import { seoHead } from '#/lib/seo'
import {
  CATEGORY_GROUPS,
  START_PACK_IDS,
  categoryIdsInGroup,
  hexToRgba,
  stackSupportsCategory,
  skillsForStackAndCategory,
  type Category,
  type CollectionSummary,
  type SkillSummary,
} from '#/lib/catalog'

export const Route = createFileRoute('/getting-started')({
  loader: () => getCatalog(),
  head: () =>
    seoHead({
      title: 'Premier pas — packs Sonar et skills',
      path: '/getting-started',
      description:
        'Installe Skill Sonar, GateGuard et les packs starter, ou filtre par domaine et techno pour ton agent.',
    }),
  component: GettingStartedPage,
})

function GettingStartedPage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy(1700)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [stackId, setStackId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const catById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of catalog.categories) map.set(c.id, c)
    return map
  }, [catalog.categories])

  const skillById = useMemo(() => {
    const map = new Map<string, SkillSummary>()
    for (const s of catalog.skills) map.set(s.id, s)
    return map
  }, [catalog.skills])

  const starterPacks = useMemo(() => {
    const byId = new Map((catalog.collections ?? []).map((c) => [c.id, c]))
    return START_PACK_IDS.map((id) => byId.get(id)).filter(
      (c): c is CollectionSummary => Boolean(c),
    )
  }, [catalog.collections])

  const skillsForSelection = (stack: string, category: string) =>
    skillsForStackAndCategory(catalog.skills, stack, category)

  const stacksForCategory = useMemo(() => {
    if (!categoryId) return []
    return catalog.stacks
      .filter((stack) => stackSupportsCategory(stack.id, categoryId))
      .map((stack) => ({
        stack,
        count: skillsForStackAndCategory(catalog.skills, stack.id, categoryId).length,
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count || a.stack.label.localeCompare(b.stack.label))
  }, [catalog.stacks, catalog.skills, categoryId])

  const categoriesForGroup = useMemo(() => {
    if (!groupId) return []
    const ids = categoryIdsInGroup(groupId)
    return catalog.categories.filter((c) => ids.includes(c.id))
  }, [catalog.categories, groupId])

  const activeGroup = groupId ? CATEGORY_GROUPS.find((g) => g.id === groupId) : undefined
  const activeCategory = categoryId ? catById.get(categoryId) : undefined
  const active = stackId ? catalog.stacks.find((s) => s.id === stackId) : undefined
  const rows = active && categoryId ? skillsForSelection(active.id, categoryId) : []
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((skill) => {
      const cat = catById.get(skill.categoryId)
      const haystack = `${skill.id} ${skill.tag[lang]} ${cat?.label[lang] ?? ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [catById, lang, query, rows])

  const pickGroup = (id: string) => {
    setGroupId(id)
    setCategoryId(null)
    setStackId(null)
    setQuery('')
    setSearchOpen(false)
  }

  const pickCategory = (id: string) => {
    setCategoryId(id)
    setStackId(null)
    setQuery('')
    setSearchOpen(false)
  }

  const pickStack = (id: string) => {
    setStackId(id)
    setQuery('')
    setSearchOpen(false)
  }

  const showSearch = searchOpen || query.length > 0

  useEffect(() => {
    if (showSearch) searchRef.current?.focus()
  }, [showSearch])

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
        <p className="mt-4 max-w-[640px] text-[14px] leading-relaxed text-[var(--text-2)]">
          {t.start.aboutBody}
        </p>
      </section>

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

      {/* Packs recommandés (Sonar + starters) */}
      {starterPacks.length > 0 ? (
        <section className="pt-[34px]">
          <div className="mb-4">
            <h2 className="mb-1 font-display text-[22px] font-semibold">{t.start.packsTitle}</h2>
            <p className="text-[14px] text-[var(--text-2)]">{t.start.packsSub}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {starterPacks.map((pack) => (
              <StarterPackCard
                key={pack.id}
                pack={pack}
                skills={pack.skillIds
                  .map((id) => skillById.get(id))
                  .filter((s): s is SkillSummary => Boolean(s))}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Parcours domaine → spécialité → techno */}
      <section className="pt-[40px]">
        <div className="mb-5">
          <h2 className="mb-1 font-display text-[22px] font-semibold">{t.start.browseTitle}</h2>
          <p className="text-[14px] text-[var(--text-2)]">{t.start.browseSub}</p>
        </div>

        <div className="mb-4">
          <h3 className="mb-1 font-display text-[17px] font-semibold text-[var(--text-1)]">
            {t.start.pickGroupTitle}
          </h3>
          <p className="mb-3 text-[13.5px] text-[var(--text-2)]">{t.start.pickGroupSub}</p>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORY_GROUPS.map((group) => {
              const isActive = group.id === groupId
              const count = catalog.skills.filter((s) => group.categoryIds.includes(s.categoryId)).length
              if (count === 0) return null
              return (
                <button
                  key={group.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => pickGroup(group.id)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-md border py-2 pl-2.5 pr-3.5 text-sm font-medium text-[var(--text-1)] transition-colors ${
                    isActive
                      ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]'
                  }`}
                >
                  <span
                    className="grid h-[30px] w-[30px] place-items-center rounded-lg"
                    style={{ background: hexToRgba(group.color, 0.15), color: group.color }}
                  >
                    <Icon name={group.icon} bold size={17} />
                  </span>
                  <span className="flex flex-col items-start leading-[1.15]">
                    <span>{group.label[lang]}</span>
                    <span className="font-mono text-[10.5px] font-medium text-[var(--text-3)]">
                      {count} skills
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {groupId ? (
        <section className="pt-[18px]">
          <div className="mb-4">
            <h3 className="mb-1 font-display text-[17px] font-semibold">{t.start.pickCategoryTitle}</h3>
            <p className="text-[13.5px] text-[var(--text-2)]">
              {activeGroup ? (
                <>
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium"
                    style={{
                      background: hexToRgba(activeGroup.color, 0.12),
                      color: activeGroup.color,
                      borderColor: hexToRgba(activeGroup.color, 0.28),
                    }}
                  >
                    <Icon name={activeGroup.icon} size={11} bold />
                    {activeGroup.label[lang]}
                  </span>
                  <span className="ml-2">{t.start.pickCategorySub}</span>
                </>
              ) : (
                t.start.pickCategorySub
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {categoriesForGroup.map((c) => {
              const isActive = c.id === categoryId
              const count = catalog.skills.filter((s) => s.categoryId === c.id).length
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => pickCategory(c.id)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-md border py-2 pl-2.5 pr-3.5 text-sm font-medium text-[var(--text-1)] transition-colors ${
                    isActive
                      ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-2)]'
                  }`}
                >
                  <span
                    className="grid h-[30px] w-[30px] place-items-center rounded-lg"
                    style={{ background: hexToRgba(c.color, 0.15), color: c.color }}
                  >
                    <Icon name={c.icon} bold size={17} />
                  </span>
                  <span className="flex flex-col items-start leading-[1.15]">
                    <span>{c.label[lang]}</span>
                    <span className="font-mono text-[10.5px] font-medium text-[var(--text-3)]">
                      {count} skills
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {categoryId ? (
        <section className="pt-[18px]">
          <div className="mb-4">
            <h3 className="mb-1 font-display text-[17px] font-semibold">{t.start.pickTitle}</h3>
            <p className="text-[13.5px] text-[var(--text-2)]">{t.start.pickSub}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {stacksForCategory.map(({ stack: k, count }) => {
              const isActive = k.id === stackId
              return (
                <button
                  key={k.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => pickStack(k.id)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-md border py-2 pl-2.5 pr-3.5 text-sm font-medium text-[var(--text-1)] transition-colors ${
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
                    <span className="font-mono text-[10.5px] font-medium text-[var(--text-3)]">
                      {count} skills
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="pt-6 pb-[70px]">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          {active && activeCategory ? (
            <>
              <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-[18px] lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                <div className="flex min-w-0 items-center gap-3.5">
                  <span
                    className="grid h-11 w-11 flex-none place-items-center rounded-xl"
                    style={{ background: hexToRgba(active.color, 0.15), color: active.color }}
                  >
                    <Icon name={active.icon} bold size={23} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-[18px] font-semibold">
                      {t.start.recFor} {active.label}
                    </div>
                    <div className="text-[13px] text-[var(--text-2)]">
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-medium"
                        style={{
                          background: hexToRgba(activeCategory.color, 0.12),
                          color: activeCategory.color,
                          borderColor: hexToRgba(activeCategory.color, 0.28),
                        }}
                      >
                        <Icon name={activeCategory.icon} size={11} bold />
                        {activeCategory.label[lang]}
                      </span>
                      <span className="mx-1.5 text-[var(--text-3)]">·</span>
                      {query.trim()
                        ? `${filteredRows.length} / ${rows.length} ${t.start.skillsWord}`
                        : `${rows.length} ${t.start.skillsWord}`}
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-end gap-2.5 lg:w-auto">
                  <div
                    className={`overflow-hidden transition-[width,opacity] duration-200 ease-out ${
                      showSearch ? 'w-full min-w-0 opacity-100 sm:max-w-[280px]' : 'w-10 opacity-100'
                    }`}
                  >
                    {showSearch ? (
                      <div className="relative w-full">
                        <label htmlFor="stack-skills-search" className="sr-only">
                          {t.a11y.searchSkills}
                        </label>
                        <Icon
                          name="magnifying-glass"
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
                        />
                        <input
                          ref={searchRef}
                          id="stack-skills-search"
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setQuery('')
                              setSearchOpen(false)
                              searchRef.current?.blur()
                            }
                          }}
                          onBlur={() => {
                            if (!query.trim()) setSearchOpen(false)
                          }}
                          placeholder={t.start.searchPh}
                          className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] pl-9 pr-9 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                        />
                        {query.length > 0 ? (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setQuery('')}
                            aria-label={t.a11y.clearSearch}
                            className="absolute right-2 top-1/2 grid h-[22px] w-[22px] -translate-y-1/2 cursor-pointer place-items-center text-[var(--text-3)] hover:text-[var(--text-1)]"
                          >
                            <Icon name="x" size={13} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setSearchOpen(false)}
                            aria-label={t.a11y.clearSearch}
                            className="absolute right-2 top-1/2 grid h-[22px] w-[22px] -translate-y-1/2 cursor-pointer place-items-center text-[var(--text-3)] hover:text-[var(--text-1)]"
                          >
                            <Icon name="x" size={13} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSearchOpen(true)}
                        aria-label={t.a11y.searchSkills}
                        className="grid h-10 w-10 cursor-pointer place-items-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-3)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
                      >
                        <Icon name="magnifying-glass" size={16} />
                      </button>
                    )}
                  </div>
                  <CliCommandBar
                    args={active.id}
                    copyLabel={t.start.copyCommand}
                    copiedLabel={t.start.copiedCommand}
                    className="w-full shrink-0 sm:max-w-[320px] lg:max-w-[380px]"
                  />
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
                <Icon
                  name={!groupId ? 'squares-four' : !categoryId ? 'folders' : 'stack'}
                  size={22}
                />
              </div>
              <p className="max-w-[360px] text-[15px] text-[var(--text-2)]">
                {!groupId
                  ? t.start.pickGroupPrompt
                  : !categoryId
                    ? t.start.pickCategoryPrompt
                    : t.start.pickPrompt}
              </p>
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

function StarterPackCard({
  pack,
  skills,
}: {
  pack: CollectionSummary
  skills: SkillSummary[]
}) {
  const { t, lang } = useI18n()
  const itemCount = pack.skillIds.length + pack.commandIds.length

  return (
    <div className="flex flex-col rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-start gap-3">
        <span
          className="grid h-11 w-11 flex-none place-items-center rounded-[11px]"
          style={{ background: hexToRgba(pack.color, 0.14), color: pack.color }}
        >
          <Icon name={pack.icon} bold size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[16px] font-semibold text-[var(--text-1)]">
            {pack.label[lang]}
          </div>
          <div className="font-mono text-[11px] text-[var(--text-3)]">
            {itemCount} · {pack.kind === 'pack' ? t.collections.pack : t.collections.featured}
          </div>
        </div>
      </div>
      <p className="mb-3 line-clamp-3 flex-1 text-[13px] leading-[1.5] text-[var(--text-2)]">
        {pack.brief[lang]}
      </p>

      {skills.length > 0 ? (
        <div className="mb-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)]">
            {t.start.packSkills}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <Link
                key={skill.id}
                to="/skills/$id"
                params={{ id: skill.id }}
                className="inline-flex max-w-full cursor-pointer truncate rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
              >
                {skill.id}
              </Link>
            ))}
          </div>
        </div>
      ) : pack.commandIds.length > 0 ? (
        <div className="mb-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)]">
            {t.start.packCommands}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pack.commandIds.slice(0, 6).map((id) => (
              <Link
                key={id}
                to="/commands/$id"
                params={{ id }}
                className="inline-flex cursor-pointer truncate rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
              >
                /{id}
              </Link>
            ))}
            {pack.commandIds.length > 6 ? (
              <span className="font-mono text-[11px] text-[var(--text-3)]">
                +{pack.commandIds.length - 6}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <CliCommandBar
        args={`collection ${pack.id}`}
        copyLabel={t.start.copyCommand}
        copiedLabel={t.start.copiedCommand}
        className="mb-3 max-w-none"
      />
      <Link
        to="/collections/$id"
        params={{ id: pack.id }}
        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-[var(--border)] px-3 py-2 text-[13px] font-medium text-[var(--text-1)] transition-colors hover:border-[var(--border-2)] hover:bg-[var(--surface-hover)]"
      >
        {t.start.packsCta}
        <Icon name="arrow-up-right" size={14} />
      </Link>
    </div>
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
          className="grid h-[38px] w-[38px] flex-none cursor-pointer place-items-center rounded-[10px]"
          style={{ background: tint, color }}
        >
          <Icon name={skill.icon} bold size={19} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to="/skills/$id"
            params={{ id: skill.id }}
            className="block cursor-pointer truncate font-mono text-[13.5px] font-semibold text-[var(--text-1)]"
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
          className="grid h-[34px] w-[34px] flex-none cursor-pointer place-items-center rounded-[9px] border border-[var(--border)] text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
        >
          <Icon name="arrow-up-right" bold size={14} />
        </Link>
      </div>
    </div>
  )
}
