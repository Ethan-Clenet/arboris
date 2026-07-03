import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Icon from '#/components/Icon'
import { Button } from '#/components/Button'
import PageShell from '#/components/PageShell'
import { useI18n } from '#/lib/i18n'
import { useSkillCopy } from '#/lib/useSkillCopy'
import { getCatalog } from '#/server/functions'
import {
  compatDot,
  hexToRgba,
  type Category,
  type SkillSummary,
} from '#/lib/catalog'

export const Route = createFileRoute('/skills/')({
  loader: () => getCatalog(),
  component: SkillsPage,
})

function SkillsPage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy()

  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [techs, setTechs] = useState<string[]>([])
  const [compat, setCompat] = useState<string[]>([])

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

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase()
    const match = (s: SkillSummary) => {
      if (cat !== 'all' && s.categoryId !== cat) return false
      if (techs.length && !techs.every((x) => s.tech.includes(x))) return false
      if (compat.length && !compat.every((x) => s.compat.includes(x))) return false
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
  }, [q, cat, techs, compat, catalog.skills, catById, lang])

  const hasFilters = cat !== 'all' || techs.length > 0 || compat.length > 0 || q.trim().length > 0
  const clearAll = () => {
    setQ('')
    setCat('all')
    setTechs([])
    setCompat([])
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
            <div className="flex flex-wrap gap-[7px]">
              {catalog.compatOrder.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-[11px] py-[5px] text-[12.5px] text-[var(--text-2)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: compatDot(name) }} />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PageShell>

      <PageShell as="div" className="grid items-start gap-7 pt-6 pb-[70px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-[22px] lg:sticky lg:top-[78px]">
          {/* Recherche */}
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

          {/* Catégories */}
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

          {/* Compatibilité */}
          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-3)]">
              {t.skills.compat}
            </div>
            <div className="flex flex-wrap gap-[7px]">
              {catalog.compatOrder.map((name) => {
                const active = compat.includes(name)
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCompat(toggle(compat, name))}
                    className={`flex items-center gap-1.5 rounded-md border px-[11px] py-[5px] text-[12.5px] font-medium transition-colors ${
                      active
                        ? 'border-[var(--border-2)] bg-[var(--surface-hover)] text-[var(--text-1)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-2)] hover:border-[var(--border-2)]'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: compatDot(name) }} />
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Technologies */}
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

        {/* Résultats */}
        <section>
          <div className="mb-3.5 text-[13.5px] text-[var(--text-2)]">
            <span className="font-semibold text-[var(--text-1)]">{rows.length}</span> {resultLabel}
          </div>

          <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <div className="scroll-x">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[minmax(200px,1.4fr)_minmax(220px,2fr)_156px_152px_130px] gap-3.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-[18px] py-[11px] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)]">
                  <div>{t.skills.colSkill}</div>
                  <div>{t.skills.colDesc}</div>
                  <div>{t.skills.colTech}</div>
                  <div>{t.skills.colCompat}</div>
                  <div />
                </div>

                {rows.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    category={catById.get(skill.categoryId)}
                    copied={copiedKey === skill.id}
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
  onCopy,
}: {
  skill: SkillSummary
  category?: Category
  copied: boolean
  onCopy: () => void
}) {
  const { t, lang } = useI18n()
  const color = category?.color ?? 'var(--text-3)'
  const techShort = skill.tech.slice(0, 2)
  const compatShort = skill.compat.slice(0, 2)

  return (
    <div className="grid grid-cols-[minmax(200px,1.4fr)_minmax(220px,2fr)_156px_152px_130px] items-center gap-3.5 border-b border-[var(--border)] px-[18px] py-3.5 transition-colors hover:bg-[var(--surface-hover)]">
      <Link to="/skills/$id" params={{ id: skill.id }} className="flex min-w-0 items-center gap-[11px] text-[var(--text-1)]">
        <span
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px]"
          style={{ background: category ? hexToRgba(category.color, 0.13) : 'var(--surface-2)', color }}
        >
          <Icon name={skill.icon} bold size={17} />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-mono text-[13.5px] font-semibold">{skill.id}</span>
          <span className="block text-[11.5px] text-[var(--text-3)]">{category ? category.label[lang] : ''}</span>
        </span>
      </Link>

      <div className="line-clamp-2 text-[13px] leading-[1.4] text-[var(--text-2)]">{skill.tag[lang]}</div>

      <div className="flex flex-wrap items-center gap-1.5">
        {techShort.map((tech) => (
          <span
            key={tech}
            className="whitespace-nowrap rounded-md border border-[var(--border)] px-[7px] py-0.5 font-mono text-[10.5px] text-[var(--text-2)]"
          >
            {tech}
          </span>
        ))}
        {skill.tech.length > 2 && (
          <span className="font-mono text-[10.5px] text-[var(--text-3)]">+{skill.tech.length - 2}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {compatShort.map((name) => (
          <span key={name} className="inline-flex items-center gap-1 text-[11.5px] text-[var(--text-2)]">
            <span className="h-[5px] w-[5px] rounded-full" style={{ background: compatDot(name) }} />
            {name}
          </span>
        ))}
        {skill.compat.length > 2 && (
          <span className="text-[11px] text-[var(--text-3)]">+{skill.compat.length - 2}</span>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="copy" size="sm" copied={copied} onClick={onCopy}>
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? t.skills.copied : t.skills.copy}
        </Button>
      </div>
    </div>
  )
}
