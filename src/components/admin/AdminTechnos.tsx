import Icon from '#/components/Icon'
import { AdminCard, AdminIconBtn } from '#/components/admin/AdminUi'
import { ADMIN_CAT_COLORS, ADMIN_SKILL_ICONS } from '#/lib/admin-constants'
import { hexToRgba } from '#/lib/catalog'
import type { AdminCatState, AdminNewStackState, AdminSkillState } from '#/lib/admin-state'
import type { Stack } from '#/lib/catalog'

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
        <div className="overflow-x-auto">
          <div style={{ minWidth: 220 + stacks.length * 80 }}>
            <div
              className="grid border-b border-[var(--border)] bg-[var(--surface-2)]"
              style={{ gridTemplateColumns: `220px repeat(${stacks.length}, 1fr)` }}
            >
              <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
                Skill
              </div>
              {stacks.map((stack) => {
                const count = skills.filter((s) => s.stacks.includes(stack.id)).length
                return (
                  <div
                    key={stack.id}
                    className="flex flex-col items-center gap-1 border-l border-[var(--border)] px-2 py-2.5"
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
                    <span className="whitespace-nowrap text-[11px] font-semibold">{stack.label}</span>
                    <span className="font-mono text-[10px] text-[var(--text-3)]">{count}</span>
                  </div>
                )
              })}
            </div>

            {skills.map((skill) => {
              const cat = catOf(skill.cat)
              return (
                <div
                  key={skill.id}
                  className="grid items-center border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)]"
                  style={{ gridTemplateColumns: `220px repeat(${stacks.length}, 1fr)` }}
                >
                  <div className="flex min-w-0 items-center gap-2.5 px-4 py-[11px]">
                    <span
                      className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg"
                      style={{
                        background: hexToRgba(cat.color, 0.14),
                        color: cat.color,
                      }}
                    >
                      <Icon name={skill.icon} bold size={15} />
                    </span>
                    <span className="truncate font-mono text-[12.5px] font-semibold">{skill.id}</span>
                  </div>
                  {stacks.map((stack) => {
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
          </div>
        </div>
      </AdminCard>
    </>
  )
}
