import { createFileRoute, redirect } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminCategories from '#/components/admin/AdminCategories'
import AdminOverview from '#/components/admin/AdminOverview'
import AdminSkillForm from '#/components/admin/AdminSkillForm'
import AdminSkillsList from '#/components/admin/AdminSkillsList'
import AdminSidebar, { AdminHeader } from '#/components/admin/AdminShell'
import AdminTechnos from '#/components/admin/AdminTechnos'
import AdminToast from '#/components/admin/AdminUi'
import type { AdminView } from '#/lib/admin-constants'
import { ADMIN_COMPAT } from '#/lib/admin-constants'
import {
  catalogToAdminState,
  emptyForm,
  formFromSkill,
  formToSkill,
  newCatRecord,
  type AdminCatState,
  type AdminFormState,
  type AdminNewCatState,
  type AdminSkillState,
} from '#/lib/admin-state'
import { useI18n } from '#/lib/i18n'
import { getCatalog } from '#/server/functions'
import { Route as RootRoute } from '#/routes/__root'

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context }) => {
    const user = context.auth.user
    if (!user || user.role !== 'ADMIN') {
      throw redirect({ to: '/' })
    }
  },
  loader: () => getCatalog(),
  component: AdminPage,
})

function AdminPage() {
  const catalog = Route.useLoaderData()
  const { auth } = RootRoute.useRouteContext()
  const { t, lang } = useI18n()
  const a = t.admin

  const [view, setView] = useState<AdminView>('overview')
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [query, setQuery] = useState('')
  const [skills, setSkills] = useState<AdminSkillState[]>([])
  const [cats, setCats] = useState<AdminCatState[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AdminFormState>(emptyForm([]))
  const [newCat, setNewCat] = useState<AdminNewCatState>({
    name: '',
    color: '#43A047',
    icon: 'lightning',
  })
  const [toast, setToast] = useState('')

  useEffect(() => {
    const state = catalogToAdminState(catalog)
    setSkills(state.skills)
    setCats(state.cats)
    setForm(emptyForm(state.cats))
  }, [catalog])

  const expanded = hover || pinned

  const catOf = useCallback(
    (id: string): AdminCatState =>
      cats.find((c) => c.id === id) ?? {
        id,
        fr: id,
        en: id,
        color: '#8A909B',
        icon: 'tag',
      },
    [cats],
  )

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 1900)
  }

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm(cats))
    setView('create')
  }

  const startEdit = (skill: AdminSkillState) => {
    setEditingId(skill.id)
    setForm(formFromSkill(skill))
    setView('create')
  }

  const saveForm = () => {
    const rec = formToSkill(form)
    if (!rec) return
    const list = skills.slice()
    const idx = list.findIndex((s) => s.id === (editingId ?? rec.id))
    if (idx >= 0) {
      list[idx] = rec
    } else {
      const dup = list.findIndex((s) => s.id === rec.id)
      if (dup >= 0) list[dup] = rec
      else list.unshift(rec)
    }
    setSkills(list)
    setView('skills')
    setEditingId(null)
    showToast(editingId ? a.toastUpdated : a.toastCreated)
  }

  const removeSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id))
    showToast(a.toastRemoved)
  }

  const toggleStack = (skillId: string, stackId: string) => {
    setSkills(
      skills.map((s) => {
        if (s.id !== skillId) return s
        const has = s.stacks.includes(stackId)
        return {
          ...s,
          stacks: has ? s.stacks.filter((x) => x !== stackId) : [...s.stacks, stackId],
        }
      }),
    )
  }

  const addCat = () => {
    const rec = newCatRecord(newCat.name, newCat.color, newCat.icon)
    if (!rec || cats.some((c) => c.id === rec.id)) return
    setCats([...cats, rec])
    setNewCat({ name: '', color: '#43A047', icon: 'lightning' })
    showToast(a.toastCatAdded)
  }

  const removeCat = (id: string) => {
    setCats(cats.filter((c) => c.id !== id))
    showToast(a.toastCatRemoved)
  }

  const titleKey = view === 'create' ? (editingId ? 'edit' : 'create') : view
  const [pageTitle, pageSub] = a.titles[titleKey as keyof typeof a.titles]

  const userName = auth.user?.name ?? 'Admin'

  const formT = useMemo(
    () => ({
      fId: a.fId,
      fIcon: a.fIcon,
      fCat: a.fCat,
      fDescFr: a.fDescFr,
      fDescEn: a.fDescEn,
      descPh: a.descPh,
      fTech: a.fTech,
      techHint: a.techHint,
      fCompat: a.fCompat,
      fStacks: a.fStacks,
      cancel: a.cancel,
      save: a.save,
      create: a.create,
    }),
    [a],
  )

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text-1)]">
      <AdminSidebar
        view={view}
        expanded={expanded}
        pinned={pinned}
        onHover={setHover}
        onTogglePin={() => setPinned((p) => !p)}
        onNavigate={setView}
        onStartCreate={startCreate}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={pageTitle}
          subtitle={pageSub}
          userName={userName}
          onStartCreate={startCreate}
        />

        <main className="flex-1 overflow-auto px-7 pb-[60px] pt-[26px]">
          <div className="mx-auto max-w-[1120px]">
            {view === 'overview' && (
              <AdminOverview
                lang={lang}
                skills={skills}
                cats={cats}
                stackCount={catalog.stacks.length}
                compatCount={ADMIN_COMPAT.length}
                t={{
                  statSkills: a.statSkills,
                  statCats: a.statCats,
                  statTechnos: a.statTechnos,
                  statCompat: a.statCompat,
                  recent: a.recent,
                }}
                catOf={catOf}
              />
            )}

            {view === 'skills' && (
              <AdminSkillsList
                lang={lang}
                query={query}
                onQuery={setQuery}
                skills={skills}
                t={{
                  searchSkills: a.searchSkills,
                  skillsCount: a.skillsCount,
                  colCat: a.colCat,
                  colTechnos: a.colTechnos,
                  colActions: a.colActions,
                  edit: a.edit,
                  remove: a.remove,
                  emptySkills: a.emptySkills,
                }}
                catOf={catOf}
                onEdit={startEdit}
                onRemove={removeSkill}
              />
            )}

            {view === 'create' && (
              <AdminSkillForm
                form={form}
                editing={editingId != null}
                stacks={catalog.stacks}
                cats={cats}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                onToggleCompat={(name) =>
                  setForm((f) => ({
                    ...f,
                    compat: f.compat.includes(name)
                      ? f.compat.filter((x) => x !== name)
                      : [...f.compat, name],
                  }))
                }
                onToggleStack={(id) =>
                  setForm((f) => ({
                    ...f,
                    stacks: f.stacks.includes(id)
                      ? f.stacks.filter((x) => x !== id)
                      : [...f.stacks, id],
                  }))
                }
                onCancel={() => {
                  setView('skills')
                  setEditingId(null)
                }}
                onSave={saveForm}
                t={formT}
                lang={lang}
              />
            )}

            {view === 'cats' && (
              <AdminCategories
                lang={lang}
                cats={cats}
                skills={skills}
                newCat={newCat}
                onNewCat={(patch) => setNewCat((c) => ({ ...c, ...patch }))}
                onAdd={addCat}
                onRemove={removeCat}
                t={{
                  catsTitle: a.catsTitle,
                  newCat: a.newCat,
                  catName: a.catName,
                  catNamePh: a.catNamePh,
                  catColor: a.catColor,
                  addCat: a.addCat,
                  remove: a.remove,
                  catSkillsCount: a.catSkillsCount,
                  fIcon: a.fIcon,
                }}
              />
            )}

            {view === 'technos' && (
              <AdminTechnos
                stacks={catalog.stacks}
                skills={skills}
                onToggle={toggleStack}
                catOf={catOf}
                t={{ technosIntro: a.technosIntro }}
              />
            )}
          </div>
        </main>
      </div>

      <AdminToast show={!!toast} text={toast} />
    </div>
  )
}
