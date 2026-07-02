import Icon from '#/components/Icon'
import { AdminCard, AdminIconBtn } from '#/components/admin/AdminUi'
import { ADMIN_CAT_COLORS, ADMIN_CAT_ICONS } from '#/lib/admin-constants'
import { hexToRgba } from '#/lib/catalog'
import type { AdminCatState, AdminNewCatState, AdminSkillState } from '#/lib/admin-state'

interface AdminCategoriesProps {
  lang: 'fr' | 'en'
  cats: AdminCatState[]
  skills: AdminSkillState[]
  newCat: AdminNewCatState
  onNewCat: (patch: Partial<AdminNewCatState>) => void
  onAdd: () => void
  onRemove: (id: string) => void
  t: {
    catsTitle: string
    newCat: string
    catName: string
    catNamePh: string
    catColor: string
    addCat: string
    remove: string
    catSkillsCount: (n: number) => string
    fIcon: string
  }
}

export default function AdminCategories({
  lang,
  cats,
  skills,
  newCat,
  onNewCat,
  onAdd,
  onRemove,
  t,
}: AdminCategoriesProps) {
  const catValid = newCat.name.trim()

  return (
    <div className="grid items-start gap-[22px] lg:grid-cols-[1fr_320px]">
      <AdminCard>
        <div className="border-b border-[var(--border)] px-[18px] py-3 font-[family-name:var(--font-display)] text-[15px] font-semibold">
          {t.catsTitle}{' '}
          <span className="font-mono text-[12px] font-normal text-[var(--text-3)]">· {cats.length}</span>
        </div>
        {cats.map((cat) => {
          const count = skills.filter((s) => s.cat === cat.id).length
          return (
            <div
              key={cat.id}
              className="flex items-center gap-3 border-b border-[var(--border)] px-[18px] py-3 last:border-0 hover:bg-[var(--surface-hover)]"
            >
              <span
                className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[9px]"
                style={{
                  background: hexToRgba(cat.color, 0.14),
                  color: cat.color,
                }}
              >
                <Icon name={cat.icon} bold size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold">{cat[lang]}</div>
                <div className="font-mono text-[11px] text-[var(--text-3)]">{cat.id}</div>
              </div>
              <span className="text-[12.5px] text-[var(--text-3)]">{t.catSkillsCount(count)}</span>
              <AdminIconBtn title={t.remove} danger onClick={() => onRemove(cat.id)}>
                <Icon name="trash" bold size={14} />
              </AdminIconBtn>
            </div>
          )
        })}
      </AdminCard>

      <div className="sticky top-20 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow-card)]">
        <div className="mb-3.5 font-[family-name:var(--font-display)] text-[15px] font-semibold">
          {t.newCat}
        </div>
        <div className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.catName}</span>
            <input
              value={newCat.name}
              onChange={(e) => onNewCat({ name: e.target.value })}
              placeholder={t.catNamePh}
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
                  onClick={() => onNewCat({ color: hex })}
                  className="h-7 w-7 cursor-pointer rounded-lg border-2"
                  style={{
                    background: hex,
                    borderColor: newCat.color === hex ? 'var(--text-1)' : 'transparent',
                  }}
                  aria-label={hex}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fIcon}</span>
            <div className="flex flex-wrap gap-1.5">
              {ADMIN_CAT_ICONS.map((name) => {
                const on = newCat.icon === name
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onNewCat({ icon: name })}
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
            onClick={onAdd}
            disabled={!catValid}
            className="mt-0.5 flex h-[42px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border-0 text-[14px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: catValid ? 'var(--accent)' : 'var(--text-3)' }}
          >
            <Icon name="plus" bold size={15} />
            {t.addCat}
          </button>
        </div>
      </div>
    </div>
  )
}
