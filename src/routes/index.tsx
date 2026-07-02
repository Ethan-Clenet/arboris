import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Icon from '#/components/Icon'
import { Button, ButtonLink } from '#/components/Button'
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

export const Route = createFileRoute('/')({
  loader: () => getCatalog(),
  component: HomePage,
})

function HomePage() {
  const catalog = Route.useLoaderData()
  const { t, lang } = useI18n()
  const { copiedKey, copySkill } = useSkillCopy()
  const [query, setQuery] = useState('')

  const catById = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of catalog.categories) map.set(c.id, c)
    return map
  }, [catalog.categories])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog.skills
    return catalog.skills.filter((s) => {
      const cat = catById.get(s.categoryId)
      const hay = `${s.id} ${s.tag[lang]} ${s.tech.join(' ')} ${cat ? cat.label[lang] : ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, catalog.skills, catById, lang])

  return (
    <PageShell>
      {/* Hero */}
      <section className="grid items-center gap-11 pt-14 pb-8 lg:grid-cols-[1fr_470px]">
        <div className="rise-in">
          <div className="mb-[22px] inline-flex items-center gap-[7px] rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-[13px] py-[5px] font-mono text-[11.5px] text-[var(--accent)]">
            <Icon name="leaf" bold size={13} />
            {t.home.eyebrow}
          </div>
          <h1 className="mb-[18px] max-w-[560px] whitespace-pre-line font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[52px]">
            {t.home.title}
          </h1>
          <p className="mb-7 max-w-[460px] text-[17px] text-[var(--text-2)]">{t.home.sub}</p>

          <div className="flex flex-wrap items-center gap-2.5">
            <ButtonLink to="/skills" variant="primary" size="lg">
              <Icon name="list-magnifying-glass" size={16} />
              {t.home.openIndex}
            </ButtonLink>
            <ButtonLink to="/skills/$id" params={{ id: 'fastify' }} variant="secondary" size="lg">
              {t.home.example}
            </ButtonLink>
          </div>

          <div className="mt-[30px] flex flex-wrap items-center gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)]">
              {t.home.worksWith}
            </span>
            <div className="flex flex-wrap gap-[7px]">
              {catalog.compatOrder.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[12px] text-[var(--text-2)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: compatDot(name) }} />
                  {name}
                </span>
              ))}
            </div>
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
              <span className="text-[#30A46C]">$</span> arboris copy <span className="text-[#9BCB3C]">fastify</span>
            </div>
            <div className="text-[#3ECF8E]">✓ {t.home.term1}</div>
            <div className="text-[#6B7280]">→ {t.home.term2}</div>
            <div className="text-[#3ECF8E]">
              ✓ {t.home.term3}
              <span className="ml-[5px] inline-block h-4 w-2 -translate-y-[2px] bg-[#3ECF8E] align-middle [animation:sp-blink_1.1s_steps(1)_infinite]" />
            </div>
          </div>
        </div>
      </section>

      {/* Index */}
      <section className="pt-6 pb-[70px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-2.5">
            <h2 className="font-display text-[22px] font-semibold">{t.home.indexTitle}</h2>
            <span className="font-mono text-[12.5px] text-[var(--text-3)]">
              {rows.length}/{catalog.skills.length}
            </span>
          </div>
          <div className="relative w-[240px]">
            <label htmlFor="home-search" className="sr-only">
              {t.a11y.filterSkills}
            </label>
            <Icon
              name="magnifying-glass"
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
            />
            <input
              id="home-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.home.searchPh}
              className="h-[38px] w-full rounded-[9px] border border-[var(--border)] bg-[var(--surface)] pl-[34px] pr-3 font-mono text-[12.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <div className="scroll-x">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[minmax(200px,1.4fr)_minmax(200px,2fr)_132px] gap-3.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-[18px] py-[11px] text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-3)]">
                <div>Skill</div>
                <div>Description</div>
                <div />
              </div>

              {rows.map((skill) => (
                <HomeRow
                  key={skill.id}
                  skill={skill}
                  category={catById.get(skill.categoryId)}
                  copied={copiedKey === skill.id}
                  onCopy={() => copySkill({ id: skill.id, lang, announceMsg: t.home.copied })}
                />
              ))}

              {rows.length === 0 && (
                <div className="p-12 text-center text-[13.5px] text-[var(--text-3)]">{t.home.empty}</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function HomeRow({
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

  return (
    <div className="grid grid-cols-[minmax(200px,1.4fr)_minmax(200px,2fr)_132px] items-center gap-3.5 border-b border-[var(--border)] px-[18px] py-[13px] transition-colors hover:bg-[var(--surface-hover)]">
      <Link to="/skills/$id" params={{ id: skill.id }} className="flex min-w-0 items-center gap-[11px] text-[var(--text-1)]">
        <span
          className="grid h-8 w-8 flex-none place-items-center rounded-[9px]"
          style={{ background: category ? hexToRgba(category.color, 0.14) : 'var(--surface-2)', color }}
        >
          <Icon name={skill.icon} bold size={16} />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-mono text-[13px] font-semibold">{skill.id}</span>
          <span className="block text-[11.5px] text-[var(--text-3)]">{category ? category.label[lang] : ''}</span>
        </span>
      </Link>

      <div className="line-clamp-2 text-[12.5px] leading-[1.4] text-[var(--text-2)]">{skill.tag[lang]}</div>

      <div className="flex justify-end">
        <Button variant="copy" size="sm" copied={copied} onClick={onCopy}>
          <Icon name={copied ? 'check' : 'copy'} size={13} />
          {copied ? t.home.copied : t.home.copy}
        </Button>
      </div>
    </div>
  )
}
