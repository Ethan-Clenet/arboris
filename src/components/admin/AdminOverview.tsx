import Icon from '#/components/Icon'
import { AdminCard } from '#/components/admin/AdminUi'
import type { Lang } from '#/lib/catalog'
import { hexToRgba } from '#/lib/catalog'
import type { AdminCatState, AdminSkillState } from '#/lib/admin-state'

interface AdminOverviewProps {
  lang: Lang
  skills: AdminSkillState[]
  cats: AdminCatState[]
  stackCount: number
  compatCount: number
  t: {
    statSkills: string
    statCats: string
    statTechnos: string
    statCompat: string
    recent: string
  }
  catOf: (id: string) => AdminCatState
}

export default function AdminOverview({
  lang,
  skills,
  cats,
  stackCount,
  compatCount,
  t,
  catOf,
}: AdminOverviewProps) {
  const stats = [
    { label: t.statSkills, value: skills.length, icon: 'stack' },
    { label: t.statCats, value: cats.length, icon: 'tag' },
    { label: t.statTechnos, value: stackCount, icon: 'circuitry' },
    { label: t.statCompat, value: compatCount, icon: 'robot' },
  ]

  const recent = skills.slice(0, 6)

  return (
    <>
      <div className="mb-[22px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]"
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[12.5px] text-[var(--text-3)]">{s.label}</span>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon name={s.icon} bold size={15} />
              </span>
            </div>
            <div className="font-[family-name:var(--font-display)] text-[28px] font-bold tracking-tight">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <AdminCard>
        <div className="border-b border-[var(--border)] px-[18px] py-3.5 font-[family-name:var(--font-display)] text-[15px] font-semibold">
          {t.recent}
        </div>
        {recent.map((skill) => {
          const cat = catOf(skill.cat)
          return (
            <div
              key={skill.id}
              className="flex items-center gap-3 border-b border-[var(--border)] px-[18px] py-3 last:border-0"
            >
              <span
                className="grid h-8 w-8 flex-none place-items-center rounded-[9px]"
                style={{
                  background: hexToRgba(cat.color, 0.14),
                  color: cat.color,
                }}
              >
                <Icon name={skill.icon} bold size={16} />
              </span>
              <span className="min-w-[150px] font-mono text-[13.5px] font-semibold">{skill.id}</span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--text-2)]">
                {skill.tag[lang]}
              </span>
              <span className="whitespace-nowrap text-[11.5px] text-[var(--text-3)]">
                {cat[lang]}
              </span>
            </div>
          )
        })}
      </AdminCard>
    </>
  )
}
