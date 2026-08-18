import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/server/commands.server', () => ({
  resolveCommand: vi.fn(),
}))

vi.mock('#/lib/command-install-core', () => ({
  installCommandToWorkspace: vi.fn(),
}))

vi.mock('#/lib/skill-install-core', () => ({
  installSkillToWorkspace: vi.fn(),
}))

import { resolveCommand } from '#/server/commands.server'
import { installCommandToWorkspace } from '#/lib/command-install-core'
import { installSkillToWorkspace } from '#/lib/skill-install-core'
import { installCommandForAgent } from './command-install.server'

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

beforeEach(() => {
  vi.mocked(resolveCommand).mockReset()
  vi.mocked(installCommandToWorkspace).mockReset()
  vi.mocked(installSkillToWorkspace).mockReset()
  delete process.env[envKey]
})

describe('installCommandForAgent', () => {
  it('rejette agent / commande / workspace', async () => {
    await expect(
      installCommandForAgent({ commandId: 'commit', agent: 'Nope', lang: 'fr' }),
    ).rejects.toThrow('unknown_agent')

    vi.mocked(resolveCommand).mockResolvedValue(null)
    await expect(
      installCommandForAgent({ commandId: 'missing', agent: 'Cursor', lang: 'fr' }),
    ).rejects.toThrow('command_not_found')

    vi.mocked(resolveCommand).mockResolvedValue(command)
    await expect(
      installCommandForAgent({ commandId: 'commit', agent: 'Cursor', lang: 'fr' }),
    ).rejects.toThrow('workspace_not_configured')
  })

  it('installe la commande et les skills compagnons', async () => {
    process.env[envKey] = '/tmp/ws'
    vi.mocked(resolveCommand).mockResolvedValue(command)
    vi.mocked(installCommandToWorkspace).mockResolvedValue({
      ok: true,
      path: '.cursor/commands/commit.md',
      skipped: false,
    })
    vi.mocked(installSkillToWorkspace).mockResolvedValue({
      ok: true,
      path: '.cursor/skills/gateguard/SKILL.md',
      skipped: false,
      files: [],
    })

    const result = await installCommandForAgent({
      commandId: 'commit',
      agent: 'Cursor',
      lang: 'fr',
    })
    expect(result).toEqual({
      path: '.cursor/commands/commit.md',
      skillPaths: ['.cursor/skills/gateguard/SKILL.md'],
    })
  })

  it('propage les erreurs du core commande', async () => {
    process.env[envKey] = '/tmp/ws'
    vi.mocked(resolveCommand).mockResolvedValue(command)

    vi.mocked(installCommandToWorkspace).mockResolvedValue({ ok: false, error: 'command_not_found' })
    await expect(
      installCommandForAgent({ commandId: 'commit', agent: 'Cursor', lang: 'fr' }),
    ).rejects.toThrow('command_not_found')

    vi.mocked(installCommandToWorkspace).mockResolvedValue({ ok: false, error: 'invalid_path' })
    await expect(
      installCommandForAgent({ commandId: 'commit', agent: 'Cursor', lang: 'fr' }),
    ).rejects.toThrow('invalid_path')

    vi.mocked(installCommandToWorkspace).mockResolvedValue({ ok: false, error: 'unknown_agent' })
    await expect(
      installCommandForAgent({ commandId: 'commit', agent: 'Cursor', lang: 'fr' }),
    ).rejects.toThrow('unknown_agent')
  })

  it('ignore un skill compagnon en échec', async () => {
    process.env[envKey] = '/tmp/ws'
    vi.mocked(resolveCommand).mockResolvedValue(command)
    vi.mocked(installCommandToWorkspace).mockResolvedValue({
      ok: true,
      path: '.cursor/commands/commit.md',
      skipped: false,
    })
    vi.mocked(installSkillToWorkspace).mockResolvedValue({ ok: false, error: 'skill_not_found' })

    const result = await installCommandForAgent({
      commandId: 'commit',
      agent: 'Cursor',
      lang: 'fr',
    })
    expect(result.skillPaths).toEqual([])
  })
})
