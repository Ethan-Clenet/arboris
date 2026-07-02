import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
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
  newStackRecord,
  type AdminCatState,
  type AdminFormState,
  type AdminNewCatState,
  type AdminNewStackState,
  type AdminSkillState,
} from '#/lib/admin-state'
import { useI18n } from '#/lib/i18n'
import {
  adminCreateCategory,
  adminCreateStack,
  adminDeleteCategory,
  adminDeleteSkill,
  adminDeleteStack,
  adminToggleSkillStack,
  adminUpsertSkill,
  type AdminMutationError,
} from '#/server/admin.functions'
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
  const router = useRouter()
  const { auth } = RootRoute.useRouteContext()
  const { t, lang } = useI18n()
  const a = t.admin

  const createCategoryFn = useServerFn(adminCreateCategory)
  const createStackFn = useServerFn(adminCreateStack)
  const deleteCategoryFn = useServerFn(adminDeleteCategory)
  const deleteStackFn = useServerFn(adminDeleteStack)
  const upsertSkillFn = useServerFn(adminUpsertSkill)
  const deleteSkillFn = useServerFn(adminDeleteSkill)
  const toggleStackFn = useServerFn(adminToggleSkillStack)

  const [view, setView] = useState<AdminView>('overview')
  const [hover, setHover] = useState(false)
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
  const [newStack, setNewStack] = useState<AdminNewStackState>({
    name: '',
    color: '#43A047',
    icon: 'hexagon',
  })
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const state = catalogToAdminState(catalog)
    setSkills(state.skills)
    setCats(state.cats)
    setForm((prev) => (view === 'create' ? prev : emptyForm(state.cats)))
  }, [catalog, view])

  const expanded = hover

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

  const mapError = (error: AdminMutationError) => {
    switch (error) {
      case 'category_exists':
        return a.toastCatExists
      case 'stack_exists':
        return a.toastStackExists
      case 'category_has_skills':
        return a.toastCatInUse
      case 'forbidden':
        return a.forbidden
      default:
        return a.toastError
    }
  }

  const refreshCatalog = async () => {
    await router.invalidate()
  }

  const runMutation = async (
    fn: () => Promise<{ ok: boolean; error?: AdminMutationError }>,
    successMsg: string,
  ) => {
    setSaving(true)
    try {
      const result = await fn()
      if (!result.ok) {
        showToast(mapError(result.error ?? 'generic'))
        return false
      }
      await refreshCatalog()
      showToast(successMsg)
      return true
    } finally {
      setSaving(false)
    }
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

  const saveForm = async () => {
    const rec = formToSkill(form)
    if (!rec) return
    const ok = await runMutation(
      () =>
        upsertSkillFn({
          data: {
            id: rec.id,
            categoryId: rec.cat,
            icon: rec.icon,
            tagFr: rec.tag.fr,
            tagEn: rec.tag.en,
            tech: rec.tech,
            compat: rec.compat,
            stackIds: rec.stacks,
            editingId: editingId ?? undefined,
          },
        }),
      editingId ? a.toastUpdated : a.toastCreated,
    )
    if (ok) {
      setView('skills')
      setEditingId(null)
    }
  }

  const removeSkill = async (id: string) => {
    const ok = await runMutation(() => deleteSkillFn({ data: { id } }), a.toastRemoved)
    if (ok && editingId === id) {
      setEditingId(null)
      setView('skills')
    }
  }

  const toggleStack = async (skillId: string, stackId: string) => {
    setSaving(true)
    try {
      const result = await toggleStackFn({ data: { skillId, stackId } })
      if (!result.ok) {
        showToast(mapError(result.error ?? 'generic'))
        return
      }
      await refreshCatalog()
    } finally {
      setSaving(false)
    }
  }

  const addCat = async () => {
    const rec = newCatRecord(newCat.name, newCat.color, newCat.icon)
    if (!rec || cats.some((c) => c.id === rec.id)) {
      if (rec && cats.some((c) => c.id === rec.id)) showToast(a.toastCatExists)
      return
    }
    const ok = await runMutation(
      () =>
        createCategoryFn({
          data: {
            id: rec.id,
            labelFr: rec.fr,
            labelEn: rec.en,
            color: rec.color,
            icon: rec.icon,
          },
        }),
      a.toastCatAdded,
    )
    if (ok) {
      setNewCat({ name: '', color: '#43A047', icon: 'lightning' })
    }
  }

  const removeCat = async (id: string) => {
    await runMutation(() => deleteCategoryFn({ data: { id } }), a.toastCatRemoved)
  }

  const addStack = async () => {
    const rec = newStackRecord(newStack.name, newStack.color, newStack.icon)
    if (!rec || catalog.stacks.some((s) => s.id === rec.id)) {
      if (rec && catalog.stacks.some((s) => s.id === rec.id)) showToast(a.toastStackExists)
      return
    }
    const ok = await runMutation(
      () =>
        createStackFn({
          data: {
            id: rec.id,
            label: rec.label,
            icon: rec.icon,
            color: rec.color,
          },
        }),
      a.toastStackAdded,
    )
    if (ok) {
      setNewStack({ name: '', color: '#43A047', icon: 'hexagon' })
    }
  }

  const removeStack = async (id: string) => {
    await runMutation(() => deleteStackFn({ data: { id } }), a.toastStackRemoved)
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
        onHover={setHover}
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
                saving={saving}
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
                saving={saving}
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
                newStack={newStack}
                saving={saving}
                onNewStack={(patch) => setNewStack((s) => ({ ...s, ...patch }))}
                onAddStack={addStack}
                onRemoveStack={removeStack}
                onToggle={toggleStack}
                catOf={catOf}
                t={{
                  technosIntro: a.technosIntro,
                  catsVsTechnosHint: a.catsVsTechnosHint,
                  stacksTitle: a.stacksTitle,
                  newStack: a.newStack,
                  stackName: a.stackName,
                  stackNamePh: a.stackNamePh,
                  addStack: a.addStack,
                  remove: a.remove,
                  fIcon: a.fIcon,
                  catColor: a.catColor,
                  filterTechnoHint: a.filterTechnoHint,
                  clearTechnoFilters: a.clearTechnoFilters,
                  matrixNoMatch: a.matrixNoMatch,
                }}
              />
            )}
          </div>
        </main>
      </div>

      <AdminToast show={!!toast} text={toast} />
    </div>
  )
}
