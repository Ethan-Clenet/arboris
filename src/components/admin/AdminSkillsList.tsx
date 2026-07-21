import Icon from '#/components/Icon'
import { AdminCard, AdminIconBtn } from '#/components/admin/AdminUi'
import SecurityBadge from '#/components/SecurityBadge'
import type { Lang } from '#/lib/catalog'
import { hexToRgba } from '#/lib/catalog'
import type { AdminCatState, AdminSkillState } from '#/lib/admin-state'

interface AdminSkillsListProps {
  lang: Lang
  query: string
  onQuery: (q: string) => void
  skills: AdminSkillState[]
  t: {
    searchSkills: string
    skillsCount: (n: number) => string
    colCat: string
    colTechnos: string
    colActions: string
    edit: string
    remove: string
    emptySkills: string
  }
  catOf: (id: string) => AdminCatState
  onEdit: (skill: AdminSkillState) => void
  onRemove: (id: string) => void
}

export default function AdminSkillsList({
  lang,
  query,
  onQuery,
  skills,
  t,
  catOf,
  onEdit,
  onRemove,
}: AdminSkillsListProps) {
  const ql = query.trim().toLowerCase()
  const filtered = ql
    ? skills.filter(
        (s) =>
          `${s.id} ${s.tag[lang]} ${s.tech.join(' ')}`.toLowerCase().includes(ql),
      )
    : skills

  const badgeLabels =
    lang === 'fr'
      ? {
          unscanned: 'Non scanné',
          safe: 'Sûr',
          caution: 'Attention',
          unsafe: 'Risqué',
          score: (n: number) => `Sûreté ${n}/100`,
        }
      : {
          unscanned: 'Unscanned',
          safe: 'Safe',
          caution: 'Caution',
          unsafe: 'Risky',
          score: (n: number) => `Safety ${n}/100`,
        }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-[340px] flex-1">
          <Icon
            name="magnifying-glass"
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
          />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t.searchSkills}
            className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] py-0 pl-[34px] pr-3 text-[13.5px] text-[var(--text-1)] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </div>
        <span className="text-[13px] text-[var(--text-3)]">{t.skillsCount(filtered.length)}</span>
        <span className="font-mono text-[11px] text-[var(--text-3)]">
          npm run skills:scan -- &lt;id&gt; --force
        </span>
      </div>

      <AdminCard>
        <div className="grid grid-cols-[minmax(160px,1.2fr)_minmax(160px,1.6fr)_110px_120px_96px] gap-3.5 border-b border-[var(--border)] bg-[var(--surface-2)] px-[18px] py-[11px] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
          <div>Skill</div>
          <div>Description</div>
          <div>Sécurité</div>
          <div>{t.colCat}</div>
          <div className="text-right">{t.colActions}</div>
        </div>
        {filtered.length === 0 ? (
          <div className="px-10 py-10 text-center text-[13.5px] text-[var(--text-3)]">
            {t.emptySkills}
          </div>
        ) : (
          filtered.map((skill) => {
            const cat = catOf(skill.cat)
            return (
              <div
                key={skill.id}
                className="grid grid-cols-[minmax(160px,1.2fr)_minmax(160px,1.6fr)_110px_120px_96px] items-center gap-3.5 border-b border-[var(--border)] px-[18px] py-3 last:border-0 hover:bg-[var(--surface-hover)]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="grid h-8 w-8 flex-none place-items-center rounded-[9px]"
                    style={{
                      background: hexToRgba(cat.color, 0.14),
                      color: cat.color,
                    }}
                  >
                    <Icon name={skill.icon} bold size={16} />
                  </span>
                  <span className="truncate font-mono text-[13px] font-semibold">{skill.id}</span>
                </div>
                <div className="truncate text-[12.5px] text-[var(--text-2)]">{skill.tag[lang]}</div>
                <div className="flex items-center">
                  <SecurityBadge
                    score={skill.score}
                    recommendation={skill.securityRecommendation}
                    labels={badgeLabels}
                  />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-2)]">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: cat.color }}
                    />
                    {cat[lang]}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <AdminIconBtn title={t.edit} onClick={() => onEdit(skill)}>
                    <Icon name="pencil-simple" bold size={14} />
                  </AdminIconBtn>
                  <AdminIconBtn title={t.remove} danger onClick={() => onRemove(skill.id)}>
                    <Icon name="trash" bold size={14} />
                  </AdminIconBtn>
                </div>
              </div>
            )
          })
        )}
      </AdminCard>
    </>
  )
}
