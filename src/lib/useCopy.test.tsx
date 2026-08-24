// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { AnnouncerProvider } from './announcer'
import { useCopy } from './useCopy'

function wrapper({ children }: { children: ReactNode }) {
  return <AnnouncerProvider>{children}</AnnouncerProvider>
}

describe('useCopy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('copie et reset la clé après le délai', () => {
    const { result } = renderHook(() => useCopy(50), { wrapper })
    act(() => {
      result.current.copy('hello', 'skill-1', 'Copié')
    })
    expect(result.current.copiedKey).toBe('skill-1')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello')
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.copiedKey).toBeNull()
  })
})
