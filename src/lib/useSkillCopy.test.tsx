// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { AnnouncerProvider } from './announcer'
import { serverFns } from '#/test/harness'
import { useSkillCopy } from './useSkillCopy'
import type { SkillDetail } from './catalog'

function wrapper({ children }: { children: ReactNode }) {
  return <AnnouncerProvider>{children}</AnnouncerProvider>
}

const fallback: SkillDetail = {
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

describe('useSkillCopy', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('copie fileContent en priorité', async () => {
    const { result } = renderHook(() => useSkillCopy(50), { wrapper })
    await act(async () => {
      await result.current.copySkill({
        id: 'gateguard',
        lang: 'fr',
        announceMsg: 'Copié',
        fileContent: '# file',
      })
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# file')
    expect(result.current.copiedKey).toBe('gateguard')
    expect(serverFns.getSkillCopyContent).not.toHaveBeenCalled()
  })

  it('construit le markdown depuis fallback puis fetch serveur', async () => {
    const { result } = renderHook(() => useSkillCopy(50), { wrapper })
    await act(async () => {
      await result.current.copySkill({
        id: 'gateguard',
        lang: 'fr',
        announceMsg: 'Copié',
        fallback,
      })
    })
    expect(String(vi.mocked(navigator.clipboard.writeText).mock.calls[0]?.[0])).toContain(
      'name: gateguard',
    )

    serverFns.getSkillCopyContent.mockResolvedValue('# from-server')
    await act(async () => {
      await result.current.copySkill({
        id: 'other',
        lang: 'en',
        announceMsg: 'Copied',
      })
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# from-server')

    serverFns.getSkillCopyContent.mockResolvedValue(null)
    await act(async () => {
      await result.current.copySkill({ id: 'empty', lang: 'fr', announceMsg: 'x' })
    })
    expect(result.current.copiedKey).toBe('other')
  })
})
