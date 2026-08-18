// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '#/lib/i18n'
import { emptyForm } from '#/lib/admin-state'
import { ADMIN_CAT_COLORS } from '#/lib/admin-constants'
import { serverFns, testRouter } from '#/test/harness'
import {
  catSecurity,
  filledForm,
  formT,
  skillGate,
  skillRisky,
  stackTs,
} from '#/test/admin-fixtures'
import AdminOverview from './AdminOverview'
import AdminSkillsList from './AdminSkillsList'
import AdminCategories from './AdminCategories'
import AdminSkillForm from './AdminSkillForm'
import AdminTechnos from './AdminTechnos'
import AdminSidebar, { AdminHeader } from './AdminShell'

const overviewT = {
  statSkills: 'Skills',
  statCats: 'Catégories',
  statTechnos: 'Technos',
  statCompat: 'Agents compatibles',
  recent: 'Skills récents',
}

const listT = {
  searchSkills: 'Rechercher un skill…',
  skillsCount: (n: number) => `${n} skills`,
  colCat: 'Catégorie',
  colTechnos: 'Technos',
  colActions: 'Actions',
  edit: 'Modifier',
  remove: 'Supprimer',
  emptySkills: 'Aucun skill.',
}

const catsT = {
  catsTitle: 'Catégories',
  newCat: 'Nouvelle catégorie',
  catName: 'Nom',
  catNamePh: 'ex. Base de données',
  catColor: 'Couleur',
  addCat: 'Ajouter la catégorie',
  remove: 'Supprimer',
  catSkillsCount: (n: number) => `${n} skills`,
  fIcon: 'Icône',
}

const technosT = {
  technosIntro: 'Intro technos',
  catsVsTechnosHint: 'Hint',
  stacksTitle: 'Technologies',
  newStack: 'Nouvelle techno',
  stackName: 'Nom',
  stackNamePh: 'ex. Bun',
  addStack: 'Ajouter la techno',
  remove: 'Supprimer',
  fIcon: 'Icône',
  catColor: 'Couleur',
  filterTechnoHint: 'Filtrer',
  clearTechnoFilters: 'Effacer les filtres',
  matrixNoMatch: 'Aucun skill ne correspond aux filtres.',
}

function wrap(ui: ReactNode) {
  return <I18nProvider>{ui}</I18nProvider>
}

describe('AdminOverview', () => {
  it('affiche les stats et les skills récents', () => {
    render(
      <AdminOverview
        lang="fr"
        skills={[skillGate, skillRisky]}
        cats={[catSecurity]}
        stackCount={3}
        compatCount={4}
        t={overviewT}
        catOf={() => catSecurity}
      />,
    )
    expect(screen.getByText('Skills')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('gateguard')).toBeTruthy()
    expect(screen.getByText('Garde')).toBeTruthy()
  })
})

describe('AdminSkillsList', () => {
  it('filtre, édite et supprime', async () => {
    const user = userEvent.setup()
    const onQuery = vi.fn()
    const onEdit = vi.fn()
    const onRemove = vi.fn()
    const { rerender } = render(
      <AdminSkillsList
        lang="en"
        query=""
        onQuery={onQuery}
        skills={[skillGate, skillRisky]}
        t={listT}
        catOf={() => catSecurity}
        onEdit={onEdit}
        onRemove={onRemove}
      />,
    )
    expect(screen.getByText('2 skills')).toBeTruthy()
    expect(screen.getByText('Guard')).toBeTruthy()

    await user.type(screen.getByPlaceholderText('Rechercher un skill…'), 'gate')
    expect(onQuery).toHaveBeenCalled()

    rerender(
      <AdminSkillsList
        lang="fr"
        query="zzzz"
        onQuery={onQuery}
        skills={[skillGate]}
        t={listT}
        catOf={() => catSecurity}
        onEdit={onEdit}
        onRemove={onRemove}
      />,
    )
    expect(screen.getByText('Aucun skill.')).toBeTruthy()

    rerender(
      <AdminSkillsList
        lang="fr"
        query="gate"
        onQuery={onQuery}
        skills={[skillGate, skillRisky]}
        t={listT}
        catOf={() => catSecurity}
        onEdit={onEdit}
        onRemove={onRemove}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Modifier' }))
    expect(onEdit).toHaveBeenCalledWith(skillGate)
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(onRemove).toHaveBeenCalledWith('gateguard')
  })
})

describe('AdminCategories', () => {
  it('ajoute une catégorie et en supprime une', async () => {
    const user = userEvent.setup()
    const onNewCat = vi.fn()
    const onAdd = vi.fn()
    const onRemove = vi.fn()
    const { rerender } = render(
      <AdminCategories
        lang="fr"
        cats={[catSecurity]}
        skills={[skillGate]}
        newCat={{ name: '', color: ADMIN_CAT_COLORS[0], icon: 'lightning' }}
        onNewCat={onNewCat}
        onAdd={onAdd}
        onRemove={onRemove}
        t={catsT}
      />,
    )
    expect(screen.getByText('1 skills')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ajouter la catégorie' })).toHaveProperty(
      'disabled',
      true,
    )

    await user.type(screen.getByPlaceholderText('ex. Base de données'), 'Ops')
    expect(onNewCat).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: ADMIN_CAT_COLORS[1] }))
    expect(onNewCat).toHaveBeenCalledWith({ color: ADMIN_CAT_COLORS[1] })

    rerender(
      <AdminCategories
        lang="fr"
        cats={[catSecurity]}
        skills={[skillGate]}
        newCat={{ name: 'Ops', color: ADMIN_CAT_COLORS[0], icon: 'cpu' }}
        onNewCat={onNewCat}
        onAdd={onAdd}
        onRemove={onRemove}
        t={catsT}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Ajouter la catégorie' }))
    expect(onAdd).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(onRemove).toHaveBeenCalledWith('security')
  })
})

