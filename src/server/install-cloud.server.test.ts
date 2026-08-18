import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/server/catalog.server', () => ({
  loadCollection: vi.fn(),
  loadSkill: vi.fn(),
}))

vi.mock('#/server/skill-content.server', () => ({
  loadSkillCopyContent: vi.fn(),
}))

vi.mock('#/lib/skill-package', () => ({
  listSkillPackageFiles: vi.fn(),
  skillPackageHasCompanions: vi.fn(),
}))

vi.mock('#/server/commands.server', () => ({
  resolveCommand: vi.fn(),
}))

import { loadCollection, loadSkill } from '#/server/catalog.server'
import { loadSkillCopyContent } from '#/server/skill-content.server'
import { listSkillPackageFiles, skillPackageHasCompanions } from '#/lib/skill-package'
import { resolveCommand } from '#/server/commands.server'
import {
  buildCollectionZip,
  buildCommandZip,
  buildSkillZip,
  isWorkspaceInstallConfigured,
} from './install-cloud.server'

const envKey = 'ARBORIS_WORKSPACE_ROOT'

const command = {
  id: 'commit',
  description: { fr: 'c', en: 'c' },
  preview: 'p',
  compat: ['Cursor'],
  skillIds: ['gateguard'],
  body: '# commit',
  raw: '# commit',
}

const collection = {
  id: 'sonar',
  icon: 'broadcast',
  color: '#0D9488',
  kind: 'pack',
  label: { fr: 'Sonar', en: 'Sonar' },
  brief: { fr: 'b', en: 'b' },
  skillIds: ['gateguard'],
  commandIds: ['commit'],
  skills: [],
  commands: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env[envKey]
  vi.mocked(listSkillPackageFiles).mockResolvedValue(null)
  vi.mocked(skillPackageHasCompanions).mockReturnValue(false)
  vi.mocked(loadSkillCopyContent).mockResolvedValue('# skill')
  vi.mocked(resolveCommand).mockResolvedValue(command)
})

afterEach(() => {
  delete process.env[envKey]
})

describe('isWorkspaceInstallConfigured', () => {
  it('dépend de ARBORIS_WORKSPACE_ROOT', () => {
    expect(isWorkspaceInstallConfigured()).toBe(false)
    process.env[envKey] = '  /tmp/ws  '
    expect(isWorkspaceInstallConfigured()).toBe(true)
  })
})

describe('buildSkillZip', () => {
  it('refuse un agent inconnu ou un skill absent', async () => {
    expect(await buildSkillZip({ skillId: 'x', agent: 'Nope', lang: 'fr' })).toBeNull()
    vi.mocked(loadSkill).mockResolvedValue(null)
    expect(await buildSkillZip({ skillId: 'x', agent: 'Cursor', lang: 'fr' })).toBeNull()
  })

  it('zippe le package compagnon ou le markdown de copie', async () => {
    vi.mocked(loadSkill).mockResolvedValue({ id: 'gateguard' } as never)
    vi.mocked(listSkillPackageFiles).mockResolvedValue([
      { relativePath: 'SKILL.md', content: '# a' },
      { relativePath: 'docs/note.md', content: 'n' },
    ])
    vi.mocked(skillPackageHasCompanions).mockReturnValue(true)

    const zip = await buildSkillZip({ skillId: 'gateguard', agent: 'Cursor', lang: 'fr' })
    expect(zip).toMatchObject({
      filename: 'arboris-skill-gateguard-cursor.zip',
      fileCount: 2,
    })
    expect(zip?.base64.length).toBeGreaterThan(10)

    vi.mocked(listSkillPackageFiles).mockResolvedValue(null)
    const single = await buildSkillZip({ skillId: 'gateguard', agent: 'Cursor', lang: 'en' })
    expect(single?.fileCount).toBe(1)

    vi.mocked(loadSkillCopyContent).mockResolvedValue(null)
    expect(await buildSkillZip({ skillId: 'gateguard', agent: 'Cursor', lang: 'fr' })).toBeNull()
  })
})

describe('buildCommandZip', () => {
  it('inclut la commande et ses skills', async () => {
    expect(await buildCommandZip({ commandId: 'commit', agent: 'Nope' })).toBeNull()
    vi.mocked(resolveCommand).mockResolvedValue(null)
    expect(await buildCommandZip({ commandId: 'missing', agent: 'Cursor' })).toBeNull()

    vi.mocked(resolveCommand).mockResolvedValue(command)
    const zip = await buildCommandZip({ commandId: 'commit', agent: 'Claude', lang: 'fr' })
    expect(zip).toMatchObject({
      filename: 'arboris-command-commit-claude.zip',
      fileCount: 2,
    })
  })
})

describe('buildCollectionZip', () => {
  it('assemble skills + commandes ou échoue vide', async () => {
    expect(await buildCollectionZip({ collectionId: 'sonar', agent: 'Nope', lang: 'fr' })).toBeNull()
    vi.mocked(loadCollection).mockResolvedValue(null)
    expect(
      await buildCollectionZip({ collectionId: 'missing', agent: 'Cursor', lang: 'fr' }),
    ).toBeNull()

    vi.mocked(loadCollection).mockResolvedValue(collection)
    vi.mocked(resolveCommand).mockResolvedValue(command)
    const zip = await buildCollectionZip({ collectionId: 'sonar', agent: 'Cursor', lang: 'fr' })
    expect(zip).toMatchObject({
      filename: 'arboris-sonar-cursor.zip',
      fileCount: 2,
    })

    vi.mocked(loadCollection).mockResolvedValue({ ...collection, skillIds: [], commandIds: [] })
    expect(
      await buildCollectionZip({ collectionId: 'sonar', agent: 'Cursor', lang: 'fr' }),
    ).toBeNull()
  })
})
