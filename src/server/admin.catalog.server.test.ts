import { beforeEach, describe, expect, it, vi } from 'vitest'

const prisma = vi.hoisted(() => ({
  category: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  stack: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
  },
  skill: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
}))

vi.mock('#/server/db', () => ({ prisma }))
vi.mock('./db', () => ({ prisma }))

vi.mock('./skill-content.server', () => ({
  tryLoadSkillFile: vi.fn(),
}))

import { tryLoadSkillFile } from './skill-content.server'
import {
  createCategory,
  createStack,
  deleteCategory,
  deleteSkill,
  deleteStack,
  loadSkillAdminForm,
  toggleSkillStack,
  upsertSkill,
} from './admin.catalog.server'

const skillInput = {
  id: 'gateguard',
  categoryId: 'security',
  icon: 'shield',
  tagFr: 'Garde',
  tagEn: 'Guard',
  tech: ['ts'],
  compat: ['Cursor'],
  stackIds: ['ts'],
  doesFr: ['filtre'],
  doesEn: [],
  triggersFr: ['merge'],
  triggersEn: [],
  bodyMd: '# body',
}

beforeEach(() => {
  vi.clearAllMocks()
  prisma.category.aggregate.mockResolvedValue({ _max: { sort: 2 } })
  prisma.stack.aggregate.mockResolvedValue({ _max: { sort: 0 } })
  prisma.skill.aggregate.mockResolvedValue({ _max: { sort: 4 } })
})

describe('createCategory / deleteCategory', () => {
  it('refuse un id existant puis crée', async () => {
    prisma.category.findUnique.mockResolvedValue({ id: 'security' })
    await expect(
      createCategory({
        id: 'security',
        labelFr: 'Sécu',
        labelEn: 'Sec',
        color: '#0D9488',
        icon: 'shield',
      }),
    ).rejects.toThrow('category_exists')

    prisma.category.findUnique.mockResolvedValue(null)
    await createCategory({
      id: 'ops',
      labelFr: 'Ops',
      labelEn: 'Ops',
      color: '#111',
      icon: 'cpu',
    })
    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: 'ops', sort: 3 }),
      }),
    )
  })

  it('refuse de supprimer une catégorie utilisée', async () => {
    prisma.skill.count.mockResolvedValue(2)
    await expect(deleteCategory('security')).rejects.toThrow('category_has_skills')

    prisma.skill.count.mockResolvedValue(0)
    await deleteCategory('ops')
    expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: 'ops' } })
  })
})

describe('createStack / deleteStack', () => {
  it('crée une techno ou refuse le doublon', async () => {
    prisma.stack.findUnique.mockResolvedValue({ id: 'ts' })
    await expect(
      createStack({ id: 'ts', label: 'TS', icon: 'code', color: '#3178C6' }),
    ).rejects.toThrow('stack_exists')

    prisma.stack.findUnique.mockResolvedValue(null)
    await createStack({ id: 'node', label: ' Node ', icon: 'cpu', color: '#333' })
    expect(prisma.stack.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'node',
          label: 'Node',
          briefFr: 'Node',
          briefEn: 'Node',
          sort: 1,
        }),
      }),
    )

    await deleteStack('node')
    expect(prisma.stack.delete).toHaveBeenCalledWith({ where: { id: 'node' } })
  })
})

describe('upsertSkill', () => {
  it('met à jour un skill existant', async () => {
    prisma.skill.findUnique.mockResolvedValue({
      id: 'gateguard',
      actFr: 'a',
      actEn: 'b',
    })
    await upsertSkill({ ...skillInput, editingId: 'gateguard' })
    expect(prisma.skill.update).toHaveBeenCalled()
    expect(prisma.skill.create).not.toHaveBeenCalled()
  })

  it('crée un skill et refuse un id déjà pris', async () => {
    prisma.skill.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'gateguard' })
    await expect(upsertSkill(skillInput)).rejects.toThrow('skill_exists')

    prisma.skill.findUnique.mockResolvedValue(null)
    await upsertSkill({
      ...skillInput,
      tagFr: `${'x'.repeat(130)} extra`,
      tagEn: '',
      bodyMd: '  ',
    })
    expect(prisma.skill.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'gateguard',
          sort: 5,
          tagEn: 'x'.repeat(130) + ' extra',
          bodyMd: null,
        }),
      }),
    )
  })
})

describe('loadSkillAdminForm / deleteSkill / toggleSkillStack', () => {
  it('charge le formulaire avec fallback fichier et parse JSON invalide', async () => {
    prisma.skill.findUnique.mockResolvedValue({
      id: 'gateguard',
      categoryId: 'security',
      icon: 'shield',
      tagFr: 'Garde',
      tagEn: 'Guard',
      techJson: '["ts"]',
      compatJson: '{',
      doesFrJson: '["a"]',
      doesEnJson: '[]',
      triggersFrJson: '[]',
      triggersEnJson: '[]',
      bodyMd: null,
      stacks: [{ id: 'ts' }],
    })
    vi.mocked(tryLoadSkillFile).mockResolvedValue('  # from disk  ')
    const form = await loadSkillAdminForm('gateguard')
    expect(form).toMatchObject({
      id: 'gateguard',
      tech: ['ts'],
      compat: [],
      bodyMd: '# from disk',
      stackIds: ['ts'],
    })

    prisma.skill.findUnique.mockResolvedValue(null)
    expect(await loadSkillAdminForm('missing')).toBeNull()

    prisma.skill.findUnique.mockResolvedValue({
      id: 'gateguard',
      categoryId: 'security',
      icon: 'shield',
      tagFr: 'Garde',
      tagEn: 'Guard',
      techJson: '[]',
      compatJson: '[]',
      doesFrJson: '[]',
      doesEnJson: '[]',
      triggersFrJson: '[]',
      triggersEnJson: '[]',
      bodyMd: '  ',
      stacks: [],
    })
    vi.mocked(tryLoadSkillFile).mockRejectedValue(new Error('fs'))
    const empty = await loadSkillAdminForm('gateguard')
    expect(empty?.bodyMd).toBe('')
  })

  it('supprime un skill et bascule une techno', async () => {
    await deleteSkill('gateguard')
    expect(prisma.skill.delete).toHaveBeenCalledWith({ where: { id: 'gateguard' } })

    prisma.skill.findUnique.mockResolvedValue(null)
    await expect(toggleSkillStack('gateguard', 'ts')).rejects.toThrow('skill_not_found')

    prisma.skill.findUnique.mockResolvedValue({
      id: 'gateguard',
      stacks: [{ id: 'ts' }],
    })
    prisma.stack.findUnique.mockResolvedValue(null)
    await expect(toggleSkillStack('gateguard', 'ts')).rejects.toThrow('stack_not_found')

    prisma.stack.findUnique.mockResolvedValue({ id: 'ts' })
    await toggleSkillStack('gateguard', 'ts')
    expect(prisma.skill.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { stacks: { disconnect: { id: 'ts' } } },
      }),
    )

    prisma.skill.findUnique.mockResolvedValue({ id: 'gateguard', stacks: [] })
    await toggleSkillStack('gateguard', 'ts')
    expect(prisma.skill.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { stacks: { connect: { id: 'ts' } } },
      }),
    )
  })
})