describe('AdminSkillForm', () => {
  it('désactive la création tant que le formulaire est vide', () => {
    render(
      <AdminSkillForm
        form={emptyForm([catSecurity])}
        editing={false}
        stacks={[stackTs]}
        cats={[catSecurity]}
        onChange={() => {}}
        onToggleCompat={() => {}}
        onToggleStack={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
        t={formT}
        lang="fr"
      />,
    )
    expect(screen.getByRole('button', { name: 'Créer le skill' })).toHaveProperty('disabled', true)
  })

  it('propage les changements et la sauvegarde', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onToggleCompat = vi.fn()
    const onToggleStack = vi.fn()
    const onCancel = vi.fn()
    const onSave = vi.fn()
    render(
      <AdminSkillForm
        form={filledForm()}
        editing
        stacks={[stackTs]}
        cats={[catSecurity]}
        onChange={onChange}
        onToggleCompat={onToggleCompat}
        onToggleStack={onToggleStack}
        onCancel={onCancel}
        onSave={onSave}
        t={formT}
        lang="en"
      />,
    )
    expect(screen.getByDisplayValue('gateguard')).toHaveProperty('disabled', true)
    await user.click(screen.getByRole('button', { name: 'Cursor' }))
    expect(onToggleCompat).toHaveBeenCalledWith('Cursor')
    await user.click(screen.getByRole('button', { name: /TypeScript/ }))
    expect(onToggleStack).toHaveBeenCalledWith('ts')
    await user.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(onCancel).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(onSave).toHaveBeenCalled()
  })
})

describe('AdminTechnos', () => {
  it('filtre la matrice et bascule une case', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const onNewStack = vi.fn()
    const onAddStack = vi.fn()
    const onRemoveStack = vi.fn()
    render(
      <AdminTechnos
        stacks={[stackTs]}
        skills={[skillGate, skillRisky]}
        newStack={{ name: '', color: ADMIN_CAT_COLORS[0], icon: 'package' }}
        onNewStack={onNewStack}
        onAddStack={onAddStack}
        onRemoveStack={onRemoveStack}
        onToggle={onToggle}
        catOf={() => catSecurity}
        t={technosT}
      />,
    )
    expect(screen.getByText('gateguard')).toBeTruthy()
    const filterChip = screen.getByRole('button', { name: 'TS' })
    await user.click(filterChip)
    expect(filterChip.getAttribute('aria-pressed')).toBe('true')
    await user.click(screen.getByRole('button', { name: 'Effacer les filtres' }))

    await user.type(screen.getByPlaceholderText('Filtrer les skills…'), 'zzzz')
    expect(screen.getByText('Aucun skill ne correspond aux filtres.')).toBeTruthy()
    await user.clear(screen.getByPlaceholderText('Filtrer les skills…'))

    const matrix = screen
      .getAllByTitle('TypeScript')
      .filter((el) => el.tagName === 'BUTTON' && el.getAttribute('aria-pressed') == null)
    await user.click(matrix[0]!)
    expect(onToggle).toHaveBeenCalledWith('gateguard', 'ts')

    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(onRemoveStack).toHaveBeenCalledWith('ts')
  })
})

describe('AdminSidebar / AdminHeader', () => {
  it('navigue, déconnecte et crée un skill', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    const onStartCreate = vi.fn()
    const onHover = vi.fn()
    render(
      wrap(
        <>
          <AdminSidebar
            view="overview"
            expanded
            onHover={onHover}
            onNavigate={onNavigate}
            onStartCreate={onStartCreate}
          />
          <AdminHeader
            title="Vue"
            subtitle="sub"
            userName="Ada Lovelace"
            onStartCreate={onStartCreate}
          />
        </>,
      ),
    )
    expect(screen.getByText('AL')).toBeTruthy()
    await user.hover(screen.getByRole('complementary'))
    expect(onHover).toHaveBeenCalledWith(true)
    await user.click(screen.getByRole('button', { name: 'Skills' }))
    expect(onNavigate).toHaveBeenCalledWith('skills')
    await user.click(screen.getAllByRole('button', { name: 'Créer un skill' })[0]!)
    expect(onStartCreate).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Déconnexion' }))
    await waitFor(() => {
      expect(serverFns.logout).toHaveBeenCalled()
      expect(testRouter.invalidate).toHaveBeenCalled()
    })
  })
})
