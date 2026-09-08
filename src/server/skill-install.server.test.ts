import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

vi.mock('./db', () => ({
  prisma: {
    skill: { findUnique: vi.fn() },
  },
}))

vi.mock('#/lib/skill-install-core', () => ({
  installSkillToWorkspace: vi.fn(),
}))

import { prisma } from './db'
import { installSkillToWorkspace } from '#/lib/skill-install-core'
import { installSkillForAgent } from './skill-install.server'

const envKey = 'ARBORIS_WORKSPACE_ROOT'
const tokenKey = 'ARBORIS_INSTALL_TOKEN'
const testToken = 'test-install-token'

beforeEach(() => {
  vi.mocked(prisma.skill.findUnique).mockReset()
  vi.mocked(installSkillToWorkspace).mockReset()
  delete process.env[envKey]
  delete process.env[tokenKey]
})

afterEach(async () => {
  delete process.env[envKey]
  delete process.env[tokenKey]
})

describe('installSkillForAgent', () => {
  it('rejette un agent inconnu ou un skill absent', async () => {
    await expect(
      installSkillForAgent({ skillId: 'x', agent: 'Nope', lang: 'fr' }),
    ).rejects.toThrow('unknown_agent')

    vi.mocked(prisma.skill.findUnique).mockResolvedValue(null)
    await expect(
      installSkillForAgent({ skillId: 'missing', agent: 'Cursor', lang: 'fr' }),
    ).rejects.toThrow('skill_not_found')
  })

  it('bloque un score trop bas sans acknowledgement', async () => {
    vi.mocked(prisma.skill.findUnique).mockResolvedValue({ score: 10, bodyMd: null } as never)
    await expect(
      installSkillForAgent({ skillId: 'risky', agent: 'Cursor', lang: 'fr' }),
    ).rejects.toThrow('security_blocked')
  })

  it('exige un workspace configuré', async () => {
    vi.mocked(prisma.skill.findUnique).mockResolvedValue({ score: 90, bodyMd: null } as never)
    process.env[tokenKey] = testToken
    await expect(
      installSkillForAgent({
        skillId: 'gateguard',
        agent: 'Cursor',
        lang: 'fr',
        installToken: testToken,
      }),
    ).rejects.toThrow('workspace_not_configured')
  })

  it('refuse un jeton d’install invalide', async () => {
    vi.mocked(prisma.skill.findUnique).mockResolvedValue({ score: 90, bodyMd: null } as never)
    process.env[envKey] = '/tmp/ws'
    process.env[tokenKey] = testToken
    await expect(
      installSkillForAgent({ skillId: 'gateguard', agent: 'Cursor', lang: 'fr' }),
    ).rejects.toThrow('install_unauthorized')
    await expect(
      installSkillForAgent({
        skillId: 'gateguard',
        agent: 'Cursor',
        lang: 'fr',
        installToken: 'wrong',
      }),
    ).rejects.toThrow('install_unauthorized')
  })

  it('retourne le chemin si l’install disque réussit', async () => {
    vi.mocked(prisma.skill.findUnique).mockResolvedValue({ score: 90, bodyMd: null } as never)
    vi.mocked(installSkillToWorkspace).mockResolvedValue({
      ok: true,
      path: '.cursor/skills/gateguard/SKILL.md',
      skipped: false,
      files: [],
    })
    process.env[envKey] = '/tmp/ws'
    process.env[tokenKey] = testToken
    const result = await installSkillForAgent({
      skillId: 'gateguard',
      agent: 'Cursor',
      lang: 'fr',
      installToken: testToken,
    })
    expect(result.path).toBe('.cursor/skills/gateguard/SKILL.md')
  })

  it('écrit bodyMd en fallback si le package disque manque', async () => {
    const root = await mkdtemp(join(tmpdir(), 'arboris-skill-fb-'))
    process.env[envKey] = root
    process.env[tokenKey] = testToken
    vi.mocked(prisma.skill.findUnique).mockResolvedValue({
      score: 90,
      bodyMd: '# fallback\n',
    } as never)
    vi.mocked(installSkillToWorkspace).mockResolvedValue({ ok: false, error: 'skill_not_found' })

    const result = await installSkillForAgent({
      skillId: 'gateguard',
      agent: 'Cursor',
      lang: 'fr',
      installToken: testToken,
    })
    expect(result.path).toBe('.cursor/skills/gateguard/SKILL.md')
    const written = await readFile(join(root, result.path), 'utf-8')
    expect(written).toBe('# fallback\n')
    await rm(root, { recursive: true, force: true })
  })

  it('propage skill_not_found / invalid_path / unknown_agent du core', async () => {
    process.env[envKey] = '/tmp/ws'
    process.env[tokenKey] = testToken
    vi.mocked(prisma.skill.findUnique).mockResolvedValue({ score: 90, bodyMd: null } as never)

    vi.mocked(installSkillToWorkspace).mockResolvedValue({ ok: false, error: 'skill_not_found' })
    await expect(
      installSkillForAgent({
        skillId: 'gateguard',
        agent: 'Cursor',
        lang: 'fr',
        installToken: testToken,
      }),
    ).rejects.toThrow('skill_not_found')

    vi.mocked(installSkillToWorkspace).mockResolvedValue({ ok: false, error: 'invalid_path' })
    await expect(
      installSkillForAgent({
        skillId: 'gateguard',
        agent: 'Cursor',
        lang: 'fr',
        installToken: testToken,
      }),
    ).rejects.toThrow('invalid_path')

    vi.mocked(installSkillToWorkspace).mockResolvedValue({ ok: false, error: 'unknown_agent' })
    await expect(
      installSkillForAgent({
        skillId: 'gateguard',
        agent: 'Cursor',
        lang: 'fr',
        installToken: testToken,
      }),
    ).rejects.toThrow('unknown_agent')
  })
})
