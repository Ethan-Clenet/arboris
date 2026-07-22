import Icon from '#/components/Icon'
import { adminFieldClass, adminTextareaClass } from '#/components/admin/AdminUi'
import { ADMIN_COMPAT, ADMIN_SKILL_ICONS } from '#/lib/admin-constants'
import { AgentBadge } from '#/components/AgentLogo'
import { hexToRgba } from '#/lib/catalog'
import type { AdminCatState, AdminFormState } from '#/lib/admin-state'
import type { Stack } from '#/lib/catalog'

interface AdminSkillFormProps {
  form: AdminFormState
  editing: boolean
  stacks: Stack[]
  cats: AdminCatState[]
  saving?: boolean
  onChange: (patch: Partial<AdminFormState>) => void
  onToggleCompat: (name: string) => void
  onToggleStack: (id: string) => void
  onCancel: () => void
  onSave: () => void
  t: {
    fId: string
    fIcon: string
    fCat: string
    fDescFr: string
    fDescEn: string
    descPh: string
    fBody: string
    bodyPh: string
    bodyHint: string
    fDoesFr: string
    fDoesEn: string
    fTriggersFr: string
    fTriggersEn: string
    listPh: string
    listHint: string
    fTech: string
    techHint: string
    fCompat: string
    fStacks: string
    cancel: string
    save: string
    create: string
  }
  lang: 'fr' | 'en'
}

export default function AdminSkillForm({
  form,
  editing,
  stacks,
  cats,
  onChange,
  onToggleCompat,
  onToggleStack,
  onCancel,
  onSave,
  t,
  lang,
  saving = false,
}: AdminSkillFormProps) {
  const valid = form.id.trim() && form.descFr.trim()
  const saveLabel = editing ? t.save : t.create

  return (
    <div className="max-w-[720px]">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-[18px]">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fId}</span>
              <input
                value={form.id}
                onChange={(e) => onChange({ id: e.target.value })}
                disabled={editing}
                placeholder="mon-super-skill"
                className={`${adminFieldClass} font-mono ${editing ? 'bg-[var(--surface-2)]' : ''}`}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fIcon}</span>
              <div className="flex items-center gap-2">
                <span className="grid h-[42px] w-[42px] flex-none place-items-center rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon name={form.icon} bold size={20} />
                </span>
                <select
                  value={form.icon}
                  onChange={(e) => onChange({ icon: e.target.value })}
                  className={`${adminFieldClass} flex-1`}
                >
                  {ADMIN_SKILL_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fCat}</span>
            <select
              value={form.cat}
              onChange={(e) => onChange({ cat: e.target.value })}
              className={adminFieldClass}
            >
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c[lang]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fDescFr}</span>
            <textarea
              value={form.descFr}
              onChange={(e) => onChange({ descFr: e.target.value })}
              rows={2}
              placeholder={t.descPh}
              className={adminTextareaClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fDescEn}</span>
            <textarea
              value={form.descEn}
              onChange={(e) => onChange({ descEn: e.target.value })}
              rows={2}
              placeholder={t.descPh}
              className={adminTextareaClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fBody}</span>
            <textarea
              value={form.bodyMd}
              onChange={(e) => onChange({ bodyMd: e.target.value })}
              rows={14}
              placeholder={t.bodyPh}
              className={`${adminTextareaClass} font-mono text-[12.5px] leading-[1.55]`}
            />
            <span className="text-[11.5px] text-[var(--text-3)]">{t.bodyHint}</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fDoesFr}</span>
              <textarea
                value={form.doesFr}
                onChange={(e) => onChange({ doesFr: e.target.value })}
                rows={5}
                placeholder={t.listPh}
                className={adminTextareaClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fDoesEn}</span>
              <textarea
                value={form.doesEn}
                onChange={(e) => onChange({ doesEn: e.target.value })}
                rows={5}
                placeholder={t.listPh}
                className={adminTextareaClass}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fTriggersFr}</span>
              <textarea
                value={form.triggersFr}
                onChange={(e) => onChange({ triggersFr: e.target.value })}
                rows={4}
                placeholder={t.listPh}
                className={adminTextareaClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fTriggersEn}</span>
              <textarea
                value={form.triggersEn}
                onChange={(e) => onChange({ triggersEn: e.target.value })}
                rows={4}
                placeholder={t.listPh}
                className={adminTextareaClass}
              />
            </label>
          </div>
          <span className="-mt-2 text-[11.5px] text-[var(--text-3)]">{t.listHint}</span>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fTech}</span>
            <input
              value={form.tech}
              onChange={(e) => onChange({ tech: e.target.value })}
              placeholder="Node.js, TypeScript, Fastify"
              className={adminFieldClass}
            />
            <span className="text-[11.5px] text-[var(--text-3)]">{t.techHint}</span>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fCompat}</span>
            <div className="flex flex-wrap gap-2">
              {ADMIN_COMPAT.map((cm) => {
                const on = form.compat.includes(cm.name)
                return (
                  <AgentBadge
                    key={cm.name}
                    agent={cm.name}
                    active={on}
                    size={15}
                    onClick={() => onToggleCompat(cm.name)}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] font-semibold text-[var(--text-2)]">{t.fStacks}</span>
            <div className="flex flex-wrap gap-2">
              {stacks.map((stack) => {
                const on = form.stacks.includes(stack.id)
                return (
                  <button
                    key={stack.id}
                    type="button"
                    onClick={() => onToggleStack(stack.id)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors"
                    style={{
                      border: `1px solid ${on ? 'var(--accent-border)' : 'var(--border)'}`,
                      background: on ? 'var(--accent-soft)' : 'var(--surface)',
                      color: on ? 'var(--text-1)' : 'var(--text-2)',
                    }}
                  >
                    <span
                      className="grid h-[18px] w-[18px] place-items-center rounded-[5px]"
                      style={{
                        background: hexToRgba(stack.color, 0.16),
                        color: stack.color,
                      }}
                    >
                      <Icon name={stack.icon} bold size={11} />
                    </span>
                    {stack.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-1 flex items-center justify-end gap-2.5 border-t border-[var(--border)] pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="cursor-pointer rounded-[10px] border border-[var(--border-2)] bg-[var(--surface)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--text-1)] transition-colors hover:border-[var(--text-3)]"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!valid || saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border-0 px-[18px] py-2.5 text-[13.5px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: valid ? 'var(--accent)' : 'var(--text-3)' }}
            >
              <Icon name="check" bold size={15} />
              {saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
