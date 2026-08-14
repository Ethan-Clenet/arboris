import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SkillDetail } from '#/lib/catalog'

vi.mock('./catalog.server', () => ({
  loadSkill: vi.fn(),
}))

vi.mock('#/lib/skill-file', () => ({
  tryLoadSkillFile: vi.fn(),
  loadSkillFileContent: vi.fn(),
}))

const prisma = vi.hoisted(() => ({
  skill: { findUnique: vi.fn() },
}))

vi.mock('./db', () => ({ prisma }))

import { loadSkill } from './catalog.server'
import { tryLoadSkillFile, loadSkillFileContent } from '#/lib/skill-file'
import { loadSkillCopyContent, loadSkillWithCopy, tryLoadSkillFile as tryLoadSkillDb } from './skill-content.server'

const skill: SkillDetail = {
  id: 'gateguard',
  categoryId: 'security',
  icon: 'shield',
  score: 90,
  securityRecommendation: 'SAFE',
  scannedAt: null,
  publisher: null,
  tech: [],
  compat: [],
  stacks: [],
  tag: { fr: 'Garde', en: 'Guard' },
  act: { fr: 'filtre', en: 'filters' },
  does: { fr: ['a'], en: ['a'] },
  triggers: { fr: ['b'], en: ['b'] },
  securityReport: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(loadSkill).mockResolvedValue(skill)
  vi.mocked(tryLoadSkillFile).mockResolvedValue(null)
  vi.mocked(loadSkillFileContent).mockResolvedValue(null)
  prisma.skill.findUnique.mockResolvedValue(null)
})

describe('loadSkillCopyContent', () => {
  it('retourne null si le skill n’existe pas', async () => {
    vi.mocked(loadSkill).mockResolvedValue(null)
    expect(await loadSkillCopyContent('x', 'fr')).toBeNull()
  })

  it('privilégie le fichier disque, puis bodyMd, puis markdown généré', async () => {
    vi.mocked(tryLoadSkillFile).mockResolvedValue('  # disk  ')
    expect(await loadSkillCopyContent('gateguard', 'fr')).toBe('# disk')

    vi.mocked(tryLoadSkillFile).mockResolvedValue(null)
    prisma.skill.findUnique.mockResolvedValue({ bodyMd: '  # db  ' })
    expect(await loadSkillCopyContent('gateguard', 'fr')).toBe('# db')

    prisma.skill.findUnique.mockResolvedValue({ bodyMd: null })
    vi.mocked(loadSkillFileContent).mockResolvedValue('# generated-file')
    expect(await loadSkillCopyContent('gateguard', 'en')).toBe('# generated-file')

    vi.mocked(loadSkillFileContent).mockResolvedValue(null)
    const md = await loadSkillCopyContent('gateguard', 'fr')
    expect(md).toContain('name: gateguard')
    expect(md).toContain('Garde')
  })
})

describe('tryLoadSkillFile / loadSkillWithCopy', () => {
  it('lit le disque ou le bodyMd', async () => {
    vi.mocked(tryLoadSkillFile).mockResolvedValue('  from disk  ')
    expect(await tryLoadSkillDb('gateguard')).toBe('  from disk  ')

    vi.mocked(tryLoadSkillFile).mockResolvedValue(null)
    prisma.skill.findUnique.mockResolvedValue({ bodyMd: '  db  ' })
    expect(await tryLoadSkillDb('gateguard')).toBe('db')

    prisma.skill.findUnique.mockResolvedValue({ bodyMd: null })
    expect(await tryLoadSkillDb('gateguard')).toBeNull()
  })

  it('assemble skill + copy, ou null', async () => {
    vi.mocked(loadSkill).mockResolvedValue(null)
    expect(await loadSkillWithCopy('x', 'fr')).toBeNull()

    vi.mocked(loadSkill).mockResolvedValue(skill)
    vi.mocked(tryLoadSkillFile).mockResolvedValue('# copy')
    const packed = await loadSkillWithCopy('gateguard', 'fr')
    expect(packed).toMatchObject({ skill, copyContent: '# copy' })
  })
})
