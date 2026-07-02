import Icon from '#/components/Icon'
import { AdminCard, AdminIconBtn } from '#/components/admin/AdminUi'
import { ADMIN_CAT_COLORS, ADMIN_SKILL_ICONS } from '#/lib/admin-constants'
import { hexToRgba } from '#/lib/catalog'
import type { AdminCatState, AdminNewStackState, AdminSkillState } from '#/lib/admin-state'
import type { Stack } from '#/lib/catalog'
import { useMemo, useState } from 'react'

interface AdminTechnosProps {
  stacks: Stack[]
  skills: AdminSkillState[]
  newStack: AdminNewStackState
  saving?: boolean
  onNewStack: (patch: Partial<AdminNewStackState>) => void
  onAddStack: () => void
  onRemoveStack: (id: string) => void
  onToggle: (skillId: string, stackId: string) => void
  catOf: (id: string) => AdminCatState
  t: {
    technosIntro: string
    catsVsTechnosHint: string
    stacksTitle: string
    newStack: string
    stackName: string
    stackNamePh: string
    addStack: string
    remove: string
    fIcon: string
    catColor: string
    filterTechnoHint: string
    clearTechnoFilters: string
    matrixNoMatch: string
  }
}

export default function AdminTechnos({
  stacks,
  skills,
  newStack,
  saving = false,
  onNewStack,
  onAddStack,
  onRemoveStack,
  onToggle,
  catOf,
  t,
}: AdminTechnosProps) {
  const stackValid = newStack.name.trim()
  const [query, setQuery] = useState('')
  const [selectedStacks, setSelectedStacks] = useState<string[]>([])

  const toggleStackFilter = (stackId: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stackId) ? prev.filter((id) => id !== stackId) : [...prev, stackId],
    )
  }

  const clearFilters = () => {
    setSelectedStacks([])
    setQuery('')
  }

  const hasActiveFilters = selectedStacks.length > 0 || query.trim().length > 0

  const visibleStacks = useMemo(() => {
    if (selectedStacks.length === 0) return stacks
    return stacks.filter((stack) => selectedStacks.includes(stack.id))
  }, [selectedStacks, stacks])

  const filteredSkills = useMemo(() => {
    const q = query.trim().toLowerCase()
    return skills.filter((skill) => {
      if (selectedStacks.length > 0) {
        const linked = selectedStacks.some((stackId) => skill.stacks.includes(stackId))
        if (!linked) return false
      }
      if (!q) return true
      const cat = catOf(skill.cat)
      return `${skill.id} ${cat.fr} ${cat.en}`.toLowerCase().includes(q)
    })
  }, [catOf, query, selectedStacks, skills])

  const shortLabel = (label: string) => {
    const map: Record<string, string> = {
      'Node.js': 'Node',
      JavaScript: 'JS',
      TypeScript: 'TS',
      FastAPI: 'FastAPI',
      Angular: 'Angular',
      React: 'React',
      Java: 'Java',
      'Spring Boot': 'Spring',
      Docker: 'Docker',
      K9: 'K9',
      PostgreSQL: 'Postgres',
      MySQL: 'MySQL',
      Prisma: 'Prisma',
    }
    return map[label] ?? label
  }

  return (
    <>
      <p className="mb-2 max-w-[640px] text-[13.5px] text-[var(--text-2)]">{t.technosIntro}</p>
      <p className="mb-5 max-w-[640px] text-[12.5px] text-[var(--text-3)]">{t.catsVsTechnosHint}</p>

      <div className="mb-6 grid items-start gap-[22px] lg:grid-cols-[1fr_320px]">
        <AdminCard>
          <div className="border-b border-[var(--border)] px-[18px] py-3 font-[family-name:var(--font-display)] text-[15px] font-semibold">
            {t.stacksTitle}{' '}
            <span className="font-mono text-[12px] font-normal text-[var(--text-3)]">· {stacks.length}</span>
          </div>
          {stacks.map((stack) => {
            const count = skills.filter((s) => s.stacks.includes(stack.id)).length
            return (
              <div
                key={stack.id}
                className="flex items-center gap-3 border-b border-[var(--border)] px-[18px] py-3 last:border-0 hover:bg-[var(--surface-hover)]"
              >
                <span
                  className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px]"
                  style={{
                    background: hexToRgba(stack.color, 0.16),
                    color: stack.color,
                  }}
                >
                  <Icon name={stack.icon} bold size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold">{stack.label}</div>
                  <div className="font-mono text-[11px] text-[var(--text-3)]">{stack.id}</div>
                </div>
                <span className="text-[12.5px] text-[var(--text-3)]">{count} skills</span>
                <AdminIconBtn title={t.remove} danger onClick={() => onRemoveStack(stack.id)}>
                  <Icon name="trash" bold size={14} />
                </AdminIconBtn>
              </div>
            )
          })}
        </AdminCard>

        <div className="sticky top-20 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow-card)]">
          <div className="mb-3.5 font-[family-name:var(--font-display)] text-[15px] font-semibold">
            {t.newStack}
          </div>
          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.stackName}</span>
              <input
                value={newStack.name}
                onChange={(e) => onNewStack({ name: e.target.value })}
                placeholder={t.stackNamePh}
                className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.catColor}</span>
              <div className="flex flex-wrap gap-2">
                {ADMIN_CAT_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onNewStack({ color: hex })}
                    className="h-7 w-7 cursor-pointer rounded-lg border-2"
                    style={{
                      background: hex,
                      borderColor: newStack.color === hex ? 'var(--text-1)' : 'transparent',
                    }}
                    aria-label={hex}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fIcon}</span>
              <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                {ADMIN_SKILL_ICONS.map((name) => {
                  const on = newStack.icon === name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onNewStack({ icon: name })}
                      className="grid h-[34px] w-[34px] cursor-pointer place-items-center rounded-[9px] border transition-colors"
                      style={{
                        borderColor: on ? 'var(--accent-border)' : 'var(--border)',
                        background: on ? 'var(--accent-soft)' : 'var(--surface)',
                        color: on ? 'var(--accent)' : 'var(--text-2)',
                      }}
                    >
                      <Icon name={name} bold size={16} />
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={onAddStack}
              disabled={!stackValid || saving}
              className="mt-0.5 flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 text-[14px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: stackValid ? 'var(--accent)' : 'var(--text-3)' }}
            >
              <Icon name="plus" bold size={15} />
              {t.addStack}
            </button>
          </div>
        </div>
      </div>

      <AdminCard>
        <div className="border-b border-[var(--border)] px-4 py-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] text-[var(--text-3)]">{t.filterTechnoHint}</p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-2)] transition-colors hover:border-[var(--border-2)] hover:text-[var(--text-1)]"
              >
                <Icon name="x" size={12} />
                {t.clearTechnoFilters}
              </button>
            ) : null}
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {stacks.map((stack) => {
              const active = selectedStacks.includes(stack.id)
              return (
                <button
                  key={stack.id}
                  type="button"
                  onClick={() => toggleStackFilter(stack.id)}
                  aria-pressed={active}
                  title={stack.label}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors"
                  style={{
                    borderColor: active ? 'var(--accent-border)' : 'var(--border)',
                    background: active ? 'var(--accent-soft)' : 'var(--surface)',
                    color: active ? 'var(--accent)' : 'var(--text-2)',
                  }}
                >
                  <span
                    className="grid h-4 w-4 place-items-center rounded"
                    style={{ background: hexToRgba(stack.color, 0.16), color: stack.color }}
                  >
                    <Icon name={stack.icon} bold size={10} />
                  </span>
                  {shortLabel(stack.label)}
                </button>
              )
            })}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrer les skills…"
            className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--bg)] px-3 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </div>
        <div className="overflow-x-auto">
          <div style={{ minWidth: 260 + visibleStacks.length * 74 }}>
            <div
              className="sticky top-0 z-10 grid border-b border-[var(--border)] bg-[var(--surface-2)]"
              style={{ gridTemplateColumns: `260px repeat(${visibleStacks.length}, 74px)` }}
            >
              <div className="sticky left-0 z-20 bg-[var(--surface-2)] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
                Skill
              </div>
              {visibleStacks.map((stack) => {
                const count = filteredSkills.filter((s) => s.stacks.includes(stack.id)).length
                return (
                  <div
                    key={stack.id}
                    className="flex flex-col items-center gap-1 border-l border-[var(--border)] px-1.5 py-2"
                    title={stack.label}
                  >
                    <span
                      className="grid h-[26px] w-[26px] place-items-center rounded-[7px]"
                      style={{
                        background: hexToRgba(stack.color, 0.16),
                        color: stack.color,
                      }}
                    >
                      <Icon name={stack.icon} bold size={15} />
                    </span>
                    <span className="whitespace-nowrap text-[10px] font-semibold">{shortLabel(stack.label)}</span>
                    <span className="font-mono text-[10px] text-[var(--text-3)]">{count}</span>
                  </div>
                )
              })}
            </div>

            {filteredSkills.map((skill) => {
              const cat = catOf(skill.cat)
              return (
                <div
                  key={skill.id}
                  className="grid items-center border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]"
                  style={{ gridTemplateColumns: `260px repeat(${visibleStacks.length}, 74px)` }}
                >
                  <div className="sticky left-0 z-[1] flex min-w-0 items-center gap-2.5 bg-[var(--surface)] px-4 py-[11px]">
                    <span
                      className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg"
                      style={{
                        background: hexToRgba(cat.color, 0.14),
                        color: cat.color,
                      }}
                    >
                      <Icon name={skill.icon} bold size={15} />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[12.5px] font-semibold">{skill.id}</div>
                      <div className="truncate text-[11px] text-[var(--text-3)]">{cat.fr}</div>
                    </div>
                  </div>
                  {visibleStacks.map((stack) => {
                    const on = skill.stacks.includes(stack.id)
                    return (
                      <div
                        key={stack.id}
                        className="flex justify-center border-l border-[var(--border)] px-2 py-[11px]"
                      >
                        <button
                          type="button"
                          title={stack.label}
                          disabled={saving}
                          onClick={() => onToggle(skill.id, stack.id)}
                          className="grid h-[26px] w-[26px] cursor-pointer place-items-center rounded-[7px] border-[1.5px] text-white transition-all disabled:opacity-50"
                          style={{
                            borderColor: on ? 'var(--accent)' : 'var(--border-2)',
                            background: on ? 'var(--accent)' : 'transparent',
                          }}
                        >
                          <Icon
                            name="check"
                            bold
                            size={14}
                            className={on ? 'opacity-100' : 'opacity-0'}
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
            })}
            {filteredSkills.length === 0 ? (
              <div className="px-4 py-10 text-center text-[13px] text-[var(--text-3)]">
                {t.matrixNoMatch}
              </div>
            ) : null}
          </div>
        </div>
      </AdminCard>
    </>
  )
}
