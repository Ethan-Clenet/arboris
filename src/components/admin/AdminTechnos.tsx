import Icon from '#/components/Icon'
import { AdminCard } from '#/components/admin/AdminUi'
import { hexToRgba } from '#/lib/catalog'
import type { AdminCatState, AdminSkillState } from '#/lib/admin-state'
import type { Stack } from '#/lib/catalog'

interface AdminTechnosProps {
  stacks: Stack[]
  skills: AdminSkillState[]
  onToggle: (skillId: string, stackId: string) => void
  catOf: (id: string) => AdminCatState
  t: { technosIntro: string }
}

export default function AdminTechnos({ stacks, skills, onToggle, catOf, t }: AdminTechnosProps) {
  return (
    <>
      <p className="mb-4 max-w-[640px] text-[13.5px] text-[var(--text-2)]">{t.technosIntro}</p>
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
                    <span className="text-[11px] font-semibold whitespace-nowrap">{stack.label}</span>
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
                          onClick={() => onToggle(skill.id, stack.id)}
                          className="grid h-[26px] w-[26px] cursor-pointer place-items-center rounded-[7px] border-[1.5px] text-white transition-all"
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
